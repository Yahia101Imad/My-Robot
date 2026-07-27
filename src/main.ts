// Main entry point for the AI robot chatbot (terminal version).
//
// Run with: npm run dev
// Requires an API key set in a .env file (see .env.example).

import "dotenv/config";
import readline from "readline";
import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt } from "./personality";
import { getMemoryAsText, rememberFact } from "./memory";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Short-term memory: only lives while the program is running.
// Note: Gemini uses "model" instead of "assistant" for the AI's role.
type ChatMessage = { role: "user" | "model"; parts: { text: string }[] };
const conversationHistory: ChatMessage[] = [];

// Send the user's message to the AI and return its reply
async function getAiReply(userMessage: string): Promise<string> {
  conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

  const systemPrompt = buildSystemPrompt(getMemoryAsText());

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: conversationHistory,
    config: { systemInstruction: systemPrompt },
  });

  const replyText = response.text ?? "";

  conversationHistory.push({ role: "model", parts: [{ text: replyText }] });
  return replyText;
}

// Very simple command handler so you can teach the robot facts manually.
// Example: "remember my name is Ahmed" -> saves note: "my name is Ahmed"
// This is a basic placeholder; you can make it smarter later.
function handleSpecialCommands(userInput: string): string | null {
  const lower = userInput.toLowerCase();
  if (lower.startsWith("remember ")) {
    const fact = userInput.slice(9); // remove "remember " prefix
    rememberFact("note", fact);
    return `Got it, I'll remember: ${fact}`;
  }
  return null;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(): void {
  rl.question("You: ", async (userInput) => {
    const trimmed = userInput.trim();

    if (!trimmed) {
      askQuestion();
      return;
    }

    if (["exit", "quit"].includes(trimmed.toLowerCase())) {
      console.log("Bot: See you later!");
      rl.close();
      return;
    }

    const specialReply = handleSpecialCommands(trimmed);
    if (specialReply) {
      console.log(`Bot: ${specialReply}\n`);
      askQuestion();
      return;
    }

    try {
      const reply = await getAiReply(trimmed);
      console.log(`Bot: ${reply}\n`);
    } catch (error) {
      console.error("Error talking to the AI:", error);
    }

    askQuestion();
  });
}

console.log("Chatbot ready. Type 'exit' to quit.\n");
askQuestion();
