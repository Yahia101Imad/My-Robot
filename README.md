# AI Robot Chatbot (Node.js / TypeScript version)

A personalized AI chatbot with short-term and long-term memory.
Same architecture as the Python version, just in a stack you already know.

## Project structure

```
ai_robot_project_node/
├── src/
│   ├── main.ts         # CLI entry point - chat in the terminal
│   ├── server.ts        # Optional Express API (POST /chat) for a future web/mobile UI
│   ├── personality.ts    # Robot's character (edit this to customize behavior)
│   └── memory.ts         # Long-term memory (saves facts to a JSON file)
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Setup

1. Open this folder in VS Code.
2. Install dependencies:
   ```
   npm install
   ```
3. Create your real `.env` file:
   ```
   copy .env.example .env
   ```
   (on macOS/Linux use `cp` instead of `copy`)

   Then open `.env` and paste your real Gemini API key. Get one for free
   at https://aistudio.google.com/apikey (no billing setup required for
   the free tier).

## Running it

**Terminal chat version:**
```
npm run dev
```
Type messages, type `exit` to quit.

**Express API version (optional, for later):**
```
npm run dev:server
```
Then test it with:
```
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"
```

Try: `remember my name is Ahmed` — then ask something later in the same
session (or a new server request) and see if it uses that saved fact.

## Pushing to GitHub

```
git init
git add .
git commit -m "Initial commit: AI robot starter (Node/TS)"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`node_modules/`, `.env`, and `long_term_memory.json` are excluded via
`.gitignore` — only source code gets uploaded.

## What to customize first

Open `src/personality.ts` and change `ROBOT_NAME` and the personality
rules in `SYSTEM_PROMPT_TEMPLATE`.

## Next steps (later)

- Add Speech-to-Text (e.g. a cloud API, or `whisper-node`) for voice input.
- Add Text-to-Speech (e.g. ElevenLabs API) for voice output.
- Connect `server.ts` to a simple frontend, or move everything to a
  Raspberry Pi (Node runs fine on Raspberry Pi OS) connected to a mic + speaker.
