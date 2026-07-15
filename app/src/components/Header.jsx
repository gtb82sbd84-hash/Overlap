import { useEffect, useRef, useState } from "react";
import { css } from "../css.js";
import overlapIcon from "../assets/overlap-icon.svg";

export default function Header({ vm }) {
  const profileWrapRef = useRef(null);
  const [menuAlign, setMenuAlign] = useState("right");

  useEffect(() => {
    if (!vm.profileMenuOpen) return;
    const updateAlign = () => {
      const el = profileWrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      // If the button wrapped onto its own line (sitting near the left edge),
      // open the menu to the right of it instead of off-screen to the left.
      setMenuAlign(center < window.innerWidth / 2 ? "left" : "right");
    };
    updateAlign();
    window.addEventListener("resize", updateAlign);
    return () => window.removeEventListener("resize", updateAlign);
  }, [vm.profileMenuOpen]);

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", paddingBottom: 16, borderBottom: "1px solid #E5E8EB", marginBottom: 22 }}>
      <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
        <img src={overlapIcon} alt="오버랩 아이콘" style={{ width: 59, height: 59, objectFit: "contain", flex: "none", cursor: "pointer" }} onClick={vm.goToMeetingCreate} />
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "#191F28", height: 36 }}>오버랩</h1>
          <p style={{ margin: "2px 0 0", color: "#4E5968", fontSize: 13, maxWidth: "44ch" }}>모두가 하나로 만나는 시간</p>
        </div>
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", maxWidth: "100%" }}>
        <button style={css(vm.scheduleNavStyle)} onClick={vm.goToSchedule}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"></rect><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg>
          일정
        </button>
        <div style={css(vm.navWrapStyle)}>
          {vm.mainTabs.map((t) => (
            <button key={t.label} style={css(t.style)} onClick={t.onClick}>{t.label}</button>
          ))}
        </div>

        <div ref={profileWrapRef} style={{ position: "relative", display: "inline-block" }}>
          <button style={css(vm.settingsTabStyle)} onClick={vm.setSettingsTab}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"></circle><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg>
            {vm.meName}님
          </button>
          {vm.profileMenuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={vm.closeProfileMenu}></div>
              <div style={{ position: "absolute", top: "calc(100% + 8px)", [menuAlign]: 0, zIndex: 45, background: "#FFFFFF", border: "1px solid #E5E8EB", borderRadius: 16, padding: 10, boxShadow: "0 12px 32px -8px rgba(0,0,0,.16)", width: 220 }}>
                <div style={{ padding: "8px 10px 12px", borderBottom: "1px solid #F2F4F6", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#191F28" }}>{vm.meName}</div>
                  <div style={{ fontSize: 12, color: "#8B95A1", marginTop: 2 }}>{vm.meEmail}</div>
                </div>
                <button style={css(vm.meetingCreateItemStyle)} onClick={vm.goToMeetingCreate}>회의 생성</button>
                <button style={css(vm.settingsItemStyle)} onClick={vm.goToSettingsFromMenu}>설정</button>
                <button style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: 8, padding: "9px 10px", fontSize: 14, fontWeight: 500, color: "#F04452", cursor: "pointer" }} onClick={vm.clickLogout}>로그아웃</button>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
