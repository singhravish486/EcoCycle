import { NextResponse } from 'next/server';
import axios from 'axios';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Language-specific prompts to guide the AI
const languagePrompts = {
  english: "You are EcoMentor, a helpful recycling assistant. CRITICAL INSTRUCTION: Your ENTIRE response MUST be in the form of short bullet points (using '-') or a numbered list. NEVER write paragraphs. Each point should be 1-2 sentences maximum. Answer the following question about recycling and sustainability in a friendly, informative way. Limit your response to 5-6 points maximum: ",
  hindi: "आप EcoMentor हैं, एक सहायक रीसाइक्लिंग सहायक। महत्वपूर्ण निर्देश: आपका पूरा उत्तर छोटे बुलेट पॉइंट्स ('-' का उपयोग करके) या क्रमांकित सूची के रूप में होना चाहिए। कभी भी पैराग्राफ न लिखें। प्रत्येक बिंदु अधिकतम 1-2 वाक्य का होना चाहिए। रीसाइक्लिंग और सस्टेनेबिलिटी के बारे में निम्नलिखित प्रश्न का उत्तर मित्रवत, जानकारीपूर्ण तरीके से दें। अपने उत्तर को अधिकतम 5-6 बिंदुओं तक सीमित रखें: ",
  kannada: "ನೀವು EcoMentor, ಸಹಾಯಕ ರೀಸೈಕ್ಲಿಂಗ್ ಸಹಾಯಕ. ಮಹತ್ವದ ಸೂಚನೆ: ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಪ್ರತಿಕ್ರಿಯೆಯು ಚಿಕ್ಕ ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳು ('-' ಬಳಸಿ) ಅಥವಾ ಸಂಖ್ಯೆಯ ಪಟ್ಟಿಯ ರೂಪದಲ್ಲಿರಬೇಕು. ಎಂದಿಗೂ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳನ್ನು ಬರೆಯಬೇಡಿ. ಪ್ರತಿ ಬಿಂದು ಗರಿಷ್ಠ 1-2 ವಾಕ್ಯಗಳಾಗಿರಬೇಕು. ರೀಸೈಕ್ಲಿಂಗ್ ಮತ್ತು ಸುಸ್ಥಿರತೆ ಕುರಿತು ಈ ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗೆ ಸ್ನೇಹಪೂರ್ಣ, ಮಾಹಿತಿಪೂರ್ಣ ರೀತಿಯಲ್ಲಿ ಉತ್ತರಿಸಿ. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಗರಿಷ್ಠ 5-6 ಅಂಕಗಳಿಗೆ ಸೀಮಿತಗೊಳಿಸಿ: "
};

// Enhanced format helper function to ensure responses are in bullet points
function formatResponse(text: string): string {
  // If the text is empty, return a default message
  if (!text || text.trim() === '') {
    return "- No response generated\n- Please try again with a different question";
  }
  
  // If the response already has bullet points or numbers, return it as is
  if (text.includes('\n- ') || text.includes('\n• ') || /\n\d+\./.test(text)) {
    return text;
  }
  
  // Split by sentences and convert to bullet points
  // This is more aggressive than splitting by paragraphs
  let sentences = text.split(/(?<=[.!?])\s+/);
  
  // Filter out empty sentences and very short ones (likely not complete sentences)
  sentences = sentences.filter(s => s.trim().length > 10);
  
  // Group sentences into chunks of 1-2 sentences to make reasonable bullet points
  const bulletPoints = [];
  let currentPoint = "";
  
  for (const sentence of sentences) {
    if (currentPoint.length === 0) {
      currentPoint = sentence;
    } else if (currentPoint.length + sentence.length < 150) {
      // If adding this sentence doesn't make the point too long, add it
      currentPoint += " " + sentence;
    } else {
      // Otherwise, finish the current point and start a new one
      bulletPoints.push(currentPoint);
      currentPoint = sentence;
    }
  }
  
  // Add the last point if there is one
  if (currentPoint.length > 0) {
    bulletPoints.push(currentPoint);
  }
  
  // Limit to 6 points maximum
  const limitedPoints = bulletPoints.slice(0, 6);
  
  // Convert to bullet point format
  return limitedPoints.map(p => `- ${p.trim()}`).join('\n');
}

export async function POST(request: Request) {
  try {
    const { message, language = 'english' } = await request.json();
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { reply: "- Configuration error\n- Please contact the administrator" },
        { status: 500 }
      );
    }
    
    // Get the appropriate prompt based on language
    const promptTemplate = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.english;
    const fullPrompt = promptTemplate + message;
    
    const GEMINI_MODEL = "gemini-1.5-pro";
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ 
          parts: [{ 
            text: fullPrompt + " FINAL REMINDER: Your response MUST be formatted as bullet points or a numbered list. Each point should be brief (1-2 sentences). DO NOT write paragraphs. Maximum 5-6 points total." 
          }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      }
    );
    
    let aiReply = response.data.candidates[0].content.parts[0].text;
    
    // Ensure the response is formatted as bullet points
    aiReply = formatResponse(aiReply);
    
    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    const err = error as any;
    console.error('Error:', err.response?.data || err.message || err);
    return NextResponse.json(
      { reply: "- Error communicating with Gemini API\n- Please try again later" },
      { status: 500 }
    );
  }
}
