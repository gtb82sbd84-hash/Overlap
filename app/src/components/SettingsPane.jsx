import { css } from "../css.js";

export default function SettingsPane({ vm }) {
  return (
    <section data-screen-label="내 설정">
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px" }}>내 선호는 한 번만 등록해요</h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#4E5968", maxWidth: "60ch", width: 520, height: 40 }}>
        회의마다 입력할 필요 없이, 여기 등록한 값이 모든 회의 계산에 자동 반영돼요. <br />남에게는 <b style={{ color: "rgb(25, 31, 40)" }}>공개되지 않아요.</b>
      </p>
      <div style={{ background: "#EBF2FE", borderRadius: 11, padding: "12px 14px", fontSize: 12.5, color: "#4E5968", marginBottom: 16 }}>
        선호 규칙은 <b style={{ color: "#191F28" }}>언제나 양보 가능</b>해요. "절대 안 되는 시간"은 따로 켜지 않아도 <b style={{ color: "#191F28" }}>캘린더·근무시간</b>이 대신 알려줘요.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14, color: "#fff", background: "#3182F7" }}>{vm.meInitial}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#191F28" }}>{vm.meName} <span style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,monospace", fontSize: 12, fontWeight: 600, color: "#4E5968", background: "#F2F4F6", borderRadius: 5, padding: "2px 6px" }}>나</span></div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 20, padding: "6px 18px" }}>
        {/* 구글 캘린더 연동 */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "15px 0", borderBottom: "1px solid #F2F4F6" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>구글 캘린더 연동 <span style={{ display: "block", fontSize: 12.5, color: "#8B95A1", fontWeight: 400, marginTop: 4 }}>연동하면 바쁜 일정이 자동으로 반영돼요</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "none", whiteSpace: "nowrap", marginLeft: "auto" }}>
            <span style={{ ...css(vm.gcalStatusStyle), whiteSpace: "nowrap" }}>{vm.gcalStatusText}</span>
            <button style={{ ...css(vm.gcalBtnStyle), whiteSpace: "nowrap" }} onClick={vm.toggleGcal}>{vm.gcalBtnText}</button>
          </div>
        </div>

        {/* 근무시간 */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "15px 0", borderBottom: "1px solid #F2F4F6" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>근무시간 <span style={{ display: "block", fontSize: 12.5, color: "#8B95A1", fontWeight: 400, marginTop: 4 }}>유연 · 일/주/월 단위로 조정</span></div>
          <div style={{ position: "relative", display: "inline-block", flex: "none", marginLeft: "auto" }}>
            <button style={{ background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 12px", fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#191F28", cursor: "pointer", whiteSpace: "nowrap" }} onClick={vm.openWork}>{vm.meWorkLabel}</button>
            {vm.workOpen && (
              <div style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeWork}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 20, boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", width: "min(420px,100%)", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 10 }}>빠른 선택</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {vm.workPresets.map((wp) => (
                      <button key={wp.label} style={css(wp.style)} onClick={wp.onClick}>{wp.label}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 8 }}>직접 입력</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                    <input type="number" min="0" max="23" value={vm.workStartH} onChange={vm.onWorkStartHInput} style={{ width: 42, fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 9, padding: "7px 6px", color: "#191F28" }} />
                    <span style={{ fontSize: 12, color: "#4E5968" }}>시</span>
                    <input type="number" min="0" max="59" step="15" value={vm.workStartM} onChange={vm.onWorkStartMInput} style={{ width: 42, fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 9, padding: "7px 6px", color: "#191F28" }} />
                    <span style={{ fontSize: 12, color: "#4E5968" }}>분 –</span>
                    <input type="number" min="0" max="23" value={vm.workEndH} onChange={vm.onWorkEndHInput} style={{ width: 42, fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 9, padding: "7px 6px", color: "#191F28" }} />
                    <span style={{ fontSize: 12, color: "#4E5968" }}>시</span>
                    <input type="number" min="0" max="59" step="15" value={vm.workEndM} onChange={vm.onWorkEndMInput} style={{ width: 42, fontSize: 14, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 9, padding: "7px 6px", color: "#191F28" }} />
                    <span style={{ fontSize: 12, color: "#4E5968" }}>분</span>
                  </div>
                  <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", marginBottom: 4 }} onClick={vm.toggleWorkAdvanced}>{vm.workAdvancedLabel}</button>
                  {vm.workAdvancedOpen && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F2F4F6", display: "flex", flexDirection: "column", gap: 10 }}>
                      {vm.workDayRows.map((wd) => (
                        <div key={wd.dow} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F8FA", borderRadius: 10, padding: "10px 12px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#191F28", width: 20, flex: "none" }}>{wd.label}</span>
                          <button style={css(wd.toggleOffStyle)} onClick={wd.toggleOff}>{wd.toggleOffLabel}</button>
                          {wd.off ? (
                            <span style={{ fontSize: 12.5, color: "#8B95A1" }}>쉬는 날</span>
                          ) : (
                            <>
                              <input type="number" min="0" max="23" value={wd.s} onChange={wd.onStartH} style={{ width: 38, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 600, border: "1px solid #E5E8EB", borderRadius: 7, padding: "6px 4px", color: "#191F28", flex: "none", textAlign: "center" }} />
                              <span style={{ fontSize: 12, color: "#8B95A1", flex: "none" }}>:</span>
                              <input type="number" min="0" max="59" step="15" value={wd.sm} onChange={wd.onStartM} style={{ width: 38, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 600, border: "1px solid #E5E8EB", borderRadius: 7, padding: "6px 4px", color: "#191F28", flex: "none", textAlign: "center" }} />
                              <span style={{ fontSize: 12, color: "#8B95A1", flex: "none" }}>–</span>
                              <input type="number" min="0" max="23" value={wd.e} onChange={wd.onEndH} style={{ width: 38, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 600, border: "1px solid #E5E8EB", borderRadius: 7, padding: "6px 4px", color: "#191F28", flex: "none", textAlign: "center" }} />
                              <span style={{ fontSize: 12, color: "#8B95A1", flex: "none" }}>:</span>
                              <input type="number" min="0" max="59" step="15" value={wd.em} onChange={wd.onEndM} style={{ width: 38, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 600, border: "1px solid #E5E8EB", borderRadius: 7, padding: "6px 4px", color: "#191F28", flex: "none", textAlign: "center" }} />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, marginTop: 12, borderTop: "1px solid #F2F4F6" }}>
                    <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 14px", cursor: "pointer" }} onClick={vm.closeWork}>취소</button>
                    <button style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#3182F7", border: "none", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={vm.confirmWork}>적용</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 선호/비선호 규칙 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", padding: "15px 0", borderBottom: "1px solid #F2F4F6", borderStyle: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>선호 / 비선호 규칙 <span style={{ display: "block", fontSize: 12.5, color: "#8B95A1", fontWeight: 400, marginTop: 4 }}>캘린더에서 원하는 요일·시간을 직접 선택해요</span></div>
            <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={vm.openRuleForm}>{vm.addRuleBtnText}</button>
          </div>
          {vm.mePrefs.map((pr, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 5, padding: "3px 8px", flex: "none", color: pr.color, background: pr.bg }}>{pr.tag}</span>
              <span style={{ flex: 1, fontSize: 13, color: "#4E5968" }}>{pr.label}</span>
              <button style={{ width: 22, height: 22, borderRadius: 7, border: "none", background: "#F2F4F6", color: "#8B95A1", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 14, lineHeight: 1, flex: "none" }} onClick={pr.remove}>×</button>
            </div>
          ))}
          {vm.meHasNoPrefs && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, borderRadius: 5, padding: "3px 8px", flex: "none", color: "#8B95A1", background: "#F2F4F6" }}>없음</span>
              <span style={{ fontSize: 13, color: "#4E5968" }}>아직 등록된 규칙이 없어요</span>
            </div>
          )}
          {vm.ruleAdding && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #F2F4F6", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, display: "block", marginBottom: 8 }}>선호 / 비선호</span>
                <div style={{ display: "flex", gap: 4, background: "#F2F4F6", borderRadius: 9, padding: 3, width: "fit-content" }}>
                  <button style={css(vm.ruleKindDislikeStyle)} onClick={vm.setRuleKindDislike}>비선호</button>
                  <button style={css(vm.ruleKindLikeStyle)} onClick={vm.setRuleKindLike}>선호</button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, display: "block", marginBottom: 8 }}>시간 단위</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {vm.ruleSlotHoursOpts.map((su) => (
                    <button key={su.label} style={css(su.style)} onClick={su.onClick}>{su.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, display: "block", marginBottom: 2 }}>캘린더에서 클릭해 추가 (여러 개 선택 가능)</span>
                <span style={{ fontSize: 11, color: "#8B95A1", display: "block", marginBottom: 8 }}>옅은 칸은 이미 등록된 규칙이에요</span>
                <div style={{ display: "grid", gridTemplateColumns: "36px repeat(7,1fr)", gap: 3 }}>
                  <div></div>
                  {vm.ruleCalDayHeaders.map((dh, i) => (
                    <div key={i} style={{ textAlign: "center", fontSize: 11, color: "#8B95A1" }}>{dh.label}</div>
                  ))}
                  {vm.ruleCalRows.map((row, ri) => (
                    <RuleCalRow key={ri} row={row} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#3182F7", border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer" }} onClick={vm.addRule}>추가</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RuleCalRow({ row }) {
  return (
    <>
      <div style={{ fontSize: 10.5, color: "#8B95A1", display: "flex", alignItems: "center", fontVariantNumeric: "tabular-nums" }}>{row.timeLabel}</div>
      {row.cells.map((c, i) => (
        <div key={i} style={css(c.style)} onClick={c.onClick}></div>
      ))}
    </>
  );
}
