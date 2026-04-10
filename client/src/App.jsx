import { useState, useRef, useEffect, useCallback } from "react";
import ApiKeyInput from "./components/ApiKeyInput.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import StatePanel from "./components/StatePanel.jsx";

const C = {
  bg: "#141210", surface: "#1c1917", surface2: "#242018",
  border: "#2e2a24", border2: "#3a3530",
  text: "#e8e0d5", muted: "#8a8278", dim: "#5a554f",
  accent: "#c4873a", accentSoft: "#a06c28", accentDim: "#3d2d14",
  green: "#5a8a5a", greenDim: "#1e2e1e",
  red: "#8a4a4a", redDim: "#2e1e1e",
};

export { C };

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("tdc_api_key") || "");
  const [messages, setMessages] = useState([]);      // display messages
  const [apiHistory, setApiHistory] = useState([]);  // full Anthropic message history
  const [teamState, setTeamState] = useState(null);  // uploaded state doc
  const [currentState, setCurrentState] = useState(null); // latest extracted state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApiKey = (key) => {
    setApiKey(key);
    sessionStorage.setItem("tdc_api_key", key);
  };

  const handleStateUpload = (markdown) => {
    setTeamState(markdown);
    setCurrentState(markdown);
  };

  const clearSession = () => {
    setMessages([]);
    setApiHistory([]);
    setTeamState(null);
    setError("");
  };

  const sendMessage = useCallback(async (userMessage) => {
    if (loading || !userMessage.trim() || !apiKey) return;
    setError("");

    setMessages(prev => [...prev, { role: "user", text: userMessage }]);

    setLoading(true);
    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          teamState: apiHistory.length === 0 ? teamState : null,
          messages: apiHistory,
          userMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Server error");
        setLoading(false);
        return;
      }

      const { reply, updatedState, assistantMessage } = data;

      setApiHistory(prev => [
        ...prev,
        // If first message and state was prepended, the server handled it —
        // we store the plain user message for subsequent turns
        { role: "user", content: userMessage },
        assistantMessage,
      ]);

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: reply, stateExtracted: !!updatedState },
      ]);

      if (updatedState) setCurrentState(updatedState);

    } catch (err) {
      setError("Network error: " + err.message);
    }
    setLoading(false);
  }, [loading, apiKey, teamState, apiHistory]);

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
        padding: "14px 24px", borderBottom: `1px solid ${C.border}`,
        background: C.surface, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
          <h1 style={{
            fontFamily: "Georgia, serif", fontSize: "17px",
            fontWeight: "700", color: C.text, margin: 0,
          }}>
            Team Dynamics Coach
          </h1>
          <span style={{
            fontSize: "10px", color: C.dim,
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Longitudinal · Structured · Private
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "2px",
            letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "500",
            background: currentState ? C.greenDim : C.surface2,
            color: currentState ? C.green : C.dim,
            border: `1px solid ${currentState ? "#2e4a2e" : C.border}`,
          }}>
            {currentState ? "Team loaded" : "No team loaded"}
          </span>
          <button onClick={clearSession} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim, transition: "all 0.15s",
          }}>
            Clear session
          </button>
          <button onClick={() => { sessionStorage.removeItem("tdc_api_key"); setApiKey(""); }} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim, transition: "all 0.15s",
          }}>
            Change key
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", flex: 1, overflow: "hidden" }}>
        <ChatPanel
          messages={messages}
          loading={loading}
          error={error}
          onSend={sendMessage}
          onStateUpload={handleStateUpload}
          teamStateLoaded={!!teamState}
        />
        <StatePanel
          stateMarkdown={currentState}
        />
      </div>
    </div>
  );
}
