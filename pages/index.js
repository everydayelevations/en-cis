import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const B = {
  navy:     "#0A1628",
  navyMid:  "#0F2040",
  navyLight:"#1A3A5C",
  red:      "#E94560",
  redDark:  "#9B2335",
  white:    "#FFFFFF",
  offWhite: "#F8F9FC",
  border:   "#E2E8F0",
  borderDark:"#1E2D45",
  text:     "#0A1628",
  textMid:  "#4A5568",
  textLight:"#718096",
  gold:     "#F5A623",
  green:    "#27AE60",
  teal:     "#0A8A7A",
  purple:   "#6E2F8E",
};

const ANGLES = [
  { id:"veteran", label:"Veteran / Resilience",      icon:"🎖️", color:B.navy   },
  { id:"mindset", label:"Mindset & Mental Toughness", icon:"🧠", color:B.purple },
  { id:"wins",    label:"Everyday Wins",              icon:"⚡", color:B.teal   },
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
  <div style={{ width:14, height:14, border:`2px solid rgba(255,255,255,0.3)`, borderTop:`2px solid ${B.white}`, borderRadius:"50%", animation:"spin 0.7s linear infinite", flexShrink:0 }} />
);

const Bdg = ({ label, type }) => {
  const m = {
    high:   { bg:"#FEF2F2", t:"#9B1C1C", b:"#FCA5A5" },
    medium: { bg:"#FFFBEB", t:"#92400E", b:"#FCD34D" },
    low:    { bg:"#F0FDF4", t:"#14532D", b:"#86EFAC" },
  };
  const co = m[type] || m.medium;
  return <span style={{ background:co.bg, color:co.t, border:`1px solid ${co.b}`, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{label}</span>;
};

const Card = ({ children, style={} }) => (
  <div style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:12, padding:"20px 24px", marginBottom:16, ...style }}>
    {children}
  </div>
);

const SecLabel = ({ text }) => (
  <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:12 }}>{text}</div>
);

const RedBtn = ({ onClick, disabled, loading, children }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:disabled ? "#CBD5E0" : B.red, color:B.white, border:"none", borderRadius:8, padding:"11px 24px", fontSize:13, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:disabled ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:9, transition:"background 0.2s" }}>
    {children}
  </button>
);

const OutlineBtn = ({ onClick, children }) => (
  <button onClick={onClick}
    style={{ background:"transparent", color:B.textMid, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 16px", fontSize:12, cursor:"pointer" }}>
    {children}
  </button>
);

function Home({ go, ec, sc }) {
  const steps = [
    { n:"01", l:"Market Research", s:"Run Vault prompts",      c:B.navy   },
    { n:"02", l:"Extract Intel",   s:"Gaps + competitors",     c:B.red    },
    { n:"03", l:"Generate Script", s:"In Jason's voice",       c:B.teal   },
    { n:"04", l:"Film + Post",     s:"Elevation Nation grows", c:B.green  },
  ];
  const cards = [
    { id:"extract", label:"Insight Extractor", desc:"Paste market research. Get competitor intel, content gaps, and ready-to-film Reel ideas.", stat: ec > 0 ? `${ec} session${ec>1?"s":""} run` : "Ready", color:B.red   },
    { id:"script",  label:"Script Engine",     desc:"Topic + angle in. Full Reel script in Jason's voice out. Hook, body, CTA, caption, hashtags.", stat: sc > 0 ? `${sc} script${sc>1?"s":""} written` : "Ready", color:B.navy  },
    { id:"vault",   label:"Prompt Vault",      desc:"12 market research prompts across 4 tiers. Run in Perplexity, feed results into the Extractor.", stat:"12 prompts · 4 tiers", color:B.teal  },
  ];

  return (
    <div style={{ animation:"fu 0.4s ease" }}>
      {/* Hero -- dark navy with logo */}
      <div style={{ background:`linear-gradient(160deg, ${B.navy} 0%, ${B.navyMid} 60%, #0A1F3C 100%)`, padding:"48px 40px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:0, width:"40%", height:"100%", background:`radial-gradient(ellipse at top right, ${B.red}18 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:200, height:200, borderRadius:"50%", background:`${B.navyLight}44`, pointerEvents:"none" }} />

        <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:32, position:"relative" }}>
          <img src="/E-E-Logo.jpg" alt="Everyday Elevations" style={{ width:80, height:80, borderRadius:12, objectFit:"cover", border:`2px solid ${B.red}` }} />
          <div>
            <div style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:B.white, lineHeight:1 }}>ELEVATION NATION</div>
            <div style={{ fontSize:"clamp(10px,1.5vw,13px)", fontWeight:600, letterSpacing:5, color:B.red, textTransform:"uppercase", marginTop:4 }}>Content Intelligence System</div>
          </div>
        </div>

        <div style={{ fontSize:14, color:"rgba(255,255,255,0.65)", maxWidth:500, lineHeight:1.8, marginBottom:36, position:"relative" }}>
          Your end-to-end Instagram growth engine for <span style={{ color:B.red, fontWeight:600 }}>@everydayelevations</span>. Market research feeds extraction. Extraction feeds scripts. Scripts grow the Elevation Nation.
        </div>

        {/* Workflow steps */}
        <div style={{ display:"flex", alignItems:"stretch", gap:0, flexWrap:"wrap", position:"relative" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ background:"rgba(255,255,255,0.06)", border:`1px solid rgba(255,255,255,0.12)`, borderTop:`2px solid ${s.c}`, borderRadius:8, padding:"14px 18px", minWidth:120 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:s.c, lineHeight:1 }}>{s.n}</div>
                <div style={{ color:B.white, fontSize:11, fontWeight:700, marginTop:3 }}>{s.l}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10, marginTop:2 }}>{s.s}</div>
              </div>
              {i < 3 && <div style={{ color:"rgba(255,255,255,0.2)", fontSize:16, padding:"0 6px" }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Tool cards */}
      <div style={{ padding:"32px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:24 }}>
          {cards.map(card => (
            <div key={card.id} onClick={() => go(card.id)}
              style={{ background:B.white, border:`1px solid ${B.border}`, borderTop:`3px solid ${card.color}`, borderRadius:12, padding:"22px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"; }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:10 }}>{card.label}</div>
              <div style={{ color:B.textMid, fontSize:13, lineHeight:1.7, marginBottom:16 }}>{card.desc}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ background:card.color+"12", color:card.color, border:`1px solid ${card.color}33`, borderRadius:4, padding:"3px 9px", fontSize:11, fontWeight:700 }}>{card.stat}</span>
                <span style={{ color:card.color, fontSize:12, fontWeight:700 }}>Open →</span>
              </div>
            </div>
          ))}
        </div>

        {/* EN strip */}
        <div style={{ background:B.navy, borderRadius:12, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.red, marginBottom:6 }}>Elevation Nation</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.7, maxWidth:480 }}>Everyday people who refuse to stay where they are. Every script, every piece of content is built to grow this community.</div>
          </div>
          <img src="/E-E-Logo.jpg" alt="EE" style={{ width:48, height:48, borderRadius:8, objectFit:"cover", opacity:0.9, flexShrink:0 }} />
        </div>
      </div>
    </div>
  );
}

function Extract({ onScript, onCount }) {
  const [inp,  setInp]  = useState("");
  const [load, setLoad] = useState(false);
  const [res,  setRes]  = useState(null);
  const [err,  setErr]  = useState(null);
  const [cp,   setCp]   = useState("");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function run() {
    if (!inp.trim()) return;
    setLoad(true); setErr(null); setRes(null);
    try { const d = await ai(EP, `Analyze for @everydayelevations:\n\n${inp}`); setRes(d); onCount(); }
    catch { setErr("Parse failed. Try again or shorten your input."); }
    finally { setLoad(false); }
  }

  const ec = { high:B.red, medium:B.gold, low:B.green };

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>INSIGHT EXTRACTOR</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Paste market research. Get structured intelligence for @everydayelevations.</div>
      </div>

      {!res ? (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <SecLabel text="Paste Research" />
            <span style={{ color:B.textLight, fontSize:11 }}>{inp.length.toLocaleString()} chars</span>
          </div>
          <textarea value={inp} onChange={e => setInp(e.target.value)} disabled={load}
            placeholder="Paste your full Perplexity results here including sources. More context = sharper output."
            style={{ width:"100%", minHeight:180, background:B.offWhite, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          {err && <div style={{ color:B.red, fontSize:12, marginTop:10, padding:"10px 14px", background:"#FEF2F2", borderRadius:6, border:`1px solid #FCA5A5` }}>{err}</div>}
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <RedBtn onClick={run} disabled={load || !inp.trim()}>
              {load ? <><Spin />Extracting...</> : "⚡ Extract Intelligence"}
            </RedBtn>
            {inp && !load && <OutlineBtn onClick={() => setInp("")}>Clear</OutlineBtn>}
          </div>
        </Card>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:1, color:B.navy }}>Intelligence Report</div>
            <button onClick={() => { setRes(null); setInp(""); }} style={{ background:"transparent", color:B.red, border:`1px solid ${B.red}33`, borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ New Analysis</button>
          </div>

          <Card style={{ borderLeft:`3px solid ${B.red}` }}>
            <SecLabel text="Summary" />
            <div style={{ color:B.text, fontSize:14, lineHeight:1.8, fontStyle:"italic" }}>{res.summary}</div>
          </Card>

          <Card style={{ borderLeft:`3px solid ${B.gold}`, background:"#FFFBF0" }}>
            <SecLabel text="Elevation Nation Angle" />
            <div style={{ color:B.text, fontSize:13, lineHeight:1.8 }}>{res.elevationNationAngle}</div>
          </Card>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16, marginBottom:16 }}>
            <Card style={{ margin:0 }}>
              <SecLabel text="🎯 Competitor Intel" />
              {(res.competitors || []).map((c, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <span style={{ color:B.red, fontWeight:700, fontSize:13 }}>{c.handle}</span>
                    <Bdg label={c.threat} type={c.threat} />
                  </div>
                  <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{c.insight}</div>
                </div>
              ))}
            </Card>
            <Card style={{ margin:0 }}>
              <SecLabel text="🕳️ Content Gaps" />
              {(res.contentGaps || []).map((g, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <span style={{ color:B.text, fontWeight:700, fontSize:12 }}>{g.gap}</span>
                    <div style={{ display:"flex", gap:5 }}>
                      <Bdg label={g.priority} type={g.priority} />
                      <span style={{ background:"#EFF6FF", color:"#1D4ED8", border:"1px solid #BFDBFE", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700 }}>{g.format}</span>
                    </div>
                  </div>
                  <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{g.description}</div>
                </div>
              ))}
            </Card>
          </div>

          <Card>
            <SecLabel text="🎬 Ready-to-Film Reel Ideas" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
              {(res.reelIdeas || []).map((r, i) => (
                <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderTop:`2px solid ${B.red}`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ color:B.text, fontWeight:700, fontSize:12, marginBottom:7 }}>{r.title}</div>
                  <div style={{ color:B.red, fontSize:11, fontStyle:"italic", marginBottom:6 }}>"{r.hook}"</div>
                  <div style={{ color:B.textMid, fontSize:11, lineHeight:1.5, marginBottom:10 }}>{r.why}</div>
                  <button onClick={() => onScript(r.title)} style={{ background:B.navy, color:B.white, border:"none", borderRadius:6, padding:"6px 10px", fontSize:11, fontWeight:700, cursor:"pointer", width:"100%" }}>
                    → Send to Script Engine
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SecLabel text="📈 Growth Tactics" />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
              {(res.growthTactics || []).map((t, i) => (
                <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ color:B.text, fontWeight:700, fontSize:12, marginBottom:5 }}>{t.tactic}</div>
                  <div style={{ color:B.textMid, fontSize:11, lineHeight:1.6, marginBottom:8 }}>{t.description}</div>
                  <div style={{ display:"flex", gap:10 }}>
                    <span style={{ fontSize:11, color:B.textLight }}>Effort: <span style={{ color:ec[t.effort]||B.gold, fontWeight:700, textTransform:"capitalize" }}>{t.effort}</span></span>
                    <span style={{ fontSize:11, color:B.textLight }}>Impact: <span style={{ color:ec[t.impact]||B.gold, fontWeight:700, textTransform:"capitalize" }}>{t.impact}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Script({ prefill, onCount }) {
  const [topic, setTopic] = useState(prefill || "");
  const [angle, setAngle] = useState("");
  const [ctx,   setCtx]   = useState("");
  const [load,  setLoad]  = useState(false);
  const [scr,   setScr]   = useState(null);
  const [err,   setErr]   = useState(null);
  const [cp,    setCp]    = useState("");
  const [tab,   setTab]   = useState("script");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function gen() {
    if (!topic.trim() || !angle) return;
    setLoad(true); setErr(null); setScr(null);
    const a = ANGLES.find(x => x.id === angle);
    try { const d = await ai(SP, `Topic: ${topic}\nAngle: ${a?.label}\n${ctx ? `Context: ${ctx}` : ""}`); setScr(d); onCount(); }
    catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }

  const ft = () => scr ? [`[ON SCREEN: ${scr.onScreenText}]`, ``, `HOOK: "${scr.hook}"`, `(${scr.hookNote})`, ``, ...scr.body.map((l, i) => `"${l}"\n(${scr.bodyNotes[i]})`), ``, `CTA: "${scr.cta}"`, `(${scr.ctaNote})`].join("\n") : "";
  const sa = ANGLES.find(x => x.id === angle);

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>SCRIPT ENGINE</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Topic + angle → full Reel script in Jason's voice. 30-60 seconds, ready to film.</div>
      </div>

      {!scr ? (
        <>
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>What's the Reel about?</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. What the Army taught me about starting over"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 16px", fontSize:14, fontFamily:"'Barlow',sans-serif", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }} />
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {ANGLES.map(a => (
                <div key={a.id} onClick={() => setAngle(a.id)}
                  style={{ background:angle === a.id ? B.navy : B.white, border:`2px solid ${angle === a.id ? B.navy : B.border}`, borderRadius:10, padding:"14px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:18, marginBottom:5 }}>{a.icon}</div>
                  <div style={{ color:angle === a.id ? B.white : B.textMid, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>
              Context <span style={{ color:B.textLight, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional -- real details make better scripts)</span>
            </label>
            <textarea value={ctx} onChange={e => setCtx(e.target.value)} rows={3}
              placeholder="Real memory or detail that makes it authentic..."
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>

          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{err}</div>}
          <RedBtn onClick={gen} disabled={load || !topic.trim() || !angle}>
            {load ? <><Spin />Writing Script...</> : "⚡ Generate Script"}
          </RedBtn>
        </>
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:0.5, color:B.navy }}>{topic}</div>
              <div style={{ display:"flex", gap:8, marginTop:6 }}>
                {sa && <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{sa.icon} {sa.label}</span>}
                <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700 }}>~{scr.estimatedSeconds}s</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => copy(ft(), "full")} style={{ background:cp==="full" ? "#F0FDF4" : B.white, color:cp==="full" ? B.green : B.textMid, border:`1px solid ${cp==="full" ? "#86EFAC" : B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{cp==="full" ? "✓ Copied" : "Copy Script"}</button>
              <button onClick={() => { setScr(null); setErr(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Script</button>
            </div>
          </div>

          <div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderLeft:`3px solid ${B.green}`, borderRadius:8, padding:"12px 16px", marginBottom:18, fontSize:12, color:"#14532D", lineHeight:1.6 }}>
            <span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10 }}>Why it drives follows: </span>{scr.whyItWorks}
          </div>

          <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:20 }}>
            {["script","caption","hashtags"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t ? B.red : "transparent"}`, color:tab===t ? B.navy : B.textLight, padding:"10px 18px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>
                {t}
              </button>
            ))}
          </div>

          {tab === "script" && (
            <div>
              <Card style={{ background:"#FFFBF0", borderColor:"#FCD34D" }}>
                <SecLabel text="On Screen Text" />
                <div style={{ color:B.text, fontSize:14, fontWeight:600 }}>"{scr.onScreenText}"</div>
              </Card>
              <Card style={{ borderLeft:`3px solid ${B.red}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <SecLabel text="Hook · 0-3 sec" />
                  <button onClick={() => copy(scr.hook, "hook")} style={{ background:"transparent", color:cp==="hook" ? B.green : B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="hook" ? "✓" : "copy"}</button>
                </div>
                <div style={{ color:B.navy, fontSize:17, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:8 }}>"{scr.hook}"</div>
                <div style={{ color:B.textLight, fontSize:12, fontStyle:"italic" }}>📹 {scr.hookNote}</div>
              </Card>
              <div style={{ marginBottom:16 }}>
                <SecLabel text="Body · 3-50 sec" />
                {scr.body.map((line, i) => (
                  <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 16px", marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ color:B.text, fontSize:13, lineHeight:1.6, marginBottom:5 }}>"{line}"</div>
                        <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {scr.bodyNotes[i]}</div>
                      </div>
                      <button onClick={() => copy(line, `b${i}`)} style={{ background:"transparent", color:cp===`b${i}` ? B.green : B.textLight, border:"none", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:600 }}>{cp===`b${i}` ? "✓" : "copy"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <Card style={{ borderLeft:`3px solid ${B.green}`, background:"#F0FDF4" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <SecLabel text="CTA" />
                  <button onClick={() => copy(scr.cta, "cta")} style={{ background:"transparent", color:cp==="cta" ? B.green : B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="cta" ? "✓" : "copy"}</button>
                </div>
                <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:6 }}>"{scr.cta}"</div>
                <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {scr.ctaNote}</div>
              </Card>
            </div>
          )}

          {tab === "caption" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                <button onClick={() => copy(scr.caption+"\n\n"+scr.hashtags.join(" "),"cap")} style={{ background:cp==="cap"?"#F0FDF4":B.white, color:cp==="cap"?B.green:B.textMid, border:`1px solid ${cp==="cap"?"#86EFAC":B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>{cp==="cap" ? "✓ Copied" : "Copy Caption + Tags"}</button>
              </div>
              <Card style={{ whiteSpace:"pre-wrap", fontSize:14, lineHeight:1.9, color:B.text }}>{scr.caption}</Card>
            </div>
          )}

          {tab === "hashtags" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                <button onClick={() => copy(scr.hashtags.join(" "),"tags")} style={{ background:cp==="tags"?"#F0FDF4":B.white, color:cp==="tags"?B.green:B.textMid, border:`1px solid ${cp==="tags"?"#86EFAC":B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>{cp==="tags" ? "✓ Copied" : "Copy All"}</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {scr.hashtags.map((tag, i) => (
                  <div key={i} onClick={() => copy(tag, `t${i}`)}
                    style={{ background:cp===`t${i}`?"#F0FDF4":B.white, border:`1px solid ${cp===`t${i}`?"#86EFAC":B.border}`, color:cp===`t${i}`?B.green:B.text, borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                    {tag}
                  </div>
                ))}
              </div>
              <div style={{ color:B.textLight, fontSize:12, marginTop:14, fontStyle:"italic" }}>Drop these in your first comment to keep the caption clean.</div>
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
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>PROMPT VAULT</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>12 market research prompts · 4 tiers · Run sequentially for compounding intelligence.</div>
      </div>
      {tiers.map(tier => {
        const tp = PROMPTS.filter(p => p.tier === tier);
        const tc = tp[0].color;
        return (
          <div key={tier} style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <span style={{ background:tc, color:"#fff", borderRadius:4, padding:"3px 12px", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:1 }}>{tier}</span>
              <span style={{ color:tc, fontSize:12, fontWeight:700 }}>{tp[0].focus}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {tp.map((p, i) => (
                <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${tc}`, borderRadius:8, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ color:B.text, fontSize:13, lineHeight:1.7, marginBottom:10 }}>{p.prompt}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>{p.when}</span>
                    <button onClick={() => copy(p.prompt, `p${tier}${i}`)}
                      style={{ background:cp===`p${tier}${i}`?"#F0FDF4":B.offWhite, color:cp===`p${tier}${i}`?B.green:B.textMid, border:`1px solid ${cp===`p${tier}${i}`?"#86EFAC":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                      {cp===`p${tier}${i}` ? "✓ Copied" : "Copy Prompt"}
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

export default function App() {
  const [page, setPage] = useState("home");
  const [pf,   setPf]   = useState("");
  const [ec,   setEc]   = useState(0);
  const [sc,   setSc]   = useState(0);

  function toScript(t) { setPf(t); setPage("script"); }

  return (
    <>
      <Head>
        <title>EN·CIS — Elevation Nation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/E-E-Logo.jpg" />
      </Head>
      <div style={{ minHeight:"100vh", background:B.offWhite, color:B.text, fontFamily:"'Barlow','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap');
          *{box-sizing:border-box;} input,textarea{outline:none;} input:focus,textarea:focus{border-color:${B.red}!important; box-shadow:0 0 0 3px ${B.red}22!important;}
          @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          button{font-family:'Barlow',sans-serif;}
          ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:${B.offWhite};} ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px;}
        `}</style>

        {/* Nav */}
        <nav style={{ background:B.navy, padding:"0 24px", display:"flex", alignItems:"center", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(10,22,40,0.4)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:28, padding:"10px 0" }}>
            <img src="/E-E-Logo.jpg" alt="EE" style={{ width:32, height:32, borderRadius:6, objectFit:"cover" }} />
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:3, color:B.red }}>EN·CIS</span>
          </div>
          <div style={{ display:"flex", overflowX:"auto" }}>
            {NAV.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ background:"transparent", border:"none", borderBottom:`2px solid ${page===item.id ? B.red : "transparent"}`, color:page===item.id ? B.white : "rgba(255,255,255,0.45)", padding:"14px 14px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", whiteSpace:"nowrap", marginBottom:-1 }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft:"auto", paddingLeft:16, flexShrink:0 }}>
            <span style={{ background:B.red, color:B.white, borderRadius:4, padding:"3px 8px", fontSize:9, fontWeight:800, letterSpacing:1 }}>ELEVATION NATION</span>
          </div>
        </nav>

        <div style={{ flex:1, overflowY:"auto" }}>
          {page==="home"    && <Home go={setPage} ec={ec} sc={sc} />}
          {page==="extract" && <Extract onScript={toScript} onCount={() => setEc(n => n+1)} />}
          {page==="script"  && <Script prefill={pf} onCount={() => setSc(n => n+1)} />}
          {page==="vault"   && <Vault />}
        </div>
      </div>
    </>
  );
}
