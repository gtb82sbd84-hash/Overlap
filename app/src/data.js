export const HOURS_IN = [9, 10, 11, 12, 13, 14, 15, 16, 17];
export const HOURS_OUT = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export const PEOPLE = [
  { id: "seojun", name: "김서준", short: "서준", role: "required", tag: "팀장", work: { s: 10, e: 19 },
    busy: [{ d: 0, f: 10, t: 12 }, { d: 3, f: 15, t: 17 }],
    prefs: [{ k: "dislike", label: "월–금 · 출근 후 1시간까지", days: [0,1,2,3,4], hours: [10] }] },
  { id: "jimin", name: "김토스", short: "토스", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 1, f: 14, t: 16 }, { d: 3, f: 10, t: 11 }],
    prefs: [] },
  { id: "dohyun", name: "박도현", short: "도현", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 0, f: 14, t: 16 }, { d: 2, f: 10, t: 12 }],
    prefs: [{ k: "dislike", label: "금요일 · 종일", days: [4], hours: [9,10,11,12,13,14,15,16,17] },
            { k: "like", label: "화·수 · 점심 후 2시간까지", days: [1,2], hours: [13,14] }] },
  { id: "sua", name: "강수아", short: "수아", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 1, f: 10, t: 12 }, { d: 4, f: 15, t: 17 }],
    prefs: [{ k: "like", label: "월–금 · 출근 후 2시간까지", days: [0,1,2,3,4], hours: [9,10] }] },
  { id: "yuna", name: "최유나", short: "유나", role: "required", work: { s: 10, e: 19 },
    busy: [{ d: 2, f: 14, t: 16 }, { d: 4, f: 10, t: 12 }],
    prefs: [{ k: "dislike", label: "월–금 · 출근 후 1시간까지", days: [0,1,2,3,4], hours: [10] }] },
  { id: "hajun", name: "정하준", short: "하준", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 3, f: 13, t: 15 }, { d: 0, f: 16, t: 17 }],
    prefs: [] },
];

export const GCAL_DEFAULT = { seojun: true, jimin: true, dohyun: false, sua: true, yuna: true, hajun: false };
export const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
