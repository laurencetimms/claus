import { useState } from "react";
import { C } from "../App.jsx";

export default function ApiKeyInput({ onSubmit }) {
  const [value, setValue] = useState("");

  const handle = () => {
    const trimmed = value.trim();
    if (trimmed.startsWith("sk-ant-")) onSubmit(trimmed);
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: C.bg, fontFamily: "'DM Mono', monospace",
      gap: "24px", padding: "40px",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: "22px",
          color: C.text, marginBottom: "8px",
        }}>
          Team Dynamics Coach
        </h1>
        <p style={{ fontSize: "12px", color: C.dim, letterSpacing: "0.04em", lineHeight: "1.8" }}>
          Enter your Anthropic API key to begin.<br />
          Your key is used only for this session and never stored.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "420px" }}>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: "13px",
            background: C.surface2, border: `1px solid ${C.border2}`,
            color: C.text, padding: "12px 16px", borderRadius: "3px",
            outline: "none", width: "100%",
          }}
        />
        <button
          onClick={handle}
          disabled={!value.trim().startsWith("sk-ant-")}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: "11px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "12px", borderRadius: "3px", cursor: "pointer",
            background: value.trim().startsWith("sk-ant-") ? C.accent : C.accentDim,
            border: "none",
            color: value.trim().startsWith("sk-ant-") ? "#0a0a08" : C.dim,
            fontWeight: "500", transition: "all 0.15s",
          }}
        >
          Start session
        </button>
      </div>

      <p style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.04em", textAlign: "center", maxWidth: "360px", lineHeight: "1.8" }}>
        API usage via this tool does not train Anthropic models.<br />
        Team state documents stay on your device.
      </p>
    </div>
  );
}
