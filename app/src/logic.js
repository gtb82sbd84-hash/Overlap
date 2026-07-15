import { DAY_LABELS } from "./data.js";

// ---------- availability / scoring ----------

export function inWorkDay(workDay, h) {
  if (!workDay || workDay.off) return false;
  const startMin = workDay.s * 60 + workDay.sm;
  const endMin = workDay.e * 60 + workDay.em;
  return h * 60 >= startMin && h * 60 < endMin;
}

export function available(p, dow, h, scopeMode) {
  const workDay = p.workSchedule[dow];
  const inHours = scopeMode === "out" ? true : inWorkDay(workDay, h);
  const busy = p.busy.some((b) => b.d === dow && h >= b.f && h < b.t);
  return inHours && !busy;
}

export const standing = (p, dow, h) => {
  for (const r of p.prefs) if (r.days.includes(dow) && r.hours.includes(h)) return r.k;
  return "neutral";
};

export function seatState(p, dow, h, scopeMode, vote) {
  if (!available(p, dow, h, scopeMode)) return { kind: "unavail" };
  if (vote === "no") return { kind: "no" };
  if (vote === "love") return { kind: "like", voted: true };
  if (vote === "ok") return { kind: "neutral", voted: true };
  return { kind: standing(p, dow, h) };
}

export function scoreAny(peopleList, day, h, roles, votes, scopeMode, orderIdx) {
  const seats = peopleList.map((p) => ({
    p, role: roles[p.id], s: seatState(p, day.dow, h, scopeMode, votes[`${p.id}-${day.iso}-${h}`]),
  }));
  const req = seats.filter((x) => x.role === "required");
  const opt = seats.filter((x) => x.role === "optional");
  const missing = req.filter((x) => x.s.kind === "unavail" || x.s.kind === "no");
  return {
    day, h, seats,
    miss: missing.length,
    missNames: missing.map((x) => x.p.short),
    dis: req.filter((x) => x.s.kind === "dislike").length,
    like: req.filter((x) => x.s.kind === "like").length,
    optIn: opt.filter((x) => x.s.kind !== "unavail" && x.s.kind !== "no").length,
    order: orderIdx,
  };
}

export function buildDaysInRange(startIso, endIso, includeWeekday, includeWeekend) {
  const out = [];
  if (!startIso || !endIso) return out;
  let cur = new Date(startIso + "T00:00:00");
  const end = new Date(endIso + "T00:00:00");
  let guard = 0;
  while (cur <= end && guard < 60) {
    const jsDow = cur.getDay();
    const dow = (jsDow + 6) % 7;
    const isWeekend = dow >= 5;
    if (isWeekend ? includeWeekend : includeWeekday) {
      out.push({
        iso: isoDate(cur.getFullYear(), cur.getMonth(), cur.getDate()),
        dow, l: DAY_LABELS[dow], date: String(cur.getDate()), month: cur.getMonth() + 1,
      });
    }
    cur = addDays(cur, 1);
    guard++;
  }
  return out;
}

export function reasonParts(slot, named) {
  const req = slot.seats.filter((x) => x.role === "required");
  const opt = slot.seats.filter((x) => x.role === "optional");
  const dis = req.filter((x) => x.s.kind === "dislike");
  const lik = req.filter((x) => x.s.kind === "like");
  const optOut = opt.filter((x) => x.s.kind === "unavail" || x.s.kind === "no");
  const parts = [];
  if (slot.miss > 0) parts.push({ t: named ? `${slot.missNames.join("·")} 불가` : `필참 ${slot.miss}명 불가`, tone: "bad" });
  else parts.push({ t: `필참 ${req.length}명 전원 가능`, tone: "ok" });
  if (dis.length) parts.push({ t: named ? `${dis.map((x)=>x.p.short).join("·")} 비선호` : `필참 ${dis.length}명 비선호`, tone: "bad" });
  else if (slot.miss === 0) parts.push({ t: "비선호 없음", tone: "ok" });
  if (lik.length) parts.push({ t: named ? `${lik.map((x)=>x.p.short).join("·")} 선호` : `필참 ${lik.length}명 선호`, tone: "good" });
  if (optOut.length) parts.push({ t: named ? `${optOut.map((x)=>x.p.short).join("·")} 불가` : `선택 ${optOut.length}명 불가`, tone: "mut" });
  else parts.push({ t: `선택 ${opt.length}명 참석`, tone: "mut" });
  return parts;
}

export const CYCLE = { undefined: "love", love: "ok", ok: "no", no: undefined };
export const VOTE_TXT = { love: "좋아요", ok: "되긴해요", no: "안돼요" };
export const TONE = {
  ok: { color: "#0AB259", bg: "#E3F9ED" }, good: { color: "#0AB259", bg: "#E3F9ED" },
  bad: { color: "#F04452", bg: "#FEECEE" }, mut: { color: "#4E5968", bg: "#F2F4F6" },
};

export function cellBg(net) {
  if (net >= 2) return "#7FE0A8";
  if (net === 1) return "#C9E9D6";
  if (net === 0) return "#F2F4F6";
  if (net === -1) return "#FDE1E3";
  return "#FBC4C9";
}

// ---------- style-string generators (kept as CSS strings, applied via css()) ----------

export function tabBtnStyle(active) {
  return active
    ? "font-size:14px;font-weight:500;padding:7px 12px;border-radius:8px;cursor:pointer;border:none;background:#191F28;color:#fff;white-space:nowrap;flex-shrink:0"
    : "font-size:14px;font-weight:500;padding:7px 12px;border-radius:8px;cursor:pointer;border:none;background:none;color:#4E5968;white-space:nowrap;flex-shrink:0";
}
export function navContainerStyle(variant) {
  if (variant === "underline") return "display:flex;gap:22px;align-items:flex-end;background:none;border:none;padding:0";
  if (variant === "outline") return "display:flex;gap:8px;background:none;border:none;padding:0";
  return "display:flex;gap:5px;background:#FFFFFF;border:1px solid #E5E8EB;border-radius:11px;padding:4px";
}
export function navTabStyleVariant(active, variant) {
  if (variant === "underline") {
    return active
      ? "font-size:14px;font-weight:700;padding:6px 0 10px;cursor:pointer;border:none;background:none;color:#191F28;border-bottom:2px solid #3182F7;white-space:nowrap;flex-shrink:0"
      : "font-size:14px;font-weight:500;padding:6px 0 10px;cursor:pointer;border:none;background:none;color:#8B95A1;border-bottom:2px solid transparent;white-space:nowrap;flex-shrink:0";
  }
  if (variant === "outline") {
    return active
      ? "font-size:14px;font-weight:700;padding:8px 14px;border-radius:999px;cursor:pointer;border:1.5px solid #3182F7;background:#EBF2FE;color:#3182F7;white-space:nowrap;flex-shrink:0"
      : "font-size:14px;font-weight:500;padding:8px 14px;border-radius:999px;cursor:pointer;border:1.5px solid #E5E8EB;background:#FFFFFF;color:#4E5968;white-space:nowrap;flex-shrink:0";
  }
  return tabBtnStyle(active);
}
export function segStyle(active) {
  return active
    ? "flex:1;text-align:center;font-size:12px;font-weight:700;padding:9px 0;border-radius:11px;background:#fff;color:#191F28;box-shadow:0 1px 3px rgba(0,0,0,.08)"
    : "flex:1;text-align:center;font-size:12px;font-weight:600;padding:9px 0;border-radius:11px;color:#8B95A1;background:none";
}
export function seatStyle(kind, role) {
  const borderW = role === "required" ? "1.5px" : "1px";
  if (kind === "like") return `display:flex;align-items:center;border:${borderW} solid #0AB259;background:#E3F9ED;border-radius:12px;padding:0;cursor:pointer;overflow:hidden;color:#0AB259`;
  if (kind === "dislike") return `display:flex;align-items:center;border:${borderW} solid #F04452;background:#FEECEE;border-radius:12px;padding:0;cursor:pointer;overflow:hidden;color:#F04452`;
  if (kind === "unavail" || kind === "no") return `display:flex;align-items:center;border:${borderW} solid #E5E8EB;background:#FFFFFF;border-radius:12px;padding:0;cursor:pointer;overflow:hidden;color:#8B95A1;text-decoration:line-through`;
  return `display:flex;align-items:center;border:${borderW} solid #E5E8EB;background:#FFFFFF;border-radius:12px;padding:0;cursor:pointer;overflow:hidden;color:#4E5968`;
}
export function seatDotBg(kind) {
  if (kind === "like") return "#0AB259";
  if (kind === "dislike") return "#F04452";
  if (kind === "unavail" || kind === "no") return "#8B95A1";
  return "#8B95A1";
}

// ---------- date/format helpers ----------

export function pad2(n) { return String(n).padStart(2, "0"); }
export function isoDate(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }
export function nowHM() { const t = new Date(); return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`; }
export function todayIsoNow() { const t = new Date(); return isoDate(t.getFullYear(), t.getMonth(), t.getDate()); }
export function mondayOfWeek(date) { const d = new Date(date); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; }
export function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
export const WD_KR = ["일", "월", "화", "수", "목", "금", "토"];
export function fmtDay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = WD_KR[new Date(y, m - 1, d).getDay()];
  return `${wd} ${m}/${d}`;
}
export function durationLabel(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
export function quickLenStyle(active) {
  return active
    ? "font-size:14px;font-weight:700;color:#fff;background:#3182F7;border:none;border-radius:8px;padding:8px 12px;cursor:pointer"
    : "font-size:14px;font-weight:600;color:#3182F7;background:#EBF2FE;border:none;border-radius:8px;padding:8px 12px;cursor:pointer";
}
export function scopeOptStyle(active) {
  return active
    ? "text-align:left;display:flex;flex-direction:column;gap:2px;background:#EBF2FE;border:1.5px solid #3182F7;border-radius:12px;padding:12px 14px;cursor:pointer;width:100%"
    : "text-align:left;display:flex;flex-direction:column;gap:2px;background:#FFFFFF;border:1px solid #E5E8EB;border-radius:12px;padding:12px 14px;cursor:pointer;width:100%";
}
export function scopeSubStyle(active) {
  return active
    ? "font-size:14px;font-weight:700;color:#fff;background:#3182F7;border:none;border-radius:8px;padding:7px 11px;cursor:pointer"
    : "font-size:14px;font-weight:600;color:#3182F7;background:#EBF2FE;border:none;border-radius:8px;padding:7px 11px;cursor:pointer";
}
export function chipSegStyle(active) {
  return active
    ? "padding:6px 11px;border-radius:7px;font-size:14px;font-weight:700;color:#191F28;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06);border:none;cursor:pointer"
    : "padding:6px 11px;border-radius:7px;font-size:14px;font-weight:600;color:#8B95A1;background:none;border:none;cursor:pointer";
}
export function summarizeWorkSchedule(days) {
  const onDays = days.map((d, i) => ({ ...d, i })).filter((d) => !d.off);
  if (!onDays.length) return "휴무";
  const first = onDays[0];
  const uniform = onDays.every((d) => d.s === first.s && d.sm === first.sm && d.e === first.e && d.em === first.em);
  const offDays = days.map((d, i) => ({ ...d, i })).filter((d) => d.off).map((d) => DAY_LABELS[d.i]);
  const hm = (h, m) => `${h}:${pad2(m)}`;
  if (!uniform) return "요일별로 달라요";
  let label = `${hm(first.s, first.sm)} – ${hm(first.e, first.em)}`;
  if (offDays.length) label += ` · ${offDays.join("·")} 휴무`;
  return label;
}
export function cellStyle(isStart, isEnd, inRange, isToday, isPast) {
  const base = "height:34px;display:flex;align-items:center;justify-content:center;font-size:12.5px;";
  if (isPast) return base + "cursor:not-allowed;color:#C4C9D1;background:none";
  const c = base + "cursor:pointer;";
  if (isStart || isEnd) return c + "background:#3182F7;color:#fff;font-weight:700;border-radius:9px";
  if (inRange) return c + "background:#EBF2FE;color:#191F28;font-weight:500;border-radius:6px";
  if (isToday) return c + "color:#3182F7;font-weight:700;border:1px solid #3182F7;border-radius:9px";
  return c + "color:#191F28;font-weight:500;border-radius:9px";
}
export function singleCellStyle(isSelected, isToday, isPast) {
  const base = "height:34px;display:flex;align-items:center;justify-content:center;font-size:12.5px;";
  if (isPast) return base + "cursor:not-allowed;color:#C4C9D1;background:none";
  const c = base + "cursor:pointer;";
  if (isSelected) return c + "background:#3182F7;color:#fff;font-weight:700;border-radius:9px";
  if (isToday) return c + "color:#3182F7;font-weight:700;border:1px solid #3182F7;border-radius:9px";
  return c + "color:#191F28;font-weight:500;border-radius:9px";
}
