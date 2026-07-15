import { useState, useMemo } from "react";

/* ================================================================== *
 *  틈 v3 — 앵커 없는 6명을 위한 회의 시간 "결정" 도구
 *
 *  v3 추가
 *  · 소프트(선호/비선호)는 절대 슬롯을 막지 않는다 — 아무도 안 되면
 *    비선호 시간이라도 최선으로 올라온다. (강도 설정 없음: 모두 양보 가능)
 *  · 하드(근무시간·캘린더·'안돼요' 투표)만이 참석을 막는다.
 *  · 필참 전원 하드 가능이 없으면 → 빈 화면이 아니라 사람에게 결정을
 *    넘긴다: 기간 확장 / 필참 강등 / 결원 감수.
 * ================================================================== */

const WEEKS = [
  [{ dow: 0, l: "월", date: "13" }, { dow: 1, l: "화", date: "14" }, { dow: 2, l: "수", date: "15" }, { dow: 3, l: "목", date: "16" }, { dow: 4, l: "금", date: "17" }],
  [{ dow: 0, l: "월", date: "20" }, { dow: 1, l: "화", date: "21" }, { dow: 2, l: "수", date: "22" }, { dow: 3, l: "목", date: "23" }, { dow: 4, l: "금", date: "24" }],
];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const PEOPLE = [
  { id: "seojun", name: "김서준", short: "서준", role: "required", tag: "팀장", work: { s: 10, e: 19 },
    busy: [{ d: 0, f: 10, t: 12 }, { d: 3, f: 9, t: 18 }, { d: 4, f: 15, t: 18 }],
    prefs: [{ k: "dislike", label: "월–금 · 출근 후 1시간까지", days: [0,1,2,3,4], hours: [10] }] },
  { id: "jimin", name: "이지민", short: "지민", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 1, f: 14, t: 16 }, { d: 2, f: 9, t: 11 }, { d: 4, f: 9, t: 11 }],
    prefs: [{ k: "dislike", label: "월–금 · 점심 후 1시간까지", days: [0,1,2,3,4], hours: [13] }] },
  { id: "dohyun", name: "박도현", short: "도현", role: "required", work: { s: 9, e: 18 },
    busy: [{ d: 0, f: 14, t: 16 }, { d: 2, f: 10, t: 13 }, { d: 1, f: 9, t: 10 }],
    prefs: [{ k: "dislike", label: "금요일 · 종일", days: [4], hours: [9,10,11,12,13,14,15,16,17] },
            { k: "like", label: "화·수 · 점심 후 2시간까지", days: [1,2], hours: [13,14] }] },
  { id: "sua", name: "강수아", short: "수아", role: "required", work: { s: 9, e: 17 },
    busy: [{ d: 1, f: 10, t: 12 }, { d: 2, f: 15, t: 18 }],
    prefs: [{ k: "like", label: "월–금 · 출근 후 2시간까지", days: [0,1,2,3,4], hours: [9,10] }] },
  { id: "yuna", name: "최유나", short: "유나", role: "optional", work: { s: 10, e: 19 },
    busy: [{ d: 0, f: 12, t: 18 }, { d: 3, f: 9, t: 12 }, { d: 2, f: 12, t: 15 }],
    prefs: [{ k: "dislike", label: "월–금 · 출근 후 1시간까지", days: [0,1,2,3,4], hours: [10] }] },
  { id: "hajun", name: "정하준", short: "하준", role: "optional", work: { s: 9, e: 18 },
    busy: [{ d: 1, f: 9, t: 18 }, { d: 2, f: 15, t: 17 }, { d: 4, f: 9, t: 13 }, { d: 0, f: 16, t: 18 }],
    prefs: [] },
];

const inWork = (p, h) => h >= p.work.s && h < p.work.e;
function available(p, wk, dow, h, tight) {
  let a = inWork(p, h) && !p.busy.some((b) => b.d === dow && h >= b.f && h < b.t);
  if (tight && wk === 0) {
    if (p.id === "seojun" && h >= 9 && h < 13) a = false;   // 빡빡한 주: 오전 소진
    if (p.id === "sua" && h >= 13 && h < 18) a = false;      //           오후 소진
  }
  return a;
}
const standing = (p, dow, h) => {
  for (const r of p.prefs) if (r.days.includes(dow) && r.hours.includes(h)) return r.k;
  return "neutral";
};
function seatState(p, wk, dow, h, tight, vote) {
  if (!available(p, wk, dow, h, tight)) return { kind: "unavail" };
  if (vote === "no") return { kind: "no" };
  if (vote === "love") return { kind: "like", voted: true };
  if (vote === "ok") return { kind: "neutral", voted: true };
  return { kind: standing(p, dow, h) };
}

function scoreAny(wk, dow, h, roles, votes, tight) {
  const seats = PEOPLE.map((p) => ({
    p, role: roles[p.id], s: seatState(p, wk, dow, h, tight, votes[`${p.id}-${wk}-${dow}-${h}`]),
  }));
  const req = seats.filter((x) => x.role === "required");
  const opt = seats.filter((x) => x.role === "optional");
  const missing = req.filter((x) => x.s.kind === "unavail" || x.s.kind === "no");
  return {
    wk, dow, h, seats,
    miss: missing.length,
    missNames: missing.map((x) => x.p.short),
    dis: req.filter((x) => x.s.kind === "dislike").length,
    like: req.filter((x) => x.s.kind === "like").length,
    optIn: opt.filter((x) => x.s.kind !== "unavail" && x.s.kind !== "no").length,
    order: wk * 500 + dow * 100 + h,
  };
}

function reasonParts(slot, named) {
  const req = slot.seats.filter((x) => x.role === "required");
  const opt = slot.seats.filter((x) => x.role === "optional");
  const dis = req.filter((x) => x.s.kind === "dislike");
  const lik = req.filter((x) => x.s.kind === "like");
  const optOut = opt.filter((x) => x.s.kind === "unavail" || x.s.kind === "no");
  const parts = [];
  if (slot.miss > 0)
    parts.push({ t: named ? `${slot.missNames.join("·")} 불가` : `필참 ${slot.miss}명 불가`, tone: "bad" });
  else parts.push({ t: `필참 ${req.length}명 전원 가능`, tone: "ok" });
  if (dis.length) parts.push({ t: named ? `${dis.map((x)=>x.p.short).join("·")} 비선호` : `필참 ${dis.length}명 비선호`, tone: "bad" });
  else if (slot.miss === 0) parts.push({ t: "비선호 없음", tone: "ok" });
  if (lik.length) parts.push({ t: named ? `${lik.map((x)=>x.p.short).join("·")} 선호` : `필참 ${lik.length}명 선호`, tone: "good" });
  if (optOut.length) parts.push({ t: named ? `${optOut.map((x)=>x.p.short).join("·")} 불가` : `선택 ${optOut.length}명 불가`, tone: "mut" });
  else parts.push({ t: `선택 ${opt.length}명 참석`, tone: "mut" });
  return parts;
}

const CYCLE = { undefined: "love", love: "ok", ok: "no", no: undefined };
const VOTE_TXT = { love: "좋아요", ok: "되긴해요", no: "안돼요" };

export default function App() {
  const [tab, setTab] = useState("decide");
  const [named, setNamed] = useState(false);
  const [roles, setRoles] = useState(Object.fromEntries(PEOPLE.map((p) => [p.id, p.role])));
  const [votes, setVotes] = useState({});
  const [confirmed, setConfirmed] = useState(null);
  const [me, setMe] = useState("jimin");
  const [tight, setTight] = useState(false);
  const [weeks, setWeeks] = useState(1);
  const [allowMissing, setAllowMissing] = useState(false);

  const days = useMemo(() => {
    const out = [];
    for (let wk = 0; wk < weeks; wk++) for (const d of WEEKS[wk]) out.push({ wk, ...d });
    return out;
  }, [weeks]);

  const solved = useMemo(() => {
    const all = [];
    for (let wk = 0; wk < weeks; wk++) for (const d of WEEKS[wk]) for (const h of HOURS)
      all.push(scoreAny(wk, d.dow, h, roles, votes, tight));
    const hard = all.filter((s) => s.miss === 0);
    if (hard.length) {
      hard.sort((a, b) => a.dis - b.dis || b.like - a.like || b.optIn - a.optIn || a.order - b.order);
      return { mode: "normal", list: hard };
    }
    if (allowMissing) {
      all.sort((a, b) => a.miss - b.miss || a.dis - b.dis || b.like - a.like || b.optIn - a.optIn || a.order - b.order);
      return { mode: "missing", list: all };
    }
    return { mode: "empty", list: [] };
  }, [roles, votes, tight, weeks, allowMissing]);

  const top = solved.list.slice(0, 4);
  const reqCount = Object.values(roles).filter((r) => r === "required").length;
  const optCount = Object.values(roles).filter((r) => r === "optional").length;

  const changeTight = (v) => { setTight(v); setAllowMissing(false); setWeeks(1); setConfirmed(null); };
  const cycle = (pid, wk, dow, h) => { setVotes((v) => ({ ...v, [`${pid}-${wk}-${dow}-${h}`]: CYCLE[v[`${pid}-${wk}-${dow}-${h}`]] })); setConfirmed(null); };
  const toggleRole = (pid) => setRoles((r) => ({ ...r, [pid]: r[pid] === "required" ? "optional" : "required" }));

  const fmt = (s) => {
    const wd = WEEKS[s.wk].find((d) => d.dow === s.dow);
    return { day: `${weeks > 1 ? (s.wk + 1) + "주차 " : ""}${wd.l} 7/${wd.date}`, time: `${String(s.h).padStart(2,"0")}:00–${String(s.h+1).padStart(2,"0")}:00` };
  };
  const heatClass = (net) => net >= 2 ? "h2" : net === 1 ? "h1" : net === 0 ? "h0" : net === -1 ? "hn1" : "hn2";
  const rankKey = (s) => `${s.wk}-${s.dow}-${s.h}`;
  const rankOf = (wk, dow, h) => {
    if (solved.mode === "empty") return null;
    const i = solved.list.findIndex((s) => s.wk === wk && s.dow === dow && s.h === h);
    return i >= 0 && i < 3 ? i + 1 : null;
  };

  return (
    <div className="teum">
      <style>{css}</style>
      <header className="hd">
        <div className="brand"><span className="mark" aria-hidden>●</span>
          <div><h1>틈</h1><p className="sub">6명의 캘린더에서 모두가 괜찮은 한 시간을 찾아 <em>결정</em>합니다.</p></div></div>
        <nav className="steps">{[["setup","1 · 회의"],["decide","2 · 결정"],["settings","내 설정"]].map(([k,l]) => (
          <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>))}</nav>
      </header>

      {tab === "setup" && (
        <section className="pane">
          <div className="fixed-row">
            <div className="chip fixed"><span className="ck">기간</span> 다음 주 (월 7/13 – 금 7/17)</div>
            <div className="chip fixed"><span className="ck">길이</span> 1시간</div>
            <div className="chip fixed"><span className="ck">범위</span> 각자 근무시간 내 · 기본 ON</div>
          </div>
          <p className="lead">회의 기간은 <b>하루부터 몇 주까지</b> 범위로 잡아요(숙박일 고르듯). 참여자는 캘린더와
            <b> 한 번 등록해 둔 선호</b>를 이미 갖고 있으니, 주최자는 <b>필참/선택만</b> 정하면 됩니다.</p>
          <div className="team">{PEOPLE.map((p) => (
            <div key={p.id} className={`pcard ${roles[p.id]}`}>
              <div className="pcard-top"><div className="avatar" data-r={roles[p.id]}>{p.short[0]}</div>
                <div className="pmeta"><div className="pname">{p.name}{p.tag && <span className="pt">{p.tag}</span>}</div>
                  <div className="wh"><span className="ck">근무</span> {p.work.s}:00–{p.work.e}:00 · 유연</div></div></div>
              <button className="roletog" onClick={() => toggleRole(p.id)}>
                <span className={roles[p.id]==="required"?"seg on":"seg"}>필참</span>
                <span className={roles[p.id]==="optional"?"seg on":"seg"}>선택</span></button>
            </div>))}</div>
          <button className="cta" onClick={() => setTab("decide")}>시간 찾기 <span aria-hidden>→</span></button>
        </section>
      )}

      {tab === "decide" && (
        <section className="pane">
          <div className="ctxbar">
            <span>팀 회의 · {weeks>1?"2주 범위":"다음 주"} · 1시간 · <b>필참 {reqCount}</b> · 선택 {optCount}</span>
            <div className="ctxright">
              <div className="demo"><span>데모</span>
                <button className={!tight?"on":""} onClick={()=>changeTight(false)}>여유로운 주</button>
                <button className={tight?"on":""} onClick={()=>changeTight(true)}>빡빡한 주</button>
              </div>
              <label className="anon"><span className={!named?"on":""}>익명</span>
                <button className={`sw ${named?"r":""}`} onClick={()=>setNamed(v=>!v)}><i/></button>
                <span className={named?"on":""}>이름 공개</span></label>
            </div>
          </div>

          {/* 히트맵 */}
          <div className="heatwrap">
            <div className="heat-head"><h3>{weeks>1?"2주 선호 지형":"한 주의 선호 지형"}</h3>
              <p>{named ? "이름 공개 중 — 상세가 실명으로 보여요." : "누가 선호했는지는 감추고, 얼마나인지만 색으로 보여줘요."}</p></div>
            <div className="heat-scroll">
              <div className="heat" style={{ gridTemplateColumns: `48px repeat(${days.length}, minmax(46px,1fr))` }}>
                <div className="hcorner" />
                {days.map((d, i) => <div key={i} className={`hd-day ${d.wk===1?"w2":""}`}>{d.l}<em>7/{d.date}</em></div>)}
                {HOURS.flatMap((h) => [
                  <div className="htime" key={`t${h}`}>{String(h).padStart(2,"0")}:00</div>,
                  ...days.map((d, i) => {
                    const c = scoreAny(d.wk, d.dow, h, roles, votes, tight);
                    const net = c.seats.filter((x)=>x.s.kind==="like").length - c.seats.filter((x)=>x.s.kind==="dislike").length;
                    const rk = rankOf(d.wk, d.dow, h);
                    if (c.miss > 0) return <div key={`c${h}-${i}`} className="hcell infeasible" title="필참 참석 불가" />;
                    return <div key={`c${h}-${i}`} className={`hcell ${heatClass(net)}`} title={`선호 ${c.seats.filter(x=>x.s.kind==="like").length} · 비선호 ${c.seats.filter(x=>x.s.kind==="dislike").length}`}>
                      {rk && <span className="hrk">{rk}</span>}</div>;
                  })
                ])}
              </div>
            </div>
            <div className="legend">
              <span className="scale"><i className="s hn2"/><i className="s hn1"/><i className="s h0"/><i className="s h1"/><i className="s h2"/></span>
              <span className="sl">비선호 많음</span><span className="sr">선호 많음</span>
              <span className="lg-if"><i/>필참 불가</span>
              <span className="note">{tight ? "빡빡한 주: 필참 전원 가능한 칸이 사라졌어요" : "목요일은 필참 김서준님 종일 외근으로 전부 불가"}</span>
            </div>
          </div>

          {/* 결정 영역 */}
          {solved.mode === "empty" ? (
            <div className="escalate">
              <div className="esc-head">
                <span className="esc-ic">!</span>
                <div><h3>필참 전원이 가능한 한 시간이 없어요</h3>
                  <p>비선호 시간까지 전부 포함해도 전원이 되는 슬롯이 없어요. 여기서부터는 <b>제약을 바꾸는 결정</b>이라, 도구가 대신 정하지 않고 당신에게 맡겨요.</p></div>
              </div>
              <div className="esc-opts">
                <button className="esc-opt" onClick={() => { setWeeks(2); setAllowMissing(false); }} disabled={weeks>1}>
                  <span className="eo-t">기간 늘리기</span>
                  <span className="eo-d">{weeks>1 ? "이미 2주로 확장됨" : "다음 주(7/20–24)까지 넓혀서 다시 찾기"}</span></button>
                <div className="esc-opt col">
                  <span className="eo-t">필참 조정</span>
                  <span className="eo-d">한 명을 선택 참석으로 내리면 자리가 열릴 수 있어요</span>
                  <div className="demote">{PEOPLE.filter(p=>roles[p.id]==="required").map(p => (
                    <button key={p.id} onClick={()=>toggleRole(p.id)}>{p.short} →선택</button>))}</div>
                </div>
                <button className="esc-opt" onClick={() => setAllowMissing(true)}>
                  <span className="eo-t">결원 감수하고 최선 보기</span>
                  <span className="eo-d">필참 결원이 가장 적은 순으로 시간을 제안받기</span></button>
              </div>
            </div>
          ) : (
            <>
              {solved.mode === "missing" && (
                <div className="banner warn2"><span className="dot" />
                  <span>필참 전원 가능한 시간이 없어, <b>결원이 가장 적은 순</b>으로 보여드려요. 누가 빠지는지 각 카드에 표시돼요.</span>
                  <button className="reset" onClick={()=>setAllowMissing(false)}>돌아가기</button></div>
              )}
              {solved.mode === "normal" && (
                <div className="banner"><span className="dot pulse" />
                  <span>등록된 선호로 <b>추정 진행</b> 중 · 마감 전까지 순위는 실시간으로 다시 정해져요.
                    {Object.values(votes).some(Boolean) && " (반응 반영됨)"}</span>
                  {Object.values(votes).some(Boolean) && <button className="reset" onClick={()=>{setVotes({});setConfirmed(null);}}>초기화</button>}</div>
              )}
              <h3 className="rank-title">결정 순위 <em>· {solved.mode==="missing" ? "결원을 가장 먼저 줄이고" : "비선호를 가장 먼저 피하고"}, 동률은 만들지 않아요</em></h3>
              <div className="rank">{top.map((slot, idx) => {
                const f = fmt(slot); const isTop = idx === 0; const parts = reasonParts(slot, named);
                return (
                  <article key={rankKey(slot)} className={`slot ${isTop?"first":""}`}>
                    <div className="rk"><span className="rknum">{idx+1}</span>{isTop && <span className="rktag">추천</span>}</div>
                    <div className="slotbody">
                      <div className="when"><span className="wday">{f.day}</span><span className="wtime">{f.time}</span></div>
                      <div className="reasons">{parts.map((p,i) => <span key={i} className={`rz ${p.tone}`}>{p.t}</span>)}</div>
                      {isTop && named && (
                        <div className="seats">{slot.seats.slice().sort((a,b)=>a.role===b.role?0:a.role==="required"?-1:1).map((x) => {
                          const b = x.s.kind==="like"?"good":x.s.kind==="dislike"?"bad":x.s.kind==="unavail"||x.s.kind==="no"?"off":"neu";
                          const v = votes[`${x.p.id}-${slot.wk}-${slot.dow}-${slot.h}`];
                          return <button key={x.p.id} className={`seat ${b} ${x.role}`} onClick={()=>x.s.kind!=="unavail"&&cycle(x.p.id,slot.wk,slot.dow,slot.h)}
                            title={`${x.p.name} · ${x.role==="required"?"필참":"선택"}${v?` · ${VOTE_TXT[v]}`:""}`}>
                            <span className="sd">{x.p.short[0]}</span><span className="sname">{x.p.short}{v && <em>{VOTE_TXT[v]}</em>}</span></button>;
                        })}</div>
                      )}
                      {isTop && !named && <p className="revealhint">조율이 필요하면 <button className="link" onClick={()=>setNamed(true)}>이름 공개</button>로 필참자를 확인하고 조정할 수 있어요.</p>}
                    </div>
                    {isTop && (<div className="confirm">{confirmed===rankKey(slot)
                      ? <div className="done">확정 · 안내 전송됨</div>
                      : <button className="cta small" onClick={()=>setConfirmed(rankKey(slot))}>이 시간으로 확정</button>}</div>)}
                  </article>
                );
              })}</div>
            </>
          )}
        </section>
      )}

      {tab === "settings" && (
        <section className="pane">
          <div className="set-head"><h3>내 선호는 한 번만 등록해요</h3>
            <p>미팅마다 입력할 필요 없이, 여기 등록한 값이 모든 회의 계산에 자동 반영돼요. 남에게는 <b>공개되지 않아요.</b></p></div>
          <div className="philo">선호 규칙은 <b>언제나 양보 가능</b>해요. “절대 안 되는 시간”은 따로 켜지 않아도 <b>캘린더·근무시간</b>이 대신 알려줘요.</div>
          <div className="who">{PEOPLE.map((p) => <button key={p.id} className={me===p.id?"on":""} onClick={()=>setMe(p.id)}>{p.short}</button>)}</div>
          {(() => { const p = PEOPLE.find((x) => x.id === me); return (
            <div className="setcard">
              <div className="setrow"><div className="setlabel">근무시간 <span>유연 · 일/주/월 단위로 조정</span></div>
                <div className="setval mono">{p.work.s}:00 – {p.work.e}:00</div></div>
              <div className="setrow col"><div className="setlabel">선호 / 비선호 규칙 <span>요일 · 앵커(출근·점심·퇴근) · 전/후 · n시간 n분</span></div>
                {p.prefs.length ? p.prefs.map((r, i) => (
                  <div key={i} className={`prefline ${r.k}`}><span className={`ptag ${r.k}`}>{r.k==="dislike"?"비선호":"선호"}</span><span className="ptxt">{r.label}</span></div>
                )) : <div className="prefline none"><span className="ptag none">없음</span><span className="ptxt">아직 등록된 규칙이 없어요</span></div>}
                <button className="addrule">+ 규칙 추가</button></div>
              <div className="schema"><div className="sc-title">규칙 입력 방식</div>
                <div className="sc-grid">
                  <div className="sc-col"><span className="sc-h">요일</span><div className="days">{["월","화","수","목","금","토","일"].map((d,i)=><span key={d} className={`day ${i<5?"on":""}`}>{d}</span>)}</div></div>
                  <div className="sc-col"><span className="sc-h">앵커</span><div className="segs"><span className="sg">출근</span><span className="sg on">점심</span><span className="sg">퇴근</span></div></div>
                  <div className="sc-col"><span className="sc-h">전 / 후</span><div className="segs"><span className="sg">전</span><span className="sg on">후</span></div></div>
                  <div className="sc-col"><span className="sc-h">길이</span><div className="lenbox mono">1시간 0분<em>까지</em></div></div>
                </div><p className="sc-note">예) “점심 · 후 · 1시간까지” = 점심 직후 한 시간이 비선호로 잡혀요.</p></div>
            </div>);})()}
        </section>
      )}
    </div>
  );
}

const css = `
@import url('https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/static/pretendard.css');
.teum{--paper:#F7F8FA;--surface:#FFFFFF;--ink:#191F28;--ink2:#4E5968;--ink3:#8B95A1;--line:#E5E8EB;--line2:#F2F4F6;
  --accent:#3182F7;--accent-strong:#1B64DA;--accent-soft:#EBF2FE;
  --good:#0AB259;--good-s:#E3F9ED;--warn:#F5A100;--warn-s:#FEF3DA;--bad:#F04452;--bad-s:#FEECEE;--mut:#8B95A1;
  font-family:'Pretendard',system-ui,sans-serif;color:var(--ink);background:var(--paper);min-height:100%;padding:28px clamp(16px,4vw,44px) 60px;line-height:1.5;letter-spacing:-.01em}
.teum *{box-sizing:border-box}
.teum h1{font-family:'Pretendard';font-size:26px;font-weight:800;letter-spacing:-.02em;margin:0}
.teum h3{font-family:'Pretendard';font-size:17px;font-weight:700;letter-spacing:-.01em;margin:0}
.teum em{font-style:normal}.mono{font-family:'Pretendard';font-variant-numeric:tabular-nums;font-weight:700}
.hd{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:22px}
.brand{display:flex;gap:13px;align-items:center}
.mark{width:34px;height:34px;border-radius:50%;background:linear-gradient(160deg,var(--accent),var(--accent-strong));display:inline-flex;margin-right:2px;box-shadow:0 4px 10px -3px rgba(49,130,247,.5)}
.sub{margin:2px 0 0;color:var(--ink2);font-size:13px;max-width:44ch}.sub em{color:var(--accent);font-weight:600}
.steps{display:flex;gap:5px;background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:4px}
.steps button{font-size:12.5px;font-weight:500;color:var(--ink2);background:none;border:none;padding:7px 12px;border-radius:8px;cursor:pointer}
.steps button.on{background:var(--ink);color:#fff}
.fixed-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.chip.fixed{background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 12px;font-size:12.5px;font-weight:500}
.chip .ck,.wh .ck,.setrow .ck{font-family:'Pretendard';font-size:10px;color:var(--ink3);margin-right:6px;text-transform:uppercase}
.lead{font-size:13.5px;color:var(--ink2);max-width:64ch;margin:0 0 20px}.lead b{color:var(--ink);font-weight:600}
.team{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:11px;margin-bottom:24px}
.pcard{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:13px;justify-content:space-between}
.pcard.required{border-color:#C9E0FE}
.pcard-top{display:flex;gap:11px}
.avatar{width:37px;height:37px;border-radius:11px;display:grid;place-items:center;flex:none;font-family:'Pretendard';font-weight:600;font-size:15px;color:#fff;background:var(--ink3)}
.avatar[data-r=required]{background:var(--accent)}
.pname{font-weight:600;font-size:14px;display:flex;align-items:center;gap:7px}
.pt{font-size:10px;font-weight:600;color:var(--accent);background:var(--accent-soft);border-radius:5px;padding:2px 6px}
.wh{font-size:11.5px;color:var(--ink2);margin-top:5px}
.roletog{display:flex;padding:3px;background:var(--line2);border:none;border-radius:9px;cursor:pointer;gap:2px}
.seg{flex:1;text-align:center;font-size:11.5px;font-weight:600;color:var(--ink3);padding:6px 0;border-radius:7px}
.seg.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.cta{font-family:'Pretendard';font-weight:600;font-size:14.5px;background:var(--ink);color:#fff;border:none;border-radius:18px;padding:14px 26px;cursor:pointer;display:inline-flex;gap:8px;align-items:center;transition:transform .12s}
.cta:hover{transform:translateY(-1px);box-shadow:0 6px 16px -4px rgba(49,130,247,.35)}.cta.small{font-size:13.5px;padding:11px 18px;background:var(--accent);border-radius:12px}
.ctxbar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:12px}
.ctxbar>span{font-size:13px;color:var(--ink2)}.ctxbar b{color:var(--ink)}
.ctxright{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.demo{display:flex;align-items:center;gap:4px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:3px}
.demo>span{font-family:'Pretendard';font-size:9.5px;color:var(--ink3);text-transform:uppercase;padding:0 5px}
.demo button{font-size:11.5px;font-weight:500;color:var(--ink2);background:none;border:none;padding:5px 9px;border-radius:6px;cursor:pointer}
.demo button.on{background:var(--ink);color:#fff}
.anon{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--ink3)}.anon .on{color:var(--ink);font-weight:600}
.sw{width:38px;height:22px;border-radius:11px;border:none;background:var(--accent);cursor:pointer;position:relative;padding:0}
.sw.r{background:var(--ink3)}.sw i{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .16s}.sw:not(.r) i{left:19px}
.banner{display:flex;align-items:center;gap:11px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:11px 14px;font-size:12.5px;color:var(--ink2);margin-bottom:18px}
.banner.warn2{background:var(--warn-s);border-color:#EAD4A8}.banner b{color:var(--ink)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none}.banner.warn2 .dot{background:var(--warn)}
.dot.pulse{animation:pl 1.6s ease-out infinite}
@keyframes pl{0%{box-shadow:0 0 0 0 rgba(59,55,224,.4)}70%{box-shadow:0 0 0 7px rgba(59,55,224,0)}100%{box-shadow:0 0 0 0 rgba(59,55,224,0)}}
.reset{margin-left:auto;font-size:11.5px;font-weight:500;color:var(--ink2);background:none;border:1px solid var(--line);border-radius:8px;padding:5px 10px;cursor:pointer}
.heatwrap{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:20px 20px 16px;margin-bottom:26px}
.heat-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:14px}.heat-head p{margin:0;font-size:12px;color:var(--ink3)}
.heat-scroll{overflow-x:auto}
.heat{display:grid;gap:4px;min-width:420px}
.hcorner{}
.hd-day{text-align:center;font-size:12.5px;font-weight:600;color:var(--ink2);display:flex;flex-direction:column;line-height:1.2}
.hd-day.w2{color:var(--accent)}.hd-day em{font-family:'Pretendard';font-size:9.5px;color:var(--ink3);font-weight:400}
.htime{font-family:'Pretendard';font-size:11px;color:var(--ink3);display:flex;align-items:center}
.hcell{height:32px;border-radius:9px;position:relative}
.hcell.infeasible{background:repeating-linear-gradient(45deg,#F0F1F4,#F0F1F4 5px,#E8E9EE 5px,#E8E9EE 10px)}
.hcell.hn2{background:#FBC4C9}.hcell.hn1{background:#FDE1E3}.hcell.h0{background:#F2F4F6}.hcell.h1{background:#C9E9D6}.hcell.h2{background:#7FE0A8}
.hrk{position:absolute;top:2px;right:5px;font-family:'Pretendard';font-weight:700;font-size:12px;color:var(--ink);opacity:.72}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin-top:14px;font-size:11.5px;color:var(--ink3)}
.scale{display:flex;gap:2px}.scale .s{width:15px;height:12px;border-radius:3px;display:inline-block}
.s.hn2{background:#FBC4C9}.s.hn1{background:#FDE1E3}.s.h0{background:#F2F4F6}.s.h1{background:#C9E9D6}.s.h2{background:#7FE0A8}
.legend .sl{margin-right:8px}.lg-if{display:flex;align-items:center;gap:5px;margin-left:6px}
.lg-if i{width:14px;height:12px;border-radius:3px;background:repeating-linear-gradient(45deg,#F0F1F4,#F0F1F4 4px,#E8E9EE 4px,#E8E9EE 8px);display:inline-block}
.legend .note{margin-left:auto;color:var(--ink3)}
.escalate{background:var(--surface);border:1px solid #EAD4A8;border-radius:16px;padding:22px;background:linear-gradient(0deg,var(--surface),var(--surface))}
.esc-head{display:flex;gap:13px;margin-bottom:18px}
.esc-ic{width:28px;height:28px;border-radius:50%;background:var(--warn);color:#fff;display:grid;place-items:center;font-family:'Pretendard';font-weight:700;flex:none}
.esc-head h3{margin-bottom:5px}.esc-head p{margin:0;font-size:13px;color:var(--ink2);max-width:66ch}.esc-head b{color:var(--ink)}
.esc-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:11px}
.esc-opt{text-align:left;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px;cursor:pointer;display:flex;flex-direction:column;gap:5px}
.esc-opt:hover:not(:disabled){border-color:var(--accent)}.esc-opt:disabled{opacity:.5;cursor:default}
.esc-opt.col{cursor:default}
.eo-t{font-family:'Pretendard';font-weight:600;font-size:14px}.eo-d{font-size:12px;color:var(--ink2)}
.demote{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.demote button{font-size:11.5px;font-weight:600;color:var(--accent);background:var(--accent-soft);border:none;border-radius:7px;padding:6px 9px;cursor:pointer}
.rank-title{margin:0 0 12px}.rank-title em{font-size:12px;color:var(--ink3);font-weight:400}
.rank{display:flex;flex-direction:column;gap:9px}
.slot{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:14px 16px;display:flex;gap:15px;align-items:flex-start}
.slot.first{border-color:var(--accent);border-width:2px;padding:19px 22px;box-shadow:0 10px 28px -12px rgba(49,130,247,.28);background:linear-gradient(180deg,#FFFFFF,#FBFDFF)}
.rk{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:32px;padding-top:2px}
.rknum{font-family:'Pretendard';font-weight:700;font-size:18px;color:var(--ink3)}.first .rknum{color:var(--accent);font-size:23px}
.rktag{font-size:9.5px;font-weight:700;color:#fff;background:var(--accent);border-radius:5px;padding:2px 6px}
.slotbody{flex:1;min-width:0}
.when{display:flex;align-items:baseline;gap:11px;flex-wrap:wrap}.wday{font-size:12.5px;color:var(--ink2);font-weight:500}
.wtime{font-family:'Pretendard';font-weight:700;font-size:16px}.first .wtime{font-size:20px}
.reasons{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.rz{font-size:11.5px;font-weight:500;border-radius:6px;padding:3px 8px}
.rz.ok,.rz.good{color:var(--good);background:var(--good-s)}.rz.bad{color:var(--bad);background:var(--bad-s)}.rz.mut{color:var(--ink2);background:var(--line2)}
.seats{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}
.seat{display:flex;align-items:center;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:0;cursor:pointer;overflow:hidden;transition:transform .1s}
.seat:hover{transform:translateY(-1px)}
.seat .sd{width:28px;height:28px;display:grid;place-items:center;font-size:12px;font-weight:600;color:#fff}
.seat .sname{padding:0 9px 0 7px;font-size:12px;font-weight:500;display:flex;flex-direction:column;line-height:1.15}.seat .sname em{font-size:9.5px;font-weight:600;opacity:.85}
.seat.required{border-width:1.5px}
.seat.good .sd{background:var(--good)}.seat.good{border-color:var(--good);background:var(--good-s);color:var(--good)}
.seat.bad .sd{background:var(--bad)}.seat.bad{border-color:var(--bad);background:var(--bad-s);color:var(--bad)}
.seat.neu .sd{background:var(--mut)}.seat.neu{color:var(--ink2)}
.seat.off .sd{background:var(--ink3)}.seat.off{color:var(--ink3);text-decoration:line-through}
.revealhint{font-size:12px;color:var(--ink3);margin:12px 0 0}
.link{background:none;border:none;color:var(--accent);font-weight:600;cursor:pointer;padding:0;font-size:12px;text-decoration:underline}
.confirm{align-self:center;flex:none}.done{font-size:12px;font-weight:600;color:var(--good);background:var(--good-s);border-radius:9px;padding:10px 14px}
.set-head h3{margin-bottom:5px}.set-head p{margin:0 0 14px;font-size:13px;color:var(--ink2);max-width:60ch}.set-head b{color:var(--ink)}
.philo{background:var(--accent-soft);border-radius:11px;padding:12px 14px;font-size:12.5px;color:var(--ink2);margin-bottom:16px}.philo b{color:var(--ink)}
.who{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.who button{font-size:12.5px;font-weight:500;color:var(--ink2);background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:7px 13px;cursor:pointer}
.who button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.setcard{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:6px 18px}
.setrow{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:15px 0;border-bottom:1px solid var(--line2)}
.setrow.col{flex-direction:column;align-items:stretch}
.setlabel{font-size:13.5px;font-weight:600}.setlabel span{display:block;font-size:11.5px;color:var(--ink3);font-weight:400;margin-top:3px}
.setval{font-size:14px}
.prefline{display:flex;align-items:center;gap:9px;margin-top:10px}
.ptag{font-size:10.5px;font-weight:600;border-radius:5px;padding:3px 8px;flex:none}
.ptag.dislike{color:var(--bad);background:var(--bad-s)}.ptag.like{color:var(--good);background:var(--good-s)}.ptag.none{color:var(--ink3);background:var(--line2)}
.ptxt{font-size:13px;color:var(--ink2)}
.addrule{margin-top:12px;align-self:flex-start;font-size:12px;font-weight:500;color:var(--accent);background:var(--accent-soft);border:none;border-radius:8px;padding:7px 12px;cursor:pointer}
.schema{padding:16px 0 12px}.sc-title{font-size:11px;font-family:'Pretendard';text-transform:uppercase;color:var(--ink3);margin-bottom:12px}
.sc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}
.sc-h{font-size:11.5px;color:var(--ink2);font-weight:600;display:block;margin-bottom:8px}
.days{display:flex;gap:4px}.day{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;font-size:11.5px;font-weight:600;color:var(--ink3);background:var(--line2)}.day.on{background:var(--accent);color:#fff}
.segs{display:flex;gap:4px;background:var(--line2);border-radius:9px;padding:3px}.sg{padding:6px 11px;border-radius:7px;font-size:12px;font-weight:600;color:var(--ink3)}.sg.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.lenbox{font-size:14px;border:1px solid var(--line);border-radius:9px;padding:7px 12px;display:inline-flex;gap:6px;align-items:baseline}.lenbox em{font-size:11px;color:var(--ink3)}
.sc-note{font-size:12px;color:var(--ink3);margin:16px 0 0}
@media(max-width:560px){.legend .note{margin-left:0;flex-basis:100%}}
`;
