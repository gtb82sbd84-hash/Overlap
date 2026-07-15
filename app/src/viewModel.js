import { PEOPLE, DAY_LABELS } from "./data.js";
import {
  scoreAny, buildDaysInRange, reasonParts, TONE, cellBg,
  navContainerStyle, navTabStyleVariant, segStyle,
  pad2, isoDate, nowHM, todayIsoNow, fmtDay, durationLabel,
  quickLenStyle, scopeOptStyle, scopeSubStyle, chipSegStyle,
  summarizeWorkSchedule, cellStyle, singleCellStyle,
} from "./logic.js";

const HOURS_IN = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOURS_OUT = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const NAV_TAB_STYLE = "segmented"; // fixed; the "Tweaks" variant picker was a design-tool-only dev knob

export function buildViewModel(state, h) {
  const {
    tab, roles, me, allowMissing, periodOpen, calY, calM, rangeStart, rangeEnd,
    lengthOpen, durationMin, scopeOpen, scopeMode, scopeOutSub, prefsByPerson, gcalByPerson,
    ruleAdding, ruleKind, selectedSlots, voteModalOpen, voteAnon, voteMessage, toastVisible, toastMessage,
    deadlineOpen, deadlineY, deadlineM, deadlineDate, deadlineTime, rankExpanded,
    cancelConfirmId, cancelNotifyEmail, hoveredSlotKey, gcalDisconnectOpen,
    workScheduleByPerson, workOpen, workAdvancedOpen, profileMenuOpen,
    confirmedMeetings, activeVotes, voteCancelConfirmId, myVotesByVoteId,
    confirmPreviewOpen, confirmPreviewData, confirmMeetingTitle, confirmMeetingLocation, confirmMeetingMessage,
    ruleSlotHours, ruleCalSelected, excludedPeople,
  } = state;

  const livePeople = PEOPLE.map((p) => ({ ...p, prefs: prefsByPerson[p.id], workSchedule: workScheduleByPerson[p.id] }));
  const confirmedKeys = new Set(confirmedMeetings.map((m) => m.key));
  const activePeople = livePeople.filter((p) => !excludedPeople[p.id]);
  const votes = {}; // per-person vote cycling was superseded by candidate voting; no UI reaches this anymore

  const QUICK_LENS = [15, 30, 60, 90, 120];
  const lengthQuickOpts = QUICK_LENS.map((m) => ({ label: durationLabel(m), style: quickLenStyle(durationMin === m), onClick: () => h.setDuration(m) }));
  const scopeSubParts = [];
  if (scopeOutSub.weekday) scopeSubParts.push("주중");
  if (scopeOutSub.weekend) scopeSubParts.push("주말 및 공휴일 포함");
  const scopeLabel = scopeMode === "in" ? "각자 근무시간 내" : (scopeSubParts.length ? `근무시간 외 · ${scopeSubParts.join(" · ")}` : "근무시간 외");

  const todayD = new Date();
  const todayIso = isoDate(todayD.getFullYear(), todayD.getMonth(), todayD.getDate());
  const buildMonth = (y, m) => {
    const first = new Date(y, m, 1);
    const leading = (first.getDay() + 6) % 7;
    const dim = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < leading; i++) cells.push({ blank: true, notBlank: false });
    for (let d = 1; d <= dim; d++) {
      const dateStr = isoDate(y, m, d);
      const isStart = dateStr === rangeStart, isEnd = dateStr === rangeEnd;
      const inRange = !!rangeStart && !!rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;
      const isToday = dateStr === todayIso;
      const isPast = dateStr < todayIso;
      cells.push({ blank: false, notBlank: true, day: d, style: cellStyle(isStart, isEnd, inRange, isToday, isPast), onClick: isPast ? () => {} : () => h.pickDay(dateStr) });
    }
    return { label: `${y}년 ${m + 1}월`, cells };
  };
  let calM2 = calM + 1, calY2 = calY; if (calM2 > 11) { calM2 = 0; calY2++; }
  const calMonths = [buildMonth(calY, calM), buildMonth(calY2, calM2)];
  const periodLabel = rangeStart && rangeEnd ? `${fmtDay(rangeStart)} – ${fmtDay(rangeEnd)}` : rangeStart ? `${fmtDay(rangeStart)} – 종료일 선택` : "기간 선택";

  const selectedSlotKeys = Object.keys(selectedSlots);
  let earliestSlotDate = null, earliestSlotHour = null;
  selectedSlotKeys.forEach((k) => {
    const idx = k.lastIndexOf("-");
    const iso = k.slice(0, idx);
    const hh = parseInt(k.slice(idx + 1), 10);
    if (earliestSlotDate === null || iso < earliestSlotDate || (iso === earliestSlotDate && hh < earliestSlotHour)) {
      earliestSlotDate = iso; earliestSlotHour = hh;
    }
  });

  const buildDeadlineMonth = (y, m) => {
    const first = new Date(y, m, 1);
    const leading = (first.getDay() + 6) % 7;
    const dim = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < leading; i++) cells.push({ blank: true, notBlank: false });
    for (let d = 1; d <= dim; d++) {
      const dateStr = isoDate(y, m, d);
      const isPastD = dateStr < todayIso || (earliestSlotDate && dateStr > earliestSlotDate);
      cells.push({ blank: false, notBlank: true, day: d, style: singleCellStyle(dateStr === deadlineDate, dateStr === todayIso, isPastD), onClick: isPastD ? () => {} : () => h.pickDeadlineDay(dateStr) });
    }
    return { label: `${y}년 ${m + 1}월`, cells };
  };
  const deadlineMonths = [buildDeadlineMonth(deadlineY, deadlineM)];
  const deadlineLabel = deadlineDate ? `${fmtDay(deadlineDate)} ${deadlineTime}` : "마감 시간 선택";
  const [deadlineHour, deadlineMinute] = deadlineTime.split(":");
  const isDeadlineToday = deadlineDate === todayIso;
  const curNowHM = `${pad2(todayD.getHours())}:${pad2(todayD.getMinutes())}`;
  const isDeadlineEarliestDay = earliestSlotDate && deadlineDate === earliestSlotDate;
  const earliestHM = earliestSlotHour != null ? `${pad2(earliestSlotHour)}:00` : null;
  const DEADLINE_TIME_PRESETS = [["오전 9시", "09:00"], ["정오", "12:00"], ["오후 6시", "18:00"], ["오후 9시", "21:00"]];
  const deadlineTimePresets = DEADLINE_TIME_PRESETS.map(([label, val]) => {
    const isPastTime = (isDeadlineToday && val < curNowHM) || (isDeadlineEarliestDay && val >= earliestHM);
    return {
      label,
      style: isPastTime ? "font-size:14px;font-weight:600;color:#C4C9D1;background:#F2F4F6;border:none;border-radius:8px;padding:8px 12px;cursor:not-allowed" : quickLenStyle(deadlineTime === val),
      onClick: isPastTime ? () => {} : () => h.setDeadlineTime(val),
    };
  });

  const includeWeekday = scopeMode === "out" ? scopeOutSub.weekday : true;
  const includeWeekend = scopeMode === "out" && scopeOutSub.weekend;
  const days = buildDaysInRange(rangeStart, rangeEnd, includeWeekday, includeWeekend);
  const HOURS = scopeMode === "out" ? HOURS_OUT : HOURS_IN;

  const all = [];
  days.forEach((d, dayIdx) => { HOURS.forEach((hh) => { all.push(scoreAny(activePeople, d, hh, roles, votes, scopeMode, dayIdx * 1000 + hh)); }); });
  const availableAll = all.filter((s) => !confirmedKeys.has(`${s.day.iso}-${s.h}`));
  const hard = availableAll.filter((s) => s.miss === 0);
  let solvedMode, solvedList;
  if (hard.length) {
    hard.sort((a, b) => a.dis - b.dis || b.like - a.like || b.optIn - a.optIn || a.order - b.order);
    solvedMode = "normal"; solvedList = hard;
  } else if (allowMissing) {
    availableAll.sort((a, b) => a.miss - b.miss || a.dis - b.dis || b.like - a.like || b.optIn - a.optIn || a.order - b.order);
    solvedMode = "missing"; solvedList = availableAll;
  } else {
    solvedMode = "empty"; solvedList = [];
  }
  const top = rankExpanded ? solvedList : solvedList.slice(0, 4);
  const hasMoreRanks = solvedList.length > 4;
  const remainingRanksCount = Math.max(0, solvedList.length - 4);
  const reqCount = Object.entries(roles).filter(([pid, r]) => r === "required" && !excludedPeople[pid]).length;
  const optCount = Object.entries(roles).filter(([pid, r]) => r === "optional" && !excludedPeople[pid]).length;

  const fmt = (s) => {
    const endTotalMin = s.h * 60 + durationMin;
    const endH = Math.floor(endTotalMin / 60) % 24, endM = endTotalMin % 60;
    return { day: `${s.day.l} ${s.day.month}/${s.day.date}`, time: `${pad2(s.h)}:00–${pad2(endH)}:${pad2(endM)}` };
  };
  const rankOf = (dayIso, hh) => {
    if (solvedMode === "empty") return null;
    const i = solvedList.findIndex((s) => s.day.iso === dayIso && s.h === hh);
    return i >= 0 && i < 3 ? i + 1 : null;
  };

  const navWrapStyle = navContainerStyle(NAV_TAB_STYLE);
  const mainTabs = [["setup", "1 · 조건 설정"], ["decide", "2 · 시간 찾기"]].map(([k, l]) => ({
    label: l, style: navTabStyleVariant(tab === k, NAV_TAB_STYLE), onClick: () => h.setTab(k),
  }));
  const isScheduleTab = tab === "schedule";
  const scheduleNavStyle = isScheduleTab
    ? "display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;padding:9px 13px;border-radius:11px;cursor:pointer;border:1px solid #3182F7;background:#EBF2FE;color:#3182F7;white-space:nowrap;flex-shrink:0"
    : "display:flex;align-items:center;gap:6px;font-size:14px;font-weight:500;padding:9px 13px;border-radius:11px;cursor:pointer;border:1px solid #E5E8EB;background:#FFFFFF;color:#4E5968;white-space:nowrap;flex-shrink:0";
  const isSettingsTab = tab === "settings";
  const settingsTabStyle = (isSettingsTab || profileMenuOpen)
    ? "display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;padding:9px 13px;border-radius:11px;cursor:pointer;border:1px solid #3182F7;background:#EBF2FE;color:#3182F7;white-space:nowrap;flex-shrink:0"
    : "display:flex;align-items:center;gap:6px;font-size:14px;font-weight:500;padding:9px 13px;border-radius:11px;cursor:pointer;border:1px solid #E5E8EB;background:#FFFFFF;color:#4E5968;white-space:nowrap;flex-shrink:0";

  const setupPeople = PEOPLE.map((p) => ({
    id: p.id, initial: p.short[0], name: p.name, hasTag: !!p.tag, tag: p.tag || "", isMe: p.id === me,
    workLabel: summarizeWorkSchedule(workScheduleByPerson[p.id]),
    borderColor: roles[p.id] === "required" ? "#C9E0FE" : "#E5E8EB",
    avatarBg: roles[p.id] === "required" ? "#3182F7" : "#8B95A1",
    reqSegStyle: segStyle(roles[p.id] === "required"),
    optSegStyle: segStyle(roles[p.id] === "optional"),
    toggleRole: () => h.toggleRole(p.id),
    isExcluded: !!excludedPeople[p.id],
    cardOpacity: excludedPeople[p.id] ? ".5" : "1",
    excludeLabel: excludedPeople[p.id] ? "포함" : "제외",
    excludeStyle: excludedPeople[p.id]
      ? "font-size:12px;font-weight:700;color:#fff;background:#3182F7;border:none;border-radius:999px;padding:5px 11px;cursor:pointer"
      : "font-size:12px;font-weight:600;color:#8B95A1;background:#F2F4F6;border:none;border-radius:999px;padding:5px 11px;cursor:pointer",
    toggleExclude: () => h.toggleExclude(p.id),
  }));

  const heatDays = days.map((d) => ({ label: d.l, date: `${d.month}/${d.date}`, color: d.dow >= 5 ? "#F04452" : "#4E5968" }));
  const heatGridCols = `48px repeat(${days.length}, minmax(46px,1fr))`;
  const heatRows = HOURS.map((hh) => ({
    timeLabel: `${String(hh).padStart(2, "0")}:00`,
    cells: days.map((d) => {
      const c = scoreAny(activePeople, d, hh, roles, votes, scopeMode);
      const net = c.seats.filter((x) => x.s.kind === "like").length - c.seats.filter((x) => x.s.kind === "dislike").length;
      const rk = rankOf(d.iso, hh);
      const key = `${d.iso}-${hh}`;
      if (c.miss > 0) return { bg: "repeating-linear-gradient(45deg,#F0F1F4,#F0F1F4 5px,#E8E9EE 5px,#E8E9EE 10px)", hasRank: false, rankLabel: "", title: "필참 참석 불가", onClick: () => {}, cellStyle: "" };
      if (confirmedKeys.has(key)) return { bg: "repeating-linear-gradient(45deg,#EBF2FE,#EBF2FE 5px,#DCE9FD 5px,#DCE9FD 10px)", hasRank: false, rankLabel: "", title: "이미 확정된 회의예요", onClick: () => {}, cellStyle: "cursor:not-allowed" };
      const isSelected = !!selectedSlots[key];
      return {
        bg: cellBg(net), hasRank: !!rk, rankLabel: rk ? `${rk}순위` : "",
        title: `선호 ${c.seats.filter((x) => x.s.kind === "like").length} · 비선호 ${c.seats.filter((x) => x.s.kind === "dislike").length}`,
        onClick: () => h.toggleSlotFromHeat(key),
        cellStyle: isSelected ? "box-shadow:inset 0 0 0 2px #3182F7;cursor:pointer" : "cursor:pointer",
      };
    }),
  }));

  const rankSlots = top.map((slot, idx) => {
    const f = fmt(slot); const isFirst = idx === 0;
    const key = `${slot.day.iso}-${slot.h}`;
    const parts = reasonParts(slot, false).map((p) => ({ text: p.t, color: TONE[p.tone].color, bg: TONE[p.tone].bg }));
    const isSelected = !!selectedSlots[key];
    return {
      key, rankNum: idx + 1, isFirst,
      isSelected,
      checkStyle: isSelected
        ? "width:20px;height:20px;border-radius:6px;background:#3182F7;border:none;cursor:pointer;display:grid;place-items:center;padding:0"
        : "width:20px;height:20px;border-radius:6px;background:#fff;border:1.5px solid #E5E8EB;cursor:pointer;display:grid;place-items:center;padding:0",
      toggleSelect: () => h.toggleSlotSelect(key),
      cardStyle: isFirst
        ? "background:linear-gradient(180deg,#FFFFFF,#FBFDFF);border:2px solid #3182F7;border-radius:18px;padding:19px 22px;display:flex;flex-wrap:wrap;gap:15px;align-items:flex-start;box-shadow:0 10px 28px -12px rgba(49,130,247,.28);position:relative"
        : "background:#FFFFFF;border:1px solid #E5E8EB;border-radius:18px;padding:14px 16px;display:flex;flex-wrap:wrap;gap:15px;align-items:flex-start;position:relative",
      day: f.day, time: f.time,
      timeStyle: "font-variant-numeric:tabular-nums;font-weight:700;font-size:16px",
      reasons: parts,
      showConfirmBtn: hoveredSlotKey === key || (isSelected && Object.keys(selectedSlots).length === 1),
      confirmStop: (e) => {
        e.stopPropagation();
        const reqNames = slot.seats.filter((x) => x.role === "required").map((x) => x.p.name);
        const optNames = slot.seats.filter((x) => x.role === "optional").map((x) => x.p.name);
        h.openConfirmPreview(key, f.day, f.time, durationMin, reqNames, optNames);
      },
      onMouseEnter: () => h.setHoverSlot(key),
      onMouseLeave: h.clearHoverSlot,
    };
  });

  const meP = PEOPLE.find((x) => x.id === me);
  const mePrefs = prefsByPerson[me].map((r, i) => ({
    tag: r.k === "dislike" ? "비선호" : "선호", label: r.label,
    color: r.k === "dislike" ? "#F04452" : "#0AB259", bg: r.k === "dislike" ? "#FEECEE" : "#E3F9ED",
    remove: () => h.deleteRule(me, i),
  }));
  const selectedCount = Object.keys(selectedSlots).length;
  const gcalConnected = !!gcalByPerson[me];
  const HOURS_CAL = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const ruleCalDayHeaders = DAY_LABELS.map((lbl) => ({ label: lbl }));
  const ruleSelColor = ruleKind === "like" ? "#7FE0A8" : "#FBC4C9";
  const existingRuleMap = {};
  prefsByPerson[me].forEach((r) => {
    if (!r.days || !r.hours) return;
    r.days.forEach((dow) => { r.hours.forEach((hh) => { existingRuleMap[`${dow}-${hh}`] = r.k; }); });
  });
  const ruleCalRows = HOURS_CAL.map((hh) => ({
    timeLabel: `${String(hh).padStart(2, "0")}:00`,
    cells: DAY_LABELS.map((lbl, dow) => {
      const key = `${dow}-${hh}`;
      const selected = !!ruleCalSelected[key];
      const existingKind = existingRuleMap[key];
      let bg = "#F2F4F6";
      if (selected) bg = ruleSelColor;
      else if (existingKind === "like") bg = "#C9E9D6";
      else if (existingKind === "dislike") bg = "#FDE1E3";
      return { style: `height:24px;border-radius:6px;background:${bg};cursor:pointer`, onClick: () => h.toggleRuleCell(dow, hh) };
    }),
  }));
  const ruleSlotHoursOpts = [1, 2, 3].map((n) => ({
    label: `${n}시간`, style: quickLenStyle(ruleSlotHours === n), onClick: () => h.setRuleSlotHours(n),
  }));

  return {
    mainTabs, navWrapStyle, settingsTabStyle, setSettingsTab: h.toggleProfileMenu,
    scheduleNavStyle, goToSchedule: h.goToSchedule,
    profileMenuOpen, closeProfileMenu: h.closeProfileMenu,
    meEmail: "tosskim@example.com",
    goToSettingsFromMenu: h.goToSettingsFromMenu,
    goToMeetingCreate: h.goToMeetingCreate,
    meetingCreateItemStyle: tab === "setup"
      ? "display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:#EBF2FE;border:none;border-radius:8px;padding:9px 10px;font-size:14px;font-weight:600;color:#3182F7;cursor:pointer"
      : "display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:none;border:none;border-radius:8px;padding:9px 10px;font-size:14px;font-weight:500;color:#191F28;cursor:pointer",
    settingsItemStyle: tab === "settings"
      ? "display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:#EBF2FE;border:none;border-radius:8px;padding:9px 10px;font-size:14px;font-weight:600;color:#3182F7;cursor:pointer"
      : "display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:none;border:none;border-radius:8px;padding:9px 10px;font-size:14px;font-weight:500;color:#191F28;cursor:pointer",
    clickLogout: h.clickLogout,
    isSetup: tab === "setup", isDecide: tab === "decide", isSettings: tab === "settings", isSchedule: tab === "schedule",
    confirmedMeetingCards: confirmedMeetings.map((cm) => ({
      id: cm.id,
      title: cm.title, dayLabel: cm.dayLabel, time: cm.time,
      durationLabel: durationLabel(cm.durationMin),
      reqNamesText: cm.reqNames.join(" · "),
      hasOptNames: cm.optNames.length > 0,
      optNamesText: cm.optNames.join(" · "),
      hasLocation: !!cm.location, location: cm.location,
      hasMessage: !!cm.message, message: cm.message,
      openCancel: () => h.openCancelConfirm(cm.id),
    })),
    activeVoteCards: activeVotes.map((av) => {
      const myVotes = myVotesByVoteId[av.id] || { voted: {}, selected: {} };
      const hasMyVotes = Object.values(myVotes.voted).some(Boolean);
      const hasSelected = Object.values(myVotes.selected).some(Boolean);
      return {
        id: av.id,
        title: av.title, hasLocation: !!av.location, location: av.location,
        deadlineLabel: av.deadlineLabel,
        anonLabel: av.anon ? "익명" : "실명",
        respondedCount: hasMyVotes ? 1 : 0, totalCount: av.totalCount,
        showRespondentNames: !av.anon && hasMyVotes,
        respondentNamesText: meP.name,
        hasMessage: !!av.message, message: av.message,
        openCancel: () => h.openVoteCancelConfirm(av.id),
        voteActionLabel: hasMyVotes ? "다시 투표하기" : "투표하기",
        voteActionHandler: hasMyVotes
          ? () => h.resetMyVotes(av.id)
          : (hasSelected ? () => h.submitCandidateVotes(av.id) : h.showSelectCandidateHint),
        voteActionStyle: hasMyVotes
          ? "font-weight:600;font-size:14px;background:#fff;color:#4E5968;border:1px solid #E5E8EB;border-radius:999px;padding:8px 15px;cursor:pointer"
          : (hasSelected
            ? "font-weight:700;font-size:14px;background:#3182F7;color:#fff;border:none;border-radius:999px;padding:9px 16px;cursor:pointer"
            : "font-weight:700;font-size:14px;background:#DCE3EA;color:#8B95A1;border:none;border-radius:999px;padding:9px 16px;cursor:pointer"),
        voteActionTitle: (!hasMyVotes && !hasSelected) ? "회의 일자를 최소 한 개 선택해주세요" : "",
        candidates: av.candidates.map((c, idx) => {
          const voted = !!myVotes.voted[idx];
          const selected = !!myVotes.selected[idx];
          const locked = hasMyVotes;
          return {
            ...c, idx, voted, selected,
            onClick: locked ? () => {} : () => h.toggleSelectCandidate(av.id, idx),
            rowStyle: voted
              ? "display:flex;align-items:center;justify-content:space-between;gap:10px;background:#E3F9ED;border:1px solid #0AB259;border-radius:10px;padding:6px 12px;height:48px;box-sizing:border-box;cursor:default"
              : selected
                ? "display:flex;align-items:center;justify-content:space-between;gap:10px;background:#EBF2FE;border:1.5px solid #3182F7;border-radius:10px;padding:5.5px 11.5px;height:48px;box-sizing:border-box;cursor:pointer"
                : `display:flex;align-items:center;justify-content:space-between;gap:10px;background:#F7F8FA;border:1px solid transparent;border-radius:10px;padding:6px 12px;height:48px;box-sizing:border-box;cursor:${locked ? "default" : "pointer"};opacity:${locked ? ".5" : "1"}`,
          };
        }),
      };
    }),
    voteCancelConfirmOpen: !!voteCancelConfirmId, closeVoteCancelConfirm: h.closeVoteCancelConfirm, confirmCancelVote: h.confirmCancelVote,
    dismissVoteCancelConfirm: h.dismissVoteCancelConfirm,
    scheduleEmpty: confirmedMeetings.length === 0 && activeVotes.length === 0,
    goToDecideFromSchedule: () => h.setTab("setup"),
    confirmPreviewOpen,
    confirmPreview: confirmPreviewData ? {
      dayLabel: confirmPreviewData.dayLabel, time: confirmPreviewData.time,
      durationLabel: durationLabel(confirmPreviewData.durationMin),
      reqNamesText: confirmPreviewData.reqNames.join(" · "),
      hasOptNames: confirmPreviewData.optNames.length > 0,
      optNamesText: confirmPreviewData.optNames.join(" · "),
    } : {},
    confirmMeetingTitle, confirmMeetingLocation, confirmMeetingMessage,
    onConfirmTitleInput: h.onConfirmTitleInput, onConfirmLocationInput: h.onConfirmLocationInput,
    onConfirmMessageInput: h.onConfirmMessageInput,
    closeConfirmPreview: h.closeConfirmPreview, doConfirmFromPreview: h.doConfirmFromPreview,
    setupPeople, goToDecide: () => h.setTab("decide"),
    reqCount, optCount,
    heatTitle: "캘린더",
    heatDateRangeNote: (() => {
      if (!rangeStart || !rangeEnd) return "";
      const [, sm, sd] = rangeStart.split("-").map(Number);
      const [, em, ed] = rangeEnd.split("-").map(Number);
      return `(${sm}월 ${sd}일 ~ ${em}월 ${ed}일 ${days.length}일간)`;
    })(),
    heatSubtitle: "누가 선호했는지는 감추고, 얼마나인지만 색으로 보여줘요.",
    heatDays, heatGridCols, heatRows,
    isEmptyMode: solvedMode === "empty", isMissingMode: solvedMode === "missing", isNormalMode: solvedMode === "normal",
    hasResults: solvedMode !== "empty",
    escExpandStyle: "text-align:left;background:#F7F8FA;border:1px solid #E5E8EB;border-radius:12px;padding:14px;cursor:pointer;display:flex;flex-direction:column;gap:5px",
    escExpandNote: `현재 ${periodLabel}에서 7일 더 넓혀서 다시 찾기`,
    weeksIsTwo: false, setWeeks2: h.extendPeriod,
    demotePeople: PEOPLE.filter((p) => roles[p.id] === "required" && !excludedPeople[p.id]).map((p) => ({ short: p.short, demote: () => h.toggleRole(p.id) })),
    setAllowMissing: h.setAllowMissingTrue, backFromMissing: h.setAllowMissingFalse,
    rankSubtitle: solvedMode === "missing" ? "결원을 가장 먼저 줄이고" : "비선호를 가장 먼저 피하고, 동률은 만들지 않아요",
    rankSlots,
    meInitial: meP.short[0], meName: meP.name, meWorkLabel: summarizeWorkSchedule(workScheduleByPerson[me]),
    workOpen, workAdvancedOpen, toggleWorkAdvanced: h.toggleWorkAdvanced,
    workAdvancedLabel: workAdvancedOpen ? "간단히 보기" : "상세 설정 (요일별)",
    openWork: h.openWork, closeWork: h.closeWork, confirmWork: h.confirmWork,
    workStartH: (workScheduleByPerson[me].find((d) => !d.off) || workScheduleByPerson[me][0]).s,
    workStartM: (workScheduleByPerson[me].find((d) => !d.off) || workScheduleByPerson[me][0]).sm,
    workEndH: (workScheduleByPerson[me].find((d) => !d.off) || workScheduleByPerson[me][0]).e,
    workEndM: (workScheduleByPerson[me].find((d) => !d.off) || workScheduleByPerson[me][0]).em,
    onWorkStartHInput: h.onWorkStartHInput, onWorkStartMInput: h.onWorkStartMInput,
    onWorkEndHInput: h.onWorkEndHInput, onWorkEndMInput: h.onWorkEndMInput,
    workPresets: [[9, 18], [10, 19], [9, 17], [8, 17]].map(([s, e]) => {
      const on = workScheduleByPerson[me].filter((d) => !d.off);
      const active = on.length > 0 && on.every((d) => d.s === s && d.sm === 0 && d.e === e && d.em === 0);
      return { label: `${s}–${e}시`, style: quickLenStyle(active), onClick: () => h.setWorkHours(s, e) };
    }),
    workDayRows: DAY_LABELS.map((lbl, dow) => {
      const d = workScheduleByPerson[me][dow];
      return {
        dow, label: lbl, off: d.off, notOff: !d.off,
        toggleOffStyle: d.off
          ? "font-size:12.5px;font-weight:700;color:#fff;background:#8B95A1;border:none;border-radius:7px;padding:6px 10px;cursor:pointer;flex:none"
          : "font-size:12.5px;font-weight:600;color:#3182F7;background:#EBF2FE;border:none;border-radius:7px;padding:6px 10px;cursor:pointer;flex:none",
        toggleOffLabel: d.off ? "휴무" : "근무",
        toggleOff: () => h.toggleDayOff(dow),
        s: d.s, sm: d.sm, e: d.e, em: d.em,
        onStartH: (e) => h.onDayStartH(dow, e), onStartM: (e) => h.onDayStartM(dow, e),
        onEndH: (e) => h.onDayEndH(dow, e), onEndM: (e) => h.onDayEndM(dow, e),
      };
    }),
    mePrefs, meHasNoPrefs: mePrefs.length === 0,
    gcalConnected,
    gcalStatusStyle: gcalConnected ? "font-size:11px;font-weight:700;color:#0AB259;background:#E3F9ED;border-radius:6px;padding:4px 9px" : "font-size:11px;font-weight:700;color:#8B95A1;background:#F2F4F6;border-radius:6px;padding:4px 9px",
    gcalStatusText: gcalConnected ? "연동됨" : "연동 안 됨",
    gcalBtnStyle: gcalConnected ? "font-size:14px;font-weight:600;color:#4E5968;background:none;border:1px solid #E5E8EB;border-radius:9px;padding:7px 12px;cursor:pointer" : "font-size:14px;font-weight:700;color:#fff;background:#3182F7;border:none;border-radius:9px;padding:7px 12px;cursor:pointer",
    gcalBtnText: gcalConnected ? "연동 해제" : "지금 연동하기",
    toggleGcal: gcalConnected ? h.openGcalDisconnect : h.toggleGcal,
    gcalDisconnectOpen, closeGcalDisconnect: h.closeGcalDisconnect, confirmGcalDisconnect: h.confirmGcalDisconnect,
    ruleAdding, addRuleBtnText: ruleAdding ? "닫기" : "+ 규칙 추가",
    openRuleForm: ruleAdding ? h.closeRuleForm : h.openRuleForm,
    ruleKindDislikeStyle: chipSegStyle(ruleKind === "dislike"), ruleKindLikeStyle: chipSegStyle(ruleKind === "like"),
    setRuleKindDislike: h.setRuleKindDislike, setRuleKindLike: h.setRuleKindLike,
    ruleSlotHoursOpts, ruleCalDayHeaders, ruleCalRows,
    addRule: h.addRule, closeRuleForm: h.closeRuleForm,
    periodOpen, periodLabel, calMonths,
    openPeriod: h.openPeriod, closePeriod: h.closePeriod, confirmPeriod: h.confirmPeriod,
    navPrev: h.navPrev, navNext: h.navNext,
    quickThisWeek: h.quickThisWeek, quickNextWeek: h.quickNextWeek, quickThisMonth: h.quickThisMonth,
    lengthOpen, durationLabelText: durationLabel(durationMin), durationMin, lengthQuickOpts,
    openLength: h.openLength, closeLength: h.closeLength, confirmLength: h.confirmLength,
    onDurationInput: h.onDurationInput, onDurationBlur: h.onDurationBlur,
    scopeOpen, scopeLabel, isScopeOut: scopeMode === "out",
    scopeInStyle: scopeOptStyle(scopeMode === "in"), scopeOutStyle: scopeOptStyle(scopeMode === "out"),
    scopeWeekdayStyle: scopeSubStyle(scopeOutSub.weekday), scopeWeekendStyle: scopeSubStyle(scopeOutSub.weekend),
    openScope: h.openScope, closeScope: h.closeScope, confirmScope: h.confirmScope,
    setScopeIn: h.setScopeIn, setScopeOut: h.setScopeOut,
    toggleScopeOutWeekday: h.toggleScopeOutWeekday, toggleScopeOutWeekend: h.toggleScopeOutWeekend,
    selectedCount, hasSelection: selectedCount > 0,
    selectionBarText: `${selectedCount}개 후보 선택됨`,
    voteGenBtnStyle: selectedCount >= 2
      ? "margin-left:auto;font-weight:700;font-size:14px;background:#3182F7;color:#fff;border:none;border-radius:999px;padding:9px 16px;cursor:pointer"
      : "margin-left:auto;font-weight:700;font-size:14px;background:#DCE3EA;color:#8B95A1;border:none;border-radius:999px;padding:9px 16px;cursor:pointer",
    voteGenBtnTitle: selectedCount >= 2 ? "" : "후보를 최소 2개 이상 선택해야 투표를 생성할 수 있어요",
    openVoteModal: h.openVoteModal, closeVoteModal: h.closeVoteModal,
    voteModalOpen, voteMessage,
    voteAnonStyle: chipSegStyle(voteAnon), voteNamedStyle: chipSegStyle(!voteAnon),
    setVoteAnon: h.setVoteAnon, setVoteNamed: h.setVoteNamed,
    onVoteMessageInput: h.onVoteMessageInput,
    voteMeetingTitle: state.voteMeetingTitle, voteMeetingLocation: state.voteMeetingLocation,
    onVoteTitleInput: h.onVoteTitleInput, onVoteLocationInput: h.onVoteLocationInput,
    sendVote: () => {
      const candidates = solvedList.filter((s) => selectedSlots[`${s.day.iso}-${s.h}`]).map((s) => { const f = fmt(s); return { day: f.day, time: f.time }; });
      if (earliestSlotDate !== null && (deadlineDate > earliestSlotDate || (deadlineDate === earliestSlotDate && deadlineTime >= `${pad2(earliestSlotHour)}:00`))) {
        h.showToast("마감 시간은 선택한 후보 시간보다 전이어야 해요", 2500);
        return;
      }
      const title = state.voteMeetingTitle.trim() || "팀 회의";
      const location = state.voteMeetingLocation.trim();
      h.sendVote(candidates, deadlineLabel, voteAnon, voteMessage, title, location);
    },
    toastVisible, toastMessage,
    stopPropagation: (e) => e.stopPropagation(),
    deadlineOpen, deadlineLabel, deadlineMonths, deadlineTime, deadlineHour, deadlineMinute, deadlineTimePresets,
    openDeadline: h.openDeadline, closeDeadline: h.closeDeadline, confirmDeadline: h.confirmDeadline,
    navDeadlinePrev: h.navDeadlinePrev, navDeadlineNext: h.navDeadlineNext,
    onDeadlineHourInput: h.onDeadlineHourInput, onDeadlineMinuteInput: h.onDeadlineMinuteInput,
    quickDeadlineToday: h.quickDeadlineToday, quickDeadlineTomorrow: h.quickDeadlineTomorrow, quickDeadlineFriday: h.quickDeadlineFriday,
    hasMoreRanks, remainingRanksCount, rankExpanded,
    rankMoreLabel: rankExpanded ? "접기" : `더보기 (${remainingRanksCount}개 더 있음)`,
    toggleRankExpanded: h.toggleRankExpanded,
    cancelConfirmOpen: !!cancelConfirmId, cancelNotifyEmail,
    closeCancelConfirm: h.closeCancelConfirm,
    toggleCancelNotifyEmail: h.toggleCancelNotifyEmail, cancelConfirmedSlot: h.cancelConfirmedSlot,
    cancelCheckStyle: cancelNotifyEmail
      ? "width:18px;height:18px;border-radius:5px;background:#3182F7;border:1.5px solid #3182F7;cursor:pointer;display:grid;place-items:center;padding:0;flex:none;box-sizing:border-box"
      : "width:18px;height:18px;border-radius:5px;background:#fff;border:1.5px solid #E5E8EB;cursor:pointer;display:grid;place-items:center;padding:0;flex:none;box-sizing:border-box",
  };
}
