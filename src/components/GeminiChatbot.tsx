'use client';
import { useState, useRef, useEffect } from 'react';

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
  sender: 'You' | 'Bot';
  text: string;
}

export default function GeminiChatbot() {
  // Add language state
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');

  // Get prompts for current language
  const prePrompts = promptsByLanguage[currentLanguage];

  // Language selection message - simple English only
  const languageSelectionMessage = "Welcome to EcoMentor! Please select your preferred language:";

  // Welcome messages in different languages after language selection
  const welcomeMessages = {
    english: "👋 Hello! I'm EcoMentor, your sustainable recycling guide. How can I help you today?",
    hindi: "👋 नमस्ते! मैं EcoMentor हूं, आपका सस्टेनेबल रीसाइक्लिंग गाइड। आज मैं आपकी कैसे मदद कर सकता हूं?",
    kannada: "👋 ನಮಸ್ಕಾರ! ನಾನು EcoMentor, ನಿಮ್ಮ ಸುಸ್ಥಿರ ರೀಸೈಕ್ಲಿಂಗ್ ಮಾರ್ಗದರ್ಶಿ. ನಾನು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
  };

  // Track if language has been selected
  const [languageSelected, setLanguageSelected] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'Bot',
      text: languageSelectionMessage
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (msg: string) => {
    setMessages((prev) => [...prev, { sender: 'You', text: msg }]);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          language: currentLanguage
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'Bot', text: data.reply }]);
    } catch {
      // Error messages in different languages
      const errorMessages = {
        english: "Sorry, I couldn't get a response.",
        hindi: "क्षमा करें, मुझे कोई जवाब नहीं मिला।",
        kannada: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
      };
      setMessages((prev) => [...prev, { sender: 'Bot', text: errorMessages[currentLanguage] }]);
    }
    setLoading(false);
    // Ensure scrolling to bottom after response is received
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  // Function to select language and show welcome message
  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
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
      { sender: 'You', text: languageNames[language] },
      { sender: 'Bot', text: welcomeMessages[language] }
    ]);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatRef.current) {
      // Use a small timeout to ensure the DOM has updated
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={chatRef} className="h-[170px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.sender === 'Bot' ? 'text-green-800' : 'text-black'}`}>
            <strong>{msg.sender}:</strong>
            {msg.sender === 'Bot' ? (
              <div className="mt-1 pl-4">
                {msg.text.split('\n').map((line, j) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;

                  // Check if line starts with a bullet point or number
                  const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || /^\d+\./.test(trimmedLine);

                  return (
                    <p key={j} className={`mb-2 ${isBullet ? 'flex items-start' : ''}`}>
                      {isBullet ? (
                        <>
                          <span className="text-green-600 mr-2 font-bold">{trimmedLine.charAt(0)}</span>
                          <span>{trimmedLine.substring(1).trim()}</span>
                        </>
                      ) : (
                        trimmedLine
                      )}
                    </p>
                  );
                })}

                {/* Show language selection options for the first message */}
                {i === 0 && !languageSelected ? (
                  <div className="mt-6 flex flex-col gap-4">
                    <button
                      className="text-center px-5 py-4 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors w-full font-medium border-2 border-green-300 shadow-md hover:shadow-lg flex items-center justify-center"
                      onClick={() => selectLanguage('english')}
                      disabled={loading}
                    >
                      <span className="mr-3 text-xl">🇬🇧</span> <span className="text-lg">English</span>
                    </button>
                    <button
                      className="text-center px-5 py-4 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors w-full font-medium border-2 border-green-300 shadow-md hover:shadow-lg flex items-center justify-center"
                      onClick={() => selectLanguage('hindi')}
                      disabled={loading}
                    >
                      <span className="mr-3 text-xl">🇮🇳</span> <span className="text-lg">हिंदी (Hindi)</span>
                    </button>
                    <button
                      className="text-center px-5 py-4 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors w-full font-medium border-2 border-green-300 shadow-md hover:shadow-lg flex items-center justify-center"
                      onClick={() => selectLanguage('kannada')}
                      disabled={loading}
                    >
                      <span className="mr-3 text-xl">🇮🇳</span> <span className="text-lg">ಕನ್ನಡ (Kannada)</span>
                    </button>
                  </div>
                ) : (
                  /* Show pre-prompts after language selection */
                  languageSelected && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {prePrompts.map((prompt, j) => (
                        <button
                          key={j}
                          className="text-left px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors w-full text-xs font-medium border border-green-200 shadow-sm hover:shadow flex items-center"
                          onClick={() => sendMessage(prompt)}
                          disabled={loading}
                        >
                          <span className="mr-1.5 text-xs">💬</span> {prompt}
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>
            ) : (
              <span> {msg.text}</span>
            )}
          </div>
        ))}
        {loading && <div className="text-green-700 font-semibold">Bot: <span className="animate-pulse">...</span></div>}
      </div>

      <div className="flex flex-col">
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (input.trim()) sendMessage(input.trim());
          }}
        >
          <input
            className="flex-1 border border-green-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a recycling question..."
            disabled={loading}
            style={{ color: '#000', background: '#f8fff8' }}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm font-medium"
            type="submit"
            disabled={loading}
          >
            Send
          </button>
        </form>

        {/* Reset button - show when there's more than one message */}
        {messages.length > 1 && (
          <button
            onClick={() => {
              // Reset to language selection
              setLanguageSelected(false);
              setMessages([{
                sender: 'Bot',
                text: languageSelectionMessage
              }]);
            }}
            className="text-green-700 text-xs hover:text-green-900 self-end mt-1 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
          >
            <span>🔄</span> {
              currentLanguage === 'english' ? 'Start new chat' :
              currentLanguage === 'hindi' ? 'नई चैट शुरू करें' :
              'ಹೊಸ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ'
            }
          </button>
        )}
      </div>
    </div>
  );
}