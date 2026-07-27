// Long-term memory module.
//
// Right now this saves data to a simple local JSON file.
// Later, you could swap this out for a real database without
// changing the rest of the program (that's the point of keeping
// this logic in its own file).

import fs from "fs";
import path from "path";

const MEMORY_FILE = path.join(process.cwd(), "long_term_memory.json");

type MemoryData = Record<string, string>;

// Load saved facts about the user. Returns an empty object if nothing exists yet.
export function loadMemory(): MemoryData {
  if (!fs.existsSync(MEMORY_FILE)) {
    return {};
  }
  const raw = fs.readFileSync(MEMORY_FILE, "utf-8");
  return JSON.parse(raw) as MemoryData;
}

// Save the updated facts object back to disk
export function saveMemory(memoryData: MemoryData): void {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memoryData, null, 2), "utf-8");
}

// Store a single fact, e.g. rememberFact("name", "Ahmed")
export function rememberFact(key: string, value: string): void {
  const memory = loadMemory();
  memory[key] = value;
  saveMemory(memory);
}

// Turn saved facts into a short text summary the AI can read as context
export function getMemoryAsText(): string {
  const memory = loadMemory();
  const keys = Object.keys(memory);

  if (keys.length === 0) {
    return "No saved facts about the user yet.";
  }

  return keys.map((key) => `${key}: ${memory[key]}`).join(", ");
}
