import { Fragment } from "react";
import { css } from "../css.js";
import MonthGrid from "./MonthGrid.jsx";

export default function DecidePane({ vm }) {
  return (
    <section data-screen-label="결정">
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "#4E5968" }}>팀 회의 · {vm.durationLabelText} · <b style={{ color: "#191F28" }}>필참 {vm.reqCount}</b> · 선택 {vm.optCount}</span>
      </div>

      {/* 히트맵 */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 20, padding: "20px 20px 16px", marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, display: "flex", alignItems: "baseline", gap: 8 }}>{vm.heatTitle}<span style={{ fontSize: 12, fontWeight: 400, color: "#8B95A1" }}>{vm.heatDateRangeNote}</span></h3>
          <p style={{ margin: 0, fontSize: 12, color: "#8B95A1" }}>{vm.heatSubtitle}</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gap: 4, minWidth: 420, gridTemplateColumns: vm.heatGridCols }}>
            <div></div>
            {vm.heatDays.map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, display: "flex", flexDirection: "column", lineHeight: 1.2, color: d.color }}>{d.label}<em style={{ fontSize: 9.5, color: "#8B95A1", fontWeight: 400, fontStyle: "normal" }}>{d.date}</em></div>
            ))}
            {vm.heatRows.map((row, ri) => (
              <Fragment key={ri}>
                <div style={{ fontSize: 11, color: "#8B95A1", display: "flex", alignItems: "center", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{row.timeLabel}</div>
                {row.cells.map((c, ci) => (
                  <div key={ci} style={{ height: 32, borderRadius: 9, position: "relative", background: c.bg, ...css(c.cellStyle) }} title={c.title} onClick={c.onClick}>
                    {c.hasRank && <span style={{ position: "absolute", top: 3, left: 5, fontWeight: 700, fontSize: 12, color: "#191F28", opacity: .8 }}>{c.rankLabel}</span>}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 9, marginTop: 14, fontSize: 12, color: "#8B95A1" }}>
          <span style={{ marginRight: 2 }}>비선호 많음</span>
          <span style={{ display: "flex", gap: 2 }}>
            <i style={{ width: 15, height: 12, borderRadius: 3, display: "inline-block", backgroundColor: "#FBC4C9" }}></i>
            <i style={{ width: 15, height: 12, borderRadius: 3, display: "inline-block", background: "#FDE1E3" }}></i>
            <i style={{ width: 15, height: 12, borderRadius: 3, display: "inline-block", background: "#F2F4F6" }}></i>
            <i style={{ width: 15, height: 12, borderRadius: 3, display: "inline-block", background: "#C9E9D6" }}></i>
            <i style={{ width: 15, height: 12, borderRadius: 3, display: "inline-block", backgroundColor: "#7FE0A8" }}></i>
          </span>
          <span>선호 많음</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6 }}><i style={{ width: 14, height: 12, borderRadius: 3, background: "repeating-linear-gradient(45deg,#F0F1F4,#F0F1F4 4px,#E8E9EE 4px,#E8E9EE 8px)", display: "inline-block" }}></i>필참 불가</span>
        </div>
      </div>

      {/* 결정 영역: 빈 화면 */}
      {vm.isEmptyMode && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EAD4A8", borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", gap: 13, marginBottom: 18 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5A100", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, flex: "none" }}>!</span>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px" }}>필참 전원이 가능한 한 시간이 없어요</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#4E5968", maxWidth: "66ch" }}>비선호 시간까지 전부 포함해도 전원이 되는 슬롯이 없어요. 여기서부터는 <b style={{ color: "#191F28" }}>제약을 바꾸는 결정</b>이라, 도구가 대신 정하지 않고 당신에게 맡겨요.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 11 }}>
            <button style={css(vm.escExpandStyle)} onClick={vm.setWeeks2} disabled={vm.weeksIsTwo}>
              <span style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 5 }}>기간 늘리기</span>
              <span style={{ fontSize: 12, color: "#4E5968" }}>{vm.escExpandNote}</span>
            </button>
            <div style={{ textAlign: "left", background: "#F7F8FA", border: "1px solid #E5E8EB", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>필참 조정</span>
              <span style={{ fontSize: 12, color: "#4E5968" }}>한 명을 선택 참석으로 내리면 자리가 열릴 수 있어요</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {vm.demotePeople.map((p) => (
                  <button key={p.short} style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 7, padding: "6px 9px", cursor: "pointer" }} onClick={p.demote}>{p.short} →선택</button>
                ))}
              </div>
            </div>
            <button style={{ textAlign: "left", background: "#F7F8FA", border: "1px solid #E5E8EB", borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }} onClick={vm.setAllowMissing}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>결원 감수하고 최선 보기</span>
              <span style={{ fontSize: 12, color: "#4E5968" }}>필참 결원이 가장 적은 순으로 시간을 제안받기</span>
            </button>
          </div>
        </div>
      )}

      {/* 결정 영역: 리스트 있음 */}
      {vm.hasResults && (
        <>
          {vm.isMissingMode && (
            <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#FEF3DA", border: "1px solid #EAD4A8", borderRadius: 12, padding: "11px 14px", fontSize: 12.5, color: "#4E5968", marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5A100", flex: "none" }}></span>
              <span>필참 전원 가능한 시간이 없어, <b style={{ color: "#191F28" }}>결원이 가장 적은 순</b>으로 보여드려요. 누가 빠지는지 각 카드에 표시돼요.</span>
              <button style={{ marginLeft: "auto", fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }} onClick={vm.backFromMissing}>돌아가기</button>
            </div>
          )}
          {vm.isNormalMode && (
            <div style={{ display: "flex", alignItems: "center", gap: 11, background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 12, padding: "11px 14px", fontSize: 12.5, color: "#4E5968", marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3182F7", flex: "none", animation: "teumPulse 1.6s ease-out infinite" }}></span>
              <span>등록된 선호로 <b style={{ color: "#191F28" }}>추정 진행</b> 중 · 마감 전까지 순위는 실시간으로 다시 정해져요.</span>
            </div>
          )}
          <h3 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700 }}>결정 순위 <em style={{ fontSize: 12, color: "#8B95A1", fontWeight: 400, fontStyle: "normal" }}>· {vm.rankSubtitle}</em></h3>
          {vm.hasSelection && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#EBF2FE", border: "1px solid #C9E0FE", borderRadius: 12, padding: "11px 14px", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#191F28" }}>{vm.selectionBarText}</span>
              <button style={css(vm.voteGenBtnStyle)} title={vm.voteGenBtnTitle} onClick={vm.openVoteModal}>투표 생성하기</button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {vm.rankSlots.map((slot) => (
              <article key={slot.key} style={css(slot.cardStyle)} onMouseEnter={slot.onMouseEnter} onMouseLeave={slot.onMouseLeave} onClick={slot.toggleSelect}>
                {slot.isFirst && (
                  <div style={{ position: "absolute", top: -12, left: 20, display: "flex", alignItems: "center", gap: 4, background: "#3182F7", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 10px 5px 8px", borderRadius: 999, boxShadow: "0 4px 10px -3px rgba(49,130,247,.5)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M5 18h14l1.3-9.6-4.8 3.3L12 4.4 8.5 11.7 3.7 8.4 5 18z"></path></svg>
                    추천
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 32, paddingTop: 2 }}>
                  <button style={css(slot.checkStyle)}>
                    {slot.isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.8 9L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    )}
                  </button>
                  <span style={{ color: "#3182F7" }}>{slot.rankNum}</span>
                </div>
                <div style={{ flex: "1 1 200px", minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, color: "#4E5968", fontWeight: 500 }}>{slot.day}</span>
                    <span style={css(slot.timeStyle)}>{slot.time}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {slot.reasons.map((r, i) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 500, borderRadius: 6, padding: "3px 8px", color: r.color, background: r.bg }}>{r.text}</span>
                    ))}
                  </div>
                </div>
                <div style={{ alignSelf: "center", flex: "none", marginLeft: "auto" }}>
                  {slot.showConfirmBtn && (
                    <button style={{ fontWeight: 700, fontSize: 14, background: "#3182F7", color: "#fff", border: "none", borderRadius: 999, padding: "12px 20px", cursor: "pointer", boxShadow: "0 6px 16px -6px rgba(49,130,247,.5)", whiteSpace: "nowrap" }} onClick={slot.confirmStop}>이 시간으로 확정</button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {vm.hasMoreRanks && (
            <button style={{ marginTop: 12, width: "100%", fontSize: 14, fontWeight: 600, color: "#4E5968", background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 12, padding: 12, cursor: "pointer" }} onClick={vm.toggleRankExpanded}>{vm.rankMoreLabel}</button>
          )}
        </>
      )}

      {/* 투표 생성 모달 */}
      {vm.voteModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeVoteModal}>
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, width: "min(420px,100%)", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#191F28" }}>투표 생성하기</h3>
            <p style={{ fontSize: 12.5, color: "#8B95A1", margin: "0 0 18px" }}>선택한 {vm.selectedCount}개 후보를 참여자에게 투표로 보내요.</p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>회의 이름</div>
              <input type="text" placeholder="예) 주간 팀 싱크" value={vm.voteMeetingTitle} onChange={vm.onVoteTitleInput} style={{ width: "100%", fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>장소 / 구글 밋 링크 <span style={{ color: "#3182F7" }}>*</span></div>
              <input type="text" placeholder="예) 회의실 A 또는 meet.google.com/xxx-yyyy-zzz" value={vm.voteMeetingLocation} onChange={vm.onVoteLocationInput} style={{ width: "100%", fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, marginBottom: 2 }}>마감 시간 <span style={{ color: "#3182F7" }}>*</span></div>
              <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 8 }}>가장 이른 후보 시간보다 전으로 설정돼요</div>
              <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                <button style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontWeight: 600, color: "#191F28", cursor: "pointer", width: "100%", textAlign: "left" }} onClick={vm.openDeadline}>{vm.deadlineLabel}</button>
                {vm.deadlineOpen && (
                  <div style={{ position: "fixed", inset: 0, zIndex: 65, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeDeadline}>
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 16, boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", width: "min(300px,100%)", maxHeight: "85vh", overflowY: "auto", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                        <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }} onClick={vm.quickDeadlineToday}>오늘</button>
                        <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }} onClick={vm.quickDeadlineTomorrow}>내일</button>
                        <button style={{ fontSize: 14, fontWeight: 600, color: "#3182F7", background: "#EBF2FE", border: "none", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }} onClick={vm.quickDeadlineFriday}>이번 주 금요일</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4E5968", fontSize: 16, padding: "4px 8px", borderRadius: 6 }} onClick={vm.navDeadlinePrev}>‹</button>
                        {vm.deadlineMonths.map((mo, i) => <span key={i} style={{ fontWeight: 700, fontSize: 13 }}>{mo.label}</span>)}
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#4E5968", fontSize: 16, padding: "4px 8px", borderRadius: 6 }} onClick={vm.navDeadlineNext}>›</button>
                      </div>
                      {vm.deadlineMonths.map((mo, i) => <MonthGrid key={i} month={mo} showLabel={false} />)}
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F2F4F6" }}>
                        <div style={{ fontSize: 11, color: "#8B95A1", marginBottom: 8 }}>시간</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                          {vm.deadlineTimePresets.map((tp) => (
                            <button key={tp.label} style={css(tp.style)} onClick={tp.onClick}>{tp.label}</button>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input type="number" min="0" max="23" value={vm.deadlineHour} onChange={vm.onDeadlineHourInput} style={{ width: 52, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 8, padding: "6px 8px", color: "#191F28" }} />
                          <span style={{ fontSize: 12, color: "#4E5968" }}>시</span>
                          <input type="number" min="0" max="59" step="15" value={vm.deadlineMinute} onChange={vm.onDeadlineMinuteInput} style={{ width: 52, fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 700, border: "1px solid #E5E8EB", borderRadius: 8, padding: "6px 8px", color: "#191F28" }} />
                          <span style={{ fontSize: 12, color: "#4E5968" }}>분</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                        <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 9, padding: "8px 14px", cursor: "pointer" }} onClick={vm.closeDeadline}>취소</button>
                        <button style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: "#3182F7", border: "none", borderRadius: 9, padding: "8px 16px", cursor: "pointer" }} onClick={vm.confirmDeadline}>적용</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>응답 방식</div>
              <div style={{ display: "flex", gap: 4, background: "#F2F4F6", borderRadius: 9, padding: 3, width: "fit-content" }}>
                <button style={css(vm.voteAnonStyle)} onClick={vm.setVoteAnon}>익명</button>
                <button style={css(vm.voteNamedStyle)} onClick={vm.setVoteNamed}>실명</button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>메시지</div>
              <textarea placeholder="참여자에게 전달할 메시지를 입력하세요" value={vm.voteMessage} onChange={vm.onVoteMessageInput} style={{ width: "100%", minHeight: 76, fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}></textarea>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }} onClick={vm.closeVoteModal}>취소</button>
              <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#3182F7", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }} onClick={vm.sendVote}>전송</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
