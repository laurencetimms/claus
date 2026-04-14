import { C } from "../theme.js";

const OUTCOME = {
  1: { label: "Strong intervention", bg: C.greenDim, border: "#2e6b2e", color: C.green, symbol: "↑" },
  2: { label: "Reasonable intervention", bg: "#fef3dc", border: "#b87d18", color: "#7a5010", symbol: "→" },
  3: { label: "Weak intervention", bg: C.accentDim, border: C.accent, color: C.accent, symbol: "↓" },
  4: { label: "Counterproductive intervention", bg: C.redDim, border: C.red, color: C.red, symbol: "↓↓" },
};

export default function OutcomeView({
  event, playerOption, clausResult, options,
  turnIndex, totalTurns, loadingClaus, error, onNext,
}) {
  const playerOutcome = OUTCOME[playerOption.rank];
  const clausOption = options?.find(o => o.id === clausResult?.chosenId);
  const matched = clausResult?.chosenId === playerOption.id;
  const isLastTurn = turnIndex === totalTurns - 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Turn header */}
      <div style={{
        padding: "12px 32px", borderBottom: `1px solid ${C.border}`,
        background: C.surface, display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: C.dim,
          }}>
            Event {event.turn} of {totalTurns}
          </span>
          <span style={{ color: C.border2 }}>·</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: C.text, fontWeight: "600" }}>
            {event.title}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: totalTurns }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i <= turnIndex ? C.green : C.border,
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "32px", display: "flex", gap: 32 }}>
        {/* Left: your choice */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.dim, marginBottom: 14,
          }}>
            Your intervention
          </div>

          <div style={{
            background: playerOutcome.bg,
            border: `1px solid ${playerOutcome.border}`,
            borderRadius: "3px", padding: "20px 24px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "11px",
                  fontWeight: "bold", color: playerOutcome.color,
                  background: "rgba(255,255,255,0.5)",
                  border: `1px solid ${playerOutcome.border}`,
                  borderRadius: "2px", padding: "2px 8px",
                }}>
                  {playerOption.id}
                </span>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "12px",
                  fontWeight: "600", color: C.text,
                }}>
                  {playerOption.label}
                </span>
              </div>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "3px 10px", borderRadius: "20px",
                background: playerOutcome.color, color: "#fff",
                fontWeight: "600", flexShrink: 0,
              }}>
                {playerOutcome.symbol} {playerOutcome.label}
              </span>
            </div>
            <p style={{ fontSize: "12px", color: C.text, lineHeight: "1.7", margin: 0 }}>
              {playerOption.description}
            </p>
            {!matched && !loadingClaus && clausResult && playerOption.rationale && (
              <p style={{
                fontSize: "11px", color: C.dim, lineHeight: "1.7",
                margin: "12px 0 0", fontStyle: "italic",
                borderTop: `1px solid ${playerOutcome.border}`, paddingTop: 10,
              }}>
                {playerOption.rationale}
              </p>
            )}
          </div>

          {/* CLAUS pick */}
          <div style={{
            fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.dim, marginBottom: 14,
          }}>
            Coach + CLAUS
          </div>

          {loadingClaus && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "3px", padding: "20px 24px",
              fontSize: "12px", color: C.dim, fontFamily: "'DM Mono', monospace",
            }}>
              CLAUS is reviewing the evidence…
            </div>
          )}

          {error && (
            <div style={{
              background: C.redDim, border: `1px solid ${C.red}`,
              borderRadius: "3px", padding: "12px 16px",
              fontSize: "12px", color: C.red,
            }}>
              {error}
            </div>
          )}

          {!loadingClaus && clausResult && clausOption && (
            <>
              <div style={{
                background: matched ? C.greenDim : C.surface2,
                border: `1px solid ${matched ? "#2e6b2e" : C.border2}`,
                borderRadius: "3px", padding: "20px 24px", marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "11px",
                    fontWeight: "bold", color: matched ? C.green : C.dim,
                    background: "rgba(255,255,255,0.5)",
                    border: `1px solid ${matched ? "#2e6b2e" : C.border2}`,
                    borderRadius: "2px", padding: "2px 8px",
                  }}>
                    {clausOption.id}
                  </span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "12px",
                    fontWeight: "600", color: C.text,
                  }}>
                    {clausOption.label}
                  </span>
                  <span style={{
                    fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "20px",
                    background: C.green, color: "#fff", fontWeight: "600",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    ↑ Strong
                  </span>
                  {matched && (
                    <span style={{
                      fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: "20px",
                      background: C.surface2, border: `1px solid #2e6b2e`,
                      color: C.green, fontWeight: "600",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      ✓ Match
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: C.text, lineHeight: "1.7", margin: "0 0 12px" }}>
                  {clausOption.description}
                </p>
                {!matched && clausOption.rationale && (
                  <p style={{
                    fontSize: "11px", color: C.dim, lineHeight: "1.7", margin: "0 0 12px",
                    borderTop: `1px solid ${C.border}`, paddingTop: 10,
                    fontStyle: "italic",
                  }}>
                    {clausOption.rationale}
                  </p>
                )}
                {clausResult.reasoning && (
                  <p style={{
                    fontSize: "11px", color: C.dim, lineHeight: "1.7", margin: 0,
                    borderTop: `1px solid ${C.border}`, paddingTop: 10,
                    fontStyle: "italic",
                  }}>
                    "{clausResult.reasoning}"
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: all options summary */}
        {!loadingClaus && clausResult && (
          <div style={{ flex: "0 0 280px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: C.dim, marginBottom: 14,
            }}>
              All options
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map(opt => {
                const isPlayer = opt.id === playerOption.id;
                const isClaus = opt.id === clausResult.chosenId;
                const outcome = OUTCOME[opt.rank];
                return (
                  <div key={opt.id} style={{
                    background: isPlayer || isClaus ? outcome.bg : C.surface,
                    border: `1px solid ${isPlayer ? outcome.border : isClaus ? "#2e6b2e" : C.border}`,
                    borderRadius: "3px", padding: "10px 14px",
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "10px",
                      fontWeight: "bold", color: outcome.color,
                      background: "rgba(255,255,255,0.6)",
                      border: `1px solid ${outcome.border}`,
                      borderRadius: "2px", padding: "1px 6px",
                      flexShrink: 0,
                    }}>
                      {opt.id}
                    </span>
                    <span style={{
                      fontSize: "11px", color: C.text, flex: 1,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {opt.label}
                    </span>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {isPlayer && (
                        <span style={{
                          fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                          padding: "1px 5px", borderRadius: "20px",
                          background: outcome.color, color: "#fff",
                          fontFamily: "'DM Mono', monospace",
                        }}>You</span>
                      )}
                      {isClaus && (
                        <span style={{
                          fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                          padding: "1px 5px", borderRadius: "20px",
                          background: C.green, color: "#fff",
                          fontFamily: "'DM Mono', monospace",
                        }}>+CLAUS</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onNext}
              style={{
                width: "100%", marginTop: 24,
                fontFamily: "'DM Mono', monospace", fontSize: "11px",
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "12px", borderRadius: "3px", cursor: "pointer",
                background: C.accent, border: "none", color: "#fff",
                fontWeight: "500",
              }}
            >
              {isLastTurn ? "See results →" : "Next event →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
