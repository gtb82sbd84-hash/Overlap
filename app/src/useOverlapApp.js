import { useState } from "react";
import { PEOPLE, GCAL_DEFAULT } from "./data.js";
import { pad2, isoDate, nowHM, todayIsoNow, mondayOfWeek, addDays } from "./logic.js";

function makeInitialState() {
  const today = new Date();
  const defaultRangeEnd = addDays(today, 6); // 7 days total, starting today
  return {
    tab: "schedule",
    roles: Object.fromEntries(PEOPLE.map((p) => [p.id, p.role])),
    me: "jimin", allowMissing: false, excludedPeople: {},
    periodOpen: false, calY: today.getFullYear(), calM: today.getMonth(),
    rangeStart: isoDate(today.getFullYear(), today.getMonth(), today.getDate()),
    rangeEnd: isoDate(defaultRangeEnd.getFullYear(), defaultRangeEnd.getMonth(), defaultRangeEnd.getDate()),
    lengthOpen: false, durationMin: 60,
    scopeOpen: false, scopeMode: "in", scopeOutSub: { weekday: true, weekend: false },
    prefsByPerson: Object.fromEntries(PEOPLE.map((p) => [p.id, p.prefs.map((r) => ({ ...r, days: [...r.days], hours: [...r.hours] }))])),
    gcalByPerson: { ...GCAL_DEFAULT },
    ruleAdding: false, ruleKind: "dislike",
    ruleSlotHours: 1, ruleCalSelected: {},
    selectedSlots: {}, voteModalOpen: false, voteAnon: true, voteMessage: "",
    toastVisible: false, toastMessage: "",
    deadlineOpen: false, deadlineY: 2026, deadlineM: 6, deadlineDate: "2026-07-17", deadlineTime: "18:00",
    rankExpanded: false,
    cancelConfirmId: null, cancelNotifyEmail: true,
    hoveredSlotKey: null,
    gcalDisconnectOpen: false,
    workScheduleByPerson: Object.fromEntries(PEOPLE.map((p) => [p.id, [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
      off: dow >= 5, s: p.work.s, sm: 0, e: p.work.e, em: 0,
    }))])),
    workOpen: false, workAdvancedOpen: false,
    profileMenuOpen: false,
    confirmedMeetings: [],
    activeVotes: [],
    voteCancelConfirmId: null, myVotesByVoteId: {},
    confirmPreviewOpen: false, confirmPreviewData: null,
    confirmMeetingTitle: "", confirmMeetingLocation: "", confirmMeetingMessage: "",
    voteMeetingTitle: "", voteMeetingLocation: "",
  };
}

// Pure helper mirroring the original's `getEarliestSlot` — reads state, no mutation.
export function getEarliestSlot(s) {
  const keys = Object.keys(s.selectedSlots);
  let iso = null, h = null;
  keys.forEach((k) => {
    const idx = k.lastIndexOf("-");
    const kIso = k.slice(0, idx), kH = parseInt(k.slice(idx + 1), 10);
    if (iso === null || kIso < iso || (kIso === iso && kH < h)) { iso = kIso; h = kH; }
  });
  return iso === null ? null : { iso, h };
}

export function useOverlapApp() {
  const [state, setStateRaw] = useState(makeInitialState);

  const setState = (updater) => {
    setStateRaw((prev) => {
      const patch = typeof updater === "function" ? updater(prev) : updater;
      if (!patch) return prev;
      return { ...prev, ...patch };
    });
  };

  const showToast = (message, ms = 3000) => {
    setState({ toastVisible: true, toastMessage: message });
    setTimeout(() => setState({ toastVisible: false }), ms);
  };

  const h = {};

  h.setTab = (k) => setState({ tab: k });
  h.toggleRole = (pid) => setState((s) => ({ roles: { ...s.roles, [pid]: s.roles[pid] === "required" ? "optional" : "required" } }));
  h.toggleExclude = (pid) => setState((s) => ({ excludedPeople: { ...s.excludedPeople, [pid]: !s.excludedPeople[pid] } }));
  h.extendPeriod = () => setState((s) => {
    const end = addDays(new Date(s.rangeEnd + "T00:00:00"), 7);
    return { rangeEnd: isoDate(end.getFullYear(), end.getMonth(), end.getDate()), allowMissing: false };
  });
  h.setAllowMissingTrue = () => setState({ allowMissing: true });
  h.setAllowMissingFalse = () => setState({ allowMissing: false });

  h.confirmSlot = (key, dayLabel, time, durationMin, reqNames, optNames, title, location, message) => {
    const id = "cm" + Date.now() + Math.random().toString(36).slice(2, 7);
    setState((s) => ({
      confirmedMeetings: [...s.confirmedMeetings, { id, key, dayLabel, time, durationMin, reqNames, optNames, title, location, message }],
      selectedSlots: {},
      tab: "schedule",
    }));
    showToast("확정됐어요 · 일정에서 확인하세요");
  };
  h.openConfirmPreview = (key, dayLabel, time, durationMin, reqNames, optNames) => setState({
    confirmPreviewOpen: true, confirmPreviewData: { key, dayLabel, time, durationMin, reqNames, optNames },
    confirmMeetingTitle: "", confirmMeetingLocation: "", confirmMeetingMessage: "",
  });
  h.closeConfirmPreview = () => setState({ confirmPreviewOpen: false, confirmPreviewData: null });
  h.onConfirmTitleInput = (e) => setState({ confirmMeetingTitle: e.target.value });
  h.onConfirmLocationInput = (e) => setState({ confirmMeetingLocation: e.target.value });
  h.onConfirmMessageInput = (e) => setState({ confirmMeetingMessage: e.target.value });
  h.doConfirmFromPreview = () => {
    const d = state.confirmPreviewData;
    if (!d) return;
    const title = state.confirmMeetingTitle.trim() || "팀 회의";
    const location = state.confirmMeetingLocation.trim();
    const message = state.confirmMeetingMessage.trim();
    setState({ confirmPreviewOpen: false });
    h.confirmSlot(d.key, d.dayLabel, d.time, d.durationMin, d.reqNames, d.optNames, title, location, message);
  };
  h.goToSchedule = () => setState({ tab: "schedule" });
  h.openCancelConfirm = (id) => setState({ cancelConfirmId: id });
  h.closeCancelConfirm = () => setState({ cancelConfirmId: null });
  h.toggleCancelNotifyEmail = () => setState((s) => ({ cancelNotifyEmail: !s.cancelNotifyEmail }));
  h.cancelConfirmedSlot = () => {
    const notify = state.cancelNotifyEmail;
    setState((s) => ({
      confirmedMeetings: s.confirmedMeetings.filter((m) => m.id !== s.cancelConfirmId),
      cancelConfirmId: null,
    }));
    showToast(notify ? "확정이 취소됐어요 · 안내 메일을 보냈어요" : "확정이 취소됐어요");
  };

  h.openPeriod = () => setState({ periodOpen: true });
  h.closePeriod = () => setState({ periodOpen: false });
  h.confirmPeriod = () => setState({ periodOpen: false });
  h.navPrev = () => setState((s) => { let m = s.calM - 1, y = s.calY; if (m < 0) { m = 11; y--; } return { calM: m, calY: y }; });
  h.navNext = () => setState((s) => { let m = s.calM + 1, y = s.calY; if (m > 11) { m = 0; y++; } return { calM: m, calY: y }; });
  h.pickDay = (dateStr) => setState((s) => {
    if (!s.rangeStart || (s.rangeStart && s.rangeEnd)) return { rangeStart: dateStr, rangeEnd: null };
    if (dateStr < s.rangeStart) return { rangeStart: dateStr, rangeEnd: null };
    if (dateStr === s.rangeStart) return { rangeEnd: dateStr };
    return { rangeEnd: dateStr };
  });
  h.quickThisWeek = () => {
    const mon = mondayOfWeek(new Date()); const fri = addDays(mon, 4);
    setState({ rangeStart: isoDate(mon.getFullYear(), mon.getMonth(), mon.getDate()), rangeEnd: isoDate(fri.getFullYear(), fri.getMonth(), fri.getDate()), calY: mon.getFullYear(), calM: mon.getMonth() });
  };
  h.quickNextWeek = () => {
    const mon = addDays(mondayOfWeek(new Date()), 7); const fri = addDays(mon, 4);
    setState({ rangeStart: isoDate(mon.getFullYear(), mon.getMonth(), mon.getDate()), rangeEnd: isoDate(fri.getFullYear(), fri.getMonth(), fri.getDate()), calY: mon.getFullYear(), calM: mon.getMonth() });
  };
  h.quickThisMonth = () => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setState({ rangeStart: isoDate(first.getFullYear(), first.getMonth(), first.getDate()), rangeEnd: isoDate(last.getFullYear(), last.getMonth(), last.getDate()), calY: first.getFullYear(), calM: first.getMonth() });
  };

  h.openLength = () => setState({ lengthOpen: true });
  h.closeLength = () => setState({ lengthOpen: false });
  h.confirmLength = () => setState({ lengthOpen: false });
  h.setDuration = (mins) => setState({ durationMin: mins });
  h.onDurationInput = (e) => {
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v)) return;
    setState({ durationMin: v });
  };
  h.onDurationBlur = () => setState((s) => {
    let v = Math.round(s.durationMin / 15) * 15;
    if (v < 15) v = 15;
    return { durationMin: v };
  });

  h.openScope = () => setState({ scopeOpen: true });
  h.closeScope = () => setState({ scopeOpen: false });
  h.confirmScope = () => setState({ scopeOpen: false });
  h.setScopeIn = () => setState({ scopeMode: "in" });
  h.setScopeOut = () => setState((s) => ({
    scopeMode: "out",
    scopeOutSub: (s.scopeOutSub.weekday || s.scopeOutSub.weekend) ? s.scopeOutSub : { weekday: true, weekend: false },
  }));
  h.toggleScopeOutWeekday = () => setState((s) => {
    const next = !s.scopeOutSub.weekday;
    if (!next && !s.scopeOutSub.weekend) return null;
    return { scopeOutSub: { ...s.scopeOutSub, weekday: next } };
  });
  h.toggleScopeOutWeekend = () => setState((s) => {
    const turningOn = !s.scopeOutSub.weekend;
    if (!turningOn && !s.scopeOutSub.weekday) return null;
    let rangeEnd = s.rangeEnd;
    if (turningOn && s.rangeStart && s.rangeEnd) {
      let cur = new Date(s.rangeStart + "T00:00:00");
      const end = new Date(s.rangeEnd + "T00:00:00");
      let hasWeekend = false;
      while (cur <= end) { const dow = (cur.getDay() + 6) % 7; if (dow >= 5) { hasWeekend = true; break; } cur = addDays(cur, 1); }
      if (!hasWeekend) {
        let d = new Date(s.rangeEnd + "T00:00:00");
        while (((d.getDay() + 6) % 7) !== 6) d = addDays(d, 1);
        rangeEnd = isoDate(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
    return { scopeOutSub: { ...s.scopeOutSub, weekend: turningOn }, rangeEnd };
  });

  h.toggleGcal = () => {
    setState((s) => ({ gcalByPerson: { ...s.gcalByPerson, [s.me]: !s.gcalByPerson[s.me] } }));
    showToast("구글 캘린더가 연동됐어요");
  };
  h.openGcalDisconnect = () => setState({ gcalDisconnectOpen: true });
  h.closeGcalDisconnect = () => setState({ gcalDisconnectOpen: false });
  h.confirmGcalDisconnect = () => {
    setState((s) => ({ gcalByPerson: { ...s.gcalByPerson, [s.me]: false }, gcalDisconnectOpen: false }));
    showToast("구글 캘린더 연동이 해제됐어요");
  };
  h.openWork = () => setState({ workOpen: true });
  h.closeWork = () => setState({ workOpen: false, workAdvancedOpen: false });
  h.confirmWork = () => setState({ workOpen: false, workAdvancedOpen: false });
  h.toggleWorkAdvanced = () => setState((s) => ({ workAdvancedOpen: !s.workAdvancedOpen }));
  h.toggleProfileMenu = () => setState((s) => ({ profileMenuOpen: !s.profileMenuOpen }));
  h.closeProfileMenu = () => setState({ profileMenuOpen: false });
  h.goToSettingsFromMenu = () => setState({ tab: "settings", profileMenuOpen: false });
  h.goToMeetingCreate = () => setState({ tab: "setup", profileMenuOpen: false });
  h.clickLogout = () => {
    setState({ profileMenuOpen: false });
    showToast("프로토타입 체험을 위해 로그인 상태가 유지됩니다.");
  };
  const applyToNonOffDays = (mutator) => setState((s) => {
    const sched = s.workScheduleByPerson[s.me].map((d) => (d.off ? d : mutator(d)));
    return { workScheduleByPerson: { ...s.workScheduleByPerson, [s.me]: sched } };
  });
  h.setWorkHours = (sh, eh) => applyToNonOffDays(() => ({ off: false, s: sh, sm: 0, e: eh, em: 0 }));
  h.onWorkStartHInput = (e) => {
    let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(23, v));
    applyToNonOffDays((d) => ({ ...d, s: v, e: Math.max(v + 1, d.e) }));
  };
  h.onWorkStartMInput = (e) => {
    let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(59, v));
    applyToNonOffDays((d) => ({ ...d, sm: v }));
  };
  h.onWorkEndHInput = (e) => {
    let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 1; v = Math.max(1, Math.min(24, v));
    applyToNonOffDays((d) => ({ ...d, e: v, s: Math.min(v - 1, d.s) }));
  };
  h.onWorkEndMInput = (e) => {
    let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(59, v));
    applyToNonOffDays((d) => ({ ...d, em: v }));
  };
  h.toggleDayOff = (dow) => setState((s) => {
    const sched = s.workScheduleByPerson[s.me].map((d, i) => (i === dow ? { ...d, off: !d.off } : d));
    return { workScheduleByPerson: { ...s.workScheduleByPerson, [s.me]: sched } };
  });
  const editDay = (dow, patch) => setState((s) => {
    const sched = s.workScheduleByPerson[s.me].map((d, i) => (i === dow ? { ...d, ...patch } : d));
    return { workScheduleByPerson: { ...s.workScheduleByPerson, [s.me]: sched } };
  });
  h.onDayStartH = (dow, e) => { let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(23, v)); editDay(dow, { s: v }); };
  h.onDayStartM = (dow, e) => { let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(59, v)); editDay(dow, { sm: v }); };
  h.onDayEndH = (dow, e) => { let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 1; v = Math.max(1, Math.min(24, v)); editDay(dow, { e: v }); };
  h.onDayEndM = (dow, e) => { let v = parseInt(e.target.value, 10); if (Number.isNaN(v)) v = 0; v = Math.max(0, Math.min(59, v)); editDay(dow, { em: v }); };

  h.openRuleForm = () => setState({ ruleAdding: true });
  h.closeRuleForm = () => setState({ ruleAdding: false, ruleKind: "dislike", ruleSlotHours: 1, ruleCalSelected: {} });
  h.setRuleKindDislike = () => setState({ ruleKind: "dislike" });
  h.setRuleKindLike = () => setState({ ruleKind: "like" });
  h.setRuleSlotHours = (n) => setState({ ruleSlotHours: n, ruleCalSelected: {} });
  h.toggleRuleCell = (dow, hh) => setState((s) => {
    const n = s.ruleSlotHours;
    const block = [];
    for (let i = 0; i < n; i++) { const v = hh + i; if (v <= 17) block.push(v); }
    const anchorKey = `${dow}-${hh}`;
    const isOn = !!s.ruleCalSelected[anchorKey];
    const sel = { ...s.ruleCalSelected };
    block.forEach((v) => { const k = `${dow}-${v}`; if (isOn) delete sel[k]; else sel[k] = true; });
    return { ruleCalSelected: sel };
  });
  h.addRule = () => setState((s) => {
    const keys = Object.keys(s.ruleCalSelected);
    if (!keys.length) return null;
    const byDay = {};
    keys.forEach((k) => {
      const [dow, hh] = k.split("-").map(Number);
      if (!byDay[dow]) byDay[dow] = [];
      byDay[dow].push(hh);
    });
    const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
    const newRules = Object.entries(byDay).map(([dow, hours]) => {
      hours.sort((a, b) => a - b);
      const runs = [];
      let start = hours[0], prev = hours[0];
      for (let i = 1; i <= hours.length; i++) {
        const hv = hours[i];
        if (hv !== prev + 1) { runs.push([start, prev]); start = hv; }
        prev = hv;
      }
      const rangeLabel = runs.map(([a, b]) => `${pad2(a)}:00~${pad2(b + 1)}:00`).join(", ");
      const label = `${DAY_LABELS[dow]}요일 · ${rangeLabel}`;
      return { k: s.ruleKind, label, days: [Number(dow)], hours };
    });
    return {
      prefsByPerson: { ...s.prefsByPerson, [s.me]: [...s.prefsByPerson[s.me], ...newRules] },
      ruleAdding: false, ruleKind: "dislike", ruleSlotHours: 1, ruleCalSelected: {},
    };
  });
  h.deleteRule = (pid, idx) => setState((s) => ({ prefsByPerson: { ...s.prefsByPerson, [pid]: s.prefsByPerson[pid].filter((_, i) => i !== idx) } }));

  h.toggleSlotSelect = (key) => setState((s) => {
    const sel = { ...s.selectedSlots };
    if (sel[key]) delete sel[key]; else sel[key] = true;
    return { selectedSlots: sel };
  });
  h.toggleSlotFromHeat = (key) => setState((s) => {
    const sel = { ...s.selectedSlots };
    if (sel[key]) delete sel[key]; else sel[key] = true;
    return { selectedSlots: sel, rankExpanded: true };
  });
  h.openVoteModal = () => {
    if (Object.keys(state.selectedSlots).length < 2) {
      showToast("후보를 최소 2개 이상 선택해야 투표를 생성할 수 있어요", 2500);
      return;
    }
    setState({ voteModalOpen: true, voteMeetingTitle: "", voteMeetingLocation: "" });
  };
  h.closeVoteModal = () => setState({ voteModalOpen: false });
  h.onVoteMessageInput = (e) => setState({ voteMessage: e.target.value });
  h.onVoteTitleInput = (e) => setState({ voteMeetingTitle: e.target.value });
  h.onVoteLocationInput = (e) => setState({ voteMeetingLocation: e.target.value });
  h.openDeadline = () => setState({ deadlineOpen: true });
  h.closeDeadline = () => setState({ deadlineOpen: false });
  h.confirmDeadline = () => setState({ deadlineOpen: false });
  h.navDeadlinePrev = () => setState((s) => { let m = s.deadlineM - 1, y = s.deadlineY; if (m < 0) { m = 11; y--; } return { deadlineM: m, deadlineY: y }; });
  h.navDeadlineNext = () => setState((s) => { let m = s.deadlineM + 1, y = s.deadlineY; if (m > 11) { m = 0; y++; } return { deadlineM: m, deadlineY: y }; });
  h.pickDeadlineDay = (dateStr) => setState((s) => {
    let t = s.deadlineTime;
    if (dateStr === todayIsoNow() && t < nowHM()) t = nowHM();
    return { deadlineDate: dateStr, deadlineTime: t };
  });
  h.setDeadlineTime = (hhmm) => setState((s) => {
    if (s.deadlineDate === todayIsoNow() && hhmm < nowHM()) return null;
    return { deadlineTime: hhmm };
  });
  h.onDeadlineHourInput = (e) => {
    let hv = parseInt(e.target.value, 10); if (Number.isNaN(hv)) hv = 0; hv = Math.max(0, Math.min(23, hv));
    setState((s) => {
      let t = `${pad2(hv)}:${s.deadlineTime.split(":")[1]}`;
      if (s.deadlineDate === todayIsoNow() && t < nowHM()) t = nowHM();
      const earliest = getEarliestSlot(s);
      if (earliest && s.deadlineDate === earliest.iso && t >= `${pad2(earliest.h)}:00`) t = `${pad2(Math.max(0, earliest.h - 1))}:00`;
      return { deadlineTime: t };
    });
  };
  h.onDeadlineMinuteInput = (e) => {
    let mv = parseInt(e.target.value, 10); if (Number.isNaN(mv)) mv = 0; mv = Math.max(0, Math.min(59, mv));
    setState((s) => {
      let t = `${s.deadlineTime.split(":")[0]}:${pad2(mv)}`;
      if (s.deadlineDate === todayIsoNow() && t < nowHM()) t = nowHM();
      const earliest = getEarliestSlot(s);
      if (earliest && s.deadlineDate === earliest.iso && t >= `${pad2(earliest.h)}:00`) t = `${s.deadlineTime.split(":")[0]}:00`;
      return { deadlineTime: t };
    });
  };
  h.toggleRankExpanded = () => setState((s) => ({ rankExpanded: !s.rankExpanded }));
  h.setHoverSlot = (key) => setState({ hoveredSlotKey: key });
  h.clearHoverSlot = () => setState((s) => (s.hoveredSlotKey === null ? null : { hoveredSlotKey: null }));
  h.quickDeadlineToday = () => setState((s) => {
    const t = new Date();
    let time = s.deadlineTime; if (time < nowHM()) time = nowHM();
    return { deadlineDate: isoDate(t.getFullYear(), t.getMonth(), t.getDate()), deadlineY: t.getFullYear(), deadlineM: t.getMonth(), deadlineTime: time };
  });
  h.quickDeadlineTomorrow = () => { const t = addDays(new Date(), 1); setState({ deadlineDate: isoDate(t.getFullYear(), t.getMonth(), t.getDate()), deadlineY: t.getFullYear(), deadlineM: t.getMonth() }); };
  h.quickDeadlineFriday = () => {
    const t = new Date(); const dow = (t.getDay() + 6) % 7;
    let fri = addDays(t, (4 - dow + 7) % 7); if (fri.toDateString() === t.toDateString()) fri = addDays(t, 7);
    setState({ deadlineDate: isoDate(fri.getFullYear(), fri.getMonth(), fri.getDate()), deadlineY: fri.getFullYear(), deadlineM: fri.getMonth() });
  };
  h.setVoteAnon = () => setState({ voteAnon: true });
  h.setVoteNamed = () => setState({ voteAnon: false });
  h.sendVote = (candidates, deadlineLabel, anon, message, title, location) => {
    const id = "v" + Date.now() + Math.random().toString(36).slice(2, 7);
    setState((s) => ({
      voteModalOpen: false, selectedSlots: {}, voteMessage: "",
      activeVotes: [...s.activeVotes, { id, candidates, deadlineLabel, anon, message, title, location, totalCount: PEOPLE.length }],
      tab: "schedule",
    }));
    showToast(`투표가 생성되어 참여자 전원에게 전송됐어요 (${candidates.length}개 후보) · 일정에서 확인하세요`);
  };
  h.openVoteCancelConfirm = (id) => setState({ voteCancelConfirmId: id });
  h.closeVoteCancelConfirm = () => setState({ voteCancelConfirmId: null });
  h.dismissVoteCancelConfirm = () => {
    setState({ voteCancelConfirmId: null });
    showToast("투표가 취소되지 않고 유지돼요", 2500);
  };
  h.confirmCancelVote = () => setState((s) => {
    const id = s.voteCancelConfirmId;
    const myVotesByVoteId = { ...s.myVotesByVoteId };
    delete myVotesByVoteId[id];
    return { activeVotes: s.activeVotes.filter((v) => v.id !== id), voteCancelConfirmId: null, myVotesByVoteId };
  });
  h.toggleSelectCandidate = (voteId, idx) => setState((s) => {
    const entry = s.myVotesByVoteId[voteId] || { voted: {}, selected: {} };
    if (Object.values(entry.voted).some(Boolean)) return null;
    const sel = { ...entry.selected };
    if (sel[idx]) delete sel[idx]; else sel[idx] = true;
    return { myVotesByVoteId: { ...s.myVotesByVoteId, [voteId]: { ...entry, selected: sel } } };
  });
  h.submitCandidateVotes = (voteId) => setState((s) => {
    const entry = s.myVotesByVoteId[voteId] || { voted: {}, selected: {} };
    return { myVotesByVoteId: { ...s.myVotesByVoteId, [voteId]: { voted: { ...entry.voted, ...entry.selected }, selected: {} } } };
  });
  h.resetMyVotes = (voteId) => setState((s) => ({ myVotesByVoteId: { ...s.myVotesByVoteId, [voteId]: { voted: {}, selected: {} } } }));
  h.showSelectCandidateHint = () => showToast("회의 일자를 최소 한 개 선택해주세요", 2500);
  h.showToast = showToast;

  return { state, handlers: h };
}
