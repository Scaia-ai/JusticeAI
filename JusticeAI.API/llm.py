import json
import os
import requests
import time
import global_config
import prompt_entities_data
import prompt_extract_narrative
# OpenAI API Configuration
OPENAI_ENDPOINT = global_config.AZURE_OPENAI_ENDPOINT
OPENAI_API_KEY = global_config.AZURE_OPENAI_KEY
OPENAI_DEPLOYMENT_NAME = global_config.AZURE_OPENAI_DEPLOYMENT_NAME

TOKEN_LIMIT = 4096  
BUFFER_TOKENS = 1000  
MAX_INPUT_TOKENS = TOKEN_LIMIT - BUFFER_TOKENS  

TOKENS_PER_MINUTE_LIMIT = 80000  
token_usage = 0
start_time = time.time()

def wait_if_needed():
    """Waits if token usage is close to the per-minute limit, printing debug info."""
    global token_usage, start_time
    elapsed_time = time.time() - start_time

    print(f"🔹 Token Usage: {token_usage} / {TOKENS_PER_MINUTE_LIMIT}, Time Elapsed: {elapsed_time:.2f}s")

    if token_usage >= TOKENS_PER_MINUTE_LIMIT:
        sleep_time = 60 - elapsed_time
        if sleep_time > 0:
            print(f"⚠️ Rate limit reached! Sleeping for {sleep_time:.2f} seconds...")
            time.sleep(sleep_time)

        token_usage = 0
        start_time = time.time()


def send_request(payload, max_retries=5):
    """Sends API request to Azure OpenAI and ensures full data retrieval."""
    global token_usage
    wait_if_needed()

    headers = {
        "Content-Type": "application/json",
        "api-key": OPENAI_API_KEY
    }
    url = f"{OPENAI_ENDPOINT}/openai/deployments/{OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview"

    retry_delay = 5  # Start with 5 seconds delay

    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            response_data = response.json()

            # 🔹 Check if response contains choices
            if "choices" not in response_data or not response_data["choices"]:
                print(f"⚠️ Warning: Empty response received on attempt {attempt+1}. Retrying...")
                time.sleep(retry_delay)
                continue

            # 🔹 Check if "message" and "content" exist
            first_choice = response_data["choices"][0]
            if "message" not in first_choice or "content" not in first_choice["message"]:
                print(f"❌ ERROR: Missing 'content' field in response. Full response: {response_data}")
                return None  # Prevents KeyError

            output_text = first_choice["message"]["content"].strip()
            if not output_text:
                print(f"⚠️ Warning: Blank response received. Retrying...")
                time.sleep(retry_delay)
                continue

            token_usage += response_data.get("usage", {}).get("total_tokens", 0)
            return response_data

        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                print(f"⚠️ API Rate Limit Exceeded (429). Retrying in {retry_delay} seconds... (Attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff (5s → 10s → 20s → 40s)
            else:
                print(f"❌ API Request Error: {e}")
                break

    print("❌ ERROR: Max retries reached. Request failed.")
    return None


def extract_entities(text):
    """Extracts structured entities from the police report, ensuring complete extraction."""
    system_prompt = prompt_entities_data.PROMPT

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text}
    ]

    extracted_text = ""
    while True:
        payload = {
            "messages": messages,
            "temperature": 0.0,
            "max_tokens": 3500  
        }

        response = send_request(payload)
        if not response:
            break

        output = response["choices"][0]["message"]["content"]
        extracted_text += output

        if len(output.split()) < payload["max_tokens"] - 10:
            break

        messages.append({"role": "assistant", "content": output})
        messages.append({"role": "user", "content": "Continue extracting entities."})

    return extracted_text

def extract_narrative_with_ai(full_report_text):
    """Extracts the complete Narrative section from the report, ensuring no truncation."""
    system_prompt = prompt_extract_narrative.PROMPT

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": full_report_text}
    ]

    full_narrative = ""
    continue_flag = True
    max_tokens_per_call = 3000  
    previous_responses = set()  # Track previous responses to detect duplicates

    while continue_flag:
        payload = {
            "messages": messages,
            "temperature": 0.0,
            "max_tokens": max_tokens_per_call
        }

        response = send_request(payload)
        if not response:
            print("❌ ERROR: No response received.")
            break

        output = response["choices"][0]["message"]["content"].strip()

        # **Prevent Infinite Loop - Check for Duplicates**
        if output in previous_responses:
            print("⚠️ Duplicate response detected. Stopping extraction.")
            break

        full_narrative += output + "\n"
        previous_responses.add(output)  # Track extracted text

        # Debugging: Check last part of extracted narrative
        print(f"🔹 Extracted Length: {len(output)} characters")
        print(f"🔹 Last Few Words: {output[-250:]}") 

        # **New Condition to Stop Extraction**
        if "END OF NARRATIVE" in output or "END OF REPORT." in output or "There is no additional narrative text remaining" in output:
            print("✅ Full narrative extracted successfully.")
            continue_flag = False  # Stop when the full text is reached

        else:
            print("🔄 Continuing extraction...")
            messages.append({"role": "assistant", "content": output})
            messages.append({
                "role": "user",
                "content": "Continue extracting the remaining part of the narrative. Do not repeat previous text."
            })

    # **Final Cleanup**: Remove the "END OF NARRATIVE" marker
    full_narrative = full_narrative.replace("END OF NARRATIVE", "").strip()

    print("✅ Extracted Full Narrative:", full_narrative)  # Debug first 1000 characters
    return full_narrative

def remove_officers_from_json(input_data):
    # Step 1: Convert string to dict if needed
    if isinstance(input_data, str):
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError:
            print("Invalid JSON string")
            return input_data  # return original input if not valid JSON
    elif isinstance(input_data, dict):
        data = input_data
    else:
        print("Unsupported input type")
        return input_data

    # Step 2: Remove "Officers" key if it exists
    data.pop("Officers", None)

    # Step 3: Return result as string if original input was string, else as dict
    return json.dumps(data, indent=2) if isinstance(input_data, str) else data


def redact_sensitive_info(text, extracted_entities):
    """Redacts PII from the Narrative section while handling truncation."""
    formatted_entities = remove_officers_from_json(extracted_entities)
    system_prompt = f"""
        You are an AI assistant that redacts personally identifiable information (PII) from police report narratives by replacing names with numerated entity references.

        Use the following entity mapping to perform the redaction:
        {formatted_entities}

        ### **Redaction Rules:**

        1. **Name Redaction:**
        - Replace all full names and last name mentions of suspects, victims, witnesses, and non-officer persons with their assigned numerated entity label (e.g., "[SUSPECT 1]", "[VICTIM 1]").
        - If a person is referred to only by their **last name**, match it against the full names in the entity mapping and redact accordingly.
        - Do **not** redact officer names, deputy names, or law enforcement personnel.

        2. **PII Redaction:**
        - Redact any mention of **race or ethnicity** and replace it with “[REDACTED]”.  
            - Examples:
            - “White male” → “[REDACTED] male”
            - “Hispanic adult female” → “[REDACTED] adult female”
        - Do **not** redact:
            - Addresses
            - Phone numbers
            - Officer names or identifiers
        3. Redact usernames and aliases (e.g., social media handles, fake account names, or named pseudonyms like “Rosa Sarabia”) using a consistent numbered format like [USER 1], [USER 2], etc.
            - Assign the **same reference** if the same name or alias appears multiple times.
            - This includes:
                - Handles or usernames like "rosasararbia51" → [USER 1]
                - Full fake names like "Rosa Sarabia" → [USER 1]
                - Short fake names like "Rosa" (used in the same context) → [USER 1]
        4. **Output Requirements:**
        - Maintain grammatical integrity and readability.
        - Do not alter the core meaning or structure of any sentence.
        - Do not omit any case-relevant facts or details.
        """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text}
    ]

    redacted_text = ""
    while True:
        payload = {
            "messages": messages,
            "temperature": 0.0,
            "max_tokens": 3500  
        }

        response = send_request(payload)
        if not response:
            break

        output = response["choices"][0]["message"]["content"]
        redacted_text += output

        if len(output.split()) < payload["max_tokens"] - 10:
            break

        messages.append({"role": "assistant", "content": output})
        messages.append({"role": "user", "content": "Continue redacting from where you left off."})

    return redacted_text

def process_report(text):
    """Extracts entities, extracts the Narrative, redacts sensitive information, then saves the output."""
    print("🔹 Extracting Entities...")
    extracted_entities = extract_entities(text)

    print("🔹 Extracting Narrative Section...")
    narrative_text = extract_narrative_with_ai(text)
    if not narrative_text:
        print("⚠️ ERROR: Could not extract Narrative section.")
        return

    result = "Extracted Entities:\n"
    result = result + extracted_entities + "\n\n"
    result = result + "Redacted Narrative:\n"
    result = result + narrative_text
    return result


def process_file(text):
    return process_report(text)



