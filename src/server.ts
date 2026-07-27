// Optional Express server for the chatbot.
//
// This exposes a single POST /chat endpoint so you can later connect
// a website, mobile app, or voice interface to the same "brain".
//
// Run with: npm run dev:server (see package.json)
// Test with: curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"

import "dotenv/config";
import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt } from "./personality";
import { getMemoryAsText, rememberFact } from "./memory";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// NOTE: this simple in-memory history is shared by all requests.
// Fine for local testing with one user; for multiple users you'd
// key this by a session/user ID instead.
// Gemini uses "model" instead of "assistant" for the AI's role.
type ChatMessage = { role: "user" | "model"; parts: { text: string }[] };
const conversationHistory: ChatMessage[] = [];

app.post("/chat", async (req: Request, res: Response) => {
  const userMessage: string | undefined = req.body?.message;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Missing 'message' field in request body" });
  }

  // Simple manual memory command, same as the CLI version
  if (userMessage.toLowerCase().startsWith("remember ")) {
    const fact = userMessage.slice(9);
    rememberFact("note", fact);
    return res.json({ reply: `Got it, I'll remember: ${fact}` });
  }

  conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });
  const systemPrompt = buildSystemPrompt(getMemoryAsText());

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: conversationHistory,
      config: { systemInstruction: systemPrompt },
    });

    const replyText = response.text ?? "";

    conversationHistory.push({ role: "model", parts: [{ text: replyText }] });
    res.json({ reply: replyText });
  } catch (error) {
    console.error("Error talking to the AI:", error);
    res.status(500).json({ error: "Something went wrong talking to the AI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chatbot API running at http://localhost:${PORT}`);
});
