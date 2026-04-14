import { C } from "../App.jsx";

export default function About({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(22, 14, 6, 0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, border: `1px solid ${C.border2}`,
          borderRadius: "3px", padding: "28px 32px", maxWidth: "400px", width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        }}
      >
        <h2 style={{
          fontFamily: "Georgia, serif", fontSize: "15px",
          fontWeight: "700", color: C.text,
          margin: "0 0 14px",
        }}>
          About
        </h2>
        <p style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: "12px", color: C.text,
          lineHeight: "1.75", margin: "0 0 24px",
        }}>
          Team Dynamics Coach: built on more than 70 peer-reviewed team dynamics insights.
        </p>
        <p style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: "12px", color: C.text,
          lineHeight: "1.75", margin: "0 0 24px",
        }}>
        Team Dynamics Coach is a tool for whole-team health. Track psychological safety, trust, cohesion, and overall team health by sharing team interactions and events. Get expert guidance and recommended interventions to improve outcomes for the entire team. Build a picture of how the team is developing over time.
        </p>
        <p style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: "12px", color: C.text,
          lineHeight: "1.75", margin: "0 0 24px",
        }}>
        Privacy is central to Team Dynamics Coach. Your team owns the team state document and you choose who to share it with.
        </p>
        <p style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: "12px", color: C.text,
          lineHeight: "1.75", margin: "0 0 24px",
        }}>
        Every recommendation this tool makes is tied to peer-reviewed evidence. It does not use popular management frameworks whose validity is unestablished. It reasons from the science, names the evidence when it matters, and tells you when confidence is low.
        </p>
        <p style={{
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: "12px", color: C.text,
          lineHeight: "1.75", margin: "0 0 24px",
        }}>
        Team state documents stay on your device. Nothing is stored on our servers. API usage via this tool does not train Anthropic models.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: "10px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "6px 16px", borderRadius: "2px", cursor: "pointer",
              background: C.accentDim, border: `1px solid ${C.accent}`,
              color: C.accent,
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
