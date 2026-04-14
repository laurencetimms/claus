import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../theme.js";
import { SCENARIO } from "./scenario.js";
import Briefing from "./Briefing.jsx";
import TurnView from "./TurnView.jsx";
import OutcomeView from "./OutcomeView.jsx";
import EndState from "./EndState.jsx";
import ApiKeyInput from "../components/ApiKeyInput.jsx";

// ── Phase machine ─────────────────────────────────────────────────────────────
// briefing → loading-options → picking → loading-claus → outcome → (next turn or end)

export default function GameApp() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("tdc_api_key") || "");
  const [phase, setPhase] = useState("briefing");
  const [turnIndex, setTurnIndex] = useState(0);
  const [options, setOptions] = useState(null);
  const [playerOption, setPlayerOption] = useState(null);
  const [clausResult, setClausResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const handleApiKey = (key) => {
    setApiKey(key);
    sessionStorage.setItem("tdc_api_key", key);
  };

  const currentEvent = SCENARIO.events[turnIndex];

  // ── Start game / advance to next turn ────────────────────────────────────────

  async function loadOptions(tIdx) {
    setError(null);
    setOptions(null);
    setPlayerOption(null);
    setClausResult(null);
    setPhase("loading-options");

    const event = SCENARIO.events[tIdx];

    try {
      const res = await fetch("/api/game/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          teamState: SCENARIO.initialTeamState,
          event,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load options");
      setOptions(data.options);
      setPhase("picking");
    } catch (err) {
      setError(err.message);
      setPhase("picking");
    }
  }

  function handleStart() {
    loadOptions(0);
  }

  // ── Player chooses an option ──────────────────────────────────────────────────

  async function handleChoose(option) {
    setPlayerOption(option);
    setPhase("loading-claus");
    setError(null);

    try {
      const res = await fetch("/api/game/claus-pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          teamState: SCENARIO.initialTeamState,
          event: currentEvent,
          options,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "CLAUS failed to respond");
      setClausResult(data);
      setPhase("outcome");
    } catch (err) {
      setError(err.message);
      // Still show outcome even if CLAUS fails
      setClausResult(null);
      setPhase("outcome");
    }
  }

  // ── Advance to next turn or end ───────────────────────────────────────────────

  function handleNext() {
    // Record this turn in history
    setHistory(prev => [
      ...prev,
      {
        event: currentEvent,
        options,
        playerOption,
        clausChosenId: clausResult?.chosenId || null,
        clausReasoning: clausResult?.reasoning || null,
      },
    ]);

    const nextIndex = turnIndex + 1;

    if (nextIndex >= SCENARIO.events.length) {
      setPhase("end");
    } else {
      setTurnIndex(nextIndex);
      loadOptions(nextIndex);
    }
  }

  // ── Restart ───────────────────────────────────────────────────────────────────

  function handleRestart() {
    setPhase("briefing");
    setTurnIndex(0);
    setOptions(null);
    setPlayerOption(null);
    setClausResult(null);
    setHistory([]);
    setError(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (!apiKey) {
    return <ApiKeyInput onSubmit={handleApiKey} />;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: C.bg, color: C.text,
      fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 24px", borderBottom: `1px solid ${C.border}`,
        background: C.surface, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{
            fontFamily: "Georgia, serif", fontSize: "16px",
            fontWeight: "700", color: C.text,
          }}>
            CLAUS
          </span>
          <span style={{
            fontSize: "10px", color: C.dim,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            The Demo — Coach Without vs With
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/" style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim, textDecoration: "none",
          }}>
            ← Coaching tool
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem("tdc_api_key"); setApiKey(""); }}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: "10px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
              background: "transparent", border: `1px solid ${C.border2}`,
              color: C.dim,
            }}
          >
            Change key
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {phase === "briefing" && (
          <Briefing scenario={SCENARIO} onStart={handleStart} />
        )}

        {(phase === "loading-options" || phase === "picking") && (
          <TurnView
            event={currentEvent}
            turnIndex={turnIndex}
            totalTurns={SCENARIO.events.length}
            options={options}
            loading={phase === "loading-options"}
            error={error}
            onChoose={handleChoose}
          />
        )}

        {(phase === "loading-claus" || phase === "outcome") && playerOption && (
          <OutcomeView
            event={currentEvent}
            playerOption={playerOption}
            clausResult={clausResult}
            options={options}
            turnIndex={turnIndex}
            totalTurns={SCENARIO.events.length}
            loadingClaus={phase === "loading-claus"}
            error={error}
            onNext={handleNext}
          />
        )}

        {phase === "end" && (
          <EndState
            scenario={SCENARIO}
            history={history}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
