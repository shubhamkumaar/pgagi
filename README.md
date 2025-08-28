
# pgagi-bot

## Summary
`pgagi-bot` is a full-stack AI chatbot application designed to provide an interactive chat interface for users to communicate with a Gemini-powered assistant. The application supports advanced functionalities such as generating SQL scripts from DDL statements and manages real-time conversations using WebSockets.

## Key Features
*   **Interactive Chat Interface**: A responsive and intuitive user interface built with React and TypeScript for seamless user interaction.
*   **Real-time Communication**: Leverages WebSockets for instant message sending and receiving, ensuring a dynamic chat experience.
*   **AI-Powered Responses**: Integrates with the Google Gemini API to provide intelligent and context-aware bot responses.
*   **DDL to SQL Script Generation**: Processes Data Definition Language (DDL) statements to generate comprehensive SQL scripts, including random data generation and marker replacement for various data types.
*   **Dynamic Session Management**: The backend efficiently manages active WebSocket connections and their individual conversational states.
*   **User Experience Enhancements**: Includes features like automatic chat scroll to bottom, real-time connection status display, and UI theme management.

## Tech stack
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, WebSockets
*   **Backend**: Python, FastAPI, Google Gemini API, WebSockets

## Installation

To get `pgagi-bot` up and running, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/pgagi-bot.git
cd pgagi-bot
```

### 2. Backend Setup
Navigate to the `server` directory, install dependencies, and start the FastAPI application.
```bash
cd server
pip install -r requirements.txt
# Set up your environment variables, e.g., GEMINI_API_KEY
uvicorn main:app --reload
```

### 3. Frontend Setup
Navigate to the `client` directory, install dependencies, and start the React development server.
```bash
cd ../client
npm install
npm run dev
```
The frontend application will typically be accessible at `http://localhost:5173` (or another port specified by Vite).

## Folder Structure

```
pgagi-bot/
├── client/                     # Frontend application
│   ├── public/                 # Static assets
│   ├── src/                    # Source files
│   │   ├── App.tsx             # Main React application component
│   │   └── main.tsx            # React application entry point
│   ├── index.html              # Main HTML file
│   └── package.json            # Frontend dependencies and scripts
└── server/                     # Backend application
    ├── llms/                   # Language Model integrations
    │   └── gemini.py           # Gemini API interaction logic
    ├── main.py                 # Main FastAPI application
    └── requirements.txt        # Backend dependencies
```

## API Documentation
Detailed API endpoints and their functionalities will be documented here. The primary interaction is via a WebSocket endpoint for chat functionality.

## Contributing
Contributions are welcome! Please refer to the `CONTRIBUTING.md` file for guidelines on how to contribute to this project.

## License
This project is licensed under the MIT License.
```