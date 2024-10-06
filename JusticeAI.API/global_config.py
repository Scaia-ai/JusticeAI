import os
import logging
from dotenv import load_dotenv

load_dotenv()

JUSTICE_AI_VERSION = "3.0"
AZURE_SEARCH_DEPLOYMENT = os.getenv("AZURE_SEARCH_DEPLOYMENT")
LOG_FILE_NAME = "JusticeAI.log"
LOG_LEVEL = logging.DEBUG
ENDPOINT = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
KEY_CREDENTIAL = os.getenv("AZURE_SEARCH_ADMIN_KEY")
INDEX_NAME = os.getenv("AZURE_SEARCH_INDEX")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_EMBEDDING_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
APPLICATIONINSIGHTS_CONNECTION_STRING = os.getenv('APPLICATIONINSIGHTS_CONNECTION_STRING')