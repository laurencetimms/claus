import { useState, useRef, useEffect } from "react";
import { C } from "../App.jsx";
import { EventSelector, EventInfoBox } from "./EventSelector.jsx";

function ThinkingDots() {
  return (
    <div style={{
      display: "flex", gap: "5px", alignItems: "center",
      padding: "14px 16px", background: C.surface,
      border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accentDim}`,
      borderRadius: "0 4px 4px 0",
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: "5px", height: "5px", background: C.accent,
          borderRadius: "50%", opacity: 0.6,
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ role, text, stateExtracted }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", animation: "fadeUp 0.25s ease" }}>
      <div style={{
        fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
        color: role === "user" ? C.accent : C.dim,
      }}>
        {role === "user" ? "You" : "Coach"}
      </div>
      <div style={role === "assistant" ? {
        fontSize: "13px", lineHeight: "1.75", color: C.text,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        background: C.surface, border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.border2}`,
        padding: "14px 16px", borderRadius: "0 4px 4px 0",
      } : {
        fontSize: "13px", lineHeight: "1.75", color: C.muted,
        fontStyle: "italic", paddingLeft: "12px",
        borderLeft: `2px solid ${C.accentSoft}`,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {text}
      </div>
      {stateExtracted && (
        <div style={{
          fontSize: "10px", color: C.green, background: C.greenDim,
          border: "1px solid #2e4a2e", padding: "6px 10px",
          borderRadius: "2px", letterSpacing: "0.04em", alignSelf: "flex-start",
        }}>
          ✓ Team state updated — save from panel →
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ messages, loading, error, onSend, onStateUpload, teamStateLoaded }) {
  const [input, setInput] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [uploadLabel, setUploadLabel] = useState("No file loaded");
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!teamStateLoaded) {
      setUploadLabel("No file loaded");
    }
  }, [teamStateLoaded]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onStateUpload(ev.target.result);
      setUploadLabel(file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      borderRight: `1px solid ${C.border}`, overflow: "hidden",
    }}>
      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "24px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: "12px",
            color: C.dim, textAlign: "center", fontSize: "12px",
            lineHeight: "1.8", letterSpacing: "0.04em",
          }}>
            <div style={{ fontSize: "28px", opacity: 0.3 }}>◈</div>
            <p style={{ maxWidth: "280px", margin: 0 }}>
              Upload a team state file to continue a previous session, or start talking to create one.
            </p>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} {...m} />)
        )}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim }}>Coach</div>
            <ThinkingDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: `1px solid ${C.border}`, padding: "16px 24px",
        display: "flex", flexDirection: "column", gap: "10px",
        background: C.surface, flexShrink: 0,
      }}>
        {/* Upload + event selector row */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => fileRef.current?.click()} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "6px 12px", background: "transparent",
            border: `1px solid ${C.border2}`, color: C.muted,
            borderRadius: "2px", cursor: "pointer",
          }}>
            ↑ Load team-state.md
          </button>
          <span style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.04em" }}>
            {uploadLabel}
          </span>
          <input ref={fileRef} type="file" accept=".md,.txt" style={{ display: "none" }} onChange={handleFile} />
          <div style={{ marginLeft: "auto" }}>
            <EventSelector selected={selectedEvent} onChange={setSelectedEvent} />
          </div>
        </div>

        {/* Event info box */}
        <EventInfoBox eventId={selectedEvent} />

        {/* Error */}
        {error && (
          <div style={{
            fontSize: "11px", color: C.red, background: C.redDim,
            border: "1px solid #3a2020", padding: "8px 12px", borderRadius: "2px",
          }}>
            {error}
          </div>
        )}

        {/* Text input */}
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKey}
            placeholder="How's the team doing? What happened in today's session?"
            rows={1}
            style={{
              flex: 1, fontFamily: "'DM Mono', monospace", fontSize: "13px",
              background: C.surface2, border: `1px solid ${C.border2}`,
              color: C.text, padding: "10px 14px", borderRadius: "3px",
              resize: "none", minHeight: "42px", maxHeight: "120px",
              lineHeight: "1.6", outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: "11px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "0 18px", height: "42px", borderRadius: "3px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              background: loading || !input.trim() ? C.accentDim : C.accent,
              border: "none",
              color: loading || !input.trim() ? C.dim : "#0a0a08",
              fontWeight: "500", transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
