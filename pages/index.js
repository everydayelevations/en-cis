import { useState } from 'react';
import Head from 'next/head';

const C = {
  bg:"#080810", surface:"#0E0E1A", card:"#13131F", border:"#1E1E32",
  accent:"#E94560", accentLo:"#9B2335", gold:"#F5A623",
  teal:"#0A8A7A", purple:"#6E2F8E", green:"#27AE60",
  text:"#EEEEF8", muted:"#66667A",
};

const ANGLES = [
  { id:"veteran", label:"Veteran / Resilience",       icon:"🎖️", color:"#0F3460" },
  { id:"mindset", label:"Mindset & Mental Toughness",  icon:"🧠", color:"#6E2F8E" },
  { id:"wins",    label:"Everyday Wins",               icon:"⚡", color:"#0A8A7A" },
];

const NAV = [
  { id:"home",    icon:"⚡", label:"Command Center"    },
  { id:"extract", icon:"🔍", label:"Insight Extractor" },
  { id:"script",  icon:"🎬", label:"Script Engine"     },
  { id:"vault",   icon:"📋", label:"Prompt Vault"      },
];

const PROMPTS = [
  { tier:"Tier 1", color:"#1B4F72", focus:"Audience Intelligence", when:"Run first",
    prompt:"Who is the core audience following health and wellness mindset podcasts on Instagram in 2026? Break down by age, pain points, content consumption habits, and what motivates them to follow a new account. Compare @hubermanlab, @jayshetty, and @richroll audiences specifically. Sources not older than 3 months." },
  { tier:"Tier 1", color:"#1B4F72", focus:"Audience Intelligence", when:"Run first",
    prompt:"What emotional triggers cause someone to follow a health and wellness Instagram account vs. just watching one video and leaving? Pull from recent social behavior studies, Reddit discussions, and creator interviews from the past 6 months." },
  { tier:"Tier 1", color:"#1B4F72", focus:"Audience Intelligence", when:"Run first",
    prompt:"What are the top audience complaints about health and wellness podcast Instagram accounts? Search Reddit, YouTube comments, and podcast review threads -- what do followers wish these creators did differently?" },
  { tier:"Tier 2", color:"#145A32", focus:"Content Gap & Positioning", when:"Run second",
    prompt:"Analyze the content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, and @richroll on Instagram. For each: their 3 core content themes, what topic they own that nobody else does, and gaps where audience demand exists but nobody is filling it." },
  { tier:"Tier 2", color:"#145A32", focus:"Content Gap & Positioning", when:"Run second",
    prompt:"What health and wellness Instagram content formats are generating the highest follower conversion rates in early 2026 -- meaning viewers who were not following before watched a Reel and then followed? Focus on Reels under 90 seconds." },
  { tier:"Tier 2", color:"#145A32", focus:"Content Gap & Positioning", when:"Run second",
    prompt:"Analyze the top 10 performing content pieces from @hubermanlab, @jayshetty, @richroll in the past 3 months. What themes, formats, and hooks appear most frequently? Sources not older than 3 months." },
  { tier:"Tier 3", color:"#6E2F8E", focus:"Growth Mechanics", when:"Run third",
    prompt:"Which health and wellness Instagram creators had the fastest organic follower growth in Q1 2026 and what specific tactics preceded those spikes? Focus on accounts under 100K followers who broke through." },
  { tier:"Tier 3", color:"#6E2F8E", focus:"Growth Mechanics", when:"Run third",
    prompt:"What collaboration patterns are driving the most follower growth for mid-size health and wellness podcast Instagram accounts right now? Who is cross-promoting with whom and what formats do those collabs take?" },
  { tier:"Tier 3", color:"#6E2F8E", focus:"Growth Mechanics", when:"Run third",
    prompt:"Analyze how @jayshetty built his Instagram community identity -- specifically how he named his audience, when he introduced that naming convention, and how it affected his engagement and growth metrics." },
  { tier:"Tier 4", color:"#7E5109", focus:"Deep Dive Research", when:"Run fourth",
    prompt:"Social media audit of top wellness podcast Instagram accounts -- four categories: posting cadence, content pillars, engagement patterns, growth signals. Comparison table with @hubermanlab, @jayshetty, @richroll, @mindpumpmedia as columns. Sources not older than 3 months." },
  { tier:"Tier 4", color:"#7E5109", focus:"Deep Dive Research", when:"Run fourth",
    prompt:"What questions are health and wellness audiences asking most on Reddit, Quora, and YouTube comments in early 2026? Group by theme and identify which ones no major Instagram creator is answering consistently." },
  { tier:"Tier 4", color:"#7E5109", focus:"Deep Dive Research", when:"Run fourth",
    prompt:"Research the top 5 fastest-growing health and wellness podcast Instagram accounts right now. For each: follower count, growth rate, content format breakdown, posting frequency, and the single tactic most responsible for their growth." },
];

const EP = `You are the Elevation Nation Content Intelligence Engine for @everydayelevations — Jason Fricka's health, wellness, and mindset Instagram podcast. Analyze Perplexity research and return ONLY JSON, no markdown:
{"summary":"2-3 sentence synthesis","competitors":[{"handle":"@h","insight":"tactical insight","threat":"low|medium|high"}],"contentGaps":[{"gap":"title","description":"why it matters","priority":"high|medium|low","format":"Reel|Carousel|Story|All"}],"reelIdeas":[{"title":"hook-driven title","hook":"exact opening line","why":"why drives follows","cta":"specific CTA"}],"growthTactics":[{"tactic":"name","description":"how to execute for @everydayelevations","effort":"low|medium|high","impact":"low|medium|high"}],"elevationNationAngle":"how to leverage Elevation Nation identity"}`;

const SP = `You are Jason Fricka's Reel script writer for @everydayelevations. VOICE: Conversational like talking to a friend. No fluff. Direct. Veteran, mindset coach, endurance athlete, father in Colorado. Short punchy sentences. Elevation Nation community woven in. TARGET: 30-60 seconds. Hook in first 3 seconds. Return ONLY JSON:
{"hook":"first line","hookNote":"delivery direction","body":["l1","l2","l3","l4","l5"],"bodyNotes":["n1","n2","n3","n4","n5"],"cta":"closing line","ctaNote":"how to land it","onScreenText":"opening overlay","caption":"full Instagram caption 3-5 paragraphs","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"],"estimatedSeconds":45,"whyItWorks":"why this drives follows"}`;

async function ai(sys, msg) {
  const r = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: sys, message: msg }),
  });
  const d = await r.json();
  return JSON.parse(d.text.replace(/```json|```/g, '').trim());
}

const Spin = () => (
  <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.2)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
);

const Bdg = ({ label, type }) => {
  const m = {
    high:   { bg:"#2A0F15", t:C.accent,  b:C.accentLo },
    medium: { bg:"#1A1400", t:C.gold,    b:"#7E5109"  },
    low:    { bg:"#0A1A0F", t:C.green,   b:"#145A32"  },
  };
  const co = m[type] || m.medium;
  return <span style={{ background:co.bg, color:co.t, border:`1px solid ${co.b}`, borderRadius:3, padding:"2px 6px", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>{label}</span>;
};

function Home({ go, ec, sc }) {
  const cards = [
    { id:"extract", icon:"🔍", title:"Insight Extractor", color:C.accent, desc:"Paste Perplexity research. Get competitor intel, content gaps, and Reel ideas for @everydayelevations.", stat: ec > 0 ? `${ec} session${ec>1?"s":""} run` : "Ready" },
    { id:"script",  icon:"🎬", title:"Script Engine",     color:C.gold,   desc:"Topic + angle in. Full Reel script in Jason's voice out. Hook, body, CTA, caption, hashtags.", stat: sc > 0 ? `${sc} script${sc>1?"s":""} written` : "Ready" },
    { id:"vault",   icon:"📋", title:"Prompt Vault",      color:C.teal,   desc:"12 research prompts across 4 tiers. Run in Perplexity, feed results into the Extractor.", stat:"12 prompts · 4 tiers" },
  ];
  return (
    <div style={{ padding:"36px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(32px,5vw,52px)", letterSpacing:3, lineHeight:1, color:C.text }}>ELEVATION NATION</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(12px,2vw,16px)", letterSpacing:6, color:C.accent, marginTop:4 }}>CONTENT INTELLIGENCE SYSTEM</div>
        <div style={{ color:C.muted, fontSize:13, marginTop:10, maxWidth:520, lineHeight:1.7 }}>
          Your end-to-end Instagram growth engine for <span style={{ color:C.accent }}>@everydayelevations</span>. Research feeds Extraction. Extraction feeds Scripts. Scripts grow the Elevation Nation.
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:40, flexWrap:"wrap" }}>
        {[
          { n:"01", l:"Perplexity Research", s:"Run Vault prompts",     c:"#0F3460" },
          { n:"02", l:"Extract Intelligence", s:"Gaps + competitor intel", c:C.accent  },
          { n:"03", l:"Generate Script",      s:"In Jason's voice",       c:C.gold    },
          { n:"04", l:"Film + Post",           s:"Elevation Nation grows", c:C.green   },
        ].map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ background:C.card, border:`1px solid ${s.c}44`, borderTop:`2px solid ${s.c}`, borderRadius:8, padding:"12px 16px", minWidth:120 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:s.c, lineHeight:1 }}>{s.n}</div>
              <div style={{ color:C.text, fontSize:11, fontWeight:700, marginTop:2 }}>{s.l}</div>
              <div style={{ color:C.muted, fontSize:10, marginTop:1 }}>{s.s}</div>
            </div>
            {i < 3 && <div style={{ color:C.border, fontSize:16, padding:"0 4px" }}>→</div>}
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:28 }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => go(card.id)}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:`2px solid ${card.color}`, borderRadius:10, padding:"20px", cursor:"pointer", transition:"transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize:24, marginBottom:10 }}>{card.icon}</div>
            <div style={{ color:C.text, fontWeight:800, fontSize:14, marginBottom:7, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{card.title}</div>
            <div style={{ color:C.muted, fontSize:12, lineHeight:1.7, marginBottom:14 }}>{card.desc}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:card.color, fontSize:11, fontWeight:700, background:card.color+"18", border:`1px solid ${card.color}33`, borderRadius:4, padding:"3px 8px" }}>{card.stat}</span>
              <span style={{ color:card.color, fontSize:12, fontWeight:700 }}>Open →</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.accent}`, borderRadius:8, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:C.accent, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>Elevation Nation</div>
          <div style={{ color:C.text, fontSize:12, lineHeight:1.6 }}>Everyday people who refuse to stay where they are. Every script, every piece of content is built to grow this community.</div>
        </div>
        <div style={{ fontSize:26, marginLeft:14 }}>🏔️</div>
      </div>
    </div>
  );
}

function Extract({ onScript, onCount }) {
  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const [cp, setCp] = useState("");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function run() {
    if (!inp.trim()) return;
    setLoad(true); setErr(null); setRes(null);
    try {
      const d = await ai(EP, `Analyze for @everydayelevations:\n\n${inp}`);
      setRes(d); onCount();
    } catch { setErr("Parse failed. Try again or shorten your input."); }
    finally { setLoad(false); }
  }

  const ec = { high:C.accent, medium:C.gold, low:C.green };

  return (
    <div style={{ padding:"30px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:C.text }}>INSIGHT EXTRACTOR</div>
        <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>Paste Perplexity research. Get structured intelligence for @everydayelevations.</div>
      </div>

      {!res ? (
        <div style={{ background:C.card, border:`1px solid ${load ? C.accent : C.border}`, borderRadius:10, padding:"18px 20px", transition:"border-color 0.2s" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
            <span style={{ color:C.gold, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>Paste Research</span>
            <span style={{ color:C.muted, fontSize:11 }}>{inp.length.toLocaleString()} chars</span>
          </div>
          <textarea value={inp} onChange={e => setInp(e.target.value)} disabled={load}
            placeholder="Paste your full Perplexity results here including sources. More context = sharper output."
            style={{ width:"100%", minHeight:180, background:C.surface, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"11px 13px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          {err && <div style={{ color:C.accent, fontSize:12, marginTop:8, padding:"8px 11px", background:"#1A0808", borderRadius:6 }}>{err}</div>}
          <div style={{ display:"flex", gap:9, marginTop:13 }}>
            <button onClick={run} disabled={load || !inp.trim()}
              style={{ background:load ? C.accentLo : C.accent, color:"#fff", border:"none", borderRadius:6, padding:"10px 20px", fontSize:13, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, opacity:!inp.trim() ? 0.4 : 1, display:"flex", alignItems:"center", gap:9 }}>
              {load ? <><Spin />Extracting...</> : "⚡ Extract Intelligence"}
            </button>
            {inp && !load && <button onClick={() => setInp("")} style={{ background:"transparent", color:C.muted, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 13px", fontSize:12 }}>Clear</button>}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ color:C.text, fontWeight:800, fontSize:15 }}>Intelligence Report</div>
            <button onClick={() => { setRes(null); setInp(""); }} style={{ background:"transparent", color:C.accent, border:`1px solid ${C.accentLo}`, borderRadius:6, padding:"6px 13px", fontSize:12, fontWeight:700 }}>+ New Analysis</button>
          </div>
          <div style={{ background:"#0E0E1E", border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.accent}`, borderRadius:8, padding:"13px 16px", marginBottom:12 }}>
            <div style={{ color:C.muted, fontSize:10, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Summary</div>
            <div style={{ color:C.text, fontSize:13, lineHeight:1.7, fontStyle:"italic" }}>{res.summary}</div>
          </div>
          <div style={{ background:"#14100A", border:`1px solid #3A2E00`, borderLeft:`3px solid ${C.gold}`, borderRadius:8, padding:"13px 16px", marginBottom:16 }}>
            <div style={{ color:C.gold, fontSize:10, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Elevation Nation Angle</div>
            <div style={{ color:C.text, fontSize:13, lineHeight:1.7 }}>{res.elevationNationAngle}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:13, marginBottom:13 }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px" }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:11 }}>🎯 Competitor Intel</div>
              {(res.competitors || []).map((c, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:9, marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <span style={{ color:C.accent, fontWeight:700, fontSize:13 }}>{c.handle}</span>
                    <Bdg label={c.threat} type={c.threat} />
                  </div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{c.insight}</div>
                </div>
              ))}
            </div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px" }}>
              <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:11 }}>🕳️ Content Gaps</div>
              {(res.contentGaps || []).map((g, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:9, marginBottom:9 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                    <span style={{ color:C.text, fontWeight:700, fontSize:12 }}>{g.gap}</span>
                    <div style={{ display:"flex", gap:4 }}>
                      <Bdg label={g.priority} type={g.priority} />
                      <span style={{ background:"#0A1218", color:"#4AADE8", border:"1px solid #0F3460", borderRadius:3, padding:"2px 5px", fontSize:10, fontWeight:700 }}>{g.format}</span>
                    </div>
                  </div>
                  <div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{g.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px", marginBottom:13 }}>
            <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:11 }}>🎬 Reel Ideas</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:9 }}>
              {(res.reelIdeas || []).map((r, i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:`2px solid ${C.accent}`, borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ color:C.text, fontWeight:700, fontSize:12, marginBottom:6 }}>{r.title}</div>
                  <div style={{ color:C.gold, fontSize:11, fontStyle:"italic", marginBottom:5 }}>"{r.hook}"</div>
                  <div style={{ color:C.muted, fontSize:11, lineHeight:1.5, marginBottom:7 }}>{r.why}</div>
                  <button onClick={() => onScript(r.title)}
                    style={{ background:C.teal+"22", color:C.teal, border:`1px solid ${C.teal}44`, borderRadius:5, padding:"5px 9px", fontSize:11, fontWeight:700, width:"100%" }}>
                    → Send to Script Engine
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"14px 16px" }}>
            <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:11 }}>📈 Growth Tactics</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:9 }}>
              {(res.growthTactics || []).map((t, i) => (
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ color:C.text, fontWeight:700, fontSize:12, marginBottom:5 }}>{t.tactic}</div>
                  <div style={{ color:C.muted, fontSize:11, lineHeight:1.6, marginBottom:7 }}>{t.description}</div>
                  <div style={{ display:"flex", gap:9 }}>
                    <span style={{ fontSize:11, color:C.muted }}>Effort: <span style={{ color:ec[t.effort]||C.gold, fontWeight:700, textTransform:"capitalize" }}>{t.effort}</span></span>
                    <span style={{ fontSize:11, color:C.muted }}>Impact: <span style={{ color:ec[t.impact]||C.gold, fontWeight:700, textTransform:"capitalize" }}>{t.impact}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Script({ prefill, onCount }) {
  const [topic,  setTopic]  = useState(prefill || "");
  const [angle,  setAngle]  = useState("");
  const [ctx,    setCtx]    = useState("");
  const [load,   setLoad]   = useState(false);
  const [scr,    setScr]    = useState(null);
  const [err,    setErr]    = useState(null);
  const [cp,     setCp]     = useState("");
  const [tab,    setTab]    = useState("script");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function gen() {
    if (!topic.trim() || !angle) return;
    setLoad(true); setErr(null); setScr(null);
    const a = ANGLES.find(x => x.id === angle);
    try {
      const d = await ai(SP, `Topic: ${topic}\nAngle: ${a?.label}\n${ctx ? `Context: ${ctx}` : ""}`);
      setScr(d); onCount();
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }

  const ft = () => scr ? [
    `[ON SCREEN: ${scr.onScreenText}]`, ``,
    `HOOK: "${scr.hook}"`, `(${scr.hookNote})`, ``,
    ...scr.body.map((l, i) => `"${l}"\n(${scr.bodyNotes[i]})`), ``,
    `CTA: "${scr.cta}"`, `(${scr.ctaNote})`
  ].join("\n") : "";

  const sa = ANGLES.find(x => x.id === angle);

  return (
    <div style={{ padding:"30px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:C.text }}>SCRIPT ENGINE</div>
        <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>Topic + angle → full Reel script in Jason's voice. 30-60 seconds, ready to film.</div>
      </div>

      {!scr ? (
        <>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", color:C.gold, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:3, marginBottom:7 }}>What's the Reel about?</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. What the Army taught me about starting over"
              style={{ width:"100%", background:C.card, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px", fontSize:14, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", color:C.gold, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:3, marginBottom:7 }}>Content Angle</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:9 }}>
              {ANGLES.map(a => (
                <div key={a.id} onClick={() => setAngle(a.id)}
                  style={{ background:angle === a.id ? a.color+"28" : C.card, border:`2px solid ${angle === a.id ? a.color : C.border}`, borderRadius:8, padding:"13px", cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ fontSize:18, marginBottom:5 }}>{a.icon}</div>
                  <div style={{ color:angle === a.id ? C.text : C.muted, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", color:C.gold, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:3, marginBottom:6 }}>
              Context <span style={{ color:C.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span>
            </label>
            <textarea value={ctx} onChange={e => setCtx(e.target.value)} rows={3}
              placeholder="Real memory or detail that makes it authentic..."
              style={{ width:"100%", background:C.card, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"11px 13px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>
          {err && <div style={{ color:C.accent, background:"#1A0808", border:`1px solid ${C.accentLo}`, borderRadius:6, padding:"9px 13px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <button onClick={gen} disabled={load || !topic.trim() || !angle}
            style={{ background:load ? C.accentLo : C.accent, color:"#fff", border:"none", borderRadius:6, padding:"12px 28px", fontSize:14, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, opacity:(!topic.trim() || !angle) ? 0.4 : 1, display:"flex", alignItems:"center", gap:11 }}>
            {load ? <><Spin />Writing Script...</> : "⚡ Generate Script"}
          </button>
        </>
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:9 }}>
            <div>
              <div style={{ color:C.text, fontWeight:800, fontSize:15, fontFamily:"'Bebas Neue',sans-serif" }}>{topic}</div>
              <div style={{ display:"flex", gap:7, marginTop:5 }}>
                {sa && <span style={{ background:sa.color+"28", color:C.text, border:`1px solid ${sa.color}`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{sa.icon} {sa.label}</span>}
                <span style={{ background:C.surface, color:C.gold, border:`1px solid ${C.border}`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:700 }}>~{scr.estimatedSeconds}s</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => copy(ft(), "full")} style={{ background:C.surface, color:cp === "full" ? C.green : C.muted, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, fontWeight:600 }}>{cp === "full" ? "✓ Copied" : "Copy Script"}</button>
              <button onClick={() => { setScr(null); setErr(null); }} style={{ background:C.accent, color:"#fff", border:"none", borderRadius:6, padding:"7px 13px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>New Script</button>
            </div>
          </div>
          <div style={{ background:"#0A140A", border:`1px solid #1E3A1E`, borderLeft:`3px solid ${C.green}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#AAD4AA", lineHeight:1.6 }}>
            <span style={{ color:C.green, fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10 }}>Why it drives follows: </span>{scr.whyItWorks}
          </div>
          <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, marginBottom:16 }}>
            {["script","caption","hashtags"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab === t ? C.accent : "transparent"}`, color:tab === t ? C.text : C.muted, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", marginBottom:-1 }}>
                {t}
              </button>
            ))}
          </div>
          {tab === "script" && (
            <div>
              <div style={{ background:"#14100A", border:`1px solid #3A2800`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                <div style={{ color:C.gold, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>On Screen Text</div>
                <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>"{scr.onScreenText}"</div>
              </div>
              <div style={{ background:"#150810", border:`1px solid #3A1020`, borderLeft:`3px solid ${C.accent}`, borderRadius:8, padding:"13px 16px", marginBottom:11 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <span style={{ color:C.accent, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>Hook · 0-3 sec</span>
                  <button onClick={() => copy(scr.hook, "hook")} style={{ background:"transparent", color:cp === "hook" ? C.green : C.muted, border:"none", fontSize:11 }}>{cp === "hook" ? "✓" : "copy"}</button>
                </div>
                <div style={{ color:C.text, fontSize:16, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:5 }}>"{scr.hook}"</div>
                <div style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>📹 {scr.hookNote}</div>
              </div>
              <div style={{ marginBottom:11 }}>
                <div style={{ color:C.muted, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:7 }}>Body · 3-50 sec</div>
                {scr.body.map((line, i) => (
                  <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:7, padding:"11px 14px", marginBottom:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:9 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ color:C.text, fontSize:13, lineHeight:1.5, marginBottom:4 }}>"{line}"</div>
                        <div style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>📹 {scr.bodyNotes[i]}</div>
                      </div>
                      <button onClick={() => copy(line, `b${i}`)} style={{ background:"transparent", color:cp === `b${i}` ? C.green : C.muted, border:"none", fontSize:11, flexShrink:0 }}>{cp === `b${i}` ? "✓" : "copy"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#0A1410", border:`1px solid #1E3A28`, borderLeft:`3px solid ${C.green}`, borderRadius:8, padding:"13px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <span style={{ color:C.green, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>CTA</span>
                  <button onClick={() => copy(scr.cta, "cta")} style={{ background:"transparent", color:cp === "cta" ? C.green : C.muted, border:"none", fontSize:11 }}>{cp === "cta" ? "✓" : "copy"}</button>
                </div>
                <div style={{ color:C.text, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:5 }}>"{scr.cta}"</div>
                <div style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>📹 {scr.ctaNote}</div>
              </div>
            </div>
          )}
          {tab === "caption" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:9 }}>
                <button onClick={() => copy(scr.caption + "\n\n" + scr.hashtags.join(" "), "cap")} style={{ background:C.surface, color:cp === "cap" ? C.green : C.muted, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", fontSize:12 }}>{cp === "cap" ? "✓ Copied" : "Copy Caption + Tags"}</button>
              </div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:"16px 20px", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:C.text }}>{scr.caption}</div>
            </div>
          )}
          {tab === "hashtags" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:9 }}>
                <button onClick={() => copy(scr.hashtags.join(" "), "tags")} style={{ background:C.surface, color:cp === "tags" ? C.green : C.muted, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", fontSize:12 }}>{cp === "tags" ? "✓ Copied" : "Copy All"}</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {scr.hashtags.map((tag, i) => (
                  <div key={i} onClick={() => copy(tag, `t${i}`)}
                    style={{ background:cp === `t${i}` ? "#0A140A" : C.card, border:`1px solid ${cp === `t${i}` ? C.green : C.border}`, color:cp === `t${i}` ? C.green : C.text, borderRadius:6, padding:"9px 13px", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                    {tag}
                  </div>
                ))}
              </div>
              <div style={{ color:C.muted, fontSize:12, marginTop:11, fontStyle:"italic" }}>Drop these in your first comment to keep the caption clean.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Vault() {
  const [cp, setCp] = useState("");
  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }
  const tiers = [...new Set(PROMPTS.map(p => p.tier))];
  return (
    <div style={{ padding:"30px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:C.text }}>PROMPT VAULT</div>
        <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>12 prompts · 4 tiers · Run sequentially for compounding research.</div>
      </div>
      {tiers.map(tier => {
        const tp = PROMPTS.filter(p => p.tier === tier);
        const tc = tp[0].color;
        return (
          <div key={tier} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:11 }}>
              <div style={{ background:tc, borderRadius:4, padding:"3px 10px", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, color:"#fff" }}>{tier}</div>
              <div style={{ color:tc, fontSize:12, fontWeight:700 }}>{tp[0].focus}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {tp.map((p, i) => (
                <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${tc}`, borderRadius:8, padding:"12px 15px" }}>
                  <div style={{ color:C.text, fontSize:12, lineHeight:1.7, marginBottom:8 }}>{p.prompt}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ color:C.muted, fontSize:11, fontStyle:"italic" }}>{p.when}</div>
                    <button onClick={() => copy(p.prompt, `p${tier}${i}`)}
                      style={{ background:cp === `p${tier}${i}` ? "#0A140A" : C.surface, color:cp === `p${tier}${i}` ? C.green : C.muted, border:`1px solid ${C.border}`, borderRadius:5, padding:"5px 10px", fontSize:11, fontWeight:600 }}>
                      {cp === `p${tier}${i}` ? "✓ Copied" : "Copy Prompt"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home2() {
  const [page, setPage] = useState("home");
  const [pf,   setPf]   = useState("");
  const [ec,   setEc]   = useState(0);
  const [sc,   setSc]   = useState(0);

  function toScript(t) { setPf(t); setPage("script"); }

  return (
    <>
      <Head>
        <title>EN·CIS — Elevation Nation Content Intelligence System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Elevation Nation Content Intelligence System for @everydayelevations" />
      </Head>
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Barlow','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
        <nav style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px", display:"flex", alignItems:"center", gap:0, position:"sticky", top:0, zIndex:100, overflowX:"auto" }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:4, color:C.accent, marginRight:20, padding:"13px 0", whiteSpace:"nowrap", flexShrink:0 }}>EN·CIS</div>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ background:"transparent", border:"none", borderBottom:`2px solid ${page === item.id ? C.accent : "transparent"}`, color:page === item.id ? C.text : C.muted, padding:"13px 12px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", whiteSpace:"nowrap", marginBottom:-1, flexShrink:0 }}>
              {item.icon} {item.label}
            </button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7, flexShrink:0, paddingLeft:12 }}>
            <span style={{ color:C.muted, fontSize:10, whiteSpace:"nowrap" }}>@everydayelevations</span>
            <span style={{ background:C.accent, color:"#fff", borderRadius:4, padding:"2px 7px", fontSize:9, fontWeight:800, letterSpacing:1, whiteSpace:"nowrap" }}>ELEVATION NATION</span>
          </div>
        </nav>
        <div style={{ flex:1, overflowY:"auto" }}>
          {page === "home"    && <Home go={setPage} ec={ec} sc={sc} />}
          {page === "extract" && <Extract onScript={toScript} onCount={() => setEc(n => n + 1)} />}
          {page === "script"  && <Script prefill={pf} onCount={() => setSc(n => n + 1)} />}
          {page === "vault"   && <Vault />}
        </div>
      </div>
    </>
  );
}
