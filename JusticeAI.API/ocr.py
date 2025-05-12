import os
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import global_config
import time
from pathlib import Path


COMPUTER_VISION_ENDPOINT = global_config.COMPUTER_VISION_ENDPOINT
COMPUTER_VISION_KEY = global_config.COMPUTER_VISION_KEY

def perform_ocr_from_stream(file_stream):
    extracted_text = ""
    try:
        client = ComputerVisionClient(
            COMPUTER_VISION_ENDPOINT,
            CognitiveServicesCredentials(COMPUTER_VISION_KEY)
        )

        ocr_results = client.read_in_stream(file_stream, raw=True)
        operation_location = ocr_results.headers["Operation-Location"]
        operation_id = operation_location.split("/")[-1]

        while True:
            result = client.get_read_result(operation_id)
            if result.status not in ["notStarted", "running"]:
                break
            time.sleep(1)

        if result.status == OperationStatusCodes.succeeded:
            for page in result.analyze_result.read_results:
                for line in page.lines:
                    extracted_text += line.text + "\n"

    except Exception as e:
        print(f"OCR failed: {e}")
        raise

    return extracted_text