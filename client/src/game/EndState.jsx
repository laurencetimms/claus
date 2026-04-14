import { useState } from "react";
import { C } from "../theme.js";

const OUTCOME = {
  1: { label: "Strong", color: C.green, bg: C.greenDim, border: "#2e6b2e" },
  2: { label: "Reasonable", color: "#7a5010", bg: "#fef3dc", border: "#b87d18" },
  3: { label: "Weak", color: C.accent, bg: C.accentDim, border: C.accent },
  4: { label: "Harmful", color: C.red, bg: C.redDim, border: C.red },
};

function scoreLabel(rank) {
  const avg = rank;
  if (avg <= 1.5) return "Exceptional coaching";
  if (avg <= 2.5) return "Sound coaching";
  if (avg <= 3.0) return "Inconsistent coaching";
  return "Coaching made things worse";
}

function HistoryList({ history }) {
  const [expandedTurns, setExpandedTurns] = useState({});

  function toggleExpanded(i) {
    setExpandedTurns(prev => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {history.map((entry, i) => {
        const { event, options, playerOption, clausChosenId, clausReasoning } = entry;
        const clausOption = options.find(o => o.id === clausChosenId);
        const matched = playerOption.id === clausChosenId;
        const isExpanded = !!expandedTurns[i];
        const selectedIds = new Set([playerOption.id, clausChosenId]);
        const unselectedOptions = options.filter(o => !selectedIds.has(o.id));
        const selectedOptions = options.filter(o => selectedIds.has(o.id));

        return (
          <div key={i} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "3px", overflow: "hidden",
          }}>
            {/* Event header */}
            <div style={{
              padding: "12px 20px",
              borderBottom: `1px solid ${C.border}`,
              background: C.surface2,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "10px",
                  color: C.dim, letterSpacing: "0.08em",
                }}>
                  {event.turn}
                </span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: "13px",
                  fontWeight: "600", color: C.text,
                }}>
                  {event.title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {matched ? (
                  <span style={{
                    fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "20px",
                    background: C.green, color: "#fff",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    ✓ Matched CLAUS
                  </span>
                ) : (
                  <span style={{
                    fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "20px",
                    background: C.surface, border: `1px solid ${C.border2}`,
                    color: C.dim, fontFamily: "'DM Mono', monospace",
                  }}>
                    Diverged
                  </span>
                )}
              </div>
            </div>

            {/* Options */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedOptions.map(opt => {
                const out = OUTCOME[opt.rank];
                const isPlayer = opt.id === playerOption.id;
                const isClaus = opt.id === clausChosenId;
                return (
                  <div key={opt.id} style={{
                    background: out.bg,
                    border: `1px solid ${out.border}`,
                    borderRadius: "2px", padding: "10px 14px",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      gap: 10, marginBottom: 6,
                    }}>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        fontWeight: "bold", color: out.color,
                        background: "rgba(255,255,255,0.7)",
                        border: `1px solid ${out.border}`,
                        borderRadius: "2px", padding: "1px 6px", flexShrink: 0,
                      }}>
                        {opt.id}
                      </span>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "11px",
                        fontWeight: "600", color: C.text, flex: 1,
                      }}>
                        {opt.label}
                      </span>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <span style={{
                          fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                          padding: "1px 6px", borderRadius: "20px",
                          background: out.color, color: "#fff",
                          fontFamily: "'DM Mono', monospace",
                        }}>
                          {out.label}
                        </span>
                        {isPlayer && (
                          <span style={{
                            fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                            padding: "1px 6px", borderRadius: "20px",
                            background: C.accent, color: "#fff",
                            fontFamily: "'DM Mono', monospace",
                          }}>You</span>
                        )}
                        {isClaus && (
                          <span style={{
                            fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                            padding: "1px 6px", borderRadius: "20px",
                            background: C.green, color: "#fff",
                            fontFamily: "'DM Mono', monospace",
                          }}>+CLAUS</span>
                        )}
                      </div>
                    </div>
                    <p style={{
                      fontSize: "11px", color: C.text, lineHeight: "1.65",
                      margin: "0 0 6px",
                    }}>
                      {opt.description}
                    </p>
                    <p style={{
                      fontSize: "11px", color: C.dim, lineHeight: "1.65",
                      margin: 0, fontStyle: "italic",
                      borderTop: `1px solid ${C.border}`, paddingTop: 6,
                    }}>
                      {opt.rationale}
                    </p>
                  </div>
                );
              })}

              {/* Show/hide unselected options */}
              {unselectedOptions.length > 0 && (
                <>
                  <button
                    onClick={() => toggleExpanded(i)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${C.border}`,
                      borderRadius: "2px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: C.dim,
                      alignSelf: "flex-start",
                    }}
                  >
                    {isExpanded ? "▲ Hide other options" : "▼ Show other options"}
                  </button>

                  {isExpanded && unselectedOptions.map(opt => {
                    const out = OUTCOME[opt.rank];
                    return (
                      <div key={opt.id} style={{
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        borderRadius: "2px", padding: "10px 14px",
                        opacity: 0.75,
                      }}>
                        <div style={{
                          display: "flex", alignItems: "flex-start",
                          gap: 10, marginBottom: 6,
                        }}>
                          <span style={{
                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                            fontWeight: "bold", color: out.color,
                            background: "rgba(255,255,255,0.7)",
                            border: `1px solid ${out.border}`,
                            borderRadius: "2px", padding: "1px 6px", flexShrink: 0,
                          }}>
                            {opt.id}
                          </span>
                          <span style={{
                            fontFamily: "'DM Mono', monospace", fontSize: "11px",
                            fontWeight: "600", color: C.text, flex: 1,
                          }}>
                            {opt.label}
                          </span>
                          <span style={{
                            fontSize: "9px", letterSpacing: "0.05em", textTransform: "uppercase",
                            padding: "1px 6px", borderRadius: "20px",
                            background: out.color, color: "#fff",
                            fontFamily: "'DM Mono', monospace", flexShrink: 0,
                          }}>
                            {out.label}
                          </span>
                        </div>
                        <p style={{
                          fontSize: "11px", color: C.text, lineHeight: "1.65",
                          margin: "0 0 6px",
                        }}>
                          {opt.description}
                        </p>
                        <p style={{
                          fontSize: "11px", color: C.dim, lineHeight: "1.65",
                          margin: 0, fontStyle: "italic",
                          borderTop: `1px solid ${C.border}`, paddingTop: 6,
                        }}>
                          {opt.rationale}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              {clausReasoning && (
                <div style={{
                  marginTop: 4, padding: "8px 14px",
                  background: C.greenDim, border: `1px solid #2e6b2e`,
                  borderRadius: "2px",
                  fontSize: "11px", color: C.green, lineHeight: 1.65,
                  fontStyle: "italic",
                }}>
                  CLAUS reasoning: "{clausReasoning}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function EndState({ scenario, history, onRestart }) {
  const playerRanks = history.map(h => h.playerOption.rank);
  const clausRanks = history.map(h => {
    const clausOpt = h.options.find(o => o.id === h.clausChosenId);
    return clausOpt ? clausOpt.rank : 2;
  });

  const playerAvg = playerRanks.reduce((a, b) => a + b, 0) / playerRanks.length;
  const clausAvg = clausRanks.reduce((a, b) => a + b, 0) / clausRanks.length;
  const matches = history.filter(h => h.playerOption.id === h.clausChosenId).length;

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.dim, marginBottom: 12,
          }}>
            The Demo · Results
          </div>
          <h2 style={{
            fontFamily: "Georgia, serif", fontSize: "26px",
            fontWeight: "700", color: C.text, margin: "0 0 8px",
          }}>
            The demo shipped.
          </h2>
          <p style={{ fontSize: "13px", color: C.dim, margin: 0, lineHeight: 1.7 }}>
            {scenario.coachingObjective} Here is what your coaching did to the people.
          </p>
        </div>

        {/* Score summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16, marginBottom: 40,
        }}>
          {[
            {
              label: "Without CLAUS",
              sub: scoreLabel(playerAvg),
              value: `${playerRanks.filter(r => r === 1).length} / ${history.length}`,
              valueSub: "strong interventions",
              color: C.accent,
            },
            {
              label: "With CLAUS",
              sub: scoreLabel(clausAvg),
              value: `${clausRanks.filter(r => r === 1).length} / ${history.length}`,
              valueSub: "strong interventions",
              color: C.green,
            },
            {
              label: "Agreement",
              sub: matches === history.length ? "Perfect alignment" : matches > history.length / 2 ? "Broadly aligned" : "Frequently diverged",
              value: `${matches} / ${history.length}`,
              valueSub: "turns matched",
              color: C.dim,
            },
          ].map(({ label, sub, value, valueSub, color }) => (
            <div key={label} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "3px", padding: "20px 24px",
            }}>
              <div style={{
                fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: C.dim, marginBottom: 6,
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "Georgia, serif", fontSize: "24px",
                fontWeight: "700", color, marginBottom: 4,
              }}>
                {value}
              </div>
              <div style={{ fontSize: "11px", color: C.dim }}>{valueSub}</div>
              <div style={{
                marginTop: 10, fontSize: "11px", color: C.text,
                fontStyle: "italic",
              }}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Turn-by-turn breakdown */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.dim, marginBottom: 16,
          }}>
            Turn by turn — rationales revealed
          </div>
        </div>

        <HistoryList history={history} />

        {/* Footer */}
        <div style={{
          marginTop: 48, paddingTop: 32,
          borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{
            fontSize: "12px", color: C.dim, lineHeight: 1.7, maxWidth: 480, margin: 0,
          }}>
            CLAUS is powered by the CEBMa (2023) rapid evidence assessment — 70 peer-reviewed studies on team effectiveness. The skill is available open-source.
          </p>
          <button
            onClick={onRestart}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: "11px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "12px 24px", borderRadius: "3px", cursor: "pointer",
              background: "transparent", border: `1px solid ${C.border2}`,
              color: C.dim,
            }}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
