import { useState } from 'react';
import Head from 'next/head';


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
  green:    "#E94560",
  teal:     "#0F3460",
  purple:   "#6E2F8E",
};

const ANGLES = [
  { id:"veteran", label:"Veteran / Resilience",      icon:"🎖️", color:B.navy   },
  { id:"mindset", label:"Mindset & Mental Toughness", icon:"🧠", color:B.purple },
  { id:"wins",    label:"Everyday Wins",              icon:"⚡", color:B.navy   },
];

const NAV = [
  { id:"home",     icon:"⚡", label:"Command Center"    },
  { id:"pipeline", icon:"🚀", label:"Full Pipeline"     },
  { id:"design",   icon:"🎨", label:"Design Studio"     },
  { id:"extract",  icon:"🔍", label:"Insight Extractor" },
  { id:"script",   icon:"🎬", label:"Script Engine"     },
  { id:"vault",    icon:"📋", label:"Prompt Vault"      },
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
    low:    { bg:"#FEF2F2", t:"#9B1C1C", b:"#FCA5A5" },
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
    { n:"03", l:"Generate Script", s:"Ready to film",          c:B.navy   },
    { n:"04", l:"Film + Post",     s:"Elevation Nation grows", c:B.red  },
  ];
  const cards = [
    { id:"pipeline", label:"Full Pipeline",     desc:"Pick a tier and angle. One button runs research, extracts intel, and generates a camera-ready script -- fully automated.", stat:"🚀 One button. Full script.", color:B.red   },
    { id:"design",   label:"Design Studio",     desc:"Generate carousel and static post concepts with slide copy, visual direction, and captions. One tap to open in Canva.", stat:"🎨 Carousel + Static", color:B.red   },
    { id:"extract",  label:"Insight Extractor", desc:"Paste market research. Get competitor intel, content gaps, and ready-to-film Reel ideas.", stat: ec > 0 ? `${ec} session${ec>1?"s":""} run` : "Ready", color:B.navy  },
    { id:"script",   label:"Script Engine",     desc:"Topic + angle in. Full Reel script out -- hook, body, CTA, caption, hashtags.", stat: sc > 0 ? `${sc} script${sc>1?"s":""} written` : "Ready", color:B.navy  },
    { id:"vault",    label:"Prompt Vault",      desc:"12 market research prompts across 4 tiers. Run in Perplexity, feed results into the Extractor.", stat:"12 prompts · 4 tiers", color:B.navy  },
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

  const ec = { high:B.red, medium:B.gold, low:B.red };

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
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Topic + angle → full Reel script in your client's voice. 30-60 seconds, camera ready.</div>
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
              <button onClick={() => copy(ft(), "full")} style={{ background:cp==="full" ? "#FEF2F2" : B.white, color:cp==="full" ? B.red : B.textMid, border:`1px solid ${cp==="full" ? "#FCA5A5" : B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{cp==="full" ? "✓ Copied" : "Copy Script"}</button>
              <button onClick={() => { setScr(null); setErr(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Script</button>
            </div>
          </div>

          <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"12px 16px", marginBottom:18, fontSize:12, color:"#9B1C1C", lineHeight:1.6 }}>
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
                  <button onClick={() => copy(scr.hook, "hook")} style={{ background:"transparent", color:cp==="hook" ? B.red : B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="hook" ? "✓" : "copy"}</button>
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
                      <button onClick={() => copy(line, `b${i}`)} style={{ background:"transparent", color:cp===`b${i}` ? B.red : B.textLight, border:"none", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:600 }}>{cp===`b${i}` ? "✓" : "copy"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <SecLabel text="CTA" />
                  <button onClick={() => copy(scr.cta, "cta")} style={{ background:"transparent", color:cp==="cta" ? B.red : B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="cta" ? "✓" : "copy"}</button>
                </div>
                <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:6 }}>"{scr.cta}"</div>
                <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {scr.ctaNote}</div>
              </Card>
            </div>
          )}

          {tab === "caption" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                <button onClick={() => copy(scr.caption+"\n\n"+scr.hashtags.join(" "),"cap")} style={{ background:cp==="cap"?"#FEF2F2":B.white, color:cp==="cap"?B.red:B.textMid, border:`1px solid ${cp==="cap"?"#FCA5A5":B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>{cp==="cap" ? "✓ Copied" : "Copy Caption + Tags"}</button>
              </div>
              <Card style={{ whiteSpace:"pre-wrap", fontSize:14, lineHeight:1.9, color:B.text }}>{scr.caption}</Card>
            </div>
          )}

          {tab === "hashtags" && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
                <button onClick={() => copy(scr.hashtags.join(" "),"tags")} style={{ background:cp==="tags"?"#FEF2F2":B.white, color:cp==="tags"?B.red:B.textMid, border:`1px solid ${cp==="tags"?"#FCA5A5":B.border}`, borderRadius:8, padding:"8px 14px", fontSize:12, cursor:"pointer" }}>{cp==="tags" ? "✓ Copied" : "Copy All"}</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {scr.hashtags.map((tag, i) => (
                  <div key={i} onClick={() => copy(tag, `t${i}`)}
                    style={{ background:cp===`t${i}`?"#FEF2F2":B.white, border:`1px solid ${cp===`t${i}`?"#FCA5A5":B.border}`, color:cp===`t${i}`?B.red:B.text, borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
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
                      style={{ background:cp===`p${tier}${i}`?"#FEF2F2":B.offWhite, color:cp===`p${tier}${i}`?B.red:B.textMid, border:`1px solid ${cp===`p${tier}${i}`?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
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


const TIER_PROMPTS = {
  "Tier 1": "Who is the core audience following health and wellness mindset podcasts on Instagram in 2026? Break down by age, pain points, content consumption habits, and what motivates them to follow a new account. Compare @hubermanlab, @jayshetty, and @richroll audiences specifically. Sources not older than 3 months.",
  "Tier 2": "Analyze the content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, and @richroll on Instagram. For each: their 3 core content themes, what topic they own that nobody else does, and gaps where audience demand exists but nobody is filling it. Sources not older than 3 months.",
  "Tier 3": "Which health and wellness Instagram creators had the fastest organic follower growth in Q1 2026 and what specific tactics preceded those spikes? Focus on accounts under 100K followers who broke through.",
  "Tier 4": "Research the top 5 fastest-growing health and wellness podcast Instagram accounts right now. For each: follower count, growth rate, content format breakdown, posting frequency, and the single tactic most responsible for their growth.",
};

const PIPELINE_ANGLES = [
  { id:"veteran", label:"Veteran / Resilience",      icon:"🎖️" },
  { id:"mindset", label:"Mindset & Mental Toughness", icon:"🧠" },
  { id:"wins",    label:"Everyday Wins",              icon:"⚡" },
];

const PIPELINE_EP = `You are the Elevation Nation Content Intelligence Engine for @everydayelevations. Analyze this research and return ONLY JSON:
{"summary":"2-3 sentence synthesis","reelIdeas":[{"title":"hook-driven title","hook":"exact opening line","why":"why drives follows","cta":"specific CTA"}],"topGap":"single most important content gap in one sentence","elevationNationAngle":"how to leverage Elevation Nation community identity"}`;

const PIPELINE_SP = `You are a Reel script writer for @everydayelevations. VOICE: Conversational, no fluff, direct, short punchy sentences, Elevation Nation community woven in. TARGET: 30-60 seconds. Return ONLY JSON:
{"hook":"first line","hookNote":"delivery direction","body":["l1","l2","l3","l4","l5"],"bodyNotes":["n1","n2","n3","n4","n5"],"cta":"closing line","ctaNote":"how to land it","onScreenText":"opening overlay","caption":"full Instagram caption 3-5 paragraphs","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"],"estimatedSeconds":45}`;

function Pipeline() {
  const [tier,   setTier]   = useState("");
  const [angle,  setAngle]  = useState("");
  const [stage,  setStage]  = useState("idle"); // idle | researching | extracting | scripting | done
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState(null);
  const [cp,     setCp]     = useState("");
  const [tab,    setTab]    = useState("script");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function runPipeline() {
    if (!tier || !angle) return;
    setStage("researching"); setError(null); setResult(null);
    try {
      // Step 1 -- Perplexity research
      const researchRes = await fetch('/api/perplexity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: TIER_PROMPTS[tier] })
      });
      const researchData = await researchRes.json();
      const research = researchData.text;
      if (!research) throw new Error("Research failed");

      // Step 2 -- Extract intelligence
      setStage("extracting");
      const extractRes = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: PIPELINE_EP, message: `Analyze for @everydayelevations:\n\n${research}` })
      });
      const extractData = await extractRes.json();
      const intel = JSON.parse(extractData.text.replace(/```json|```/g, '').trim());
      const topIdea = intel.reelIdeas?.[0];
      if (!topIdea) throw new Error("Extraction failed");

      // Step 3 -- Generate script
      setStage("scripting");
      const angleLabel = PIPELINE_ANGLES.find(a => a.id === angle)?.label;
      const scriptRes = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: PIPELINE_SP, message: `Topic: ${topIdea.title}\nAngle: ${angleLabel}\nHook idea: ${topIdea.hook}\nContext: ${intel.elevationNationAngle}` })
      });
      const scriptData = await scriptRes.json();
      const scr = JSON.parse(scriptData.text.replace(/```json|```/g, '').trim());

      setResult({ intel, scr, topIdea });
      setStage("done");
    } catch(e) {
      setError("Pipeline failed. Check your Perplexity API key in Vercel environment variables.");
      setStage("idle");
    }
  }

  const stageLabel = { idle:"", researching:"Running market research...", extracting:"Extracting intelligence...", scripting:"Generating script..." };
  const stagePct   = { idle:0, researching:33, extracting:66, scripting:90, done:100 };

  const ft = () => result?.scr ? [
    `[ON SCREEN: ${result.scr.onScreenText}]`, ``,
    `HOOK: "${result.scr.hook}"`, `(${result.scr.hookNote})`, ``,
    ...result.scr.body.map((l, i) => `"${l}"\n(${result.scr.bodyNotes[i]})`), ``,
    `CTA: "${result.scr.cta}"`, `(${result.scr.ctaNote})`
  ].join("\n") : "";

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>FULL PIPELINE</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Pick a research tier and content angle. One button does everything -- research, extraction, and script generation.</div>
      </div>

      {stage === "idle" || stage === "researching" || stage === "extracting" || stage === "scripting" ? (
        <>
          {/* Tier selector */}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Research Tier</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {["Tier 1","Tier 2","Tier 3","Tier 4"].map(t => (
                <div key={t} onClick={() => stage==="idle" && setTier(t)}
                  style={{ background:tier===t ? B.navy : B.white, border:`2px solid ${tier===t ? B.navy : B.border}`, borderRadius:10, padding:"14px 16px", cursor:stage!=="idle"?"not-allowed":"pointer", transition:"all 0.15s", opacity:stage!=="idle"?0.6:1 }}>
                  <div style={{ color:tier===t ? B.red : B.textLight, fontFamily:"'Bebas Neue',sans-serif", fontSize:22, lineHeight:1 }}>{t.split(" ")[1]}</div>
                  <div style={{ color:tier===t ? B.white : B.textMid, fontWeight:700, fontSize:11, marginTop:3 }}>{t}</div>
                  <div style={{ color:tier===t ? "rgba(255,255,255,0.6)" : B.textLight, fontSize:10, marginTop:2, lineHeight:1.4 }}>
                    {t==="Tier 1"?"Audience intel":t==="Tier 2"?"Content gaps":t==="Tier 3"?"Growth tactics":"Deep research"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Angle selector */}
          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {PIPELINE_ANGLES.map(a => (
                <div key={a.id} onClick={() => stage==="idle" && setAngle(a.id)}
                  style={{ background:angle===a.id ? B.navy : B.white, border:`2px solid ${angle===a.id ? B.navy : B.border}`, borderRadius:10, padding:"14px", cursor:stage!=="idle"?"not-allowed":"pointer", transition:"all 0.15s", opacity:stage!=="idle"?0.6:1 }}>
                  <div style={{ fontSize:18, marginBottom:5 }}>{a.icon}</div>
                  <div style={{ color:angle===a.id ? B.white : B.textMid, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {stage !== "idle" && (
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:B.red, fontSize:12, fontWeight:700 }}>{stageLabel[stage]}</span>
                <span style={{ color:B.textLight, fontSize:12 }}>{stagePct[stage]}%</span>
              </div>
              <div style={{ background:B.border, borderRadius:4, height:6, overflow:"hidden" }}>
                <div style={{ background:B.red, height:"100%", width:`${stagePct[stage]}%`, transition:"width 0.5s ease", borderRadius:4 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                {["Market Research","Extract Intel","Generate Script"].map((s, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background: stagePct[stage] > (i+1)*30 ? B.red : B.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:B.white, fontWeight:700, flexShrink:0 }}>
                      {stagePct[stage] > (i+1)*30 ? "✓" : i+1}
                    </div>
                    <span style={{ color: stagePct[stage] > (i+1)*30 ? B.navy : B.textLight, fontSize:11, fontWeight:600 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"12px 16px", fontSize:13, marginBottom:16 }}>{error}</div>}

          <button onClick={runPipeline} disabled={!tier || !angle || stage !== "idle"}
            style={{ background:(!tier||!angle||stage!=="idle") ? "#CBD5E0" : B.red, color:B.white, border:"none", borderRadius:8, padding:"14px 32px", fontSize:15, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:(!tier||!angle||stage!=="idle")?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:12, transition:"background 0.2s" }}>
            {stage !== "idle" ? <><Spin />Running Pipeline...</> : "🚀 Run Full Pipeline"}
          </button>
        </>
      ) : (
        /* Results */
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Pipeline Complete</div>
              <div style={{ display:"flex", gap:8, marginTop:5 }}>
                <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{tier}</span>
                <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{PIPELINE_ANGLES.find(a=>a.id===angle)?.icon} {PIPELINE_ANGLES.find(a=>a.id===angle)?.label}</span>
              </div>
            </div>
            <button onClick={() => { setStage("idle"); setResult(null); setTier(""); setAngle(""); }}
              style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"9px 18px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>
              Run Again
            </button>
          </div>

          {/* Intel summary */}
          <Card style={{ borderLeft:`3px solid ${B.red}`, marginBottom:16 }}>
            <SecLabel text="Research Summary" />
            <div style={{ color:B.text, fontSize:13, lineHeight:1.8, fontStyle:"italic", marginBottom:10 }}>{result.intel.summary}</div>
            <div style={{ background:B.offWhite, borderRadius:6, padding:"10px 14px" }}>
              <span style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Top Gap: </span>
              <span style={{ color:B.text, fontSize:12 }}>{result.intel.topGap}</span>
            </div>
          </Card>

          {/* Reel idea that was chosen */}
          <Card style={{ background:"#FEF2F2", borderColor:"#FCA5A5", marginBottom:16 }}>
            <SecLabel text="Top Reel Idea Identified" />
            <div style={{ color:B.navy, fontWeight:700, fontSize:14, marginBottom:6 }}>{result.topIdea.title}</div>
            <div style={{ color:B.red, fontSize:13, fontStyle:"italic", marginBottom:6 }}>"{result.topIdea.hook}"</div>
            <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{result.topIdea.why}</div>
          </Card>

          {/* Script tabs */}
          <div style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:12, padding:"20px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <SecLabel text="Generated Script" />
              <button onClick={() => copy(ft(), "full")} style={{ background:cp==="full"?"#FEF2F2":B.offWhite, color:cp==="full"?B.red:B.textMid, border:`1px solid ${cp==="full"?"#FCA5A5":B.border}`, borderRadius:6, padding:"6px 13px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {cp==="full" ? "✓ Copied" : "Copy Full Script"}
              </button>
            </div>
            <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:16 }}>
              {["script","caption","hashtags"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?B.red:"transparent"}`, color:tab===t?B.navy:B.textLight, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>
                  {t}
                </button>
              ))}
            </div>

            {tab==="script" && result.scr && (
              <div>
                <div style={{ background:"#FFFBF0", border:`1px solid #FCD34D`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                  <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>On Screen Text</div>
                  <div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{result.scr.onScreenText}"</div>
                </div>
                <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"13px 16px", marginBottom:11 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>Hook · 0-3 sec</span>
                    <button onClick={() => copy(result.scr.hook,"hook")} style={{ background:"transparent", color:cp==="hook"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="hook"?"✓":"copy"}</button>
                  </div>
                  <div style={{ color:B.navy, fontSize:16, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:5 }}>"{result.scr.hook}"</div>
                  <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {result.scr.hookNote}</div>
                </div>
                <div style={{ marginBottom:11 }}>
                  <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:7 }}>Body</div>
                  {result.scr.body.map((line, i) => (
                    <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", marginBottom:6 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:4 }}>"{line}"</div>
                          <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {result.scr.bodyNotes[i]}</div>
                        </div>
                        <button onClick={() => copy(line,`b${i}`)} style={{ background:"transparent", color:cp===`b${i}`?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:600 }}>{cp===`b${i}`?"✓":"copy"}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"13px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>CTA</span>
                    <button onClick={() => copy(result.scr.cta,"cta")} style={{ background:"transparent", color:cp==="cta"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="cta"?"✓":"copy"}</button>
                  </div>
                  <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:5 }}>"{result.scr.cta}"</div>
                  <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {result.scr.ctaNote}</div>
                </div>
              </div>
            )}
            {tab==="caption" && result.scr && (
              <div>
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                  <button onClick={() => copy(result.scr.caption+"\n\n"+result.scr.hashtags.join(" "),"cap")} style={{ background:cp==="cap"?"#FEF2F2":B.offWhite, color:cp==="cap"?B.red:B.textMid, border:`1px solid ${cp==="cap"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="cap"?"✓ Copied":"Copy Caption + Tags"}</button>
                </div>
                <div style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:9, padding:"16px 20px", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{result.scr.caption}</div>
              </div>
            )}
            {tab==="hashtags" && result.scr && (
              <div>
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                  <button onClick={() => copy(result.scr.hashtags.join(" "),"tags")} style={{ background:cp==="tags"?"#FEF2F2":B.offWhite, color:cp==="tags"?B.red:B.textMid, border:`1px solid ${cp==="tags"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="tags"?"✓ Copied":"Copy All"}</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {result.scr.hashtags.map((tag, i) => (
                    <div key={i} onClick={() => copy(tag,`t${i}`)} style={{ background:cp===`t${i}`?"#FEF2F2":B.white, border:`1px solid ${cp===`t${i}`?"#FCA5A5":B.border}`, color:cp===`t${i}`?B.red:B.text, borderRadius:8, padding:"9px 14px", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>{tag}</div>
                  ))}
                </div>
                <div style={{ color:B.textLight, fontSize:12, marginTop:12, fontStyle:"italic" }}>Drop these in your first comment to keep the caption clean.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const DESIGN_PROMPT = `You are a social media content designer for @everydayelevations — a health, wellness and mindset Instagram account. Brand colors: Navy #0A1628, Red #E94560, White #FFFFFF.

Given a topic and angle, generate BOTH a carousel post concept AND a static post concept. Return ONLY JSON:
{
  "carousel": {
    "title": "carousel series title",
    "slideCount": 6,
    "slides": [
      { "slideNumber": 1, "type": "cover", "headline": "bold hook headline", "subtext": "1 line supporting text", "visualDirection": "what the background/image should show" },
      { "slideNumber": 2, "type": "content", "headline": "slide headline", "subtext": "2-3 lines of value", "visualDirection": "visual suggestion" },
      { "slideNumber": 3, "type": "content", "headline": "slide headline", "subtext": "2-3 lines of value", "visualDirection": "visual suggestion" },
      { "slideNumber": 4, "type": "content", "headline": "slide headline", "subtext": "2-3 lines of value", "visualDirection": "visual suggestion" },
      { "slideNumber": 5, "type": "content", "headline": "slide headline", "subtext": "2-3 lines of value", "visualDirection": "visual suggestion" },
      { "slideNumber": 6, "type": "cta", "headline": "CTA headline", "subtext": "follow or comment prompt", "visualDirection": "brand closing slide" }
    ],
    "caption": "full Instagram caption for the carousel",
    "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"]
  },
  "static": {
    "headline": "bold single headline under 8 words",
    "subtext": "supporting line under 12 words",
    "bodyText": "2-3 sentences of value content",
    "cta": "short action phrase",
    "visualDirection": "describe the image/background concept in detail",
    "colorUsage": "how to use the brand colors on this specific post",
    "caption": "full Instagram caption for the static post",
    "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"]
  }
}`;

function DesignStudio() {
  const [topic,   setTopic]   = useState("");
  const [angle,   setAngle]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [cp,      setCp]      = useState("");
  const [view,    setView]    = useState("carousel"); // carousel | static

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  function openCanva(type) {
    const base = type === "carousel"
      ? "https://www.canva.com/design/DAGAAAAAAAAo/edit"
      : "https://www.canva.com/design/DAGAAAAAAAAo/edit";
    // Open Canva with Instagram dimensions
    const url = type === "carousel"
      ? "https://www.canva.com/create/instagram-posts/"
      : "https://www.canva.com/create/instagram-posts/";
    window.open(url, "_blank");
  }

  async function generate() {
    if (!topic.trim() || !angle) return;
    setLoading(true); setError(null); setResult(null);
    const a = PIPELINE_ANGLES.find(x => x.id === angle);
    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: DESIGN_PROMPT, message: `Topic: ${topic}\nAngle: ${a?.label}\nGenerate carousel and static post concepts for @everydayelevations.` })
      });
      const d = await res.json();
      const parsed = JSON.parse(d.text.replace(/```json|```/g, '').trim());
      setResult(parsed);
    } catch { setError("Generation failed. Try again."); }
    finally { setLoading(false); }
  }

  const slideColors = { cover: B.navy, content: B.white, cta: B.red };
  const slideTextColors = { cover: B.white, content: B.navy, cta: B.white };

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>DESIGN STUDIO</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Generate carousel and static post concepts -- slide copy, visual direction, captions. One tap to open in Canva.</div>
      </div>

      {!result ? (
        <>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Post Topic</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. 5 mindset shifts that changed how I handle hard days"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 16px", fontSize:14, fontFamily:"'Barlow',sans-serif" }} />
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {PIPELINE_ANGLES.map(a => (
                <div key={a.id} onClick={() => setAngle(a.id)}
                  style={{ background:angle===a.id ? B.navy : B.white, border:`2px solid ${angle===a.id ? B.navy : B.border}`, borderRadius:10, padding:"14px", cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ fontSize:18, marginBottom:5 }}>{a.icon}</div>
                  <div style={{ color:angle===a.id ? B.white : B.textMid, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"12px 16px", fontSize:13, marginBottom:16 }}>{error}</div>}

          <button onClick={generate} disabled={loading || !topic.trim() || !angle}
            style={{ background:(!topic.trim()||!angle||loading) ? "#CBD5E0" : B.red, color:B.white, border:"none", borderRadius:8, padding:"14px 32px", fontSize:15, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:(!topic.trim()||!angle||loading)?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:12 }}>
            {loading ? <><Spin />Generating Concepts...</> : "🎨 Generate Design Concepts"}
          </button>

          {/* Brand colors preview */}
          <div style={{ marginTop:32, background:B.white, border:`1px solid ${B.border}`, borderRadius:12, padding:"20px 24px" }}>
            <SecLabel text="Your Brand Colors" />
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              {[{ color:B.navy, label:"Navy #0A1628" }, { color:B.red, label:"Red #E94560" }, { color:B.white, label:"White #FFFFFF", bordered:true }].map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:6, background:c.color, border:c.bordered ? `1px solid ${B.border}` : "none" }} />
                  <span style={{ color:B.textMid, fontSize:12 }}>{c.label}</span>
                </div>
              ))}
            </div>
            <div style={{ color:B.textLight, fontSize:11, marginTop:10, fontStyle:"italic" }}>These colors are baked into every concept generated. When you open Canva, apply them using your brand kit.</div>
          </div>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Design Concepts Ready</div>
            <button onClick={() => { setResult(null); setError(null); }}
              style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"9px 18px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>
              New Concept
            </button>
          </div>

          {/* Format toggle */}
          <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:24 }}>
            {[{ id:"carousel", label:"🎠 Carousel Post" }, { id:"static", label:"🖼️ Static Post" }].map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{ background:"transparent", border:"none", borderBottom:`2px solid ${view===t.id ? B.red : "transparent"}`, color:view===t.id ? B.navy : B.textLight, padding:"10px 20px", fontSize:13, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", marginBottom:-1 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* CAROUSEL VIEW */}
          {view === "carousel" && result.carousel && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ color:B.navy, fontWeight:800, fontSize:15 }}>{result.carousel.title}</div>
                  <div style={{ color:B.textLight, fontSize:12, marginTop:3 }}>{result.carousel.slideCount} slides · Instagram Carousel</div>
                </div>
                <button onClick={() => openCanva("carousel")}
                  style={{ background:B.navy, color:B.white, border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                  Open in Canva ↗
                </button>
              </div>

              {/* Slide preview */}
              <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:12, marginBottom:20 }}>
                {result.carousel.slides.map((slide, i) => (
                  <div key={i} style={{ flexShrink:0, width:160, background:slideColors[slide.type]||B.white, border:`1px solid ${B.border}`, borderRadius:10, padding:"14px", position:"relative", minHeight:200 }}>
                    <div style={{ position:"absolute", top:8, right:8, background:B.red, color:B.white, borderRadius:3, padding:"2px 6px", fontSize:9, fontWeight:800 }}>{slide.slideNumber}</div>
                    <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:slide.type==="content" ? B.textLight : "rgba(255,255,255,0.6)", marginBottom:8 }}>{slide.type}</div>
                    <div style={{ color:slideTextColors[slide.type]||B.navy, fontWeight:800, fontSize:12, lineHeight:1.3, marginBottom:8, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:0.5 }}>{slide.headline}</div>
                    <div style={{ color:slide.type==="content" ? B.textMid : "rgba(255,255,255,0.8)", fontSize:10, lineHeight:1.5 }}>{slide.subtext}</div>
                    <div style={{ marginTop:10, padding:"6px 8px", background:"rgba(0,0,0,0.1)", borderRadius:4 }}>
                      <div style={{ color:slide.type==="content" ? B.textLight : "rgba(255,255,255,0.6)", fontSize:9, fontStyle:"italic", lineHeight:1.4 }}>📸 {slide.visualDirection}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide copy list */}
              <Card>
                <SecLabel text="Slide Copy -- Ready to Paste into Canva" />
                {result.carousel.slides.map((slide, i) => (
                  <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:12, marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ background:slide.type==="cover" ? B.navy : slide.type==="cta" ? B.red : B.offWhite, color:slide.type==="content" ? B.textMid : B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700, textTransform:"uppercase" }}>Slide {slide.slideNumber}</span>
                        <span style={{ color:B.textLight, fontSize:11 }}>{slide.type}</span>
                      </div>
                      <button onClick={() => copy(`${slide.headline}\n${slide.subtext}`, `slide${i}`)}
                        style={{ background:cp===`slide${i}`?"#FEF2F2":B.offWhite, color:cp===`slide${i}`?B.red:B.textMid, border:`1px solid ${cp===`slide${i}`?"#FCA5A5":B.border}`, borderRadius:5, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        {cp===`slide${i}` ? "✓" : "copy"}
                      </button>
                    </div>
                    <div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:3 }}>{slide.headline}</div>
                    <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginBottom:4 }}>{slide.subtext}</div>
                    <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📸 {slide.visualDirection}</div>
                  </div>
                ))}
              </Card>

              {/* Caption */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <SecLabel text="Caption" />
                  <button onClick={() => copy(result.carousel.caption+"\n\n"+result.carousel.hashtags.join(" "),"cc")}
                    style={{ background:cp==="cc"?"#FEF2F2":B.offWhite, color:cp==="cc"?B.red:B.textMid, border:`1px solid ${cp==="cc"?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    {cp==="cc" ? "✓ Copied" : "Copy Caption + Tags"}
                  </button>
                </div>
                <div style={{ color:B.text, fontSize:13, lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom:14 }}>{result.carousel.caption}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {result.carousel.hashtags.map((tag, i) => (
                    <div key={i} onClick={() => copy(tag,`ct${i}`)} style={{ background:cp===`ct${i}`?"#FEF2F2":B.offWhite, border:`1px solid ${cp===`ct${i}`?"#FCA5A5":B.border}`, color:cp===`ct${i}`?B.red:B.text, borderRadius:6, padding:"7px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{tag}</div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* STATIC VIEW */}
          {view === "static" && result.static && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
                <div style={{ color:B.textLight, fontSize:12 }}>Single image · Instagram Static Post</div>
                <button onClick={() => openCanva("static")}
                  style={{ background:B.navy, color:B.white, border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                  Open in Canva ↗
                </button>
              </div>

              {/* Static post preview */}
              <div style={{ background:B.navy, borderRadius:16, padding:"32px", marginBottom:20, position:"relative", overflow:"hidden", minHeight:240 }}>
                <div style={{ position:"absolute", top:0, right:0, width:"60%", height:"100%", background:`radial-gradient(ellipse at top right, ${B.red}22 0%, transparent 70%)`, pointerEvents:"none" }} />
                <div style={{ position:"relative" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(24px,4vw,40px)", color:B.white, letterSpacing:1, lineHeight:1.1, marginBottom:10 }}>{result.static.headline}</div>
                  <div style={{ color:B.red, fontSize:14, fontWeight:600, marginBottom:12 }}>{result.static.subtext}</div>
                  <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.7, maxWidth:480, marginBottom:16 }}>{result.static.bodyText}</div>
                  <div style={{ background:B.red, color:B.white, borderRadius:6, padding:"8px 18px", fontSize:12, fontWeight:700, display:"inline-block" }}>{result.static.cta}</div>
                </div>
              </div>

              {/* Copy sections */}
              <Card>
                <SecLabel text="Post Copy -- Ready to Paste into Canva" />
                {[
                  { label:"Headline", value:result.static.headline },
                  { label:"Subtext", value:result.static.subtext },
                  { label:"Body Text", value:result.static.bodyText },
                  { label:"CTA", value:result.static.cta },
                ].map((item, i) => (
                  <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{item.label}</span>
                      <button onClick={() => copy(item.value,`s${i}`)} style={{ background:cp===`s${i}`?"#FEF2F2":B.offWhite, color:cp===`s${i}`?B.red:B.textMid, border:`1px solid ${cp===`s${i}`?"#FCA5A5":B.border}`, borderRadius:5, padding:"3px 9px", fontSize:11, fontWeight:600, cursor:"pointer" }}>{cp===`s${i}`?"✓":"copy"}</button>
                    </div>
                    <div style={{ color:B.text, fontSize:13, lineHeight:1.6 }}>{item.value}</div>
                  </div>
                ))}
                <div style={{ marginTop:8 }}>
                  <div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Visual Direction</div>
                  <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, fontStyle:"italic" }}>📸 {result.static.visualDirection}</div>
                  <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, fontStyle:"italic", marginTop:4 }}>🎨 {result.static.colorUsage}</div>
                </div>
              </Card>

              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <SecLabel text="Caption" />
                  <button onClick={() => copy(result.static.caption+"\n\n"+result.static.hashtags.join(" "),"sc")} style={{ background:cp==="sc"?"#FEF2F2":B.offWhite, color:cp==="sc"?B.red:B.textMid, border:`1px solid ${cp==="sc"?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>{cp==="sc"?"✓ Copied":"Copy Caption + Tags"}</button>
                </div>
                <div style={{ color:B.text, fontSize:13, lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom:14 }}>{result.static.caption}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {result.static.hashtags.map((tag, i) => (
                    <div key={i} onClick={() => copy(tag,`st${i}`)} style={{ background:cp===`st${i}`?"#FEF2F2":B.offWhite, border:`1px solid ${cp===`st${i}`?"#FCA5A5":B.border}`, color:cp===`st${i}`?B.red:B.text, borderRadius:6, padding:"7px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{tag}</div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
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
          {page==="home"     && <Home go={setPage} ec={ec} sc={sc} />}
          {page==="pipeline" && <Pipeline />}
          {page==="design"   && <DesignStudio />}
          {page==="extract"  && <Extract onScript={toScript} onCount={() => setEc(n => n+1)} />}
          {page==="script"   && <Script prefill={pf} onCount={() => setSc(n => n+1)} />}
          {page==="vault"    && <Vault />}
        </div>
      </div>
    </>
  );
}
