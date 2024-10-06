from langchain_openai import AzureOpenAIEmbeddings
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
    openai_credential = DefaultAzureCredential()
    token_provider = get_bearer_token_provider(openai_credential, "https://cognitiveservices.azure.com/.default")
    embeddings = AzureOpenAIEmbeddings(
        azure_deployment=global_config.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
        openai_api_version=global_config.AZURE_OPENAI_API_VERSION,
        azure_endpoint=global_config.AZURE_OPENAI_ENDPOINT,
        api_key=global_config.AZURE_OPENAI_KEY,
        azure_ad_token_provider=token_provider if not global_config.AZURE_OPENAI_KEY else None
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
        SimpleField(
            name="source",
            type=SearchFieldDataType.String,
            filterable=True,
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
