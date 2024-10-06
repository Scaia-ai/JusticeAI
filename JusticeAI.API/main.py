import json
import logging
import threading
import os
import global_config
import asyncio
import time
import httpx
from retry import retry
from typing import List, Tuple
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from opencensus.ext.azure.log_exporter import AzureLogHandler  
from concurrent.futures import ThreadPoolExecutor
from my_vector_store_retriever import MyVectorStoreRetriever
from store_document import do_store_document
from contextlib import asynccontextmanager
from index_manager import get_vector_store
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import AzureChatOpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(global_config.LOG_FILE_NAME)

if global_config.APPLICATIONINSIGHTS_CONNECTION_STRING is not None:
    AI_conn_string= global_config.APPLICATIONINSIGHTS_CONNECTION_STRING
    handler = AzureLogHandler(connection_string=AI_conn_string)  
    logger = logging.getLogger()
    logger.addHandler(handler)
else:
    fh = logging.FileHandler(global_config.LOG_FILE_NAME)
    fh.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    logger.info("Logger is configured to write to a file: " + global_config.LOG_FILE_NAME)

app = FastAPI(
    title="JusticeAI",
    description="JusticeAI API",
    version= global_config.JUSTICE_AI_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def set_default_executor():
    loop = asyncio.get_running_loop()
    loop.set_default_executor(
        ThreadPoolExecutor(max_workers=20)  # Adjust based on your workload
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
   set_default_executor()

   


@retry(httpx.HTTPStatusError, tries=5, delay=1, backoff=2)
async def get_embeddings_with_retry(llm, question, chat_history):
    # Function to get embeddings with retry logic
    result = llm({"question": question, "chat_history": chat_history})
    return result

@app.get("/")
async def read_root():
    logger.info("Hello! Redirecting to /doc")
    return RedirectResponse(url='/docs')


@app.post("/question_case/", summary="Ask JusticeAI about your Case")
async def ask_question(
    question: str = Form(...),
    case_ids: str = Form(...),
    chat_history: str = Form(default="[]")
):
    start_time = time.time()
    try:
        logger.info("****ask question")
        
        logger.info(f"Received question: {question}")
        logger.info(f"Received case_ids: {case_ids}")
        logger.info(f"Received chat_history: {chat_history}")

        chat_history_raw = json.loads(chat_history)
        if not isinstance(chat_history_raw, list):
            raise ValueError("chat_history must be a list of lists")
        chat_history: List[Tuple[str, str]] = [tuple(item) for item in chat_history_raw]
        for item in chat_history:
            if not isinstance(item, tuple) or len(item) != 2:
                raise ValueError("Each item in chat_history must be a tuple of two strings")

        case_ids = json.loads(case_ids)
        if not isinstance(case_ids, list) or not all(isinstance(case_id, str) for case_id in case_ids):
            raise ValueError("case_ids must be a list of strings")

        filter_expression = "(" + " or ".join([f"case_id eq '{case_id}'" for case_id in case_ids]) + ")"
        logger.info(f"Constructed filter expression: {filter_expression}")

        llm = AzureChatOpenAI(deployment_name=global_config.AZURE_SEARCH_DEPLOYMENT)

        CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template("""
        Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question. 
        If the necessary information is not found in the conversation, infer the best possible standalone question using your own knowledge.

        Chat History:
        {chat_history}
        Follow-Up Input: {question}
        Standalone question:
        """)

        vector_store = get_vector_store()
     
        retrieverSim = MyVectorStoreRetriever(
            vectorstore=vector_store,
            search_type="similarity_score_threshold",
            k=3,
            search_kwargs={'filters': filter_expression, "score_threshold": 0.8, "k": 3},
        )

        qa = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retrieverSim,
            condense_question_prompt=CONDENSE_QUESTION_PROMPT,
            return_source_documents=True,
            verbose=False
        )

        result = await get_embeddings_with_retry(qa, question, chat_history)
        sources = [obj.metadata["source"] for obj in result["source_documents"]]

        logger.info(f"Result: {result}")
        return {"question": question, "answer": result["answer"], "sources": sources}
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON input")
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail="An error occurred while processing the request.")
    finally:
        end_time = time.time()
        logger.info(f"Request processing time: {end_time - start_time} seconds")


@app.post("/store_content/", status_code=201, summary="Store document content for an Case")
async def store_content(case_id: str = Form(...), content: str = Form(...), source: str = Form(...)):
    try:
        logger.info("****store content")
        doc_length = len(content)
        logger.info("Store content of length: " + str(doc_length) + " for Case: " + str(case_id))
        logger.info(f"Before Store Documents: {threading.active_count()}")
        number_splits = do_store_document(content, case_id, source)
        logger.info(f"After Store Documents: {threading.active_count()}")
        logger.info(f"Number of splits: {str(number_splits)}")
        return {"message": "Content stored successfully", "Number of splits": str(number_splits)}
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail="An error occurred while processing the request.")


@app.post("/store_document/", status_code=201, summary="Store a document for a Case")
async def store_document(case_id: str = Form(...), document: UploadFile = Form(...), document_id: int = Form(...)):
    try:
        logger.info("****store document")
        if document_id is None or document_id == 0:
            source = document.filename
        else:
            source = str(document_id)

        logger.info(f"File Name: {source}")
        logger.info(f"Start: {threading.active_count()}")
        content = await document.read()
        content = content.decode()  # If the file is a text file, convert bytes to string
        doc_length = len(content)
        logger.info("Store a document of length: " + str(doc_length) + " for Case: " + str(case_id))
        logger.info(f"Before Store Documents: {threading.active_count()}")
        number_splits = do_store_document(content, case_id, source)
        return {"message": "Document stored successfully", "Number of splits": str(number_splits)}
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail="An error occurred while processing the request.")


@app.post("/clean_case_index/", status_code=201, summary="Clean up an index for a Case")
async def clean_case_index(case_id: str = Form(...)):
    logger.info("****Clean Case Index")
    logger.info("Prepare index for case_id: " + case_id)

    search_client = SearchClient(global_config.ENDPOINT, global_config.INDEX_NAME, AzureKeyCredential(global_config.KEY_CREDENTIAL))
    filter_expression = "case_id eq '" + case_id + "'"
    results = search_client.search("", filter=filter_expression)
    document_ids = [result["id"] for result in results]
    for doc_id in document_ids:
        search_client.delete_documents(documents=[{"id": doc_id}])

    return {"message": "Index cleaned successfully"}


