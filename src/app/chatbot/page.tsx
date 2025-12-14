'use client';
import GeminiChatbot from "@/components/GeminiChatbot";

export default function ChatbotPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chatbot Test Page</h1>
      <div className="w-full h-[500px] border border-green-300 rounded-lg p-4">
        <GeminiChatbot />
      </div>
    </div>
  );
}