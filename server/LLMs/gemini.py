# gemini_processor.py

import os
import logging
from typing import Dict, Any

from google import genai
from google.genai import types

# --- Configuration ---
logger = logging.getLogger(__name__)

# The list of fields the chatbot needs to collect.
REQUIRED_FIELDS = [
    "Full Name",
    "Email Address",
    "Phone Number",
    "Years of Experience",
    "Desired Position(s)",
    "Current Location",
    "Tech Stack"
]

def get_next_bot_response(session: Dict[str, Any]) -> str:
    """
    Takes the current session data and gets the next response from the Gemini API
    using the provided client SDK pattern.
    """
    try:
        # 1. Instantiate the client using the globally configured API key
        client = genai.Client(
            api_key=os.environ["GEMINI_API_KEY"]
        )
        model = "gemini-2.5-flash-lite" # Using the specified model

        # 2. Build the System Prompt as per the chatbot's logic
        missing_fields = [f for f, v in session["collected_data"].items() if v is None]
        system_prompt_text = f"""
        You are an intelligent and friendly hiring assistant chatbot for a recruitment agency called "TalentScout".
        Your primary goal is to collect the following information from the candidate: {', '.join(REQUIRED_FIELDS)}.
        
        This is the information you have collected so far: {session['collected_data']}
        This is the information you still need to collect: {missing_fields}

        CONVERSATION RULES:
        1.  **Analyze the user's last message.** The user may provide information, ask a question, or just chat.
        2.  **Update Collected Information:** First, check if the user's last message contains any of the missing information. If it does, acknowledge it. For example, if they provide their name, say "Thanks, [Name]!".
        3.  **Prioritize Information Gathering:** Your main task is to fill the missing fields. After acknowledging any provided info, smoothly transition to asking for the *next single piece* of missing information. Do NOT ask for all missing information at once. Ask one question at a time.
        4.  **Be Conversational:** Do not just be a robot asking questions. Engage in natural conversation. If the user asks a question about the company or the role, answer it briefly and then steer the conversation back to gathering the next piece of information.
        5.  **Tech Stack Trigger:** Once you have collected the "Tech Stack", your NEXT step is to say you will generate technical questions. Do not ask for more info.
        6.  **Tech Question Generation:** If the `tech_questions_asked` flag is false and the "Tech Stack" is filled, generate 3-5 technical questions based on their stack. Your response should ONLY be the questions.
        7.  **Summary Trigger:** Once the user has answered the technical questions (`tech_answers_collected` is false), your NEXT and FINAL step is to generate a summary of all collected information.
        8.  **Be Concise:** Keep your responses friendly but to the point.
        """

        # 3. Format the conversation history into the required types.Content structure
        contents = []
        for entry in session["history"]:
            role = entry.get("role")
            text = entry.get("parts", [{}])[0].get("text", "")
            if role and text:
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text)]))

        # 4. Create the generation configuration with the system instruction
        generate_content_config = types.GenerateContentConfig(
            temperature=0.7,
            system_instruction=[
                types.Part.from_text(text=system_prompt_text),
            ],
        )

        # 5. Call the API using the generate_content_stream method and concatenate the response
        full_response = ""
        # The model path needs to be in the format 'models/model-name'
        # model_ref = client.models.get(f"models/{model_name}")
        
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            full_response += chunk.text
        
        return full_response

    except Exception as e:
        logger.error(f"Error generating Gemini response: {e}", exc_info=True)
        return "I'm sorry, I encountered a technical issue. Could you please rephrase that?"
