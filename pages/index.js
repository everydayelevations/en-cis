import { useState } from 'react';
import Head from 'next/head';

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  navy: '#0A1628',
  red: '#E94560',
  white: '#FFFFFF',
  navy2: '#0D1F3C',
  gray: '#8892A4',
  light: '#F0F4FA'
};

// ─── CONTENT ANGLES ──────────────────────────────────────────────────────────
const ANGLES = [
  { id:'veteran', emoji:'🎖️', label:'Veteran / Resilience' },
  { id:'mindset', emoji:'🧠', label:'Mindset & Mental Toughness' },
  { id:'wins', emoji:'⚡', label:'Everyday Wins' },
  { id:'outdoor', emoji:'🏔️', label:'Outdoor Living & Community' },
  { id:'finance', emoji:'💰', label:'Finance & Real Estate' },
  { id:'podcast', emoji:'🎙️', label:'Podcast & Personal Growth' },
  { id:'family', emoji:'❤️', label:'Family & Life Lessons' },
  { id:'health', emoji:'💪', label:'Health & Physical Wellness' },
];

// ─── FRAMEWORKS (invisible infrastructure) ───────────────────────────────────
const SWARBRICK = `Swarbrick 8 Dimensions: Mental/Emotional, Physical, Social, Environmental, Financial, Intellectual, Occupational, Spiritual. Weave these naturally — never name them explicitly.`;

const CONTENT_SOP = `Content standards I've built my system on: No intros, no fluff — drop them into value on the first frame. Four-layer journey: See It→Click It→Watch It→Go Deeper. CTA split: 60% comment-based, 20% DM, 20% link. I measure wins by shares and saves first — not likes.`;

const VOICE = `Write in Jason Fricka's voice. He's a veteran, HR manager, mindset coach, endurance athlete, dad, and real estate agent in Colorado. He talks like he's sitting across the table from you — direct, no fluff, no corporate speak. Short sentences. Real stories. He doesn't hype things up. He doesn't use words like "transform" or "journey" or "unlock your potential." He says what he means. He talks about hard days, early mornings, the work nobody sees, and why showing up matters even when it doesn't feel like it. His community is Elevation Nation — everyday people who refuse to stay where they are. He roots for them out loud. Write like him, not like a marketer writing about him.`;

// ─── PLATFORMS ───────────────────────────────────────────────────────────────
const PLATFORMS = ['Instagram','YouTube','Facebook','LinkedIn'];

// ─── RESEARCH TIERS ──────────────────────────────────────────────────────────
const TIER_PROMPTS = [
  { label:'Quick Pulse', desc:'Top 3 viral angles right now', depth:'surface' },
  { label:'Deep Dive', desc:'Trend analysis + audience psychology', depth:'medium' },
  { label:'Competitor Intel', desc:'What competitors are missing', depth:'deep' },
  { label:'Full Intel', desc:'Everything — trends, gaps, scripts, angles', depth:'full' },
];

// ─── PROMPT VAULT TABS ───────────────────────────────────────────────────────
const VAULT_TABS = [

  // ── MARKET RESEARCH ──────────────────────────────────────────────────────
  { id:'market', label:'🔍 Market Research', color:'#1B4F72', sections:[
    { title:'Tier 1 — Audience Intelligence', when:'Run first', prompts:[
      'Who is the core audience following health and wellness mindset podcasts on Instagram in 2025? Break down by age, pain points, content habits, and what makes them follow a new account. Compare @hubermanlab, @jayshetty, @richroll. Sources max 3 months old.',
      'What emotional triggers cause someone to follow a health/wellness Instagram account vs. just watching one video? Pull from recent social behavior studies, Reddit, and creator interviews from the past 6 months.',
      'What are the top complaints about health and wellness podcast Instagram accounts? Search Reddit, YouTube comments, podcast reviews — what do followers wish creators did differently?',
    ]},
    { title:'Tier 2 — Content Gap & Positioning', when:'Run second', prompts:[
      'Analyze content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, @richroll on Instagram. For each: 3 core themes, what topic they own, and gaps where audience demand exists but nobody is filling it.',
      'What health/wellness Instagram content formats are generating the highest follower conversion in 2025? Focus on Reels under 90 seconds.',
      'Analyze the top 10 performing pieces from @hubermanlab, @jayshetty, @richroll in the past 3 months. What themes, formats, and hooks appear most frequently?',
    ]},
    { title:'Tier 3 — Growth Mechanics', when:'Run third', prompts:[
      'Which health/wellness Instagram creators had the fastest organic follower growth in 2025 and what specific tactics preceded those spikes? Focus on accounts under 100K.',
      'What collaboration patterns are driving the most follower growth for mid-size health/wellness podcast accounts right now?',
      'How did @jayshetty build his Instagram community identity — specifically when he named his audience, and how that affected engagement and growth?',
    ]},
    { title:'Tier 4 — Deep Dive', when:'Run fourth', prompts:[
      'Social media audit of top wellness podcast Instagram accounts — posting cadence, content pillars, engagement patterns, growth signals. Comparison table: @hubermanlab, @jayshetty, @richroll, @mindpumpmedia. Sources max 3 months.',
      'What questions are health/wellness audiences asking most on Reddit, Quora, and YouTube comments in 2025? Group by theme. Which ones is no major creator answering consistently?',
      'Top 5 fastest-growing health/wellness podcast Instagram accounts right now. For each: follower count, growth rate, content breakdown, posting frequency, and the single tactic most responsible for their growth.',
    ]},
  ]},

  // ── INSTAGRAM ────────────────────────────────────────────────────────────
  { id:'instagram', label:'📸 Instagram', color:'#E94560', sections:[
    { title:'Profile Diagnostics — @everydayelevations', when:'Run in order', prompts:[
      'Analyze the Instagram profile @everydayelevations. What does the bio, highlight structure, pinned content, and posting frequency signal to a first-time visitor? What specific elements would cause someone to leave without following?',
      'Compare content style, hook patterns, caption length, and posting frequency of @everydayelevations vs @jayshetty and @hubermanlab. Where is @everydayelevations losing potential followers in the first 3 seconds of a Reel?',
      'What specific elements are missing from @everydayelevations that accounts with 50K–200K followers in health/mindset consistently have?',
      'Analyze the last 30 days of visible content from @everydayelevations. Is there a clear content identity and brand voice? Does each post reinforce a single clear message?',
      'What are the most common reasons a health/wellness Instagram account stays stuck under 10K followers despite consistent posting? Which of these apply to @everydayelevations?',
    ]},
  ]},

  // ── FACEBOOK ─────────────────────────────────────────────────────────────
  { id:'facebook', label:'👥 Facebook', color:'#1877F2', sections:[
    { title:'Profile Diagnostics — facebook.com/jason.fricka', when:'Run in order', prompts:[
      'Analyze the Facebook profile facebook.com/jason.fricka. What does the page structure, about section, and content mix signal to someone discovering Jason for the first time?',
      "How does Facebook's 2025 algorithm treat health/wellness mindset content from personal profiles vs pages? What formats are getting the most organic reach?",
      'What are the top Facebook growth strategies working for health/wellness coaches and podcast hosts in 2025? How does facebook.com/jason.fricka compare to these benchmarks?',
      'What Facebook community-building tactics are driving the most engagement for mindset and wellness creators right now? Should @everydayelevations be running a Facebook Group?',
      'How can Jason Fricka at facebook.com/jason.fricka best repurpose Instagram and podcast content for Facebook without it feeling like cross-posted filler?',
    ]},
  ]},

  // ── YOUTUBE ──────────────────────────────────────────────────────────────
  { id:'youtube', label:'▶️ YouTube', color:'#CC0000', sections:[
    { title:'Channel Diagnostics — @everydayelevations', when:'Run in order', prompts:[
      'Analyze the YouTube channel youtube.com/@everydayelevations. What does the channel art, about section, playlist structure, and upload frequency signal to a first-time visitor?',
      'What YouTube SEO strategies are working best for health/wellness podcast channels in 2025? What keywords, thumbnail styles, and title formats drive the most discovery?',
      "How does YouTube's 2025 algorithm treat long-form podcast content vs. short-form clips for health/wellness creators? What's the optimal content mix?",
      'What are the most common reasons a health/wellness YouTube channel stays under 1K subscribers despite good content? Which apply to youtube.com/@everydayelevations?',
      'How can youtube.com/@everydayelevations best use YouTube Shorts to drive subscribers to long-form content?',
    ]},
  ]},

  // ── LINKEDIN ─────────────────────────────────────────────────────────────
  { id:'linkedin', label:'💼 LinkedIn', color:'#0A66C2', sections:[
    { title:'Dual-Lane Strategy — HR Manager + Podcast Host', when:'Run in order', prompts:[
      'Analyze linkedin.com/in/jason-fricka. He operates in two lanes: HR leadership (Highland Cabinetry HR Manager, HiBob HRIS) and health/wellness mindset coaching via Everyday Elevations podcast. Is the current profile communicating both lanes clearly?',
      'What LinkedIn content strategy lets Jason Fricka build authority in both HR leadership and health/wellness mindset coaching without the lanes conflicting?',
      "What are the fastest-growing LinkedIn content formats for HR professionals in 2025? How can Jason leverage his Highland Cabinetry experience and veteran background to build a People & Culture following?",
      'What LinkedIn formats and topics are driving the most growth for mindset coaches and podcast hosts in 2025? How can Jason bridge Everyday Elevations with his professional HR audience?',
      'How should Jason Fricka position the Everyday Elevations podcast on LinkedIn to attract both HR professionals and general professionals interested in personal growth?',
    ]},
  ]},

  // ── CROSS-PLATFORM ───────────────────────────────────────────────────────
  { id:'crossplatform', label:'🌐 Cross-Platform', color:'#8B4EBF', sections:[
    { title:'Brand Consistency & Repurposing Strategy', when:'Run after individual audits', prompts:[
      'Analyze brand consistency of Jason Fricka across Instagram (@everydayelevations), Facebook (facebook.com/jason.fricka), YouTube (youtube.com/@everydayelevations), and LinkedIn (linkedin.com/in/jason-fricka). Where does messaging break down?',
      'What content from Everyday Elevations podcast and @everydayelevations is being left on the table for repurposing across Facebook, YouTube, LinkedIn? Build a repurposing framework.',
      'What is the optimal cross-platform posting sequence for a health/wellness podcast creator in 2025? If Jason records one episode, what is the ideal content extraction workflow?',
      "Which platform should be Jason Fricka's primary growth focus right now given his goals? Rank platforms by growth potential and explain sequencing strategy.",
      'What cross-platform collaboration opportunities exist for a veteran health/wellness podcast host in Colorado? Which creator types make the strongest cross-promotion partners?',
    ]},
  ]},
];

// ─── AI HELPERS ──────────────────────────────────────────────────────────────
async function ai(message, system='You are a helpful content strategist.') {
  const res = await fetch('/api/claude', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ system, message })
  });
  const d = await res.json();
  return d.text || d.result || d.error || 'No response';
}

async function perp(query) {
  const res = await fetch('/api/perplexity', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ query })
  });
  const d = await res.json();
  return d.result || d.error || 'No response';
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Spin = () => (
  <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}>
    <div style={{
      width:36,
      height:36,
      border:`3px solid ${B.red}`,
      borderTopColor:'transparent',
      borderRadius:'50%',
      animation:'spin 0.8s linear infinite'
    }}/>
  </div>
);

const RedBtn = ({onClick,disabled,children,style={}}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background:disabled?B.gray:B.red,
      color:B.white,
      border:'none',
      borderRadius:8,
      padding:'10px 20px',
      fontWeight:700,
      cursor:disabled?'not-allowed':'pointer',
      fontSize:14,
      transition:'all 0.2s',
      display:'flex',
      alignItems:'center',
      gap:6,
      ...style
    }}
  >
    {children}
  </button>
);

const Card = ({children,style={}}) => (
  <div
    style={{
      background:B.navy2,
      border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:12,
      padding:'1.5rem',
      ...style
    }}
  >
    {children}
  </div>
);

const SecLabel = ({children,style={}}) => (
  <div
    style={{
      fontSize:11,
      fontWeight:700,
      letterSpacing:2,
      color:B.red,
      textTransform:'uppercase',
      marginBottom:8,
      ...style
    }}
  >
    {children}
  </div>
);

const SOPBadge = () => (
  <span
    style={{
      background:'rgba(233,69,96,0.15)',
      color:B.red,
      fontSize:10,
      fontWeight:700,
      padding:'2px 8px',
      borderRadius:20,
      letterSpacing:1
    }}
  >
    MY SYSTEM
  </span>
);

const AngleGrid = ({selected,onSelect}) => (
  <div
    style={{
      display:'grid',
      gridTemplateColumns:'repeat(4,1fr)',
      gap:8,
      marginBottom:16
    }}
  >
    {ANGLES.map(a => (
      <button
        key={a.id}
        onClick={() => onSelect(a.id)}
        style={{
          background:selected===a.id?B.red:'rgba(255,255,255,0.05)',
          border:`1px solid ${selected===a.id?B.red:'rgba(255,255,255,0.1)'}`,
          borderRadius:8,
          padding:'8px 4px',
          cursor:'pointer',
          color:B.white,
          fontSize:11,
          fontWeight:selected===a.id?700:400,
          transition:'all 0.2s'
        }}
      >
        {a.emoji} {a.label}
      </button>
    ))}
  </div>
);

const CopyBtn = ({text}) => {
  const [copied,setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        background:'rgba(255,255,255,0.1)',
        color:B.white,
        border:'none',
        borderRadius:6,
        padding:'6px 14px',
        cursor:'pointer',
        fontSize:12,
        fontWeight:600
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
};

const Output = ({text}) =>
  text ? (
    <div
      style={{
        marginTop:16,
        background:'rgba(0,0,0,0.3)',
        borderRadius:8,
        padding:'1rem',
        position:'relative',
        border:'1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{position:'absolute',top:8,right:8}}>
        <CopyBtn text={text}/>
      </div>
      <pre
        style={{
          color:B.white,
          fontSize:13,
          whiteSpace:'pre-wrap',
          margin:0,
          lineHeight:1.7,
          fontFamily:'inherit',
          paddingRight:80
        }}
      >
        {text}
      </pre>
    </div>
  ) : null;

// (rest of your component code, JSX, etc., continues exactly as in index-2.js)
