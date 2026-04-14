import { C } from "../theme.js";

export default function Briefing({ scenario, onStart }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <div style={{
          fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.dim, marginBottom: 16,
        }}>
          Team Dynamics Coach · The Demo
        </div>

        <h2 style={{
          fontFamily: "Georgia, serif", fontSize: "28px",
          fontWeight: "700", color: C.text, margin: "0 0 32px",
          lineHeight: 1.2,
        }}>
          {scenario.title}
        </h2>

        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "3px", padding: "28px 32px", marginBottom: 32,
        }}>
          {scenario.playerBriefing.split("\n\n").map((para, i) => (
            <p key={i} style={{
              fontSize: "14px", lineHeight: "1.8", color: C.text,
              margin: i === 0 ? 0 : "16px 0 0",
              fontStyle: i === scenario.playerBriefing.split("\n\n").length - 1 ? "italic" : "normal",
            }}>
              {para}
            </p>
          ))}
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 32,
        }}>
          {[
            { label: "Team", value: scenario.team },
            { label: "Events", value: `${scenario.turnCount} turns` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: "2px", padding: "8px 14px",
              fontSize: "11px", fontFamily: "'DM Mono', monospace",
            }}>
              <span style={{ color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}:{" "}
              </span>
              <span style={{ color: C.text }}>{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: "12px",
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "14px 32px", borderRadius: "3px", cursor: "pointer",
            background: C.accent, border: "none", color: "#fff",
            fontWeight: "500",
          }}
        >
          Begin →
        </button>
      </div>
    </div>
  );
}
