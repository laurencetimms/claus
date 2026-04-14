import fs from "fs";
import path from "path";

/**
 * Parses a scenario markdown file into the SCENARIO JSON shape
 * consumed by the game client.
 *
 * Expected markdown structure:
 *   ## Setup        — key/value pairs + Player Briefing block
 *   ## Event Sequence
 *     ### Event N — Title
 *       **Tags:** ...
 *       **Intervention constraints:** ...
 *       **Player-facing briefing:** (body follows)
 */
export function parseScenario(scenarioPath, scenariosDir) {
  const raw = fs.readFileSync(scenarioPath, "utf-8");
  const lines = raw.split("\n");

  // ── Extract embedded team state ───────────────────────────────────────────────
  const STATE_START = "---BEGIN TEAM STATE---";
  const STATE_END   = "---END TEAM STATE---";
  const stateStartIdx = raw.indexOf(STATE_START);
  const stateEndIdx   = raw.indexOf(STATE_END);
  const initialTeamState = stateStartIdx !== -1 && stateEndIdx !== -1
    ? raw.slice(stateStartIdx + STATE_START.length, stateEndIdx).trim()
    : "";

  if (!initialTeamState) {
    console.warn("[parseScenario] No embedded team state found in", scenarioPath);
  }

  // ── Setup section ────────────────────────────────────────────────────────────
  const setupStart = lines.findIndex(l => l.trim() === "## Setup");
  const eventSeqStart = lines.findIndex(l => l.trim() === "## Event Sequence");

  if (setupStart === -1) throw new Error("No ## Setup section found");
  if (eventSeqStart === -1) throw new Error("No ## Event Sequence section found");

  const setupLines = lines.slice(setupStart + 1, eventSeqStart);
  const setup = parseSetup(setupLines);

  // ── Events ───────────────────────────────────────────────────────────────────
  const eventLines = lines.slice(eventSeqStart + 1);
  const events = parseEvents(eventLines);

  return {
    id: path.basename(scenarioPath, ".md"),
    title: setup.title,
    team: setup.team,
    turnCount: events.length,
    playerBriefing: setup.playerBriefing,
    coachingObjective: setup.coachingObjective,
    initialTeamState,
    events,
  };
}

// ── Setup parser ──────────────────────────────────────────────────────────────

function parseSetup(lines) {
  const result = {
    title: "",
    team: "",
    coachingObjective: "",
    playerBriefing: "",
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Key: value pairs
    const kvMatch = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().toLowerCase().replace(/\s+/g, "-");
      const value = kvMatch[2].trim();
      if (key === "title") result.title = value;
      if (key === "team") result.team = value;
      if (key === "coaching-objective") result.coachingObjective = value;
      // initial-team-state is now embedded directly in the scenario markdown
      i++;
      continue;
    }

    // Player briefing block — starts with **Player briefing:**
    if (line.trim() === "**Player briefing:**") {
      i++;
      const briefingLines = [];
      while (i < lines.length && !lines[i].startsWith("**") && lines[i].trim() !== "---") {
        briefingLines.push(lines[i]);
        i++;
      }
      result.playerBriefing = briefingLines.join("\n").trim();
      continue;
    }

    i++;
  }

  return result;
}

// ── Events parser ─────────────────────────────────────────────────────────────

function parseEvents(lines) {
  const events = [];
  let i = 0;

  while (i < lines.length) {
    // Match ### Event N — Title
    const headingMatch = lines[i].match(/^###\s+Event\s+(\d+)\s+[—–-]+\s+(.+)$/);
    if (!headingMatch) { i++; continue; }

    const turn = parseInt(headingMatch[1], 10);
    const title = headingMatch[2].trim();
    i++;

    let tags = [];
    let interventionConstraints = null;
    let briefing = "";

    // Scan until next ### or end
    while (i < lines.length && !lines[i].match(/^###/)) {
      const line = lines[i];

      // **Tags:** `tag1` `tag2`
      const tagsMatch = line.match(/^\*\*Tags:\*\*\s*(.+)$/);
      if (tagsMatch) {
        tags = tagsMatch[1].match(/`([^`]+)`/g)?.map(t => t.replace(/`/g, "")) || [];
        i++;
        continue;
      }

      // **Intervention constraints:** value or None
      const constraintsMatch = line.match(/^\*\*Intervention constraints:\*\*\s*(.+)$/);
      if (constraintsMatch) {
        const val = constraintsMatch[1].trim();
        interventionConstraints = val.toLowerCase() === "none" ? null : val;
        i++;
        continue;
      }

      // **Player-facing briefing:** — body follows on subsequent lines
      if (line.trim() === "**Player-facing briefing:**") {
        i++;
        const briefingLines = [];
        while (
          i < lines.length &&
          !lines[i].match(/^###/) &&
          lines[i].trim() !== "---" &&
          !lines[i].match(/^\*\*/)
        ) {
          briefingLines.push(lines[i]);
          i++;
        }
        briefing = briefingLines.join("\n").trim();
        continue;
      }

      i++;
    }

    if (briefing) {
      events.push({ turn, title, tags, interventionConstraints, briefing });
    }
  }

  return events;
}
