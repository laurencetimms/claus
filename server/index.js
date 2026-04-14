import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import { parseScenario } from "./parseScenario.js";

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
  app.get("/", (req, res) => {
    res.send("Dev server — open <a href='http://localhost:5173'>http://localhost:5173</a> for the frontend.");
  });
}

// ── Scenarios directory ───────────────────────────────────────────────────────

const scenariosDir = path.join(__dirname, "scenarios");

// ── Scenario endpoint ─────────────────────────────────────────────────────────

app.get("/api/game/scenario/:id", (req, res) => {
  const scenarioFile = path.join(scenariosDir, `${req.params.id}.md`);
  if (!fs.existsSync(scenarioFile)) {
    return res.status(404).json({ error: `Scenario '${req.params.id}' not found` });
  }
  try {
    const scenario = parseScenario(scenarioFile, scenariosDir);
    res.json(scenario);
  } catch (err) {
    res.status(500).json({ error: `Failed to parse scenario: ${err.message}` });
  }
});

// ── Skill loaders ─────────────────────────────────────────────────────────────

function loadSkill() {
  const skillPath = path.join(__dirname, "skill.md");
  if (!fs.existsSync(skillPath)) throw new Error(`skill.md not found at ${skillPath}`);
  return fs.readFileSync(skillPath, "utf-8");
}

function loadInterventionSkill() {
  const skillPath = path.join(__dirname, "intervention-generation.md");
  if (!fs.existsSync(skillPath)) throw new Error(`intervention-generation.md not found at ${skillPath}`);
  return fs.readFileSync(skillPath, "utf-8");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function parseJSON(text) {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

function buildEventUserMessage(teamState, event) {
  return [
    "## Team State",
    "",
    teamState,
    "",
    "---",
    "",
    "## Event",
    "",
    `**Turn:** ${event.turn}`,
    `**Tags:** ${event.tags.join(", ")}`,
    `**Intervention constraints:** ${event.interventionConstraints || "None"}`,
    "",
    "**Description:**",
    "",
    event.briefing,
  ].join("\n");
}

// ── Existing coaching chat endpoint ───────────────────────────────────────────

app.post("/chat", async (req, res) => {
  const { apiKey, teamState, messages = [], userMessage } = req.body;

  if (!apiKey) return res.status(400).json({ error: "API key required" });
  if (!userMessage) return res.status(400).json({ error: "userMessage required" });

  let skill;
  try {
    skill = loadSkill();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

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
    const assistantMessage = { role: "assistant", content: fullText };

    res.json({ reply, updatedState, assistantMessage });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Anthropic API error" });
  }
});

// ── Game: generate intervention options ───────────────────────────────────────

app.post("/api/game/options", async (req, res) => {
  const { apiKey, teamState, event } = req.body;

  if (!apiKey) return res.status(400).json({ error: "API key required" });
  if (!teamState) return res.status(400).json({ error: "teamState required" });
  if (!event) return res.status(400).json({ error: "event required" });

  let skill;
  try {
    skill = loadInterventionSkill();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: skill,
      messages: [{ role: "user", content: buildEventUserMessage(teamState, event) }],
    });

    const text = response.content.map((b) => b.text || "").join("");
    const parsed = parseJSON(text);
    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Failed to parse options from model response" });
    }
    res.status(err.status || 500).json({ error: err.message || "Anthropic API error" });
  }
});

// ── Game: CLAUS picks an option ───────────────────────────────────────────────

const GAME_MODE_SUFFIX = `

---

## Game Mode

You are operating in game evaluation mode. Ignore the session steps above. Do not attempt to load any files or use any tools.

You will be given a team state document, an event description, and four coaching intervention options labelled A–D. Using the evidence base above, evaluate each option against the team's current state and its moderating conditions. Select the option you would recommend.

Respond ONLY with valid JSON — no preamble, no explanation, no markdown:
{"chosenId": "A", "reasoning": "<1-2 sentences grounded in the evidence explaining your choice>"}`;

app.post("/api/game/claus-pick", async (req, res) => {
  const { apiKey, teamState, event, options } = req.body;

  if (!apiKey) return res.status(400).json({ error: "API key required" });
  if (!teamState) return res.status(400).json({ error: "teamState required" });
  if (!event) return res.status(400).json({ error: "event required" });
  if (!options) return res.status(400).json({ error: "options required" });

  let skill;
  try {
    skill = loadSkill();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const optionsText = options
    .map((o) => `**Option ${o.id}: ${o.label}**\n${o.description}`)
    .join("\n\n");

  const userMessage = [
    buildEventUserMessage(teamState, event),
    "",
    "---",
    "",
    "## Intervention Options",
    "",
    optionsText,
  ].join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: skill + GAME_MODE_SUFFIX,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content.map((b) => b.text || "").join("");
    const parsed = parseJSON(text);
    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Failed to parse CLAUS pick from model response" });
    }
    res.status(err.status || 500).json({ error: err.message || "Anthropic API error" });
  }
});

// ── SPA fallback in production ────────────────────────────────────────────────

if (fs.existsSync(clientDist)) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`CLAUS server running on http://localhost:${PORT}`);
  try { loadSkill(); console.log("skill.md loaded"); } catch (err) { console.warn(`WARNING: ${err.message}`); }
  try { loadInterventionSkill(); console.log("intervention-generation.md loaded"); } catch (err) { console.warn(`WARNING: ${err.message}`); }
});
