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
  { id:"veteran",  label:"Veteran / Resilience",        icon:"🎖️", color:B.navy   },
  { id:"mindset",  label:"Mindset & Mental Toughness",   icon:"🧠", color:B.purple },
  { id:"wins",     label:"Everyday Wins",                icon:"⚡", color:B.navy   },
  { id:"outdoor",  label:"Outdoor Living & Community",   icon:"🏔️", color:B.navy   },
  { id:"finance",  label:"Finance & Real Estate",        icon:"💰", color:B.navy   },
  { id:"podcast",  label:"Podcast & Personal Growth",    icon:"🎙️", color:B.navy   },
  { id:"family",   label:"Family & Life Lessons",        icon:"❤️", color:B.navy   },
  { id:"health",   label:"Health & Physical Wellness",   icon:"💪", color:B.navy   },
];

// Dr. Peggy Swarbrick's 8 Dimensions of Wellness -- baked into all content generation
const SWARBRICK_FRAMEWORK = `
CONTENT WELLNESS FRAMEWORK (Dr. Peggy Swarbrick's 8 Dimensions -- apply as relevant):
1. Mental/Emotional Wellness: stress management, emotional balance, mindset resilience
2. Physical Wellness: training, nutrition, recovery, body as a tool for life, endurance
3. Social Wellness: relationships, community, Elevation Nation, connection
4. Environmental Wellness: sustainable lifestyle, Colorado outdoors, personal space and energy
5. Financial Wellness: financial management, real estate, debt reduction, building wealth
6. Intellectual Wellness: cognitive growth, learning, curiosity, podcast insights, continuous education
7. Occupational Wellness: career satisfaction, work-life balance, veteran-to-civilian transition, HR leadership
8. Spiritual Wellness: purpose, meaning, faith, existential peace, legacy

Content Angle to Dimension mapping:
- Veteran/Resilience: Mental/Emotional + Spiritual + Occupational
- Mindset & Mental Toughness: Mental/Emotional + Intellectual + Spiritual
- Everyday Wins: Mental/Emotional + Physical + Intellectual
- Outdoor Living & Community: Environmental + Social + Physical
- Finance & Real Estate: Financial + Occupational + Intellectual
- Podcast & Personal Growth: Intellectual + Spiritual + Mental/Emotional
- Family & Life Lessons: Social + Spiritual + Mental/Emotional
- Health & Physical Wellness: Physical + Mental/Emotional + Environmental

When generating content, identify which 1-2 dimensions are most relevant to the topic and angle, then weave in language and framing that speaks to those dimensions authentically. Do NOT mention "dimensions" or "Swarbrick" explicitly -- the framework should be invisible infrastructure, not content topic.
`;

const NAV = [
  { id:"home",      icon:"⚡", label:"Command Center"    },
  { id:"onboard",   icon:"📋", label:"Onboarding"        },
  { id:"pipeline",  icon:"🚀", label:"Full Pipeline"     },
  { id:"design",    icon:"🎨", label:"Design Studio"     },
  { id:"extract",   icon:"🔍", label:"Insight Extractor" },
  { id:"script",    icon:"🎬", label:"Script Engine"     },
  { id:"vault",     icon:"🗂️", label:"Prompt Vault"      },
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
    { id:"onboard",  label:"Onboarding",        desc:"Complete client intake and generate a full 90-day strategy document using Greenspan's proven framework.", stat:"📋 Strategy Generator", color:B.navy  },
    { id:"pipeline", label:"Full Pipeline",      desc:"Pick a tier and angle. One button runs research, extracts intel, and generates a camera-ready script.", stat:"🚀 One button. Full script.", color:B.red   },
    { id:"design",   label:"Design Studio",      desc:"Generate carousel and static post concepts with slide copy, visual direction, and captions.", stat:"🎨 Carousel + Static", color:B.red   },
    { id:"extract",  label:"Insight Extractor",  desc:"Paste market research. Get competitor intel, content gaps, and ready-to-film Reel ideas.", stat: ec > 0 ? `${ec} session${ec>1?"s":""} run` : "Ready", color:B.navy  },
    { id:"script",   label:"Script Engine",      desc:"Platform + topic + angle in. 3 script variations out. Greenspan SOP standards baked in.", stat: sc > 0 ? `${sc} script${sc>1?"s":""} written` : "Ready", color:B.navy  },
    { id:"vault",    label:"Prompt Vault",       desc:"Market research + platform diagnostics across Instagram, Facebook, YouTube, LinkedIn.", stat:"25+ prompts · 6 tabs", color:B.navy  },
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

const PLATFORMS = [
  { id:"instagram", label:"Instagram Reel",  icon:"📸", format:"30-60 sec vertical video", cta:"60% comment-based · 20% DM · 20% link in bio" },
  { id:"youtube",   label:"YouTube",          icon:"▶️", format:"8-15 min long-form OR 60s Short", cta:"Subscribe + comment within first hour" },
  { id:"facebook",  label:"Facebook",         icon:"👥", format:"60-90 sec native video or post", cta:"Comment-based · event promotion · group" },
  { id:"linkedin",  label:"LinkedIn",         icon:"💼", format:"Text post or 60s native video", cta:"Reaction + comment + DM for deeper engagement" },
];

const CONTENT_TYPES = [
  { id:"educational",    label:"Educational",       icon:"🎓", desc:"Teach something actionable. Optimize for saves." },
  { id:"trend",          label:"Trend-Responsive",  icon:"🔥", desc:"React to trending topic with your unique POV. Optimize for shares." },
  { id:"personal_story", label:"Personal Story",    icon:"❤️", desc:"Real experience. Vulnerability. Optimize for comments + follows." },
];

const SP_MULTI = `You are a social media script writer trained on Greenspan Consulting's content production standards for @everydayelevations.

GREENSPAN CONTENT STANDARDS:
- Four-Layer Viewer Journey: See It → Click It → Watch It → Go Deeper
- Opening: No intro. No fluff. Start with value. High-contrast caption from frame 1. Movement -- no static shots.
- Every piece optimizes for ACTION (saves, shares, comments, follows) not vanity metrics
- Hook must land in first 3 seconds or it's dead
- CTA Distribution: 60% comment-based, 20% DM-trigger, 20% link in bio
- Success metrics priority: Shares + Saves first, then non-follower reach, then follows

VOICE: Conversational, direct, no fluff. Veteran, mindset coach, endurance athlete, father in Colorado. Elevation Nation community identity woven in naturally.

${SWARBRICK_FRAMEWORK}

Generate 3 script variations for the given topic, platform, and content type. Return ONLY JSON:
{
  "platform": "platform name",
  "topic": "topic",
  "variations": [
    {
      "type": "Educational|Trend-Responsive|Personal Story",
      "typeNote": "why this type works for this topic",
      "onScreenText": "opening text overlay",
      "hook": "exact first line -- stops the scroll",
      "hookNote": "delivery direction",
      "body": ["line1","line2","line3","line4","line5"],
      "bodyNotes": ["note1","note2","note3","note4","note5"],
      "cta": "closing line",
      "ctaNote": "how to land it",
      "ctaType": "comment-based|DM-trigger|link-in-bio",
      "caption": "full platform-optimized caption 3-5 paragraphs",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
      "estimatedSeconds": 45,
      "optimizesFor": "saves|shares|comments|follows",
      "whyItWorks": "1-2 sentences on why this drives growth for @everydayelevations"
    }
  ]
}`;

const STITCH_PROMPT = `You are a social media script writer trained on Greenspan Consulting's content production standards for @everydayelevations.

You are writing a STITCH/RESPONSE script -- reacting to a viral piece of content with Jason Fricka's unique POV.

GREENSPAN STITCH STANDARDS:
- Hook must reference or respond to the original viral content immediately
- Take a clear stance -- agree, disagree, add nuance, or share a real story that connects
- Bring the veteran, mindset coach, endurance athlete perspective that nobody else in wellness has
- Optimize for SHARES -- stitch content gets shared when the response adds real value or sparks debate
- 30-60 seconds. No intro. No fluff. Pure value and POV.
- End with a comment-based CTA that continues the conversation

${SWARBRICK_FRAMEWORK}

Return ONLY JSON:
{
  "stitchHook": "exact first line that references the original content",
  "stitchHookNote": "delivery direction -- tone and energy",
  "stance": "agree|disagree|add-nuance|personal-story",
  "stanceReason": "why this stance is authentic to Jason",
  "body": ["line1","line2","line3","line4","line5"],
  "bodyNotes": ["note1","note2","note3","note4","note5"],
  "cta": "comment-based closing line that drives conversation",
  "ctaNote": "how to deliver it",
  "onScreenText": "opening text overlay",
  "caption": "full caption that adds context and drives shares",
  "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7"],
  "estimatedSeconds": 45,
  "whyItWillBeShared": "why this specific stitch will drive shares for @everydayelevations",
  "stitchTip": "one specific production tip for filming the stitch"
}`;

const TREND_SEARCH_PROMPT = `You are a viral content researcher for @everydayelevations -- a health, wellness, and mindset account run by Jason Fricka, a veteran, mindset coach, and endurance athlete in Colorado.

Search for what is currently going viral RIGHT NOW across Instagram Reels, TikTok, YouTube Shorts, and Facebook Reels in health, wellness, mindset, fitness, personal growth, and veteran/military spaces.

Return ONLY JSON -- no markdown:
{
  "trends": [
    {
      "id": 1,
      "title": "viral content title or description",
      "platform": "Instagram|TikTok|YouTube|Facebook|Multiple",
      "niche": "health|wellness|mindset|fitness|veteran|finance|family",
      "estimatedViews": "e.g. 2.3M+ views",
      "whyViral": "what's driving the virality -- emotion, controversy, surprise, relatability",
      "stitchAngle": "specific angle Jason Fricka should take as a veteran mindset coach",
      "stitchHookIdea": "suggested opening line for the stitch",
      "urgency": "hot-right-now|trending|evergreen-viral",
      "difficulty": "easy|medium|hard"
    }
  ]
}
Find 6-8 genuinely current viral trends. Be specific about real content patterns happening now.`;

function Script({ prefill, onCount }) {
  const [mode,     setMode]     = useState("write"); // write | stitch
  const [topic,    setTopic]    = useState(prefill || "");
  const [angle,    setAngle]    = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [ctx,      setCtx]      = useState("");
  const [load,     setLoad]     = useState(false);
  const [result,   setResult]   = useState(null);
  const [activeV,  setActiveV]  = useState(0);
  const [err,      setErr]      = useState(null);
  const [cp,       setCp]       = useState("");
  const [tab,      setTab]      = useState("script");

  // Stitch mode state
  const [trendLoad,      setTrendLoad]      = useState(false);
  const [trends,         setTrends]         = useState(null);
  const [selectedTrend,  setSelectedTrend]  = useState(null);
  const [stitchLoad,     setStitchLoad]     = useState(false);
  const [stitchResult,   setStitchResult]   = useState(null);
  const [stitchErr,      setStitchErr]      = useState(null);
  const [stitchTab,      setStitchTab]      = useState("script");

  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function gen() {
    if (!topic.trim() || !angle || !platform) return;
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    const p = PLATFORMS.find(x => x.id === platform);
    try {
      const d = await ai(SP_MULTI, `Platform: ${p?.label}\nTopic: ${topic}\nAngle: ${a?.label}\n${ctx ? `Context: ${ctx}` : ""}\nGenerate 3 variations (Educational, Trend-Responsive, Personal Story).`);
      setResult(d); setActiveV(0); onCount();
    }
    catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }

  async function findTrends() {
    setTrendLoad(true); setTrends(null); setSelectedTrend(null); setStitchResult(null); setStitchErr(null);
    try {
      const res = await fetch('/api/perplexity', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: `What health wellness mindset fitness veteran personal growth content is going viral RIGHT NOW on Instagram Reels TikTok YouTube Shorts Facebook Reels in March 2026? Find specific viral videos, trends, and content patterns with view counts. Focus on content that a veteran mindset coach and endurance athlete in Colorado could respond to or stitch with their unique POV.` })
      });
      const raw = await res.json();
      const d = await ai(TREND_SEARCH_PROMPT, `Based on this current research, identify 6-8 specific viral trends:\n\n${raw.text}`);
      setTrends(d.trends);
    }
    catch { setStitchErr("Trend search failed. Check your Perplexity API key."); }
    finally { setTrendLoad(false); }
  }

  async function generateStitch() {
    if (!selectedTrend) return;
    setStitchLoad(true); setStitchResult(null); setStitchErr(null);
    try {
      const d = await ai(STITCH_PROMPT, `Viral content to stitch:\nTitle: ${selectedTrend.title}\nPlatform: ${selectedTrend.platform}\nWhy viral: ${selectedTrend.whyViral}\nSuggested angle: ${selectedTrend.stitchAngle}\nHook idea: ${selectedTrend.stitchHookIdea}\n\nWrite a stitch response script for @everydayelevations.`);
      setStitchResult(d); onCount();
    }
    catch { setStitchErr("Script generation failed. Try again."); }
    finally { setStitchLoad(false); }
  }

  const scr = result?.variations?.[activeV];
  const sa = ANGLES.find(x => x.id === angle);
  const sp = PLATFORMS.find(x => x.id === platform);
  const ft = () => scr ? [`[ON SCREEN: ${scr.onScreenText}]`,``,[`HOOK: "${scr.hook}"`,`(${scr.hookNote})`,``,...scr.body.map((l,i)=>`"${l}"\n(${scr.bodyNotes[i]})`),``,`CTA: "${scr.cta}"`,`(${scr.ctaNote})`].join("\n")].join("\n") : "";
  const urgencyColor = { "hot-right-now":B.red, "trending":B.gold, "evergreen-viral":"#27AE60" };
  const diffColor = { easy:"#27AE60", medium:B.gold, hard:B.red };

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:24 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>SCRIPT ENGINE</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Write original scripts or find viral trends to stitch. Greenspan SOP standards baked in.</div>
      </div>

      {/* Mode toggle */}
      <div style={{ display:"flex", gap:0, marginBottom:28, background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:10, padding:4, width:"fit-content" }}>
        {[{id:"write",icon:"✍️",label:"Write Script"},{id:"stitch",icon:"🔥",label:"Viral Stitch"}].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setTrends(null); setSelectedTrend(null); setStitchResult(null); setErr(null); setStitchErr(null); }}
            style={{ background:mode===m.id?B.navy:"transparent", color:mode===m.id?B.white:B.textMid, border:"none", borderRadius:7, padding:"9px 20px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:15 }}>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      {/* WRITE MODE */}
      {mode === "write" && (
        <>
          {!result ? (
            <>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Platform</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} onClick={() => setPlatform(p.id)}
                      style={{ background:platform===p.id?B.navy:B.white, border:`2px solid ${platform===p.id?B.navy:B.border}`, borderRadius:10, padding:"13px", cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:18, marginBottom:4 }}>{p.icon}</div>
                      <div style={{ color:platform===p.id?B.white:B.textMid, fontWeight:700, fontSize:12 }}>{p.label}</div>
                      <div style={{ color:platform===p.id?"rgba(255,255,255,0.6)":B.textLight, fontSize:10, marginTop:2, lineHeight:1.4 }}>{p.format}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Topic</label>
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. What the Army taught me about starting over"
                  style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 16px", fontSize:14, fontFamily:"'Barlow',sans-serif" }} />
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
                  {ANGLES.map(a => (
                    <div key={a.id} onClick={() => setAngle(a.id)}
                      style={{ background:angle===a.id?B.navy:B.white, border:`2px solid ${angle===a.id?B.navy:B.border}`, borderRadius:10, padding:"14px", cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:18, marginBottom:5 }}>{a.icon}</div>
                      <div style={{ color:angle===a.id?B.white:B.textMid, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:22 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Context <span style={{ color:B.textLight, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
                <textarea value={ctx} onChange={e => setCtx(e.target.value)} rows={3} placeholder="Real memory or detail that makes it authentic..."
                  style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
              </div>
              <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
                <div style={{ color:"#1B4F72", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Greenspan SOP Active</div>
                <div style={{ color:"#1E40AF", fontSize:12, lineHeight:1.6 }}>3 variations: Educational (saves) + Trend-Responsive (shares) + Personal Story (follows). No intro. Value first.</div>
              </div>
              {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{err}</div>}
              <RedBtn onClick={gen} disabled={load || !topic.trim() || !angle}>
                {load ? <><Spin />Writing 3 Scripts...</> : "⚡ Generate 3 Script Variations"}
              </RedBtn>
            </>
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy }}>{topic}</div>
                  <div style={{ display:"flex", gap:8, marginTop:5, flexWrap:"wrap" }}>
                    {sp && <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{sp.icon} {sp.label}</span>}
                    {sa && <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{sa.icon} {sa.label}</span>}
                  </div>
                </div>
                <button onClick={() => { setResult(null); setErr(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Script</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
                {(result.variations||[]).map((v, i) => (
                  <div key={i} onClick={() => { setActiveV(i); setTab("script"); }}
                    style={{ background:activeV===i?B.navy:B.white, border:`2px solid ${activeV===i?B.navy:B.border}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ color:activeV===i?B.red:"#7E5109", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>{v.type}</div>
                      <div style={{ background:activeV===i?"rgba(255,255,255,0.15)":B.offWhite, color:activeV===i?"rgba(255,255,255,0.8)":B.textLight, borderRadius:3, padding:"1px 6px", fontSize:9, fontWeight:700 }}>~{v.estimatedSeconds}s</div>
                    </div>
                    <div style={{ color:activeV===i?"rgba(255,255,255,0.7)":B.textLight, fontSize:11, lineHeight:1.5 }}>{v.typeNote}</div>
                    <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:activeV===i?B.red:"#CBD5E0", flexShrink:0 }} />
                      <span style={{ color:activeV===i?"rgba(255,255,255,0.6)":B.textLight, fontSize:10, fontWeight:600 }}>Optimizes: {v.optimizesFor}</span>
                    </div>
                  </div>
                ))}
              </div>
              {scr && (
                <>
                  <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"11px 15px", marginBottom:16, fontSize:12, color:"#9B1C1C", lineHeight:1.6, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                    <span><span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10 }}>Why it works: </span>{scr.whyItWorks}</span>
                    <button onClick={() => copy(ft(),"full")} style={{ background:cp==="full"?"#FEF2F2":B.white, color:cp==="full"?B.red:B.textMid, border:`1px solid ${cp==="full"?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>{cp==="full"?"✓ Copied":"Copy Script"}</button>
                  </div>
                  <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:16 }}>
                    {["script","caption","hashtags"].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?B.red:"transparent"}`, color:tab===t?B.navy:B.textLight, padding:"9px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>
                    ))}
                  </div>
                  {tab==="script" && (
                    <div>
                      <div style={{ background:"#FFFBF0", border:`1px solid #FCD34D`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                        <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>On Screen Text</div>
                        <div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{scr.onScreenText}"</div>
                      </div>
                      <Card style={{ borderLeft:`3px solid ${B.red}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <SecLabel text="Hook 0-3 sec" />
                          <button onClick={() => copy(scr.hook,"hook")} style={{ background:"transparent", color:cp==="hook"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="hook"?"check":"copy"}</button>
                        </div>
                        <div style={{ color:B.navy, fontSize:16, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:5 }}>"{scr.hook}"</div>
                        <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {scr.hookNote}</div>
                      </Card>
                      <div style={{ marginBottom:12 }}>
                        <SecLabel text="Body" />
                        {scr.body.map((line,i) => (
                          <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", marginBottom:7 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", gap:9 }}>
                              <div style={{ flex:1 }}>
                                <div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:4 }}>"{line}"</div>
                                <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {scr.bodyNotes[i]}</div>
                              </div>
                              <button onClick={() => copy(line,"b"+i)} style={{ background:"transparent", color:cp==="b"+i?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:600 }}>{cp==="b"+i?"check":"copy"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div><SecLabel text="CTA" /><span style={{ background:"#FEF2F2", color:B.red, border:`1px solid #FCA5A5`, borderRadius:3, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{scr.ctaType}</span></div>
                          <button onClick={() => copy(scr.cta,"cta")} style={{ background:"transparent", color:cp==="cta"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="cta"?"check":"copy"}</button>
                        </div>
                        <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:5 }}>"{scr.cta}"</div>
                        <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {scr.ctaNote}</div>
                      </Card>
                    </div>
                  )}
                  {tab==="caption" && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                        <button onClick={() => copy(scr.caption+"\n\n"+scr.hashtags.join(" "),"cap")} style={{ background:cp==="cap"?"#FEF2F2":B.white, color:cp==="cap"?B.red:B.textMid, border:`1px solid ${cp==="cap"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="cap"?"Copied":"Copy Caption + Tags"}</button>
                      </div>
                      <Card style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{scr.caption}</Card>
                    </div>
                  )}
                  {tab==="hashtags" && (
                    <div>
                      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                        <button onClick={() => copy(scr.hashtags.join(" "),"tags")} style={{ background:cp==="tags"?"#FEF2F2":B.white, color:cp==="tags"?B.red:B.textMid, border:`1px solid ${cp==="tags"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="tags"?"Copied":"Copy All"}</button>
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {scr.hashtags.map((tag,i) => (
                          <div key={i} onClick={() => copy(tag,"t"+i)} style={{ background:cp==="t"+i?"#FEF2F2":B.white, border:`1px solid ${cp==="t"+i?"#FCA5A5":B.border}`, color:cp==="t"+i?B.red:B.text, borderRadius:8, padding:"9px 13px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{tag}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* VIRAL STITCH MODE */}
      {mode === "stitch" && (
        <div>
          {!stitchResult ? (
            <>
              {!trends && !trendLoad && (
                <>
                  <div style={{ background:"#FFF7ED", border:`1px solid #FED7AA`, borderLeft:`3px solid ${B.gold}`, borderRadius:8, padding:"14px 18px", marginBottom:24 }}>
                    <div style={{ color:"#92400E", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>How Viral Stitching Works</div>
                    <div style={{ color:"#78350F", fontSize:13, lineHeight:1.7 }}>Perplexity searches for what is going viral RIGHT NOW across Instagram, TikTok, YouTube, and Facebook in health, wellness, mindset, and veteran spaces. You pick the trend that resonates. The app writes your stitch script in your voice.</div>
                  </div>
                  {stitchErr && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{stitchErr}</div>}
                  <RedBtn onClick={findTrends}>Find Viral Trends Now</RedBtn>
                </>
              )}
              {trendLoad && (
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"24px 0" }}>
                  <Spin /><div style={{ color:B.textMid, fontSize:13 }}>Searching for what is going viral right now...</div>
                </div>
              )}
              {trends && !selectedTrend && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy, letterSpacing:1 }}>Trending Now</div>
                      <div style={{ color:B.textLight, fontSize:12, marginTop:2 }}>Pick a trend to stitch. The app writes your response script.</div>
                    </div>
                    <button onClick={findTrends} style={{ background:"transparent", color:B.textMid, border:`1px solid ${B.border}`, borderRadius:6, padding:"7px 13px", fontSize:12, cursor:"pointer" }}>Refresh</button>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {trends.map((trend, i) => (
                      <div key={i} onClick={() => setSelectedTrend(trend)}
                        style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${urgencyColor[trend.urgency]||B.red}`, borderRadius:10, padding:"16px 18px", cursor:"pointer", transition:"all 0.15s" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                          <div style={{ color:B.navy, fontWeight:700, fontSize:14, flex:1 }}>{trend.title}</div>
                          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                            <span style={{ background:urgencyColor[trend.urgency]||B.red, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:800, textTransform:"uppercase" }}>{(trend.urgency||"").replace(/-/g," ")}</span>
                            <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{trend.platform}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                          <span style={{ color:B.red, fontSize:12, fontWeight:700 }}>{trend.estimatedViews}</span>
                          <span style={{ color:B.textLight, fontSize:12 }}>#{trend.niche}</span>
                          <span style={{ color:diffColor[trend.difficulty]||B.gold, fontSize:12, fontWeight:600, textTransform:"capitalize" }}>Difficulty: {trend.difficulty}</span>
                        </div>
                        <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginBottom:8 }}><span style={{ fontWeight:700, color:B.textLight, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>Why viral: </span>{trend.whyViral}</div>
                        <div style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"8px 12px" }}>
                          <div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Your Stitch Angle</div>
                          <div style={{ color:B.navy, fontSize:12, lineHeight:1.5 }}>{trend.stitchAngle}</div>
                          <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:4 }}>Hook idea: "{trend.stitchHookIdea}"</div>
                        </div>
                        <div style={{ marginTop:10, color:B.red, fontSize:12, fontWeight:700, textAlign:"right" }}>Stitch This</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedTrend && !stitchLoad && (
                <div>
                  <div style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.red}`, borderRadius:10, padding:"16px 18px", marginBottom:20 }}>
                    <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Selected Trend</div>
                    <div style={{ color:B.navy, fontWeight:700, fontSize:14, marginBottom:6 }}>{selectedTrend.title}</div>
                    <div style={{ color:B.textMid, fontSize:12 }}>{selectedTrend.stitchAngle}</div>
                    <button onClick={() => setSelectedTrend(null)} style={{ marginTop:8, background:"transparent", color:B.textLight, border:"none", fontSize:11, cursor:"pointer" }}>Choose different trend</button>
                  </div>
                  {stitchErr && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{stitchErr}</div>}
                  <RedBtn onClick={generateStitch} disabled={stitchLoad}>Generate Stitch Script</RedBtn>
                </div>
              )}
              {stitchLoad && (
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"24px 0" }}>
                  <Spin /><div style={{ color:B.textMid, fontSize:13 }}>Writing your stitch script...</div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy }}>Stitch Script Ready</div>
                  <div style={{ color:B.red, fontSize:12, fontWeight:700, marginTop:3, textTransform:"capitalize" }}>Stance: {(stitchResult.stance||"").replace(/-/g," ")}</div>
                </div>
                <button onClick={() => { setStitchResult(null); setSelectedTrend(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Stitch</button>
              </div>
              <div style={{ background:"#FFF7ED", border:`1px solid #FED7AA`, borderLeft:`3px solid ${B.gold}`, borderRadius:8, padding:"12px 16px", marginBottom:14, fontSize:12, color:"#78350F", lineHeight:1.6 }}>
                <span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10, color:"#92400E" }}>Why this will be shared: </span>{stitchResult.whyItWillBeShared}
              </div>
              <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"12px 16px", marginBottom:20, fontSize:12, color:"#1E40AF", lineHeight:1.6 }}>
                <span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10, color:"#1B4F72" }}>Production tip: </span>{stitchResult.stitchTip}
              </div>
              <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:16 }}>
                {["script","caption","hashtags"].map(t => (
                  <button key={t} onClick={() => setStitchTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${stitchTab===t?B.red:"transparent"}`, color:stitchTab===t?B.navy:B.textLight, padding:"9px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>
                ))}
              </div>
              {stitchTab==="script" && (
                <div>
                  <div style={{ background:"#FFFBF0", border:`1px solid #FCD34D`, borderRadius:8, padding:"10px 14px", marginBottom:12 }}>
                    <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>On Screen Text</div>
                    <div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{stitchResult.onScreenText}"</div>
                  </div>
                  <Card style={{ borderLeft:`3px solid ${B.red}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <SecLabel text="Stitch Hook 0-3 sec" />
                      <button onClick={() => copy(stitchResult.stitchHook,"sh")} style={{ background:"transparent", color:cp==="sh"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="sh"?"check":"copy"}</button>
                    </div>
                    <div style={{ color:B.navy, fontSize:16, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:5 }}>"{stitchResult.stitchHook}"</div>
                    <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {stitchResult.stitchHookNote}</div>
                  </Card>
                  <div style={{ marginBottom:12 }}>
                    <SecLabel text="Response Body" />
                    {(stitchResult.body||[]).map((line,i) => (
                      <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", marginBottom:7 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:9 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:4 }}>"{line}"</div>
                            <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {(stitchResult.bodyNotes||[])[i]}</div>
                          </div>
                          <button onClick={() => copy(line,"sb"+i)} style={{ background:"transparent", color:cp==="sb"+i?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", flexShrink:0, fontWeight:600 }}>{cp==="sb"+i?"check":"copy"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <SecLabel text="CTA Comment-Based" />
                      <button onClick={() => copy(stitchResult.cta,"scta")} style={{ background:"transparent", color:cp==="scta"?B.red:B.textLight, border:"none", fontSize:11, cursor:"pointer", fontWeight:600 }}>{cp==="scta"?"check":"copy"}</button>
                    </div>
                    <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", marginBottom:5 }}>"{stitchResult.cta}"</div>
                    <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>filming: {stitchResult.ctaNote}</div>
                  </Card>
                </div>
              )}
              {stitchTab==="caption" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                    <button onClick={() => copy(stitchResult.caption+"\n\n"+(stitchResult.hashtags||[]).join(" "),"scap")} style={{ background:cp==="scap"?"#FEF2F2":B.white, color:cp==="scap"?B.red:B.textMid, border:`1px solid ${cp==="scap"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="scap"?"Copied":"Copy Caption + Tags"}</button>
                  </div>
                  <Card style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{stitchResult.caption}</Card>
                </div>
              )}
              {stitchTab==="hashtags" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                    <button onClick={() => copy((stitchResult.hashtags||[]).join(" "),"stags")} style={{ background:cp==="stags"?"#FEF2F2":B.white, color:cp==="stags"?B.red:B.textMid, border:`1px solid ${cp==="stags"?"#FCA5A5":B.border}`, borderRadius:6, padding:"7px 12px", fontSize:12, cursor:"pointer" }}>{cp==="stags"?"Copied":"Copy All"}</button>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {(stitchResult.hashtags||[]).map((tag,i) => (
                      <div key={i} onClick={() => copy(tag,"st"+i)} style={{ background:cp==="st"+i?"#FEF2F2":B.white, border:`1px solid ${cp==="st"+i?"#FCA5A5":B.border}`, color:cp==="st"+i?B.red:B.text, borderRadius:8, padding:"9px 13px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{tag}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


const VAULT_TABS = [
  {
    id: "market", label: "Market Research", icon: "🔍", color: "#1B4F72",
    sections: [
      {
        title: "Tier 1 -- Audience Intelligence", color: "#1B4F72", when: "Run first",
        prompts: [
          "Who is the core audience following health and wellness mindset podcasts on Instagram in 2026? Break down by age, pain points, content consumption habits, and what motivates them to follow a new account. Compare @hubermanlab, @jayshetty, and @richroll audiences specifically. Sources not older than 3 months.",
          "What emotional triggers cause someone to follow a health and wellness Instagram account vs. just watching one video and leaving? Pull from recent social behavior studies, Reddit discussions, and creator interviews from the past 6 months.",
          "What are the top audience complaints about health and wellness podcast Instagram accounts? Search Reddit, YouTube comments, and podcast review threads -- what do followers wish these creators did differently?",
        ]
      },
      {
        title: "Tier 2 -- Content Gap & Positioning", color: "#145A32", when: "Run second",
        prompts: [
          "Analyze the content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, and @richroll on Instagram. For each: their 3 core content themes, what topic they own that nobody else does, and gaps where audience demand exists but nobody is filling it.",
          "What health and wellness Instagram content formats are generating the highest follower conversion rates in early 2026 -- meaning viewers who were not following before watched a Reel and then followed? Focus on Reels under 90 seconds.",
          "Analyze the top 10 performing content pieces from @hubermanlab, @jayshetty, @richroll in the past 3 months. What themes, formats, and hooks appear most frequently? Sources not older than 3 months.",
        ]
      },
      {
        title: "Tier 3 -- Growth Mechanics", color: "#6E2F8E", when: "Run third",
        prompts: [
          "Which health and wellness Instagram creators had the fastest organic follower growth in Q1 2026 and what specific tactics preceded those spikes? Focus on accounts under 100K followers who broke through.",
          "What collaboration patterns are driving the most follower growth for mid-size health and wellness podcast Instagram accounts right now? Who is cross-promoting with whom and what formats do those collabs take?",
          "Analyze how @jayshetty built his Instagram community identity -- specifically how he named his audience, when he introduced that naming convention, and how it affected his engagement and growth metrics.",
        ]
      },
      {
        title: "Tier 4 -- Deep Dive Research", color: "#7E5109", when: "Run fourth",
        prompts: [
          "Social media audit of top wellness podcast Instagram accounts -- four categories: posting cadence, content pillars, engagement patterns, growth signals. Comparison table with @hubermanlab, @jayshetty, @richroll, @mindpumpmedia as columns. Sources not older than 3 months.",
          "What questions are health and wellness audiences asking most on Reddit, Quora, and YouTube comments in early 2026? Group by theme and identify which ones no major Instagram creator is answering consistently.",
          "Research the top 5 fastest-growing health and wellness podcast Instagram accounts right now. For each: follower count, growth rate, content format breakdown, posting frequency, and the single tactic most responsible for their growth.",
        ]
      },
    ]
  },
  {
    id: "instagram", label: "Instagram", icon: "📸", color: "#E94560",
    sections: [
      {
        title: "Instagram Account Diagnostics -- @everydayelevations", color: "#E94560", when: "Run in order",
        prompts: [
          "Analyze the Instagram profile @everydayelevations. What does the bio, highlight structure, pinned content, and posting frequency signal to a first-time visitor? What specific elements would cause someone to leave without following? Be direct and specific.",
          "Compare the content style, hook patterns, caption length, and posting frequency of @everydayelevations vs @jayshetty and @hubermanlab. Where is @everydayelevations losing potential followers in the first 3 seconds of a Reel? What is the single biggest gap?",
          "What specific elements are missing from @everydayelevations Instagram that accounts with 50K-200K followers in the health and mindset space consistently have? Compare profile structure, content consistency, community signals, and engagement tactics.",
          "Analyze the last 30 days of visible content from @everydayelevations on Instagram. Is there a clear content identity and brand voice? Does each post reinforce a single clear message or does the account feel scattered across too many topics?",
          "What are the most common reasons a health and wellness Instagram account stays stuck under 10K followers despite consistent posting? Based on what is publicly visible about @everydayelevations, which of these blockers appear most likely to apply?",
        ]
      },
    ]
  },
  {
    id: "facebook", label: "Facebook", icon: "👥", color: "#1877F2",
    sections: [
      {
        title: "Facebook Account Diagnostics -- facebook.com/jason.fricka", color: "#1877F2", when: "Run in order",
        prompts: [
          "Analyze the Facebook profile facebook.com/jason.fricka. What does the current page structure, about section, and content mix signal to someone discovering Jason Fricka for the first time? What would cause them to not follow or engage?",
          "How does Facebook's 2026 algorithm treat health and wellness mindset content from personal profiles vs. pages? What content formats (video, Reels, long-form posts, groups) are getting the most organic reach for creators in this space right now?",
          "What are the top Facebook growth strategies working for health and wellness coaches and podcast hosts in 2026? How does facebook.com/jason.fricka compare to these benchmarks based on publicly visible activity?",
          "What Facebook community-building tactics are driving the most engagement for mindset and wellness creators right now? Should @everydayelevations be running a Facebook Group alongside the profile? What are the tradeoffs?",
          "How can Jason Fricka at facebook.com/jason.fricka best repurpose Instagram and podcast content for Facebook's algorithm without it feeling like cross-posted filler? What modifications make content perform natively on Facebook?",
        ]
      },
    ]
  },
  {
    id: "youtube", label: "YouTube", icon: "▶️", color: "#FF0000",
    sections: [
      {
        title: "YouTube Account Diagnostics -- @everydayelevations", color: "#CC0000", when: "Run in order",
        prompts: [
          "Analyze the YouTube channel youtube.com/@everydayelevations. What does the channel art, about section, playlist structure, and upload frequency signal to a first-time visitor? What would cause someone to leave without subscribing?",
          "What YouTube SEO strategies are working best for health and wellness podcast channels in 2026? What keywords, thumbnail styles, and title formats are driving the most discovery for channels similar to Everyday Elevations?",
          "How does YouTube's algorithm in 2026 treat long-form podcast content vs. short-form clips for health and wellness creators? What is the optimal content mix for a channel like @everydayelevations to maximize both reach and watch time?",
          "What are the most common reasons a health and wellness YouTube channel stays under 1K subscribers despite having good content? Based on what is publicly visible about youtube.com/@everydayelevations, which blockers apply?",
          "How can youtube.com/@everydayelevations best use YouTube Shorts in 2026 to drive subscribers to long-form content? What clip strategy from the Everyday Elevations podcast would perform best as Shorts?",
        ]
      },
    ]
  },
  {
    id: "linkedin", label: "LinkedIn", icon: "💼", color: "#0A66C2",
    sections: [
      {
        title: "LinkedIn Diagnostics -- Jason Fricka (Dual Lane: HR + Podcast)", color: "#0A66C2", when: "Run in order",
        prompts: [
          "Analyze the LinkedIn profile linkedin.com/in/jason-fricka. Jason operates in two professional lanes: HR leadership (Highland Cabinetry HR Manager, HiBob HRIS expertise, People & Culture) and health/wellness mindset coaching via his podcast Everyday Elevations. Is the current profile clearly communicating both lanes or is one drowning out the other?",
          "What LinkedIn content strategy would allow Jason Fricka to build authority in both HR leadership and health/wellness mindset coaching without the two lanes conflicting? What content cadence, post types, and topics would serve both audiences simultaneously?",
          "What are the fastest-growing LinkedIn content formats for HR professionals in 2026? How can Jason Fricka at linkedin.com/in/jason-fricka leverage his Highland Cabinetry HR experience, HiBob implementation expertise, and veteran background to build a following in the People & Culture space?",
          "What LinkedIn content formats and topics are driving the most growth for mindset coaches and podcast hosts in 2026? How can Jason Fricka bridge his Everyday Elevations podcast insights with his professional HR audience on LinkedIn?",
          "How should Jason Fricka position the Everyday Elevations podcast on LinkedIn to attract both HR professionals interested in employee wellness and general professionals interested in personal growth? What episode themes and clips would perform best with a LinkedIn audience?",
        ]
      },
    ]
  },
  {
    id: "crossplatform", label: "Cross-Platform", icon: "🌐", color: "#6E2F8E",
    sections: [
      {
        title: "Cross-Platform Strategy -- All Channels", color: "#6E2F8E", when: "Run after individual platform audits",
        prompts: [
          "Analyze the brand consistency of Jason Fricka across Instagram (@everydayelevations), Facebook (facebook.com/jason.fricka), YouTube (youtube.com/@everydayelevations), and LinkedIn (linkedin.com/in/jason-fricka). Where does the messaging, visual identity, or brand voice break down across platforms? What would someone think if they found him on multiple channels?",
          "What content created for the Everyday Elevations podcast and Instagram (@everydayelevations) is being left on the table in terms of repurposing across Facebook, YouTube, and LinkedIn? Build a repurposing framework that turns one piece of content into platform-native posts for all four channels.",
          "What is the optimal cross-platform posting sequence for a health and wellness podcast creator in 2026? If Jason Fricka records one podcast episode, what is the ideal workflow to extract maximum content across Instagram, Facebook, YouTube, and LinkedIn without each platform feeling like a copy-paste?",
          "Which platform should be Jason Fricka's primary growth focus in 2026 given his goals of growing Everyday Elevations, building HR thought leadership on LinkedIn, and expanding Fricka Sells Colorado real estate brand? Rank the platforms by growth potential and explain the sequencing strategy.",
          "What cross-platform collaboration opportunities exist for a veteran health and wellness podcast host in Colorado? Which types of creators, HR professionals, real estate investors, or community organizations would make the strongest cross-promotion partners across all four platforms?",
        ]
      },
    ]
  },
];

function Vault() {
  const [activeTab, setActiveTab] = useState("market");
  const [cp, setCp] = useState("");
  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }
  const currentTab = VAULT_TABS.find(t => t.id === activeTab);

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:24 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>PROMPT VAULT</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Market research + platform diagnostics. Run prompts in Perplexity, paste results into the Insight Extractor.</div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
        {VAULT_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background:activeTab===tab.id ? tab.color : B.white, color:activeTab===tab.id ? B.white : B.textMid, border:`1px solid ${activeTab===tab.id ? tab.color : B.border}`, borderRadius:20, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:14 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Prompts */}
      {currentTab && currentTab.sections.map((section, si) => (
        <div key={si} style={{ marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ width:4, height:20, background:section.color, borderRadius:2 }} />
            <div>
              <div style={{ color:section.color, fontWeight:700, fontSize:13 }}>{section.title}</div>
              <div style={{ color:B.textLight, fontSize:11, marginTop:1 }}>{section.when}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {section.prompts.map((prompt, i) => (
              <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${section.color}`, borderRadius:8, padding:"14px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ color:B.text, fontSize:13, lineHeight:1.7, marginBottom:10 }}>{prompt}</div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button onClick={() => copy(prompt, `p${si}${i}`)}
                    style={{ background:cp===`p${si}${i}`?"#FEF2F2":B.offWhite, color:cp===`p${si}${i}`?B.red:B.textMid, border:`1px solid ${cp===`p${si}${i}`?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    {cp===`p${si}${i}` ? "✓ Copied" : "Copy Prompt"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
  { id:"veteran",  label:"Veteran / Resilience",        icon:"🎖️" },
  { id:"mindset",  label:"Mindset & Mental Toughness",   icon:"🧠" },
  { id:"wins",     label:"Everyday Wins",                icon:"⚡" },
  { id:"outdoor",  label:"Outdoor Living & Community",   icon:"🏔️" },
  { id:"finance",  label:"Finance & Real Estate",        icon:"💰" },
  { id:"podcast",  label:"Podcast & Personal Growth",    icon:"🎙️" },
  { id:"family",   label:"Family & Life Lessons",        icon:"❤️" },
  { id:"health",   label:"Health & Physical Wellness",   icon:"💪" },
];

const PIPELINE_EP = `You are the Elevation Nation Content Intelligence Engine for @everydayelevations. Analyze this research and return ONLY JSON:
{"summary":"2-3 sentence synthesis","reelIdeas":[{"title":"hook-driven title","hook":"exact opening line","why":"why drives follows","cta":"specific CTA","wellnessDimension":"which of Swarbrick's 8 dimensions this touches"}],"topGap":"single most important content gap in one sentence","elevationNationAngle":"how to leverage Elevation Nation community identity"}`;

const PIPELINE_SP = `You are a Reel script writer for @everydayelevations. VOICE: Conversational, no fluff, direct, short punchy sentences, Elevation Nation community woven in. TARGET: 30-60 seconds.

${SWARBRICK_FRAMEWORK}

Return ONLY JSON:
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

${SWARBRICK_FRAMEWORK}

Given a topic and angle, identify which wellness dimensions are most relevant and let them shape the visual direction, headlines, and body copy. Then generate BOTH a carousel post concept AND a static post concept. Return ONLY JSON:
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

const ONBOARD_PROMPT = `You are a senior social media strategist at Greenspan Consulting. Using the client intake information provided, generate a comprehensive social media strategy document following Greenspan's proven framework.

GREENSPAN CONTENT STANDARDS TO APPLY:
- Optimize for ACTION not vanity metrics (saves, shares, comments, follows in that priority)
- Four-Layer Viewer Journey: See It → Click It → Watch It → Go Deeper
- Opening standards: No intro, no fluff, value first, high-contrast captions from frame 1
- CTA Distribution: 60% comment-based, 20% DM-trigger, 20% link in bio
- Success metrics: Shares + Saves first, non-follower reach second, qualified leads third
- Content types: Educational (saves), Trend-Responsive (shares), Personal Story (follows)
- Testing framework: A/B test length, CTA type, authority placement, topic angle, posting time weekly

${SWARBRICK_FRAMEWORK}

The strategy document must reflect all 8 wellness dimensions across the content pillars -- ensuring the brand speaks to the whole person, not just one aspect of health. Content pillars should map to specific wellness dimensions so every piece of content serves a clear purpose in the audience's full wellness journey.

Generate a complete strategy document. Return ONLY JSON:
{
  "clientName": "name",
  "brandName": "brand",
  "strategyPeriod": "90-day period",
  "primaryGoal": "main goal",
  "primaryPlatforms": ["platform1","platform2"],
  "monthlyContentVolume": "X posts breakdown",
  "brandPositioning": "2-3 sentence positioning statement",
  "socialIdentity": [{"label":"identity pillar","description":"what it means"}],
  "messagingTransformation": [{"from":"where they start","to":"where they end up"}],
  "uniquePositioning": "one bold positioning statement",
  "idealClientTiers": [{"tier":"Tier 1","description":"who they are","strategy":"build/monetize/nurture"}],
  "contentPillars": [{"pillar":"pillar name","description":"what content lives here","topics":["topic1","topic2","topic3"]}],
  "platformStrategy": [{"platform":"name","role":"its role","contentMix":"what to post","cadence":"how often"}],
  "contentDistribution": {"reels":0,"carousels":0,"statics":0,"longForm":0,"stories":"daily/weekly"},
  "goals90Day": [{"platform":"name","metrics":["metric1","metric2"]}],
  "testsExperiments": [{"test":"what to test","variantA":"option A","variantB":"option B","metric":"what to measure"}],
  "emailStrategy": {"leadMagnets":["magnet1","magnet2"],"ctaDistribution":"60/20/20 breakdown","keywordTriggers":["word1","word2"]},
  "postingEngagementSOP": [{"activity":"what to do","timing":"when","frequency":"how often"}],
  "contentProductionStandards": {"opening":["standard1","standard2"],"editing":["standard1","standard2"],"retention":["standard1","standard2"]},
  "campaignPhases": [{"phase":"Phase name","days":"day range","goal":"follower/email goal","tactics":["tactic1","tactic2"]}],
  "successMetrics": {"primary":["metric1","metric2"],"secondary":["metric1","metric2"]},
  "implementationTimeline": [{"week":"Week 1","label":"Foundation","actions":["action1","action2"]}],
  "attractRepel": {"attract":["type1","type2"],"repel":["type1","type2"]}
}`;

function Onboarding() {
  const [step,    setStep]    = useState(1);
  const [load,    setLoad]    = useState(false);
  const [result,  setResult]  = useState(null);
  const [err,     setErr]     = useState(null);
  const [cp,      setCp]      = useState("");
  const [section, setSection] = useState(0);

  const [form, setForm] = useState({
    clientName: "Jason Fricka", brandName: "Everyday Elevations",
    primaryGoal: "Grow @everydayelevations audience and establish thought leadership in health, wellness, and mindset",
    platforms: "Instagram (Primary), YouTube (Authority), Facebook (Support), LinkedIn (HR + Podcast)",
    brandPersonality: "Conversational, Direct, Authentic, Veteran, Resilient",
    idealClient: "Everyday people on a health and wellness journey who want real talk, not hype. Veterans, professionals, parents, endurance athletes. Ages 25-55. Want mindset shifts and actionable daily wins.",
    transformation: "From feeling stuck, overwhelmed, and without direction -- to showing up every day with purpose, mental toughness, and small wins that compound into a better life.",
    contentPillars: "Veteran/Resilience, Mindset & Mental Toughness, Everyday Wins, Outdoor Living & Community, Finance & Real Estate, Podcast & Personal Growth, Family & Life Lessons",
    competitors: "@hubermanlab, @jayshetty, @richroll, @mindpumpmedia",
    offLimitTopics: "Divisive politics, anything that doesn't serve the Elevation Nation community",
    primaryCTA: "Comment NATION, follow for daily elevation, DM for coaching",
    leadMagnets: "Elevation Nation community membership, podcast episodes, mindset resources",
    goals90Day: "Grow Instagram following, establish consistent content cadence, launch Elevation Nation community identity, build email list",
    teamMembers: "Jason Fricka - Host, Coach, Creator",
    strategyPeriod: "90 days",
    additionalContext: "Community name: Elevation Nation. Tagline concept: Everyday people who refuse to stay where they are. Jason is a veteran, mindset coach, endurance athlete, HR professional, and Colorado-based father."
  });

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function copy(t, k) { navigator.clipboard.writeText(t); setCp(k); setTimeout(() => setCp(""), 1800); }

  async function generate() {
    setLoad(true); setErr(null); setResult(null);
    const intake = Object.entries(form).map(([k,v]) => `${k}: ${v}`).join("\n");
    try {
      const d = await ai(ONBOARD_PROMPT, `Generate a complete 90-day social media strategy for this client:\n\n${intake}`);
      setResult(d);
      setSection(0);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }

  const fields = [
    { key:"clientName",        label:"Client Name",           placeholder:"Jason Fricka" },
    { key:"brandName",         label:"Brand Name",            placeholder:"Everyday Elevations" },
    { key:"primaryGoal",       label:"Primary Goal",          placeholder:"Grow audience and establish thought leadership..." },
    { key:"platforms",         label:"Primary Platforms",     placeholder:"Instagram (Primary), YouTube, Facebook, LinkedIn" },
    { key:"brandPersonality",  label:"Brand Personality",     placeholder:"3-5 adjectives describing the brand voice" },
    { key:"idealClient",       label:"Ideal Client Profile",  placeholder:"Who they are, age, values, lifestyle..." },
    { key:"transformation",    label:"Desired Transformation",placeholder:"Where clients start vs. where they end up..." },
    { key:"contentPillars",    label:"Content Pillars",       placeholder:"Main topics/themes for content..." },
    { key:"competitors",       label:"Inspiration Accounts",  placeholder:"@handle1, @handle2..." },
    { key:"offLimitTopics",    label:"Off-Limit Topics",      placeholder:"What to never post about..." },
    { key:"primaryCTA",        label:"Primary CTA",           placeholder:"What action do you want people to take?" },
    { key:"leadMagnets",       label:"Offers / Lead Magnets", placeholder:"Free guides, courses, coaching, products..." },
    { key:"goals90Day",        label:"Top 3 Goals (90 Days)", placeholder:"Specific measurable goals..." },
    { key:"teamMembers",       label:"Team Members",          placeholder:"Name / Role / Email" },
    { key:"additionalContext", label:"Additional Context",    placeholder:"Anything else important to know..." },
  ];

  const SECTIONS = [
    "Brand Positioning", "Messaging", "Ideal Client", "Content Pillars",
    "Platform Strategy", "Content Distribution", "90-Day Goals",
    "Tests & Experiments", "Email Strategy", "Posting SOP",
    "Campaign Phases", "Success Metrics", "Implementation Timeline"
  ];

  return (
    <div style={{ padding:"32px 40px", animation:"fu 0.4s ease" }}>
      <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:20, marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:B.navy }}>ONBOARDING</div>
        <div style={{ color:B.textLight, fontSize:13, marginTop:4 }}>Complete the intake form to generate a full 90-day social media strategy document using Greenspan's proven framework.</div>
      </div>

      {!result ? (
        <>
          <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"12px 16px", marginBottom:24 }}>
            <div style={{ color:"#1B4F72", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Pre-filled for @everydayelevations</div>
            <div style={{ color:"#1E40AF", fontSize:12, lineHeight:1.6 }}>All fields are pre-filled with your brand info. Review, edit anything that needs updating, then generate your strategy.</div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>{f.label}</label>
                {f.key === "idealClient" || f.key === "transformation" || f.key === "goals90Day" || f.key === "additionalContext" ? (
                  <textarea value={form[f.key]} onChange={e => update(f.key, e.target.value)} rows={3}
                    placeholder={f.placeholder}
                    style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
                ) : (
                  <input value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
                )}
              </div>
            ))}
          </div>

          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load}>
            {load ? <><Spin />Generating Strategy Document...</> : "📋 Generate 90-Day Strategy"}
          </RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>{result.clientName} -- 90-Day Strategy</div>
              <div style={{ color:B.textLight, fontSize:12, marginTop:3 }}>{result.strategyPeriod} · {result.primaryPlatforms?.join(" · ")}</div>
            </div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Regenerate</button>
          </div>

          {/* Summary bar */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:24 }}>
            {[
              { label:"Primary Goal", value:result.primaryGoal },
              { label:"Content Volume", value:result.monthlyContentVolume },
              { label:"Strategy Period", value:result.strategyPeriod },
            ].map((item, i) => (
              <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px" }}>
                <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>{item.label}</div>
                <div style={{ color:B.text, fontSize:12, lineHeight:1.5 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Section nav */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24 }}>
            {SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setSection(i)}
                style={{ background:section===i?B.navy:B.white, color:section===i?B.white:B.textMid, border:`1px solid ${section===i?B.navy:B.border}`, borderRadius:16, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Section content */}
          {section === 0 && (
            <Card>
              <SecLabel text="Brand Positioning" />
              <div style={{ color:B.text, fontSize:14, lineHeight:1.8, marginBottom:16, fontStyle:"italic" }}>{result.brandPositioning}</div>
              {result.socialIdentity?.map((item, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10, display:"flex", gap:12 }}>
                  <div style={{ background:B.navy, color:B.white, borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap", alignSelf:"flex-start" }}>{item.label}</div>
                  <div style={{ color:B.textMid, fontSize:13, lineHeight:1.6 }}>{item.description}</div>
                </div>
              ))}
              <div style={{ background:B.navy, borderRadius:8, padding:"14px 18px", marginTop:8 }}>
                <div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Unique Positioning</div>
                <div style={{ color:B.white, fontSize:14, fontWeight:600, fontStyle:"italic" }}>{result.uniquePositioning}</div>
              </div>
            </Card>
          )}
          {section === 1 && (
            <Card>
              <SecLabel text="Messaging -- The Transformation We Deliver" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, border:`1px solid ${B.border}`, borderRadius:8, overflow:"hidden" }}>
                <div style={{ background:B.offWhite, padding:"10px 14px", borderBottom:`1px solid ${B.border}`, fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:1, color:B.textLight }}>Where They Start</div>
                <div style={{ background:B.navy, padding:"10px 14px", borderBottom:`1px solid ${B.border}`, fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:1, color:B.red }}>Where They End Up</div>
                {result.messagingTransformation?.map((item, i) => (
                  <>
                    <div key={`f${i}`} style={{ padding:"10px 14px", borderBottom:`1px solid ${B.border}`, color:B.textMid, fontSize:13 }}>{item.from}</div>
                    <div key={`t${i}`} style={{ padding:"10px 14px", borderBottom:`1px solid ${B.border}`, color:B.navy, fontSize:13, fontWeight:600, background:"#F0FDF4" }}>{item.to}</div>
                  </>
                ))}
              </div>
            </Card>
          )}
          {section === 2 && (
            <Card>
              <SecLabel text="Ideal Client Tiers" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                {result.idealClientTiers?.map((tier, i) => (
                  <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderTop:`3px solid ${B.red}`, borderRadius:8, padding:"14px 16px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:B.navy, letterSpacing:1, marginBottom:6 }}>{tier.tier}</div>
                    <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginBottom:8 }}>{tier.description}</div>
                    <div style={{ background:B.navy, color:B.red, borderRadius:4, padding:"3px 8px", fontSize:10, fontWeight:700, display:"inline-block" }}>{tier.strategy}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ color:"#14532D", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Attract</div>
                  {result.attractRepel?.attract?.map((a, i) => <div key={i} style={{ color:"#14532D", fontSize:12, marginBottom:3 }}>+ {a}</div>)}
                </div>
                <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"12px 14px" }}>
                  <div style={{ color:"#9B1C1C", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Repel</div>
                  {result.attractRepel?.repel?.map((r, i) => <div key={i} style={{ color:"#9B1C1C", fontSize:12, marginBottom:3 }}>- {r}</div>)}
                </div>
              </div>
            </Card>
          )}
          {section === 3 && (
            <Card>
              <SecLabel text="Content Pillars" />
              {result.contentPillars?.map((p, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:14, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 9px", fontSize:10, fontWeight:700 }}>Pillar {i+1}</div>
                    <div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{p.pillar}</div>
                  </div>
                  <div style={{ color:B.textMid, fontSize:13, lineHeight:1.6, marginBottom:8 }}>{p.description}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {p.topics?.map((t, j) => <span key={j} style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{t}</span>)}
                  </div>
                </div>
              ))}
            </Card>
          )}
          {section === 4 && (
            <div>
              {result.platformStrategy?.map((p, i) => (
                <Card key={i} style={{ borderTop:`3px solid ${B.red}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy, letterSpacing:1 }}>{p.platform}</div>
                    <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 9px", fontSize:11, fontWeight:600 }}>{p.cadence}</span>
                  </div>
                  <div style={{ color:B.red, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Role</div>
                  <div style={{ color:B.textMid, fontSize:13, marginBottom:10 }}>{p.role}</div>
                  <div style={{ color:B.red, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Content Mix</div>
                  <div style={{ color:B.textMid, fontSize:13 }}>{p.contentMix}</div>
                </Card>
              ))}
            </div>
          )}
          {section === 5 && (
            <Card>
              <SecLabel text="Monthly Content Distribution" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
                {Object.entries(result.contentDistribution||{}).map(([k, v], i) => (
                  <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:8, padding:"14px", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:B.red, lineHeight:1 }}>{v}</div>
                    <div style={{ color:B.textMid, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginTop:4, textTransform:"capitalize" }}>{k}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {section === 6 && (
            <div>
              {result.goals90Day?.map((g, i) => (
                <Card key={i}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:B.navy, letterSpacing:1, marginBottom:10 }}>{g.platform}</div>
                  {g.metrics?.map((m, j) => (
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
                      <div style={{ color:B.text, fontSize:13 }}>{m}</div>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          )}
          {section === 7 && (
            <Card>
              <SecLabel text="Tests & Experiments -- First 90 Days" />
              <div style={{ color:B.textLight, fontSize:12, fontStyle:"italic", marginBottom:14 }}>All variables tested weekly. Default to what the data says, not what feels right.</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:B.navy }}>
                      {["Test","Variant A","Variant B","Metric"].map(h => (
                        <th key={h} style={{ padding:"8px 12px", color:B.white, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.testsExperiments?.map((t, i) => (
                      <tr key={i} style={{ background:i%2===0?B.offWhite:B.white }}>
                        <td style={{ padding:"8px 12px", color:B.navy, fontWeight:700, fontSize:12 }}>{t.test}</td>
                        <td style={{ padding:"8px 12px", color:B.textMid, fontSize:12 }}>{t.variantA}</td>
                        <td style={{ padding:"8px 12px", color:B.textMid, fontSize:12 }}>{t.variantB}</td>
                        <td style={{ padding:"8px 12px", color:B.red, fontSize:12, fontWeight:600 }}>{t.metric}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          {section === 8 && (
            <Card>
              <SecLabel text="Email & Lead Magnet Strategy" />
              <div style={{ marginBottom:14 }}>
                <div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Lead Magnets</div>
                {result.emailStrategy?.leadMagnets?.map((m, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
                    <div style={{ color:B.text, fontSize:13 }}>{m}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:B.navy, borderRadius:8, padding:"14px 16px", marginBottom:12 }}>
                <div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>CTA Distribution</div>
                <div style={{ color:B.white, fontSize:13 }}>{result.emailStrategy?.ctaDistribution}</div>
              </div>
              <div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Keyword Triggers</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {result.emailStrategy?.keywordTriggers?.map((k, i) => (
                  <span key={i} style={{ background:B.red, color:B.white, borderRadius:4, padding:"4px 12px", fontSize:12, fontWeight:700 }}>{k}</span>
                ))}
              </div>
            </Card>
          )}
          {section === 9 && (
            <Card>
              <SecLabel text="Posting & Engagement SOP" />
              {result.postingEngagementSOP?.map((item, i) => (
                <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10, display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, alignItems:"start" }}>
                  <div style={{ color:B.text, fontSize:13, fontWeight:600 }}>{item.activity}</div>
                  <div style={{ color:B.red, fontSize:12, fontWeight:700 }}>{item.timing}</div>
                  <div style={{ color:B.textLight, fontSize:12 }}>{item.frequency}</div>
                </div>
              ))}
            </Card>
          )}
          {section === 10 && (
            <div>
              {result.campaignPhases?.map((phase, i) => (
                <Card key={i} style={{ borderLeft:`3px solid ${i===0?B.red:i===1?B.gold:"#27AE60"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy, letterSpacing:1 }}>{phase.phase}</div>
                      <div style={{ color:B.textLight, fontSize:12 }}>{phase.days}</div>
                    </div>
                    <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"3px 9px", fontSize:11, fontWeight:600 }}>Goal: {phase.goal}</span>
                  </div>
                  {phase.tactics?.map((t, j) => (
                    <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
                      <div style={{ color:B.textMid, fontSize:13 }}>{t}</div>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          )}
          {section === 11 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card>
                <SecLabel text="Primary Metrics" />
                {result.successMetrics?.primary?.map((m, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:B.red, flexShrink:0 }} />
                    <div style={{ color:B.text, fontSize:13, fontWeight:600 }}>{m}</div>
                  </div>
                ))}
              </Card>
              <Card>
                <SecLabel text="Secondary Metrics" />
                {result.successMetrics?.secondary?.map((m, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:B.border, flexShrink:0 }} />
                    <div style={{ color:B.textMid, fontSize:13 }}>{m}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {section === 12 && (
            <div>
              {result.implementationTimeline?.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:16, marginBottom:16 }}>
                  <div style={{ background:B.navy, color:B.white, borderRadius:8, padding:"12px 14px", minWidth:90, textAlign:"center", alignSelf:"flex-start" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:B.red, letterSpacing:1 }}>{item.week}</div>
                    <div style={{ color:"rgba(255,255,255,0.7)", fontSize:10, marginTop:2 }}>{item.label}</div>
                  </div>
                  <div style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"14px 16px", flex:1 }}>
                    {item.actions?.map((a, j) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
                        <div style={{ color:B.textMid, fontSize:13 }}>{a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
          {page==="onboard"  && <Onboarding />}
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
