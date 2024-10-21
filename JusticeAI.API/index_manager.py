from langchain_openai import AzureOpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings  
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import global_config
from langchain_community.vectorstores.azuresearch import AzureSearch
from azure.search.documents.indexes.models import (
    SearchableField,
    SearchField,
    SearchFieldDataType,
    SimpleField
    
)

def get_vector_store():
    embeddings = OpenAIEmbeddings(
        openai_api_key=global_config.OPENAI_API_KEY,  # Use your OpenAI API key
        model="text-embedding-ada-002",  # Specify the model you want to use
    )

    fields = [
        SimpleField(
            name="id",
            type=SearchFieldDataType.String,
            key=True,
            filterable=True,
        ),
        SearchableField(
            name="content",
            type=SearchFieldDataType.String,
            searchable=True,
        ),
        SearchField(
            name="content_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="myHnswProfile",
        ),
        SearchableField(
            name="metadata",
            type=SearchFieldDataType.String,
            searchable=True,
        ),
        SearchableField(
            name="case_id",
            type=SearchFieldDataType.String,
            filterable=True,
            searchable=True,
        ),
        SearchableField(
            name="source",
            type=SearchFieldDataType.String,
            filterable=True,
            searchable=True,
        ),
    ]

    vector_store = AzureSearch(
        azure_search_endpoint=global_config.ENDPOINT,
        azure_search_key=global_config.KEY_CREDENTIAL,
        index_name=global_config.INDEX_NAME,
        embedding_function=embeddings.embed_query,
        fields=fields
    )

    return vector_store
