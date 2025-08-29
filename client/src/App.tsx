import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  Settings,
  HelpCircle,
  Zap,
  Moon,
  Sun,
} from "lucide-react";

interface Message {
  sender: "You" | "Bot" | "System";
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [clientId] = useState<number>(Math.floor(new Date().getTime() / 1000));
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const serverUrl = `wss://shubkr-talentscout.hf.space/ws/${clientId}`;
    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnecting(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "Connected to TalentScout Assistant! How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    };

    ws.current.onmessage = (event: MessageEvent) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "Bot",
          text: event.data,
          timestamp: new Date(),
        },
      ]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnecting(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "Connection closed. Please refresh to reconnect.",
          timestamp: new Date(),
        },
      ]);
    };

    ws.current.onerror = (event: Event) => {
      console.error("WebSocket error: ", event);
      setIsConnecting(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "Connection error. Please check your network and try again.",
          timestamp: new Date(),
        },
      ]);
    };

    const currentWs = ws.current;

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
    if (
      input.trim() &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      ws.current.send(input);
      setMessages((prev) => [
        ...prev,
        {
          sender: "You",
          text: input,
          timestamp: new Date(),
        },
      ]);
      setInput("");
      setIsTyping(true);
      if (inputRef.current) {
        inputRef.current.style.height = "56px";
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      console.log("Cannot send message. WebSocket is not open.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "System",
          text: "Cannot send message. Connection is not open.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getConnectionStatus = () => {
    if (isConnecting) {
      return {
        icon: Clock,
        text: "Connecting...",
        color: "text-amber-400",
        dotColor: "bg-amber-400",
      };
    }
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return {
        icon: Wifi,
        text: "Connected",
        color: "text-green-400",
        dotColor: "bg-green-400",
      };
    }
    return {
      icon: WifiOff,
      text: "Disconnected",
      color: "text-red-400",
      dotColor: "bg-red-400",
    };
  };

  const connectionStatus = getConnectionStatus();

  const themeClasses = isDarkMode
    ? {
        bg: "bg-gray-900",
        bgSecondary: "bg-gray-800",
        bgTertiary: "bg-gray-700",
        text: "text-gray-100",
        textSecondary: "text-gray-300",
        textMuted: "text-gray-400",
        border: "border-gray-700",
        borderSecondary: "border-gray-600",
        cardBg: "bg-gray-800",
        inputBg: "bg-gray-700",
        hoverBg: "hover:bg-gray-700",
      }
    : {
        bg: "bg-white",
        bgSecondary: "bg-gray-50",
        bgTertiary: "bg-gray-100",
        text: "text-gray-900",
        textSecondary: "text-gray-700",
        textMuted: "text-gray-500",
        border: "border-gray-200",
        borderSecondary: "border-gray-300",
        cardBg: "bg-white",
        inputBg: "bg-white",
        hoverBg: "hover:bg-gray-100",
      };

  return (
    <div
      className={`h-screen ${themeClasses.bg} flex transition-colors duration-300`}
    >
      {/* Sidebar */}
      <div
        className={`w-72 ${themeClasses.bgSecondary} ${themeClasses.border} border-r flex flex-col shadow-xl`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 ${themeClasses.border} border-b backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className={`text-xl font-bold ${themeClasses.text} tracking-tight`}
                >
                  TalentScout Assistant
                </h1>
                <p className={`text-sm ${themeClasses.textMuted}`}>
                  Intelligent Chat Interface
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${themeClasses.hoverBg} ${themeClasses.textSecondary} transition-all duration-200 hover:scale-105`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`p-4 ${themeClasses.border} border-b`}>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${connectionStatus.dotColor} ${
                isConnecting ? "animate-pulse shadow-lg" : "shadow-md"
              }`}
            ></div>
            <span className={`text-sm font-semibold ${connectionStatus.color}`}>
              {connectionStatus.text}
            </span>
            <connectionStatus.icon
              className={`w-4 h-4 ${connectionStatus.color} ${
                isConnecting ? "animate-spin" : ""
              }`}
            />
          </div>
          {ws.current && ws.current.readyState === WebSocket.OPEN && (
            <div
              className={`mt-2 text-xs ${themeClasses.textMuted} flex items-center space-x-2`}
            >
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time connection active</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl transition-all duration-200 hover:bg-blue-500/20 hover:border-blue-500/30">
              <MessageSquare className="w-5 h-5" />
              <span>Active Chat</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary} ${themeClasses.hoverBg} border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium ${themeClasses.textSecondary} ${themeClasses.hoverBg} border ${themeClasses.border} rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`p-4 ${themeClasses.border} border-t ${themeClasses.bgTertiary} rounded-t-2xl`}
        >
          <div className={`text-xs ${themeClasses.textMuted} space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">Session ID:</span>
              <span className="font-mono bg-gray-500/20 px-2 py-1 rounded">
                {clientId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Messages:</span>
              <span className={`font-semibold ${themeClasses.textSecondary}`}>
                {messages.filter((m) => m.sender !== "System").length}
              </span>
            </div>
            <div className="h-1 bg-gray-600/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
                style={{
                  width: `${Math.min((messages.length / 50) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* TalentScout Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header
          className={`${themeClasses.cardBg} ${themeClasses.border} border-b px-8 py-6 shadow-sm backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-2xl font-bold ${themeClasses.text} tracking-tight`}
              >
                TalentScout Assistant Chat
              </h2>
              <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                Ask me anything and I'll provide intelligent responses
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  connectionStatus.color
                } bg-opacity-10 ${connectionStatus.dotColor.replace(
                  "bg-",
                  "bg-opacity-10 bg-"
                )}`}
              >
                Live
              </div>
              <connectionStatus.icon
                className={`w-5 h-5 ${connectionStatus.color} ${
                  isConnecting ? "animate-spin" : ""
                }`}
              />
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto ${themeClasses.bgSecondary}`}>
          <div className="max-w-5xl mx-auto p-8">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-96">
                <div className="text-center space-y-6 max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${themeClasses.text} mb-3`}
                    >
                      Welcome to TalentScout Assistant
                    </h3>
                    <p
                      className={`${themeClasses.textMuted} text-lg leading-relaxed`}
                    >
                      Start a conversation by typing a message below. I'm here
                      to help with any questions you might have.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {msg.sender !== "You" && msg.sender !== "System" && (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-3xl ${
                      msg.sender === "You" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-6 py-4 rounded-3xl shadow-sm transition-all duration-200 hover:shadow-md ${
                        msg.sender === "You"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25"
                          : msg.sender === "Bot"
                          ? `${themeClasses.cardBg} ${themeClasses.border} border ${themeClasses.text} shadow-lg backdrop-blur-sm`
                          : `${themeClasses.bgTertiary} ${themeClasses.textMuted} text-center mx-auto text-sm rounded-2xl`
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: msg.text.replace(
                            /\*\*(.*?)\*\*/g,
                            "<span class='font-bold'>$1</span>"
                          ),
                        }}
                      />
                    </div>

                    {msg.sender !== "System" && (
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${themeClasses.textMuted} px-2`}
                      >
                        <span className="font-medium">{msg.sender}</span>
                        <span>•</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                  </div>

                  {msg.sender === "You" && (
                    <div
                      className={`w-10 h-10 ${themeClasses.bgTertiary} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                    >
                      <User
                        className={`w-5 h-5 ${themeClasses.textSecondary}`}
                      />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`${themeClasses.cardBg} ${themeClasses.border} border px-6 py-4 rounded-3xl shadow-lg backdrop-blur-sm`}
                  >
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <footer
          className={`${themeClasses.cardBg} ${themeClasses.border} border-t p-6 shadow-2xl backdrop-blur-sm`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(
                          e as unknown as React.FormEvent<HTMLFormElement>
                        );
                      }
                    }}
                    placeholder="Type your message here... (Shift + Enter for new line)"
                    className={`w-full px-6 py-4 ${themeClasses.inputBg} ${themeClasses.border} border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${themeClasses.text} placeholder-gray-400 shadow-sm resize-none overflow-hidden min-h-[56px] max-h-[200px]`}
                    autoComplete="off"
                    disabled={
                      !ws.current || ws.current.readyState !== WebSocket.OPEN
                    }
                    rows={1}
                    style={{
                      height: "auto",
                      minHeight: "56px",
                      maxHeight: "200px",
                    }}
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      const textarea = e.currentTarget;
                      textarea.style.height = "auto";
                      textarea.style.height =
                        Math.min(textarea.scrollHeight, 200) + "px";
                    }}
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-400 flex items-center space-x-2">
                    {input.length > 0 && (
                      <span className="bg-gray-500/20 px-2 py-1 rounded-full">
                        {input.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  sendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
                }}
                className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg self-end ${
                  input.trim() &&
                  ws.current &&
                  ws.current.readyState === WebSocket.OPEN
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-xl hover:scale-105 active:scale-95"
                    : `${themeClasses.bgTertiary} ${themeClasses.textMuted} cursor-not-allowed opacity-50`
                }`}
                disabled={
                  !input.trim() ||
                  !ws.current ||
                  ws.current.readyState !== WebSocket.OPEN
                }
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <p
                className={`text-xs ${themeClasses.textMuted} flex items-center justify-center space-x-2`}
              >
                <span>Enter to send • Shift + Enter for new line</span>
                <span>•</span>
                <span>Powered by WebSocket</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
