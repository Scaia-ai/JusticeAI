from langchain.text_splitter import TokenTextSplitter
import global_config
import logging
import index_manager
from langchain.docstore.document import Document

logger = logging.getLogger(global_config.LOG_FILE_NAME)


def do_store_document(content: str, case_id: str, filename: str):
    logger.info("namespace: " + case_id)
    logger.info("source: " + filename)
    logger.info("index_name = " + str(global_config.INDEX_NAME))

    vector_store = index_manager.get_vector_store()
    doc = Document(page_content=content,
            metatdata={
                "source": filename,
                "case_id": case_id,
            }
        )
    text_splitter = TokenTextSplitter(chunk_size=4000, chunk_overlap=400)
    docs = text_splitter.split_documents([doc])
    texts = [doc.page_content for doc in docs]
    metadata = [{"case_id": case_id, "source": filename} for doc in docs]
   

    vector_store.add_texts(
        texts,
        metadata,
    )
    return str(len(texts))
