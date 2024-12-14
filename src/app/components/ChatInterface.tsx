import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/process-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.summary,
          sources: urls,
        },
      ]);

      setUrls([]);
    } catch (error) {
      console.error("Error processing URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.content,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* URL Input Form */}
      <form onSubmit={handleUrlSubmit} className="mb-6">
        <textarea
          className="w-full p-2 border rounded-md mb-2"
          placeholder="Paste URLs (one per line)"
          value={urls.join("\n")}
          onChange={e =>
            setUrls(e.target.value.split("\n").filter(url => url.trim()))
          }
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || urls.length === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
        >
          Process URLs
        </button>
      </form>

      {/* Chat Messages */}
      <div className="mb-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user" ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <p>{message.content}</p>
            {message.sources && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-semibold">Sources:</p>
                <ul className="list-disc pl-4">
                  {message.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleChat} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
