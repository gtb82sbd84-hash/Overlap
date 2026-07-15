import { css } from "../css.js";

export default function SchedulePane({ vm }) {
  return (
    <section data-screen-label="일정">
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px" }}>일정</h3>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#4E5968", maxWidth: "60ch" }}>확정된 회의와 진행 중인 투표를 여기서 확인할 수 있어요.</p>

      {vm.confirmedMeetingCards.map((cm) => (
        <div key={cm.id} style={{ background: "linear-gradient(180deg,#FFFFFF,#FBFDFF)", border: "2px solid #3182F7", borderRadius: 18, padding: 22, marginBottom: 16, boxShadow: "0 10px 28px -12px rgba(49,130,247,.28)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "#3182F7", borderRadius: 999, padding: "4px 10px" }}>확정된 회의</span>
            <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={cm.openCancel}>확정 취소</button>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#191F28", marginBottom: 8 }}>{cm.title}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "#4E5968", fontWeight: 500 }}>{cm.dayLabel}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 20 }}>{cm.time}</span>
            <div style={{ fontSize: 13, color: "#4E5968", marginBottom: 8 }}>{cm.durationLabel}</div>
          </div>
          <div style={{ fontSize: 13, color: "#4E5968", marginBottom: 6 }}><b style={{ color: "#191F28", marginRight: 6 }}>필참</b>{cm.reqNamesText}</div>
          {cm.hasOptNames && (
            <div style={{ fontSize: 13, color: "#4E5968", marginBottom: 6 }}><b style={{ color: "#191F28", marginRight: 6 }}>선택</b>{cm.optNamesText}</div>
          )}
          {cm.hasLocation && (
            <div style={{ fontSize: 13, color: "#3182F7", marginTop: 6, wordBreak: "break-all" }}>📍 {cm.location}</div>
          )}
          {cm.hasMessage && (
            <div style={{ fontSize: 12.5, color: "#4E5968", background: "#F7F8FA", borderRadius: 10, padding: "10px 12px", marginTop: 12 }}>{cm.message}</div>
          )}
        </div>
      ))}

      {vm.activeVoteCards.map((av) => (
        <div key={av.id} style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 18, padding: 22, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3182F7", background: "#EBF2FE", borderRadius: 999, padding: "4px 10px" }}>진행 중인 투표</span>
            <button style={{ fontSize: 14, fontWeight: 500, color: "#F04452", background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={av.openCancel}>취소</button>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#191F28", marginBottom: 8 }}>{av.title}</div>
          {av.hasLocation && (
            <div style={{ fontSize: 13, color: "#3182F7", marginBottom: 8, wordBreak: "break-all" }}>📍 {av.location}</div>
          )}
          <div style={{ fontSize: 13, color: "#4E5968", marginBottom: 4 }}>마감 <b style={{ color: "#191F28" }}>{av.deadlineLabel}</b> · 응답 방식 <b style={{ color: "#191F28" }}>{av.anonLabel}</b></div>
          <div style={{ fontSize: 13, color: "#4E5968", marginBottom: 14 }}>참여 현황 <b style={{ color: "#191F28" }}>{av.respondedCount} / {av.totalCount}명 응답</b>{av.showRespondentNames && ` · ${av.respondentNamesText}`}</div>
          {av.hasMessage && (
            <div style={{ fontSize: 12.5, color: "#4E5968", background: "#F7F8FA", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>{av.message}</div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14, marginTop: 10 }}>
            <p style={{ fontSize: 13, color: "#8B95A1", margin: 0 }}>여러 후보에 중복 투표할 수 있어요.</p>
            <button style={css(av.voteActionStyle)} title={av.voteActionTitle} onClick={av.voteActionHandler}>{av.voteActionLabel}</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {av.candidates.map((c) => (
              <div key={c.idx} style={css(c.rowStyle)} onClick={c.onClick}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: "#4E5968", fontWeight: 500 }}>{c.day}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 14 }}>{c.time}</span>
                </div>
                {c.voted && <span style={{ fontSize: 12, fontWeight: 700, color: "#0AB259" }}>투표 완료</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {vm.scheduleEmpty && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 18, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: "#4E5968", margin: "0 0 16px" }}>아직 확정되거나 진행 중인 투표가 없어요.</p>
          <button style={{ fontWeight: 700, fontSize: 14, background: "#3182F7", color: "#fff", border: "none", borderRadius: 999, padding: "12px 20px", cursor: "pointer" }} onClick={vm.goToDecideFromSchedule}>회의 생성하기</button>
        </div>
      )}
    </section>
  );
}
