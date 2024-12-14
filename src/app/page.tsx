import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        AI Chat with URL Context
      </h1>
      <ChatInterface />
    </main>
  );
}
