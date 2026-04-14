import { C } from "../theme.js";

export default function TurnView({ event, turnIndex, totalTurns, options, loading, error, onChoose }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Turn header */}
      <div style={{
        padding: "12px 32px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim,
          }}>
            Event {event.turn} of {totalTurns}
          </span>
          <span style={{ color: C.border2 }}>·</span>
          <span style={{
            fontFamily: "Georgia, serif", fontSize: "14px",
            color: C.text, fontWeight: "600",
          }}>
            {event.title}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: totalTurns }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < turnIndex ? C.green : i === turnIndex ? C.accent : C.border,
            }} />
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, overflow: "auto", padding: "32px",
        display: "flex", gap: 32,
      }}>
        {/* Left: event briefing */}
        <div style={{ flex: "0 0 420px" }}>
          <div style={{
            fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.dim, marginBottom: 14,
          }}>
            What happened
          </div>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "3px", padding: "24px 28px",
          }}>
            {event.briefing.split("\n\n").map((para, i) => (
              <p key={i} style={{
                fontSize: "13px", lineHeight: "1.85", color: C.text,
                margin: i === 0 ? 0 : "14px 0 0",
              }}>
                {para}
              </p>
            ))}
          </div>
          {event.interventionConstraints && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: C.accentDim, border: `1px solid ${C.accent}`,
              borderRadius: "2px",
              fontSize: "11px", color: C.accent, lineHeight: 1.6,
              fontFamily: "'DM Mono', monospace",
            }}>
              ⚠ {event.interventionConstraints}
            </div>
          )}
        </div>

        {/* Right: options */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.dim, marginBottom: 14,
          }}>
            {loading ? "CLAUS is reviewing the team state…" : "Choose your intervention"}
          </div>

          {error && (
            <div style={{
              background: C.redDim, border: `1px solid ${C.red}`,
              borderRadius: "3px", padding: "12px 16px",
              fontSize: "12px", color: C.red, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: "3px", padding: "20px 24px", opacity: 0.5,
                  height: 80,
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.6} }`}</style>
            </div>
          )}

          {!loading && options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChoose(opt)}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "3px", padding: "18px 22px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex", gap: 16, alignItems: "flex-start",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = C.accentDim;
                    e.currentTarget.style.borderColor = C.accent;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = C.surface;
                    e.currentTarget.style.borderColor = C.border;
                  }}
                >
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "11px",
                    fontWeight: "bold", color: C.accent,
                    background: C.accentDim, border: `1px solid ${C.accent}`,
                    borderRadius: "2px", padding: "2px 8px",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {opt.id}
                  </span>
                  <div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "12px",
                      fontWeight: "600", color: C.text, marginBottom: 6,
                      letterSpacing: "0.02em",
                    }}>
                      {opt.label}
                    </div>
                    <div style={{
                      fontSize: "12px", color: C.dim, lineHeight: "1.7",
                    }}>
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
