import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../theme.js";
import Briefing from "./Briefing.jsx";
import TurnView from "./TurnView.jsx";
import OutcomeView from "./OutcomeView.jsx";
import EndState from "./EndState.jsx";
import ApiKeyInput from "../components/ApiKeyInput.jsx";

export default function GameApp() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("tdc_api_key") || "");
  const [scenario, setScenario] = useState(null);
  const [scenarioError, setScenarioError] = useState(null);
  const [phase, setPhase] = useState("loading-scenario");
  const [turnIndex, setTurnIndex] = useState(0);
  const [options, setOptions] = useState(null);
  const [playerOption, setPlayerOption] = useState(null);
  const [clausResult, setClausResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/game/scenario/the-demo")
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setScenario(data);
        setPhase("briefing");
      })
      .catch(err => setScenarioError(err.message));
  }, []);

  const handleApiKey = (key) => {
    setApiKey(key);
    sessionStorage.setItem("tdc_api_key", key);
  };

  const currentEvent = scenario?.events[turnIndex];

  async function loadTurn(tIdx) {
    setError(null);
    setOptions(null);
    setPlayerOption(null);
    setClausResult(null);
    setPhase("loading-options");
    const event = scenario.events[tIdx];
    try {
      const res = await fetch("/api/game/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, teamState: scenario.initialTeamState, event }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load turn");
      // Store options and CLAUS pick together — both come from the same reasoning pass
      setOptions(data.options);
      setClausResult({ chosenId: data.chosenId, reasoning: data.reasoning });
      setPhase("picking");
    } catch (err) {
      setError(err.message);
      setPhase("picking");
    }
  }

  function handleStart() { loadTurn(0); }

  function handleChoose(option) {
    setPlayerOption(option);
    setPhase("outcome");
  }

  function handleNext() {
    setHistory(prev => [...prev, {
      event: currentEvent, options, playerOption,
      clausChosenId: clausResult?.chosenId || null,
      clausReasoning: clausResult?.reasoning || null,
    }]);
    const nextIndex = turnIndex + 1;
    if (nextIndex >= scenario.events.length) {
      setPhase("end");
    } else {
      setTurnIndex(nextIndex);
      loadTurn(nextIndex);
    }
  }

  function handleRestart() {
    setPhase("briefing");
    setTurnIndex(0);
    setOptions(null);
    setPlayerOption(null);
    setClausResult(null);
    setHistory([]);
    setError(null);
  }

  if (!apiKey) return <ApiKeyInput onSubmit={handleApiKey} />;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: C.bg, color: C.text, fontFamily: "'DM Mono', 'Courier New', monospace",
    }}>
      <div style={{
        padding: "12px 24px", borderBottom: `1px solid ${C.border}`,
        background: C.surface, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: "700", color: C.text }}>
            CLAUS
          </span>
          <span style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {scenario ? `${scenario.title} — Coach Without vs With` : "Loading…"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/" style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim, textDecoration: "none",
          }}>← Coaching tool</Link>
          <button onClick={() => { sessionStorage.removeItem("tdc_api_key"); setApiKey(""); }} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border2}`, color: C.dim,
          }}>Change key</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {phase === "loading-scenario" && !scenarioError && (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", color: C.dim, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
          }}>Loading scenario…</div>
        )}
        {scenarioError && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              background: C.redDim, border: `1px solid ${C.red}`, borderRadius: "3px",
              padding: "16px 24px", fontSize: "12px", color: C.red, maxWidth: 420, textAlign: "center",
            }}>Failed to load scenario: {scenarioError}</div>
          </div>
        )}
        {scenario && phase === "briefing" && (
          <Briefing scenario={scenario} onStart={handleStart} />
        )}
        {scenario && (phase === "loading-options" || phase === "picking") && currentEvent && (
          <TurnView
            event={currentEvent} turnIndex={turnIndex} totalTurns={scenario.events.length}
            options={options} loading={phase === "loading-options"} error={error} onChoose={handleChoose}
          />
        )}
        {scenario && phase === "outcome" && playerOption && (
          <OutcomeView
            event={currentEvent} playerOption={playerOption} clausResult={clausResult}
            options={options} turnIndex={turnIndex} totalTurns={scenario.events.length}
            loadingClaus={false} error={error} onNext={handleNext}
          />
        )}
        {scenario && phase === "end" && (
          <EndState scenario={scenario} history={history} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
