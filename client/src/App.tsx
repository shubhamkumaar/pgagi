import React, { useState, useEffect, useRef } from 'react';

// Define a type for the message objects for better type safety
interface Message {
  sender: 'You' | 'Bot' | 'System';
  text: string;
}

// Main App Component
export default function App(){
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [clientId] = useState<number>(Math.floor(new Date().getTime() / 1000));
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  
  // Ref for the WebSocket instance. It can be null initially.
  const ws = useRef<WebSocket | null>(null);
  
  // Ref for the div at the end of the messages list to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    // Use ws:// for local development, wss:// for production with HTTPS
    const serverUrl = `ws://localhost:8000/ws/${clientId}`;
    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnecting(false);
      setMessages(prev => [...prev, { sender: 'System', text: 'Connected to chatbot!' }]);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      console.log('Message from server: ', event.data);
      setMessages(prev => [...prev, { sender: 'Bot', text: event.data }]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnecting(false);
      setMessages(prev => [...prev, { sender: 'System', text: 'Connection closed.' }]);
    };

    ws.current.onerror = (event: Event) => {
      console.error('WebSocket error: ', event);
      setIsConnecting(false);
      setMessages(prev => [...prev, { sender: 'System', text: 'Connection error. See console for details.' }]);
    };

    // Store the current WebSocket instance to use in the cleanup function
    const currentWs = ws.current;

    // Cleanup on component unmount
    return () => {
      if (currentWs) {
        currentWs.close();
      }
    };
  }, [clientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setMessages(prev => [...prev, { sender: 'You', text: input }]);
      setInput('');
    } else {
      console.log('Cannot send message. WebSocket is not open.');
      setMessages(prev => [...prev, { sender: 'System', text: 'Cannot send message. Connection is not open.' }]);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl h-[80vh] bg-gray-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <header className="bg-gray-700 p-4 rounded-t-2xl shadow-lg flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-100">Chatbot</h1>
          <div className="flex items-center space-x-2">
             <span className={`h-3 w-3 rounded-full ${isConnecting ? 'bg-yellow-500 animate-pulse' : (ws.current && ws.current.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-red-500')}`}></span>
             <span className="text-sm text-gray-300">
                {isConnecting ? 'Connecting...' : (ws.current && ws.current.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected')}
             </span>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-800/50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-3 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender !== 'You' && msg.sender !== 'System' && (
                   <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">B</div>
                )}
                 <div className={`px-4 py-2 rounded-2xl max-w-md ${
                     msg.sender === 'You' ? 'bg-blue-600 rounded-br-none' : 
                     msg.sender === 'Bot' ? 'bg-gray-600 rounded-bl-none' : 
                     'bg-gray-700 text-center w-full text-xs italic'
                 }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <footer className="p-4 bg-gray-700 rounded-b-2xl">
          <form onSubmit={sendMessage} className="flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN}
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
