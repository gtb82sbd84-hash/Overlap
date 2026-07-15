import { css } from "../css.js";

export function ConfirmPreviewModal({ vm }) {
  if (!vm.confirmPreviewOpen) return null;
  const p = vm.confirmPreview;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeConfirmPreview}>
      <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, width: "min(400px,100%)", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#191F28" }}>이 시간으로 확정할까요?</h3>
        <p style={{ fontSize: 12.5, color: "#8B95A1", margin: "0 0 18px" }}>확정하면 참여자에게 안내가 전송되고 일정에서 확인할 수 있어요.</p>
        <div style={{ background: "#F7F8FA", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: "#4E5968", fontWeight: 500 }}>{p.dayLabel}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 18 }}>{p.time}</span>
            <span style={{ fontSize: 12, color: "#8B95A1" }}>· {p.durationLabel}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#4E5968", marginBottom: 6 }}><b style={{ color: "#191F28", marginRight: 6 }}>필참</b>{p.reqNamesText}</div>
          {p.hasOptNames && (
            <div style={{ fontSize: 12.5, color: "#4E5968" }}><b style={{ color: "#191F28", marginRight: 6 }}>선택</b>{p.optNamesText}</div>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>회의 이름</div>
          <input type="text" placeholder="예) 주간 팀 싱크" value={vm.confirmMeetingTitle} onChange={vm.onConfirmTitleInput} style={{ width: "100%", fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>장소 / 구글 밋 링크 <span style={{ color: "#3182F7" }}>*</span></div>
          <input type="text" placeholder="예) 회의실 A 또는 meet.google.com/xxx-yyyy-zzz" value={vm.confirmMeetingLocation} onChange={vm.onConfirmLocationInput} style={{ width: "100%", fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, color: "#4E5968", fontWeight: 600, marginBottom: 8 }}>메시지</div>
          <textarea placeholder="참여자에게 전달할 메시지를 입력하세요" value={vm.confirmMeetingMessage} onChange={vm.onConfirmMessageInput} style={{ width: "100%", minHeight: 64, fontSize: 13.5, border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 12px", color: "#191F28", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}></textarea>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }} onClick={vm.closeConfirmPreview}>취소</button>
          <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#3182F7", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }} onClick={vm.doConfirmFromPreview}>확정하기</button>
        </div>
      </div>
    </div>
  );
}

export function VoteCancelConfirmModal({ vm }) {
  if (!vm.voteCancelConfirmOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeVoteCancelConfirm}>
      <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, width: "min(380px,100%)", boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#191F28" }}>투표를 취소하시겠어요?</h3>
        <p style={{ fontSize: 12.5, color: "#8B95A1", margin: "0 0 20px" }}>진행 중인 투표가 삭제되고 참여자들의 응답도 초기화돼요.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }} onClick={vm.dismissVoteCancelConfirm}>아니요</button>
          <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#F04452", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }} onClick={vm.confirmCancelVote}>투표 취소하기</button>
        </div>
      </div>
    </div>
  );
}

export function CancelConfirmModal({ vm }) {
  if (!vm.cancelConfirmOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeCancelConfirm}>
      <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, width: "min(380px,100%)", boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#191F28" }}>확정을 취소하시겠어요?</h3>
        <p style={{ fontSize: 12.5, color: "#8B95A1", margin: "0 0 18px" }}>확정된 시간이 해제되고, 다시 순위 목록에서 시간을 정할 수 있어요.</p>
        <button style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: 20 }} onClick={vm.toggleCancelNotifyEmail}>
          <span style={css(vm.cancelCheckStyle)}>
            {vm.cancelNotifyEmail && (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.8 9L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            )}
          </span>
          <span style={{ fontSize: 13, color: "#191F28" }}>취소 안내 메일 보내기</span>
        </button>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }} onClick={vm.closeCancelConfirm}>아니요</button>
          <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#F04452", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }} onClick={vm.cancelConfirmedSlot}>확정 취소하기</button>
        </div>
      </div>
    </div>
  );
}

export function GcalDisconnectModal({ vm }) {
  if (!vm.gcalDisconnectOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(25,31,40,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={vm.closeGcalDisconnect}>
      <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 24, width: "min(380px,100%)", boxShadow: "0 24px 60px -12px rgba(0,0,0,.3)", boxSizing: "border-box" }} onClick={vm.stopPropagation}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#191F28" }}>구글 캘린더 연동을 해제하시겠어요?</h3>
        <p style={{ fontSize: 12.5, color: "#8B95A1", margin: "0 0 20px" }}>해제하면 바쁜 일정이 더 이상 자동으로 반영되지 않아요. 언제든 다시 연동할 수 있어요.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button style={{ fontSize: 14, fontWeight: 500, color: "#4E5968", background: "none", border: "1px solid #E5E8EB", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }} onClick={vm.closeGcalDisconnect}>취소</button>
          <button style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#F04452", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }} onClick={vm.confirmGcalDisconnect}>연동 해제</button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ vm }) {
  if (!vm.toastVisible) return null;
  return (
    <div style={{ position: "fixed", left: "50%", bottom: 32, transform: "translateX(-50%)", zIndex: 60, background: "#191F28", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "14px 20px", boxShadow: "0 12px 28px -8px rgba(0,0,0,.4)" }}>{vm.toastMessage}</div>
  );
}
