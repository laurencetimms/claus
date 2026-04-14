import { C } from "../theme.js";
import { EVENTS } from "../constants/events.js";

export function EventSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "10px", color: C.dim, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
        Event type
      </span>
      <select
        value={selected || ""}
        onChange={e => onChange(e.target.value || null)}
        style={{
          fontFamily: "'DM Mono', monospace", fontSize: "11px",
          background: C.surface2, border: `1px solid ${C.border2}`,
          color: selected ? C.text : C.dim,
          padding: "5px 10px", borderRadius: "2px",
          outline: "none", cursor: "pointer",
          letterSpacing: "0.04em",
        }}
      >
        <option value="">— none —</option>
        {EVENTS.map(e => (
          <option key={e.id} value={e.id}>{e.label}</option>
        ))}
      </select>
    </div>
  );
}

export function EventInfoBox({ eventId }) {
  if (!eventId) return null;
  const event = EVENTS.find(e => e.id === eventId);
  if (!event) return null;

  return (
    <div style={{
      background: C.accentDim, border: `1px solid ${C.accentSoft}`,
      borderLeft: `3px solid ${C.accent}`,
      borderRadius: "0 3px 3px 0",
      padding: "12px 14px",
      animation: "fadeUp 0.2s ease",
    }}>
      <div style={{
        fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
        color: C.accent, marginBottom: "8px", fontWeight: "500",
      }}>
        {event.label} — things to note
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
        {event.prompts.map((p, i) => (
          <li key={i} style={{
            fontSize: "12px", color: C.muted, lineHeight: "1.6",
            paddingLeft: "12px", position: "relative",
          }}>
            <span style={{
              position: "absolute", left: 0, color: C.accentSoft,
            }}>›</span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
