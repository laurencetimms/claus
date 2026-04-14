import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { C } from "./theme.js";
import ApiKeyInput from "./components/ApiKeyInput.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import StatePanel from "./components/StatePanel.jsx";

export { C };

export default function App() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("tdc_api_key") || "");
  const [messages, setMessages] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [teamState, setTeamState] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    setCurrentState(null);
    setError("");
    setShowClearConfirm(false);
  };

  const handleClearClick = () => {
    if (currentState !== teamState) {
      setShowClearConfirm(true);
    } else {
      clearSession();
    }
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
      {showClearConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(22, 14, 6, 0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border2}`,
            borderRadius: "3px", padding: "24px 28px", maxWidth: "360px", width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: "12px",
              color: C.text, margin: "0 0 20px", lineHeight: "1.75",
            }}>
              Team state has changed. Are you sure you want to clear the session?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowClearConfirm(false)} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: "2px", cursor: "pointer",
                background: "transparent", border: `1px solid ${C.border2}`,
                color: C.muted,
              }}>
                Cancel
              </button>
              <button onClick={clearSession} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "6px 14px", borderRadius: "2px", cursor: "pointer",
                background: C.redDim, border: `1px solid ${C.red}`,
                color: C.red,
              }}>
                Clear session
              </button>
            </div>
          </div>
        </div>
      )}

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
          <Link to="/game" style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px",
            background: C.accentDim, border: `1px solid ${C.accent}`,
            color: C.accent, textDecoration: "none",
          }}>
            Play The Demo ↗
          </Link>
          <span style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "2px",
            letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "500",
            background: currentState ? C.greenDim : C.surface2,
            color: currentState ? C.green : C.dim,
            border: `1px solid ${currentState ? "#2e4a2e" : C.border}`,
          }}>
            {currentState ? "Team loaded" : "No team loaded"}
          </span>
          <button onClick={handleClearClick} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim,
          }}>
            Clear session
          </button>
          <button onClick={() => { sessionStorage.removeItem("tdc_api_key"); setApiKey(""); }} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", borderRadius: "2px", cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border2}`,
            color: C.dim,
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
        <StatePanel stateMarkdown={currentState} />
      </div>
    </div>
  );
}
