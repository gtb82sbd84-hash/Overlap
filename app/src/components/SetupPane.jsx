import { css } from "../css.js";
import MonthGrid from "./MonthGrid.jsx";

export default function SetupPane({ vm }) {
  return (
    <section data-screen-label="회의 설정">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {/* 기간 */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" }} onClick={vm.openPeriod}>
            <span style={{ fontSize: 12, color: "#8B95A1", marginRight: 6, textTransform: "uppercase" }}>기간</span>{vm.periodLabel}
          </button>
          {vm.periodOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 15, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closePeriod}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 16, boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", width: "min(580px,100%)", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer" }} onClick={vm.quickThisWeek}>이번 주</button>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer" }} onClick={vm.quickNextWeek}>다음 주</button>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer" }} onClick={vm.quickThisMonth}>이번 달</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4E5968", fontSize: 16, padding: "4px 8px", borderRadius: 6 }} onClick={vm.navPrev}>‹</button>
                  <span style={{ fontSize: 11, color: "#8B95A1" }}>시작일과 종료일을 순서대로 선택하세요</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4E5968", fontSize: 16, padding: "4px 8px", borderRadius: 6 }} onClick={vm.navNext}>›</button>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {vm.calMonths.map((mo, i) => <MonthGrid key={i} month={mo} showLabel />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid #F2F4F6" }}>
                  <span style={{ fontSize: 12.5, color: "#4E5968" }}>선택: <b style={{ color: "#191F28" }}>{vm.periodLabel}</b></span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 14px", cursor: "pointer" }} onClick={vm.closePeriod}>취소</button>
                    <button style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#3182F7", border: "none", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={vm.confirmPeriod}>적용</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 길이 */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" }} onClick={vm.openLength}>
            <span style={{ fontSize: 12, color: "#8B95A1", marginRight: 6, textTransform: "uppercase" }}>길이</span>{vm.durationLabelText}
          </button>
          {vm.lengthOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 15, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeLength}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 16, boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", width: "min(320px,100%)", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
                <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 10 }}>빠른 선택</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {vm.lengthQuickOpts.map((q) => (
                    <button key={q.label} style={css(q.style)} onClick={q.onClick}>{q.label}</button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 8 }}>직접 입력 (15분 단위)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <input type="number" step="15" min="15" value={vm.durationMin} onChange={vm.onDurationInput} onBlur={vm.onDurationBlur} style={{ width: 88, fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 10, padding: "8px 11px", color: "#191F28", outline: "none" }} />
                  <span style={{ fontSize: 13, color: "#4E5968" }}>분</span>
                  <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#8B95A1" }}>= {vm.durationLabelText}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "1px solid #F2F4F6" }}>
                  <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 14px", cursor: "pointer" }} onClick={vm.closeLength}>취소</button>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#3182F7", border: "none", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={vm.confirmLength}>적용</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 범위 */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center" }} onClick={vm.openScope}>
            <span style={{ fontSize: 12, color: "#8B95A1", marginRight: 6, textTransform: "uppercase" }}>범위</span>{vm.scopeLabel}
          </button>
          {vm.scopeOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 15, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeScope}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 16, boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", width: "min(320px,100%)", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                  <button style={css(vm.scopeInStyle)} onClick={vm.setScopeIn}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#191F28" }}>근무시간 내</span>
                    <span style={{ fontSize: 12, color: "#8B95A1" }}>각자 등록된 근무시간 안에서만 찾아요</span>
                  </button>
                  <button style={css(vm.scopeOutStyle)} onClick={vm.setScopeOut}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#191F28" }}>근무시간 외</span>
                    <span style={{ fontSize: 12, color: "#8B95A1" }}>근무시간 밖도 후보에 포함해요</span>
                  </button>
                </div>
                {vm.isScopeOut && (
                  <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px solid #F2F4F6" }}>
                    <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 8 }}>범위 세부 선택 (복수 선택 가능)</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button style={css(vm.scopeWeekdayStyle)} onClick={vm.toggleScopeOutWeekday}>주중</button>
                      <button style={css(vm.scopeWeekendStyle)} onClick={vm.toggleScopeOutWeekend}>주말 및 공휴일 포함</button>
                    </div>
                    <p style={{ fontSize: 11, color: "#8B95A1", margin: "8px 0 0" }}>주말이 기간에 포함돼 있어야 표시돼요 — 필요하면 기간을 자동으로 넓혀드려요.</p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, paddingTop: 12, borderTop: "1px solid #F2F4F6" }}>
                  <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 14px", cursor: "pointer" }} onClick={vm.closeScope}>취소</button>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#3182F7", border: "none", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={vm.confirmScope}>적용</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: "#4E5968", maxWidth: "64ch", margin: "0 0 20px" }}>
        회의 기간은 <b style={{ color: "#191F28", fontWeight: 600 }}>하루부터 몇 주까지</b> 자유롭게 잡을 수 있어요. 참여자는 캘린더와 <b style={{ color: "#191F28", fontWeight: 600 }}>한 번 등록해 둔 선호</b>를 이미 갖고 있으니, 주최자는 <b style={{ color: "#191F28", fontWeight: 600 }}>필참/선택만</b> 정하면 됩니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 11, marginBottom: 24 }}>
        {vm.setupPeople.map((p) => (
          <div key={p.id} style={{ background: "#FFFFFF", border: `1px solid ${p.borderColor}`, borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", gap: 13, justifyContent: "space-between", position: "relative", opacity: p.cardOpacity }}>
            <button style={{ position: "absolute", top: 12, right: 12, ...css(p.excludeStyle) }} onClick={p.toggleExclude}>{p.excludeLabel}</button>
            <div style={{ display: "flex", gap: 11 }}>
              <div style={{ width: 37, height: 37, borderRadius: 11, display: "grid", placeItems: "center", flex: "none", fontWeight: 600, fontSize: 15, color: "#fff", background: p.avatarBg }}>{p.initial}</div>
              <div style={{ paddingRight: 52 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>{p.name}
                  {p.hasTag && <span style={{ fontSize: 12, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", borderRadius: 5, padding: "2px 6px" }}>{p.tag}</span>}
                  {p.isMe && <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 12, fontWeight: 600, color: "#4E5968", background: "#F2F4F6", borderRadius: 5, padding: "2px 6px" }}>나</span>}
                </div>
                <div style={{ fontSize: 12, color: "#4E5968", marginTop: 5 }}><span style={{ fontSize: 12, color: "#8B95A1", marginRight: 6, textTransform: "uppercase" }}>근무</span>{p.workLabel} · 유연</div>
              </div>
            </div>
            <button style={{ display: "flex", padding: 4, background: "#F2F4F6", border: "none", borderRadius: 14, cursor: "pointer", gap: 2 }} onClick={p.toggleRole} disabled={p.isExcluded}>
              <span style={css(p.reqSegStyle)}>필참</span>
              <span style={css(p.optSegStyle)}>선택</span>
            </button>
          </div>
        ))}
      </div>

      <button style={{ fontWeight: 700, fontSize: 14.5, color: "#fff", border: "none", borderRadius: 999, padding: "15px 28px", cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center", boxShadow: "0 8px 20px -8px rgba(49,130,247,.5)", backgroundColor: "#3182F7" }} onClick={vm.goToDecide}>시간 찾기 →</button>
    </section>
  );
}
