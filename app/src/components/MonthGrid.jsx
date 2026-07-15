import { css } from "../css.js";

const DAY_HEADERS = ["월", "화", "수", "목", "금", "토", "일"];

export default function MonthGrid({ month, showLabel }) {
  return (
    <div style={showLabel ? { flex: 1, minWidth: 220 } : undefined}>
      {showLabel && (
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{month.label}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_HEADERS.map((lbl) => (
          <span key={lbl} style={{ textAlign: "center", fontSize: 10.5, color: "#8B95A1" }}>{lbl}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {month.cells.map((c, i) =>
          c.blank ? <div key={i}></div> : (
            <div key={i} style={css(c.style)} onClick={c.onClick}>{c.day}</div>
          )
        )}
      </div>
    </div>
  );
}
