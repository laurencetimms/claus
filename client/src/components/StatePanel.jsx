import { C } from "../theme.js";

function renderMarkdown(markdown) {
  return markdown.split("\n").map((line, i) => {
    if (line.startsWith("# ")) {
      return (
        <div key={i} style={{
          fontFamily: "Georgia, serif", fontSize: "15px",
          color: C.text, marginBottom: "4px", fontWeight: "700",
        }}>
          {line.slice(2)}
        </div>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <div key={i} style={{
          fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
          color: C.accent, margin: "16px 0 8px",
          paddingBottom: "4px", borderBottom: `1px solid ${C.accentDim}`,
        }}>
          {line.slice(3)}
        </div>
      );
    }
    if (line === "---") {
      return <hr key={i} style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "10px 0" }} />;
    }

    // Inline formatting
    const parts = [];
    let remaining = line;
    let idx = 0;
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`|_(.+?)_)/g;
    let last = 0, m;
    while ((m = regex.exec(remaining)) !== null) {
      if (m.index > last) {
        parts.push(<span key={idx++} style={{ color: C.muted, fontSize: "11.5px" }}>{remaining.slice(last, m.index)}</span>);
      }
      if (m[2]) parts.push(<span key={idx++} style={{ color: C.text, fontWeight: "500", fontSize: "11.5px" }}>{m[2]}</span>);
      else if (m[3]) parts.push(<span key={idx++} style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "2px", background: C.accentDim, color: C.accent, letterSpacing: "0.04em" }}>{m[3]}</span>);
      else if (m[4]) parts.push(<span key={idx++} style={{ color: C.dim, fontStyle: "italic", fontSize: "11.5px" }}>{m[4]}</span>);
      last = m.index + m[0].length;
    }
    if (last < remaining.length) {
      parts.push(<span key={idx++} style={{ color: C.muted, fontSize: "11.5px" }}>{remaining.slice(last)}</span>);
    }

    return (
      <div key={i} style={{ lineHeight: "1.8", minHeight: "1.2em" }}>
        {parts.length ? parts : <span style={{ color: C.muted, fontSize: "11.5px" }}>{line || "\u00a0"}</span>}
      </div>
    );
  });
}

export default function StatePanel({ stateMarkdown }) {
  const copyToClipboard = () => {
    if (!stateMarkdown) return;
    navigator.clipboard.writeText(stateMarkdown).catch(() => {});
  };

  const download = () => {
    if (!stateMarkdown) return;
    const blob = new Blob([stateMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-state.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", background: C.surface, overflow: "hidden" }}>
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim }}>
          Team State
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={copyToClipboard} disabled={!stateMarkdown} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", background: "transparent",
            border: `1px solid ${stateMarkdown ? C.accent : C.border}`,
            color: stateMarkdown ? C.accent : C.dim,
            borderRadius: "2px", cursor: stateMarkdown ? "pointer" : "not-allowed",
          }}>
            Copy
          </button>
          <button onClick={download} disabled={!stateMarkdown} style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "5px 10px", background: "transparent",
            border: `1px solid ${stateMarkdown ? C.green : C.border}`,
            color: stateMarkdown ? C.green : C.dim,
            borderRadius: "2px", cursor: stateMarkdown ? "pointer" : "not-allowed",
          }}>
            ↓ Save
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
        {stateMarkdown ? (
          <div>{renderMarkdown(stateMarkdown)}</div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", height: "100%",
            alignItems: "center", justifyContent: "center",
            color: C.dim, fontSize: "11px", letterSpacing: "0.04em",
            textAlign: "center", lineHeight: "1.9", padding: "20px",
          }}>
            Updated team state will appear here after each session.<br /><br />
            Save it as <strong style={{ color: C.muted }}>team-state.md</strong> and upload next time to continue.
          </div>
        )}
      </div>
    </div>
  );
}
