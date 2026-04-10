import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Serve Vite build in production
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
} else {
  // Dev mode: guide devs to the Vite server
  app.get("/", (req, res) => {
    res.send("Dev server — open <a href='http://localhost:5173'>http://localhost:5173</a> for the frontend.");
  });
}

// Load skill at startup — reload on each request in dev so edits are picked up
function loadSkill() {
  const skillPath = path.join(__dirname, "skill.md");
  if (!fs.existsSync(skillPath)) {
    throw new Error(`skill.md not found at ${skillPath}`);
  }
  return fs.readFileSync(skillPath, "utf-8");
}

function extractState(text) {
  const START = "---BEGIN TEAM STATE---";
  const END = "---END TEAM STATE---";
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start !== -1 && end !== -1) {
    return {
      reply: text.slice(0, start).trim(),
      updatedState: text.slice(start + START.length, end).trim(),
    };
  }
  return { reply: text.trim(), updatedState: null };
}

app.post("/chat", async (req, res) => {
  const { apiKey, teamState, messages = [], userMessage } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key required" });
  }
  if (!userMessage) {
    return res.status(400).json({ error: "userMessage required" });
  }

  let skill;
  try {
    skill = loadSkill();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // Build message history for Anthropic
  // On first message with a state doc, prepend it to the user content
  const apiMessages = [...messages];

  if (teamState && apiMessages.length === 0) {
    apiMessages.push({
      role: "user",
      content: `Here is the current team state document:\n\n${teamState}\n\n---\n\n${userMessage}`,
    });
  } else {
    apiMessages.push({ role: "user", content: userMessage });
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: skill,
      messages: apiMessages,
    });

    const fullText = response.content.map((b) => b.text || "").join("");
    const { reply, updatedState } = extractState(fullText);

    // Return the assistant message to add to history on the client
    const assistantMessage = { role: "assistant", content: fullText };

    res.json({ reply, updatedState, assistantMessage });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Anthropic API error";
    res.status(status).json({ error: message });
  }
});

// SPA fallback in production
if (fs.existsSync(clientDist)) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Team Dynamics Coach server running on http://localhost:${PORT}`);
  try {
    loadSkill();
    console.log("skill.md loaded successfully");
  } catch (err) {
    console.warn(`WARNING: ${err.message}`);
  }
});
