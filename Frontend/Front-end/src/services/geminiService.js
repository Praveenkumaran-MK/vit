import { GoogleGenerativeAI } from "@google/generative-ai";

let ai = null;
let chat = null;

// -----------------------------------------
// Initialize Gemini instance
// -----------------------------------------
try {
  const key = import.meta.env.VITE_GEMINI_API_KEY;

  if (!key) {
    console.error("Gemini API key is missing. Bot disabled.");
  } else {
    ai = new GoogleGenerativeAI(key);
  }
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

// -----------------------------------------
// Start chat session with system instruction
// -----------------------------------------
const initializeChat = () => {
  if (!ai) return null;

  const systemInstruction = `
    You are Parky, a friendly parking assistant.
    Help users find parking, understand booking rules,
    calculate cost, explain features, and provide directions.
    Keep responses simple, helpful, and accurate.
  `;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash", // ✔ correct working model
      systemInstruction,
    });

    chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return chat;
  } catch (err) {
    console.error("Failed to start Gemini chat:", err);
    return null;
  }
};

// -----------------------------------------
// Public: Stream AI response
// -----------------------------------------
export const getBotResponseStream = async function* (history, newMessage) {
  if (!ai) {
    yield "Sorry, AI assistant is unavailable right now.";
    return;
  }

  if (!chat) initializeChat();

  try {
    const resp = await chat.sendMessageStream(newMessage);

    for await (const chunk of resp.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (err) {
    console.error("Chatbot error:", err);
    yield "Oops! I couldn’t respond right now.";

    // Reset chat session so next request works
    chat = null;
  }
};
