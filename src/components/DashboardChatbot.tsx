"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaTrophy } from "react-icons/fa";
import { LoadScript, GoogleMap } from '@react-google-maps/api';

// Define language options
type Language = 'english' | 'hindi' | 'kannada';

// Prompts in different languages
const promptsByLanguage = {
  english: [
    "Recycling rules?",
    "Glass recycling steps?",
    "Plastic types recycle?",
    "E-waste disposal?",
    "Reduce waste tips?",
    "Nearest recycle center?",
    "Composting how?",
    "Donate old clothes?",
    "Paper recycling?",
    "Metal recycling?"
  ],
  hindi: [
    "रीसाइक्लिंग नियम?",
    "कांच रीसाइक्लिंग चरण?",
    "प्लास्टिक प्रकार रीसाइकल?",
    "ई-कचरा निपटान?",
    "कचरा कम करने के टिप्स?",
    "निकटतम रीसाइक्लिंग केंद्र?",
    "कम्पोस्टिंग कैसे करें?",
    "पुराने कपड़े दान करें?",
    "कागज रीसाइक्लिंग?",
    "धातु रीसाइक्लिंग?"
  ],
  kannada: [
    "ರೀಸೈಕ್ಲಿಂಗ್ ನಿಯಮಗಳು?",
    "ಗಾಜು ರೀಸೈಕ್ಲಿಂಗ್ ಹಂತಗಳು?",
    "ಪ್ಲಾಸ್ಟಿಕ್ ವಿಧಗಳು ರೀಸೈಕಲ್?",
    "ಇ-ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ?",
    "ತ್ಯಾಜ್ಯ ಕಡಿಮೆ ಮಾಡುವ ಸಲಹೆಗಳು?",
    "ಹತ್ತಿರದ ರೀಸೈಕ್ಲಿಂಗ್ ಕೇಂದ್ರ?",
    "ಕಂಪೋಸ್ಟಿಂಗ್ ಹೇಗೆ?",
    "ಹಳೆಯ ಬಟ್ಟೆಗಳನ್ನು ದಾನ ಮಾಡಿ?",
    "ಕಾಗದ ರೀಸೈಕ್ಲಿಂಗ್?",
    "ಲೋಹ ರೀಸೈಕ್ಲಿಂಗ್?"
  ]
};

interface Message {
  sender: 'You' | 'EcoMentor';
  text: string;
}

// Add prop types
interface DashboardChatbotProps {
  mapFullView: boolean;
  setMapFullView: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DashboardChatbot({ mapFullView, setMapFullView }: DashboardChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'EcoMentor', text: "Select your language:" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('english');
  const [languageSelected, setLanguageSelected] = useState(false);

  // Welcome messages in different languages
  const welcomeMessages = {
    english: "👋 Hello! I'm EcoMentor, your recycling guide. How can I help you?",
    hindi: "👋 नमस्ते! मैं EcoMentor हूं, आपका रीसाइक्लिंग गाइड। मैं आपकी कैसे मदद कर सकता हूं?",
    kannada: "👋 ನಮಸ್ಕಾರ! ನಾನು EcoMentor, ನಿಮ್ಮ ರೀಸೈಕ್ಲಿಂಗ್ ಮಾರ್ಗದರ್ಶಿ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
  };

  // Function to select language and show welcome message
  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLanguageSelected(true);

    // Add user's language selection as a message
    const languageNames = {
      english: "English",
      hindi: "हिंदी (Hindi)",
      kannada: "ಕನ್ನಡ (Kannada)"
    };

    // Add both the user selection and the welcome message
    setMessages(prev => [
      ...prev,
      { sender: 'You', text: languageNames[lang] },
      { sender: 'EcoMentor', text: welcomeMessages[lang] }
    ]);
  };

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { sender: 'You', text: msg }]);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language })
      });
      if (!res.ok) throw new Error('API response was not ok');
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'EcoMentor', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'EcoMentor', text: "Sorry, I couldn't process your request right now." }]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (chatRef.current) {
      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages, loading]);

  if (mapFullView) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-green-100 to-blue-50 rounded-lg p-3 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-green-700">EcoMentor</h2>
        {languageSelected && (
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="border border-green-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm bg-white/80 backdrop-blur-sm"
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="kannada">Kannada</option>
          </select>
        )}
      </div>
      
      {/* Chat area with scrollbar */}
      <div 
        ref={chatRef} 
        className="flex-1 overflow-y-auto mb-2 p-2 bg-white/70 backdrop-blur-sm rounded-lg shadow-inner"
        style={{ overflowY: 'auto', maxHeight: '150px' }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === 'EcoMentor' ? 'text-green-800' : 'text-gray-900'}`}>
            <strong className="text-sm">{msg.sender === 'EcoMentor' ? 'EcoMentor:' : 'You:'}</strong>
            {msg.sender === 'EcoMentor' ? (
              <div className="pl-2 text-sm">
                {msg.text.split('\n').map((line, j) => (<p key={j}>{line}</p>))}
                
                {/* Show language selection options for the first message */}
                {i === 0 && !languageSelected && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors text-sm border border-green-300 shadow-sm"
                      onClick={() => selectLanguage('english')}
                      disabled={loading}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors text-sm border border-green-300 shadow-sm"
                      onClick={() => selectLanguage('hindi')}
                      disabled={loading}
                    >
                      🇮🇳 हिंदी
                    </button>
                    <button
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors text-sm border border-green-300 shadow-sm"
                      onClick={() => selectLanguage('kannada')}
                      disabled={loading}
                    >
                      🇮🇳 ಕನ್ನಡ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium"> {msg.text}</span>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {loading && <div className="text-green-700 text-sm">EcoMentor is typing<span className="animate-pulse">...</span></div>}
        
        {/* Show pre-prompts inside the chat area after the last message */}
        {languageSelected && !loading && messages.length > 1 && (
          <div className="mt-3 mb-1">
            <div className="text-xs text-green-700 mb-1">Suggested questions:</div>
            <div className="flex flex-wrap gap-1">
              {promptsByLanguage[language].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs hover:bg-green-200 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Input form */}
      {languageSelected && (
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
          <input
            className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm bg-white/80 backdrop-blur-sm"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a recycling question..."
            disabled={loading}
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition shadow text-sm"
            type="submit"
            disabled={loading}
          >
            Send
          </button>
        </form>
      )}
      
      {/* Reset button - show when there's more than one message */}
      {messages.length > 1 && (
        <button
          onClick={() => {
            // Reset to language selection
            setLanguageSelected(false);
            setMessages([{
              sender: 'EcoMentor',
              text: "Select your language:"
            }]);
          }}
          className="text-green-700 text-xs hover:text-green-900 self-end mt-1 flex items-center gap-1"
        >
          <span>🔄</span> {
            language === 'english' ? 'New chat' :
            language === 'hindi' ? 'नई चैट' :
            'ಹೊಸ ಚಾಟ್'
          }
        </button>
      )}
    </div>
  );
}












