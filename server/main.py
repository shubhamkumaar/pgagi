import os
import logging
from typing import Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

# Import the processor function and required fields list
from llms.gemini import get_next_bot_response, REQUIRED_FIELDS

# --- Configuration ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure the Gemini API globally when the app starts
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    logger.info("Gemini API configured successfully.")
except KeyError:
    logger.error("FATAL: GEMINI_API_KEY environment variable not set.")


# --- Application Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXIT_KEYWORDS = ["exit", "quit", "bye", "goodbye"]

# --- Connection Management ---

class ConnectionManager:
    """Manages active WebSocket connections and their dynamic conversation state."""
    def __init__(self):
        self.active_connections: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket):
        """Accepts a new connection and initializes its state."""
        await websocket.accept()
        
        initial_greeting = "Welcome to the PGAGI Hiring Assistant! I'm here to help with the initial screening process by gathering some information about you. We can chat naturally - feel free to ask questions at any time. To start, could you tell me your full name?"
        
        self.active_connections[websocket] = {
            "history": [
                {'role': 'user', 'parts': [{'text': 'Hello'}]},
                {'role': 'model', 'parts': [{'text': initial_greeting}]}
            ],
            "collected_data": {field: None for field in REQUIRED_FIELDS},
            "tech_questions_asked": False,
            "tech_answers_collected": False
        }
        logger.info(f"New connection. Total clients: {len(self.active_connections)}")
        await websocket.send_text(initial_greeting)

    def disconnect(self, websocket: WebSocket):
        """Removes a connection."""
        if websocket in self.active_connections:
            del self.active_connections[websocket]
            logger.info(f"Connection closed. Total clients: {len(self.active_connections)}")

    def get_session_data(self, websocket: WebSocket) -> Dict[str, Any]:
        return self.active_connections[websocket]

    async def handle_message(self, websocket: WebSocket, user_input: str):
        """
        Handles an incoming message by calling the Gemini processor
        and managing session history.
        """
        session = self.get_session_data(websocket)
        session["history"].append({'role': 'user', 'parts': [{'text': user_input}]})

        # Call the external processor to get the bot's response
        bot_response = get_next_bot_response(session)

        # Update history and send response back to the client
        session["history"].append({'role': 'model', 'parts': [{'text': bot_response}]})
        await websocket.send_text(bot_response)
        logger.info(f"Sent bot response: {bot_response}")


manager = ConnectionManager()

# --- API Endpoints ---

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    """Main WebSocket endpoint for handling the chat conversation."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received from client #{client_id}: {data}")

            if data.lower().strip() in EXIT_KEYWORDS:
                await websocket.send_text("Thank you for your time. Ending conversation.")
                break

            await manager.handle_message(websocket, data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client #{client_id} disconnected.")
    except Exception as e:
        logger.error(f"An error occurred with client #{client_id}: {e}", exc_info=True)
        manager.disconnect(websocket)
    finally:
        await websocket.close()

@app.get("/")
async def get():
    return HTMLResponse("<h2>TalentScout Hiring Assistant WebSocket Server is running.</h2>")
