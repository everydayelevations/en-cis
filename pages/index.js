import { useState } from 'react';
import Head from 'next/head';

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = { navy: '#0A1628', red: '#E94560', white: '#FFFFFF',
  navy2: '#0D1F3C', gray: '#8892A4', light: '#F0F4FA' };

// ─── CONTENT ANGLES ──────────────────────────────────────────────────────────
const ANGLES = [
  { id:'veteran',  emoji:'🎖️', label:'Veteran / Resilience' },
  { id:'mindset',  emoji:'🧠', label:'Mindset & Mental Toughness' },
  { id:'wins',     emoji:'⚡', label:'Everyday Wins' },
  { id:'outdoor',  emoji:'🏔️', label:'Outdoor Living & Community' },
  { id:'finance',  emoji:'💰', label:'Finance & Real Estate' },
  { id:'podcast',  emoji:'🎙️', label:'Podcast & Personal Growth' },
  { id:'family',   emoji:'❤️', label:'Family & Life Lessons' },
  { id:'health',   emoji:'💪', label:'Health & Physical Wellness' },
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
  { id:'instagram', label:'Instagram', prompts:[
    'Write a Reel hook that stops the scroll for [topic]',
    'Give me 5 pattern-interrupt openers for [niche]',
    'Write a carousel outline: problem→solution→CTA for [topic]',
    'Create a Story sequence that drives DMs for [offer]',
    'Write a caption that gets saves for [topic]',
    'Repurpose this blog post into a 3-slide carousel: [paste]',
  ]},
  { id:'youtube', label:'YouTube', prompts:[
    'Write a YouTube title + thumbnail concept for [topic]',
    'Create a 10-minute video outline with retention hooks',
    'Write a YouTube description with SEO keywords for [topic]',
    'Give me a Strong open for a YouTube video on [topic]',
    'Write end screen CTA script for [channel goal]',
  ]},
  { id:'facebook', label:'Facebook', prompts:[
    'Write a Facebook post that drives comments for [topic]',
    'Create a Facebook Group engagement prompt for [niche]',
    'Write a long-form Facebook story post for [personal story]',
    'Give me a Facebook Live outline for [topic]',
  ]},
  { id:'linkedin', label:'LinkedIn', prompts:[
    'Write a LinkedIn post that builds authority for [topic]',
    'Create a LinkedIn carousel: insight→lesson→CTA',
    'Write a LinkedIn connection request message for [context]',
    'Give me a LinkedIn hook for a professional audience on [topic]',
    'Write a thought leadership post about [experience]',
  ]},
  { id:'hooks', label:'Hooks', prompts:[
    'Give me 10 pattern-interrupt hooks for [topic]',
    'Write 5 question hooks that create curiosity for [topic]',
    'Give me bold statement hooks that challenge [belief]',
    'Write personal story hooks starting with "The day I..."',
    'Give me data-driven hooks with surprising stats about [topic]',
  ]},
  { id:'repurpose', label:'Repurpose', prompts:[
    'Turn this Instagram script into a LinkedIn post: [paste]',
    'Convert this YouTube script into an Instagram Reel: [paste]',
    'Repurpose this podcast episode into 5 social posts: [paste]',
    'Turn this blog post into a Twitter/X thread: [paste]',
    'Convert this long-form content into a carousel: [paste]',
  ]},
];

// ─── AI HELPERS ──────────────────────────────────────────────────────────────
async function ai(prompt, system='') {
  const res = await fetch('/api/claude', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt, system })
  });
  const d = await res.json();
  return d.result || d.error || 'No response';
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
    <div style={{width:36,height:36,border:`3px solid ${B.red}`,borderTopColor:'transparent',
      borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
  </div>
);

const RedBtn = ({onClick,disabled,children,style={}}) => (
  <button onClick={onClick} disabled={disabled}
    style={{background:disabled?B.gray:B.red,color:B.white,border:'none',
      borderRadius:8,padding:'10px 20px',fontWeight:700,cursor:disabled?'not-allowed':'pointer',
      fontSize:14,transition:'all 0.2s',...style}}>
    {children}
  </button>
);

const Card = ({children,style={}}) => (
  <div style={{background:B.navy2,border:`1px solid rgba(255,255,255,0.08)`,
    borderRadius:12,padding:'1.5rem',...style}}>
    {children}
  </div>
);

const SecLabel = ({children}) => (
  <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:B.red,
    textTransform:'uppercase',marginBottom:8}}>
    {children}
  </div>
);

const SOPBadge = () => (
  <span style={{background:'rgba(233,69,96,0.15)',color:B.red,fontSize:10,
    fontWeight:700,padding:'2px 8px',borderRadius:20,letterSpacing:1}}>
    MY SYSTEM
  </span>
);

const AngleGrid = ({selected,onSelect}) => (
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
    {ANGLES.map(a => (
      <button key={a.id} onClick={() => onSelect(a.id)}
        style={{background:selected===a.id?B.red:'rgba(255,255,255,0.05)',
          border:`1px solid ${selected===a.id?B.red:'rgba(255,255,255,0.1)'}`,
          borderRadius:8,padding:'8px 4px',cursor:'pointer',color:B.white,
          fontSize:11,fontWeight:selected===a.id?700:400,transition:'all 0.2s'}}>
        {a.emoji} {a.label}
      </button>
    ))}
  </div>
);

const CopyBtn = ({text}) => {
  const [copied,setCopied] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
      style={{background:'rgba(255,255,255,0.1)',color:B.white,border:'none',
        borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>
      {copied?'✓ Copied':'Copy'}
    </button>
  );
};

const Output = ({text}) => text ? (
  <div style={{marginTop:16,background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'1rem',
    position:'relative',border:`1px solid rgba(255,255,255,0.1)`}}>
    <div style={{position:'absolute',top:8,right:8}}><CopyBtn text={text}/></div>
    <pre style={{color:B.white,fontSize:13,whiteSpace:'pre-wrap',margin:0,lineHeight:1.7,
      fontFamily:'inherit',paddingRight:80}}>{text}</pre>
  </div>
) : null;

// ─── AI PROMPTS ───────────────────────────────────────────────────────────────

const SCRIPT_PROMPT = (topic, angle, platform) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Create 3 distinct ${platform} video script variations for: "${topic}"
Content angle: ${angle}

FORMAT EACH:
**VARIATION 1: Educational**
[Hook - pattern interrupt, first 2 seconds]
[Body - 3 teaching points, no fluff]
[CTA - comment/DM/link]

**VARIATION 2: Trend-Responsive**  
[Hook - references current moment]
[Body - connects trend to Jason's world]
[CTA]

**VARIATION 3: Personal Story**
[Hook - "The day I..." or specific moment]
[Body - story arc: problem→shift→result]
[CTA]

Each script: 60-90 seconds when spoken. No intros. No "Hey guys." Start with the hook.`;

const STITCH_PROMPT = (originalContent, angle) => `
${VOICE}
${CONTENT_SOP}

Write a viral stitch response script for: "${originalContent}"
Angle: ${angle}

Structure:
[3-second hook that sets up the contrast]
[2-3 points that add, challenge, or elevate the original]
[Strong CTA that drives conversation]

Rules: Respectful but confident. Add genuine value. End with a question that drives comments.`;

const TREND_PROMPT = (niche) => `
You are a viral content strategist for @everydayelevations.
Find 6-8 trending topics right now in: ${niche}

Return as JSON array:
[{
  "trend": "trend name",
  "why_viral": "psychology behind it",
  "jason_angle": "how Jason specifically should approach this",
  "hook": "specific hook line",
  "format": "Reel/Carousel/Story/Live"
}]

Focus on: veteran/mindset/real estate/personal growth/outdoor lifestyle spaces.`;

const PIPELINE_EXTRACT = (rawResearch, angle) => `
${VOICE}
${SWARBRICK}

Extract intelligence from this research for a ${angle} content angle:

RESEARCH:
${rawResearch}

Extract:
1. **Top 3 Viral Angles** (with psychological trigger)
2. **Audience Pain Points** (what they're searching for)
3. **Content Gaps** (what nobody is saying)
4. **Best Hook Ideas** (5 specific hooks)
5. **Recommended Format** (why)
6. **Jason's Unique POV** (how his experience gives him authority here)`;

const PIPELINE_SCRIPT = (intel, platform) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Turn this intelligence into a camera-ready ${platform} script:

INTEL:
${intel}

Write a complete script:
- Hook (pattern interrupt, first 2 seconds)
- Body (3 points max, value-first, no fluff)
- CTA (appropriate for platform)
- Thumbnail/Cover concept
- Caption with hashtag strategy`;

const CALENDAR_PROMPT = (pillars, platform, duration) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Build a ${duration}-day ${platform} content calendar.
Content pillars: ${pillars}

4-Week Content Framework:
- Week 1: Pain Awareness (identify the problem)
- Week 2: Transformation (show the shift)
- Week 3: Authority (prove the method)
- Week 4: Conversion (invite action)
${duration === '90' ? '- Repeat cycle with escalating depth for weeks 5-12' : ''}

For each day provide:
- Day number + day of week
- Content format (Reel/Carousel/Story/Post)
- Specific topic/title (not generic — real hook)
- Content angle (from: Veteran/Mindset/Wins/Outdoor/Finance/Podcast/Family/Health)
- CTA type (comment/DM/link)

Output as a clean table. Make every topic specific enough to film tomorrow.`;

const EPISODE_PROMPT = (episodeTitle, episodeNotes) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Podcast episode: "${episodeTitle}"
Notes: ${episodeNotes}

Extract and create:

1. **5-7 Platform-Native Clips**
   For each clip:
   - Timestamp/moment to pull
   - Platform (Instagram/YouTube/Facebook/LinkedIn)
   - Hook to add at the front
   - Caption

2. **Carousel Concept**
   - Title slide
   - 5-7 insight slides
   - CTA slide

3. **LinkedIn Long-Form Angle**
   Full post concept with hook + body structure

4. **Quote Graphics** (5 pullable quotes with visual direction)

5. **Email Newsletter Teaser**`;

const REPURPOSE_PROMPT = (script, originalPlatform) => `
${VOICE}
${CONTENT_SOP}

Original ${originalPlatform} script:
${script}

Repurpose into 4 platform-native versions:

**INSTAGRAM REEL** (60-90 sec, hook-heavy, visual)
**YOUTUBE SHORT** (under 60 sec, strong title, SEO)  
**FACEBOOK** (conversational, story-driven, community)
**LINKEDIN** (professional, thought leadership, no hashtag spam)

Each version should feel native — not copy-pasted. Adjust tone, length, and CTA for each platform's culture.`;

const HOOK_PROMPT = (topic, quantity) => `
${VOICE}

Write ${quantity} hooks for the topic: "${topic}"

Deliver in 5 categories (${Math.ceil(quantity/5)} each):

🔥 PATTERN INTERRUPT (challenges assumptions, surprises)
❓ QUESTION (creates irresistible curiosity)
💣 BOLD STATEMENT (controversial or counterintuitive)
📖 PERSONAL STORY (specific moment, "The day I...")
📊 DATA & STATS (surprising number or fact)

Rules:
- First 2-3 words must grab — think thumb-stop
- No "Hey guys" or "In this video"
- Every hook must make viewer think "wait, what?"
- Specific beats vague every time`;

const MAGNET_PROMPT = (audience, problem, offer) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Audience: ${audience}
Core Problem: ${problem}
Existing Offer: ${offer}

Create a complete lead magnet system:

1. **Lead Magnet Concept**
   - Title (value-packed, specific)
   - Format (checklist/guide/video/challenge)
   - Core promise
   - 5-7 key deliverables

2. **Delivery Reel Script** (the content that promotes the magnet)
   - Hook
   - Value preview (tease 3 things inside)
   - CTA: "Comment X to get it"

3. **3-Email Welcome Sequence**
   Email 1: Deliver + quick win
   Email 2: Story + deeper value
   Email 3: Soft offer or next step

4. **Instagram Story Sequence** (5 slides to promote)`;

const COMMUNITY_PROMPT = (focus) => `
${VOICE}
${SWARBRICK}

Build an Elevation Nation community system around: "${focus}"

1. **Community Identity Statement** (why people belong here)

2. **Core Challenge/Ritual** (weekly or monthly recurring thing members do together)

3. **Engagement Architecture**
   - Daily: [prompt/question]
   - Weekly: [challenge/event]
   - Monthly: [milestone/celebration]

4. **Onboarding Script** (what new members see first)

5. **Content Themes** (5 recurring series that keep people coming back)

6. **Growth Loop** (how members naturally invite others)`;

const REVIEW_PROMPT = (metrics, wins, struggles) => `
${VOICE}
${SWARBRICK}
${CONTENT_SOP}

Weekly Performance Review:

METRICS: ${metrics}
WINS: ${wins}
STRUGGLES: ${struggles}

Analyze:

1. **Performance Score** (0-10 across: Reach, Engagement, Saves, Shares, Leads)

2. **What's Working** (double down on these)

3. **What's Not** (kill or pivot)

4. **Swarbrick Gap Analysis** (which life dimensions are underrepresented in content)

5. **Next Week's Focus** (top 3 priorities with specific action)

6. **Content to Create This Week** (3 specific post ideas based on what performed)`;

const PROFILE_PROMPT = (platform, currentBio) => `
${VOICE}
${CONTENT_SOP}

Platform: ${platform}
Current bio/profile: ${currentBio || 'Not provided'}

Optimize the complete profile for maximum conversion:

1. **Profile Photo Direction** (what to wear, background, expression)
2. **Username/Handle** (if improvable)
3. **Name Field** (SEO + searchability)
4. **Bio** (complete rewrite — hook, value, CTA, keywords)
5. **Link Strategy** (what to put in link-in-bio)
6. **Highlight Covers** (for Instagram — names + strategy)
${platform === 'LinkedIn' ? `
7. **Dual-Lane Strategy** (HR Manager + Podcast Host — how to serve both audiences)
8. **Featured Section** (what to pin)
9. **About Section** (full rewrite)` : ''}`;

const COLLAB_PROMPT = (niche, goal) => `
${VOICE}

Niche: ${niche}
Collaboration Goal: ${goal}

Find and structure collaboration opportunities:

1. **Podcast Guest Targets** (5 specific profiles with why they fit Jason's audience)

2. **Stitch/Collab Targets** (5 creators to stitch with — explain the angle)

3. **Community Partnerships** (3 organizations/communities to partner with)

4. **Pitch Template**
   [Subject line]
   [Opening that shows you know their work]
   [The ask — specific and easy to say yes to]
   [The mutual value]
   [CTA]`;

const ONBOARD_PROMPT = (goals, currentState, timeCommitment) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Goals: ${goals}
Current State: ${currentState}
Weekly Time Available: ${timeCommitment} hours

Build a complete 90-Day Elevation Nation Content Strategy. Write it like Jason would explain it to himself — clear, no fluff, actionable. Not a corporate strategy deck. A real plan he can execute.

**PHASE 1 (Days 1-30): Foundation**
- Platform priority + rationale
- Content pillars (3-4 max)
- Posting frequency per platform
- First 5 pieces of content to create

**PHASE 2 (Days 31-60): Momentum**
- Content expansion strategy
- Community building moves
- Lead magnet deployment
- Collaboration targets

**PHASE 3 (Days 61-90): Scale**
- Repurposing system
- Analytics review process
- Offer alignment
- Revenue pathway

Include: Weekly schedule template, content batching strategy, tools needed.`;

const DESIGN_PROMPT = (topic, format, angle) => `
${VOICE}

Topic: ${topic}
Format: ${format} (Carousel/Static/Story)
Angle: ${angle}

Create visual content concepts:

1. **Cover/Hook Slide**
   - Headline text (8 words max)
   - Visual direction (photo/graphic/color)
   - Typography mood

2. **Content Slides** (for carousels: 5-7 slides)
   Each slide:
   - Slide purpose
   - Headline
   - Supporting text (1-2 lines max)
   - Visual element

3. **CTA Slide**
   - Text
   - Visual
   - Next action

4. **Caption** (Instagram-native, saves-first)
5. **Hashtag Strategy** (15-20 tags, tiered: niche/medium/broad)`;

const EP_PROMPT = (content, question) => `
${VOICE}
${SWARBRICK}

Content to analyze:
${content}

Question/Focus: ${question || 'Extract the most valuable insights'}

Extract:
1. **Core Insight** (the single most powerful idea)
2. **Supporting Evidence** (data, stories, examples)
3. **Contrarian Take** (what this challenges in mainstream thinking)
4. **Actionable Takeaway** (what someone can do TODAY)
5. **Content Angles** (5 ways to create content from this)
6. **Audience Psychology** (why this resonates deeply)`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function Home({setNav,setSub}) {
  const tools = [
    {nav:'strategy',sub:'onboard',emoji:'🚀',title:'90-Day Onboarding',desc:'Full strategy doc in minutes'},
    {nav:'strategy',sub:'calendar',emoji:'📅',title:'Content Calendar',desc:'30/90-day calendar engine'},
    {nav:'strategy',sub:'profile',emoji:'👤',title:'Profile Audit',desc:'Optimize all 4 platforms'},
    {nav:'strategy',sub:'magnet',emoji:'🧲',title:'Lead Magnet Builder',desc:'Build your capture system'},
    {nav:'strategy',sub:'community',emoji:'🏔️',title:'Community Builder',desc:'Elevation Nation systems'},
    {nav:'research',sub:'pipeline',emoji:'🔬',title:'Research Pipeline',desc:'Perplexity → Script engine'},
    {nav:'research',sub:'vault',emoji:'🗄️',title:'Prompt Vault',desc:'25+ proven prompts'},
    {nav:'research',sub:'collab',emoji:'🤝',title:'Collab Finder',desc:'Guest & partner targets'},
    {nav:'research',sub:'extract',emoji:'💡',title:'Insight Extractor',desc:'Pull gold from any content'},
    {nav:'create',sub:'script',emoji:'✍️',title:'Script Engine',desc:'Write + Stitch scripts'},
    {nav:'create',sub:'episode',emoji:'🎙️',title:'Episode to Clips',desc:'One episode → 5+ assets'},
    {nav:'create',sub:'repurpose',emoji:'♻️',title:'Repurpose Engine',desc:'One post → all platforms'},
    {nav:'create',sub:'hooks',emoji:'🪝',title:'Hook Library',desc:'40 hooks on any topic'},
    {nav:'create',sub:'design',emoji:'🎨',title:'Design Studio',desc:'Carousel & post concepts'},
    {nav:'optimize',sub:'review',emoji:'📊',title:'Weekly Review',desc:'Performance + Swarbrick audit'},
  ];
  return (
    <div>
      <div style={{textAlign:'center',padding:'2rem 0 2.5rem'}}>
        <img src="/E-E-Logo.jpg" alt="Elevation Nation" style={{width:72,height:72,borderRadius:'50%',marginBottom:12}}/>
        <h1 style={{color:B.white,fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:900,margin:'0 0 6px'}}>
          EN-CIS <span style={{color:B.red}}>Command Center</span>
        </h1>
        <p style={{color:B.gray,fontSize:14,margin:0}}>Elevation Nation Content Intelligence System</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        {tools.map(t => (
          <button key={t.sub} onClick={()=>{setNav(t.nav);setSub(t.sub);}}
            style={{background:B.navy2,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:12,
              padding:'1.2rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s',color:B.white,
              ':hover':{borderColor:B.red}}}>
            <div style={{fontSize:28,marginBottom:8}}>{t.emoji}</div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{t.title}</div>
            <div style={{color:B.gray,fontSize:12}}>{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Onboarding() {
  const [goals,setGoals] = useState(
    `Grow @everydayelevations from ~2,400 Instagram followers to 10,000 by end of 2025. Post consistently 5x/week on Instagram. Launch Elevation Nation as a recognizable community identity. Start building an email list from zero — target 500 subscribers in 90 days. Book 3 meaningful podcast guests. Generate at least 1 real estate lead per month through content. Keep it real — no fake hype, no gimmicks.`
  );
  const [current,setCurrent] = useState(
    `Instagram: ~2,400 followers, posting 2-3x/week inconsistently, no clear content schedule. YouTube: @everydayelevations exists but underused. Facebook: facebook.com/jason.fricka active but no strategy. LinkedIn: linkedin.com/in/jason-fricka — HR Manager at Highland Cabinetry + podcast host, dual-lane not leveraged. No email list. No lead magnet. Everyday Elevations podcast running. Colorado-based. Full-time HR job + real estate license + family.`
  );
  const [hours,setHours] = useState('10');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const [downloading,setDownloading] = useState(false);

  const run = async () => {
    if(!goals) return;
    setLoading(true); setOut('');
    const res = await ai(ONBOARD_PROMPT(goals, current, hours));
    setOut(res); setLoading(false);
  };

  const downloadDoc = async () => {
    if(!out) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/claude', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          prompt: `Convert this strategy document into clean HTML that could be printed or saved as a document. Use proper headings (h1, h2, h3), bullet points, and bold text. Make it professional and readable. Return ONLY the HTML body content, no <html> or <body> tags:\n\n${out}`,
          system: 'You convert markdown/text strategy documents into clean, well-formatted HTML. Return only the inner HTML content.'
        })
      });
      const d = await res.json();
      const html = d.result || '';
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Everyday Elevations — 90-Day Strategy</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#111;line-height:1.7}h1{color:#0A1628;border-bottom:3px solid #E94560;padding-bottom:8px}h2{color:#0A1628;margin-top:32px}h3{color:#E94560}strong{color:#0A1628}li{margin-bottom:6px}@media print{body{margin:24px}}</style></head><body><h1>Everyday Elevations — 90-Day Content Strategy</h1>${html}</body></html>`;
      const blob = new Blob([fullHtml], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'EverydayElevations-90DayStrategy.html';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🚀</span>
        <div><h2 style={{color:B.white,margin:0}}>90-Day Strategy Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Pre-filled with your numbers. Edit anything, then generate.</p></div>
      </div>
      <Card>
        <SecLabel>Your Goals</SecLabel>
        <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={5}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',lineHeight:1.6}}/>
        <SecLabel style={{marginTop:16}}>Current State</SecLabel>
        <textarea value={current} onChange={e=>setCurrent(e.target.value)} rows={5}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',lineHeight:1.6}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16,flexWrap:'wrap'}}>
          <SecLabel style={{margin:0}}>Hours/Week:</SecLabel>
          {['3','5','10','15','20+'].map(h => (
            <button key={h} onClick={()=>setHours(h)}
              style={{background:hours===h?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:hours===h?700:400}}>
              {h}
            </button>
          ))}
        </div>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!goals}>
          {loading?'Building Strategy...':'Build 90-Day Strategy'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:10}}>
            <span style={{color:B.white,fontWeight:700,fontSize:15}}>Your 90-Day Strategy</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={downloadDoc} disabled={downloading}
                style={{background:downloading?B.gray:'#0A1628',color:B.white,border:`1px solid rgba(255,255,255,0.2)`,
                  borderRadius:8,padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',
                  fontSize:13,display:'flex',alignItems:'center',gap:6,transition:'all 0.2s'}}>
                {downloading ? 'Preparing...' : '⬇ Download Strategy Doc'}
              </button>
            </div>
          </div>
          <Output text={out}/>
        </div>
      )}
    </div>
  );
}

function ContentCalendar() {
  const [pillars,setPillars] = useState('');
  const [platform,setPlatform] = useState('Instagram');
  const [duration,setDuration] = useState('30');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!pillars) return;
    setLoading(true); setOut('');
    const res = await ai(CALENDAR_PROMPT(pillars, platform, duration));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>📅</span>
        <div><h2 style={{color:B.white,margin:0}}>Content Calendar Engine</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>4-week content framework — every topic filmable tomorrow <SOPBadge/></p></div>
      </div>
      <Card>
        <SecLabel>Content Pillars</SecLabel>
        <input value={pillars} onChange={e=>setPillars(e.target.value)}
          placeholder="e.g. Veteran mindset, Real estate tips, Family lessons, Fitness..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
        <div style={{display:'flex',gap:24,marginTop:16,flexWrap:'wrap'}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:8}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={()=>setPlatform(p)}
                  style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SecLabel>Duration</SecLabel>
            <div style={{display:'flex',gap:8}}>
              {['30','60','90'].map(d => (
                <button key={d} onClick={()=>setDuration(d)}
                  style={{background:duration===d?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:duration===d?700:400}}>
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!pillars}>
          {loading?'Building Calendar...':'Build Calendar'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function ProfileAudit() {
  const [platform,setPlatform] = useState('Instagram');
  const [currentBio,setCurrentBio] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setOut('');
    const res = await ai(PROFILE_PROMPT(platform, currentBio));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>👤</span>
        <div><h2 style={{color:B.white,margin:0}}>Profile Audit & Optimizer</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>4-platform conversion optimization</p></div>
      </div>
      <Card>
        <SecLabel>Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={()=>setPlatform(p)}
              style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
              {p} {p==='LinkedIn'?'(Dual-Lane)':''}
            </button>
          ))}
        </div>
        <SecLabel>Current Bio / Profile (optional)</SecLabel>
        <textarea value={currentBio} onChange={e=>setCurrentBio(e.target.value)} rows={4}
          placeholder="Paste your current bio, about section, or leave blank for a fresh start..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading}>
          {loading?'Analyzing...':'Optimize Profile'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function LeadMagnet() {
  const [audience,setAudience] = useState('');
  const [problem,setProblem] = useState('');
  const [offer,setOffer] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!audience||!problem) return;
    setLoading(true); setOut('');
    const res = await ai(MAGNET_PROMPT(audience, problem, offer));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🧲</span>
        <div><h2 style={{color:B.white,margin:0}}>Lead Magnet Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Magnet concept + delivery Reel + email sequence <SOPBadge/></p></div>
      </div>
      <Card>
        <SecLabel>Target Audience</SecLabel>
        <input value={audience} onChange={e=>setAudience(e.target.value)}
          placeholder="e.g. Veterans transitioning to civilian life, First-time home buyers..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Core Problem You Solve</SecLabel>
        <input value={problem} onChange={e=>setProblem(e.target.value)}
          placeholder="e.g. Feeling lost after military service, Not knowing where to start with real estate..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Existing Offer (optional)</SecLabel>
        <input value={offer} onChange={e=>setOffer(e.target.value)}
          placeholder="e.g. Mindset coaching, Real estate consultation, Podcast community..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!audience||!problem}>
          {loading?'Building Magnet System...':'Build Lead Magnet System'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function CommunityBuilder() {
  const [focus,setFocus] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!focus) return;
    setLoading(true); setOut('');
    const res = await ai(COMMUNITY_PROMPT(focus));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🏔️</span>
        <div><h2 style={{color:B.white,margin:0}}>Community Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Elevation Nation systems — everyday people who refuse to stay where they are</p></div>
      </div>
      <Card>
        <SecLabel>Community Focus / Theme</SecLabel>
        <input value={focus} onChange={e=>setFocus(e.target.value)}
          placeholder="e.g. Veterans building their next chapter, Mindset for everyday wins..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!focus}>
          {loading?'Building Community System...':'Build Community System'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function Pipeline() {
  const [query,setQuery] = useState('');
  const [angle,setAngle] = useState('veteran');
  const [platform,setPlatform] = useState('Instagram');
  const [tier,setTier] = useState(0);
  const [step,setStep] = useState('idle'); // idle | researching | extracting | scripting
  const [research,setResearch] = useState('');
  const [intel,setIntel] = useState('');
  const [script,setScript] = useState('');

  const runResearch = async () => {
    if(!query) return;
    setStep('researching'); setResearch(''); setIntel(''); setScript('');
    const t = TIER_PROMPTS[tier];
    const res = await perp(`${t.desc}: ${query} — focus on ${ANGLES.find(a=>a.id===angle)?.label} angle`);
    setResearch(res); setStep('idle');
  };
  const runExtract = async () => {
    if(!research) return;
    setStep('extracting'); setIntel(''); setScript('');
    const res = await ai(PIPELINE_EXTRACT(research, ANGLES.find(a=>a.id===angle)?.label));
    setIntel(res); setStep('idle');
  };
  const runScript = async () => {
    if(!intel) return;
    setStep('scripting'); setScript('');
    const res = await ai(PIPELINE_SCRIPT(intel, platform));
    setScript(res); setStep('idle');
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🔬</span>
        <div><h2 style={{color:B.white,margin:0}}>Research Pipeline</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Perplexity research → Intelligence extraction → Camera-ready script</p></div>
      </div>
      <Card style={{marginBottom:16}}>
        <SecLabel>Research Topic</SecLabel>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="e.g. Veteran mental health stigma, Colorado real estate 2025..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Content Angle</SecLabel>
        <AngleGrid selected={angle} onSelect={setAngle}/>
        <SecLabel>Research Depth</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
          {TIER_PROMPTS.map((t,i) => (
            <button key={i} onClick={()=>setTier(i)}
              style={{background:tier===i?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:8,padding:'10px 8px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:13}}>{t.label}</div>
              <div style={{color:tier===i?'rgba(255,255,255,0.8)':B.gray,fontSize:11,marginTop:2}}>{t.desc}</div>
            </button>
          ))}
        </div>
        <RedBtn onClick={runResearch} disabled={step==='researching'||!query}>
          {step==='researching'?'Researching...':'Step 1: Research'}
        </RedBtn>
      </Card>
      {research && (
        <Card style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <SecLabel style={{margin:0}}>Raw Research</SecLabel>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={research}/>
              <RedBtn onClick={runExtract} disabled={step==='extracting'} style={{padding:'6px 14px',fontSize:13}}>
                {step==='extracting'?'Extracting...':'Step 2: Extract Intel'}
              </RedBtn>
            </div>
          </div>
          <pre style={{color:B.white,fontSize:12,whiteSpace:'pre-wrap',margin:0,lineHeight:1.6,
            maxHeight:200,overflowY:'auto'}}>{research}</pre>
        </Card>
      )}
      {intel && (
        <Card style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <SecLabel style={{margin:0}}>Extracted Intelligence</SecLabel>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={intel}/>
              <div>
                <SecLabel style={{margin:'0 0 4px',fontSize:10}}>Platform</SecLabel>
                <div style={{display:'flex',gap:6}}>
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={()=>setPlatform(p)}
                      style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                        borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:12}}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <RedBtn onClick={runScript} disabled={step==='scripting'} style={{padding:'6px 14px',fontSize:13}}>
                {step==='scripting'?'Scripting...':'Step 3: Write Script'}
              </RedBtn>
            </div>
          </div>
          <pre style={{color:B.white,fontSize:12,whiteSpace:'pre-wrap',margin:0,lineHeight:1.6,
            maxHeight:250,overflowY:'auto'}}>{intel}</pre>
        </Card>
      )}
      {script && <Output text={script}/>}
      {(step==='researching'||step==='extracting'||step==='scripting') && <Spin/>}
    </div>
  );
}

function Vault() {
  const [activeTab,setActiveTab] = useState('instagram');
  const [copied,setCopied] = useState(null);
  const current = VAULT_TABS.find(t=>t.id===activeTab);
  const copyPrompt = (p,i) => {
    navigator.clipboard.writeText(p);
    setCopied(i);
    setTimeout(()=>setCopied(null),2000);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🗄️</span>
        <div><h2 style={{color:B.white,margin:0}}>Prompt Vault</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>25+ battle-tested prompts — copy and run anywhere</p></div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {VAULT_TABS.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{background:activeTab===t.id?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
              borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:activeTab===t.id?700:400}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{display:'grid',gap:10}}>
        {current.prompts.map((p,i) => (
          <Card key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px'}}>
            <span style={{color:B.white,fontSize:13,flex:1}}>{p}</span>
            <button onClick={()=>copyPrompt(p,i)}
              style={{background:copied===i?'rgba(46,204,113,0.2)':B.red,color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700,
                marginLeft:12,whiteSpace:'nowrap'}}>
              {copied===i?'✓ Copied':'Copy'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CollabFinder() {
  const [niche,setNiche] = useState('');
  const [goal,setGoal] = useState('podcast guest');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!niche) return;
    setLoading(true); setOut('');
    const researchQ = `Find collaboration opportunities in ${niche} for ${goal}`;
    const perpRes = await perp(researchQ);
    const finalRes = await ai(COLLAB_PROMPT(niche, goal) + '\n\nResearch data:\n' + perpRes);
    setOut(finalRes); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🤝</span>
        <div><h2 style={{color:B.white,margin:0}}>Collab Finder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Perplexity-powered guest targets + pitch templates</p></div>
      </div>
      <Card>
        <SecLabel>Niche / Space</SecLabel>
        <input value={niche} onChange={e=>setNiche(e.target.value)}
          placeholder="e.g. Veteran wellness, Colorado real estate, Personal development podcasts..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Collaboration Type</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['podcast guest','stitch/collab','community partner','brand deal'].map(g => (
            <button key={g} onClick={()=>setGoal(g)}
              style={{background:goal===g?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,textTransform:'capitalize',
                fontWeight:goal===g?700:400}}>
              {g}
            </button>
          ))}
        </div>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!niche}>
          {loading?'Finding Collabs...':'Find Collaborations'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function Extract() {
  const [content,setContent] = useState('');
  const [question,setQuestion] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!content) return;
    setLoading(true); setOut('');
    const res = await ai(EP_PROMPT(content, question));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>💡</span>
        <div><h2 style={{color:B.white,margin:0}}>Insight Extractor</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Pull gold from any content — articles, interviews, books, transcripts</p></div>
      </div>
      <Card>
        <SecLabel>Content to Analyze</SecLabel>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6}
          placeholder="Paste any content: article, interview transcript, book excerpt, speech..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Specific Question / Focus (optional)</SecLabel>
        <input value={question} onChange={e=>setQuestion(e.target.value)}
          placeholder="e.g. How does this apply to veterans? What's the content angle for real estate?"
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!content}>
          {loading?'Extracting Insights...':'Extract Insights'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function ScriptEngine() {
  const [mode,setMode] = useState('write'); // write | stitch
  const [topic,setTopic] = useState('');
  const [angle,setAngle] = useState('mindset');
  const [platform,setPlatform] = useState('Instagram');
  const [stitchContent,setStitchContent] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');
    let res;
    if(mode==='write') {
      if(!topic) { setLoading(false); return; }
      const angleLabel = ANGLES.find(a=>a.id===angle)?.label;
      res = await ai(SCRIPT_PROMPT(topic, angleLabel, platform));
    } else {
      if(!stitchContent) { setLoading(false); return; }
      const angleLabel = ANGLES.find(a=>a.id===angle)?.label;
      res = await ai(STITCH_PROMPT(stitchContent, angleLabel));
    }
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>✍️</span>
        <div><h2 style={{color:B.white,margin:0}}>Script Engine</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>3 script variations — Write original or Stitch response <SOPBadge/></p></div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'write',label:'✍️ Write Script'},{id:'stitch',label:'🔗 Stitch Response'}].map(m => (
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{background:mode===m.id?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
              borderRadius:8,padding:'10px 20px',cursor:'pointer',fontSize:14,fontWeight:mode===m.id?700:400}}>
            {m.label}
          </button>
        ))}
      </div>
      <Card>
        {mode==='write' ? (
          <>
            <SecLabel>Topic / Idea</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why most people quit before they see results..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
            <SecLabel>Content Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={()=>setPlatform(p)}
                  style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SecLabel>Original Content to Stitch</SecLabel>
            <textarea value={stitchContent} onChange={e=>setStitchContent(e.target.value)} rows={4}
              placeholder="Paste the original post, video description, or quote you want to stitch/respond to..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
            <SecLabel>Your Response Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
          </>
        )}
        <RedBtn onClick={run} disabled={loading||(mode==='write'?!topic:!stitchContent)}>
          {loading?'Writing Script...':mode==='write'?'Write 3 Script Variations':'Write Stitch Response'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function EpisodeClips() {
  const [title,setTitle] = useState('');
  const [notes,setNotes] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!title) return;
    setLoading(true); setOut('');
    const res = await ai(EPISODE_PROMPT(title, notes));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🎙️</span>
        <div><h2 style={{color:B.white,margin:0}}>Episode to Clips</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>One podcast episode → 5-7 clips + carousel + LinkedIn + quotes + email</p></div>
      </div>
      <Card>
        <SecLabel>Episode Title</SecLabel>
        <input value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="e.g. How I went from active duty to building 3 businesses..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Episode Notes / Key Points (optional)</SecLabel>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
          placeholder="Paste show notes, key timestamps, main topics covered..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!title}>
          {loading?'Extracting Clips...':'Extract All Clips & Assets'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function RepurposeEngine() {
  const [script,setScript] = useState('');
  const [originalPlatform,setOriginalPlatform] = useState('Instagram');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!script) return;
    setLoading(true); setOut('');
    const res = await ai(REPURPOSE_PROMPT(script, originalPlatform));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>♻️</span>
        <div><h2 style={{color:B.white,margin:0}}>Repurpose Engine</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>One script → 4 platform-native versions <SOPBadge/></p></div>
      </div>
      <Card>
        <SecLabel>Original Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={()=>setOriginalPlatform(p)}
              style={{background:originalPlatform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:originalPlatform===p?700:400}}>
              {p}
            </button>
          ))}
        </div>
        <SecLabel>Original Script</SecLabel>
        <textarea value={script} onChange={e=>setScript(e.target.value)} rows={6}
          placeholder="Paste your existing script or content to repurpose..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!script}>
          {loading?'Repurposing...':'Repurpose to All Platforms'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function HookLibrary() {
  const [topic,setTopic] = useState('');
  const [quantity,setQuantity] = useState(20);
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!topic) return;
    setLoading(true); setOut('');
    const res = await ai(HOOK_PROMPT(topic, quantity));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🪝</span>
        <div><h2 style={{color:B.white,margin:0}}>Hook Library</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>5 hook types — Pattern Interrupt, Question, Bold Statement, Story, Data</p></div>
      </div>
      <Card>
        <SecLabel>Topic</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. Veteran transition, Mindset shift, Real estate investing, Morning routines..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>How Many Hooks?</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[10,20,30,40].map(q => (
            <button key={q} onClick={()=>setQuantity(q)}
              style={{background:quantity===q?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:quantity===q?700:400}}>
              {q}
            </button>
          ))}
        </div>
        <RedBtn onClick={run} disabled={loading||!topic}>
          {loading?'Writing Hooks...':'Generate Hooks'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function DesignStudio() {
  const [topic,setTopic] = useState('');
  const [format,setFormat] = useState('Carousel');
  const [angle,setAngle] = useState('mindset');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!topic) return;
    setLoading(true); setOut('');
    const angleLabel = ANGLES.find(a=>a.id===angle)?.label;
    const res = await ai(DESIGN_PROMPT(topic, format, angleLabel));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🎨</span>
        <div><h2 style={{color:B.white,margin:0}}>Design Studio</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Carousel + static post concepts with visual direction + captions</p></div>
      </div>
      <Card>
        <SecLabel>Topic</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. 5 signs you're ready for a mindset shift..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Format</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {['Carousel','Static Post','Story Sequence'].map(f => (
            <button key={f} onClick={()=>setFormat(f)}
              style={{background:format===f?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:format===f?700:400}}>
              {f}
            </button>
          ))}
        </div>
        <SecLabel>Content Angle</SecLabel>
        <AngleGrid selected={angle} onSelect={setAngle}/>
        <RedBtn onClick={run} disabled={loading||!topic}>
          {loading?'Designing...':'Generate Design Concepts'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

function WeeklyReview() {
  const [metrics,setMetrics] = useState('');
  const [wins,setWins] = useState('');
  const [struggles,setStruggles] = useState('');
  const [out,setOut] = useState('');
  const [loading,setLoading] = useState(false);
  const run = async () => {
    if(!metrics) return;
    setLoading(true); setOut('');
    const res = await ai(REVIEW_PROMPT(metrics, wins, struggles));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>📊</span>
        <div><h2 style={{color:B.white,margin:0}}>Weekly Review</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Performance analysis + Swarbrick 8-dimension audit + next week's focus</p></div>
      </div>
      <Card>
        <SecLabel>This Week's Metrics</SecLabel>
        <textarea value={metrics} onChange={e=>setMetrics(e.target.value)} rows={3}
          placeholder="e.g. Instagram: 3 Reels, 12K reach, 340 new followers, 2 DMs, 89 saves. Best post: veteran story reel..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Wins This Week</SecLabel>
        <textarea value={wins} onChange={e=>setWins(e.target.value)} rows={2}
          placeholder="e.g. Posted consistently 5x, first viral reel hit 50K, landed podcast guest..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Struggles / Challenges</SecLabel>
        <textarea value={struggles} onChange={e=>setStruggles(e.target.value)} rows={2}
          placeholder="e.g. Low engagement on financial content, ran out of ideas mid-week, missed 2 posting days..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.15)`,
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!metrics}>
          {loading?'Analyzing Week...':'Run Weekly Review'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <Output text={out}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

const TOP_NAV = [
  { id:'home',     emoji:'⚡', label:'Command Center' },
  { id:'strategy', emoji:'📋', label:'Strategy' },
  { id:'research', emoji:'🔬', label:'Research' },
  { id:'create',   emoji:'🎬', label:'Create' },
  { id:'optimize', emoji:'📊', label:'Optimize' },
];

const SUB_NAV = {
  strategy: [
    { id:'onboard',   emoji:'🚀', label:'Onboarding' },
    { id:'calendar',  emoji:'📅', label:'Calendar' },
    { id:'profile',   emoji:'👤', label:'Profile Audit' },
    { id:'magnet',    emoji:'🧲', label:'Lead Magnet' },
    { id:'community', emoji:'🏔️', label:'Community' },
  ],
  research: [
    { id:'pipeline', emoji:'🔬', label:'Pipeline' },
    { id:'vault',    emoji:'🗄️', label:'Prompt Vault' },
    { id:'collab',   emoji:'🤝', label:'Collab Finder' },
    { id:'extract',  emoji:'💡', label:'Insight Extractor' },
  ],
  create: [
    { id:'script',    emoji:'✍️', label:'Script Engine' },
    { id:'episode',   emoji:'🎙️', label:'Episode Clips' },
    { id:'repurpose', emoji:'♻️', label:'Repurpose' },
    { id:'hooks',     emoji:'🪝', label:'Hook Library' },
    { id:'design',    emoji:'🎨', label:'Design Studio' },
  ],
  optimize: [
    { id:'review', emoji:'📊', label:'Weekly Review' },
  ],
};

const COMPONENT_MAP = {
  home: Home,
  onboard: Onboarding,
  calendar: ContentCalendar,
  profile: ProfileAudit,
  magnet: LeadMagnet,
  community: CommunityBuilder,
  pipeline: Pipeline,
  vault: Vault,
  collab: CollabFinder,
  extract: Extract,
  script: ScriptEngine,
  episode: EpisodeClips,
  repurpose: RepurposeEngine,
  hooks: HookLibrary,
  design: DesignStudio,
  review: WeeklyReview,
};

export default function App() {
  const [nav, setNav] = useState('home');
  const [sub, setSub] = useState(null);

  const handleNav = (id) => {
    setNav(id);
    if(id === 'home') { setSub(null); return; }
    const subs = SUB_NAV[id];
    if(subs) setSub(subs[0].id);
  };

  const ActiveComponent = sub
    ? (COMPONENT_MAP[sub] || Home)
    : (nav === 'home' ? Home : null);

  const subItems = SUB_NAV[nav];

  return (
    <>
      <Head>
        <title>EN-CIS | Elevation Nation Content Intelligence System</title>
        <meta name="description" content="Elevation Nation Content Intelligence System"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${B.navy}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          textarea, input { outline: none; color-scheme: dark; }
          textarea:focus, input:focus { border-color: ${B.red} !important; }
          @keyframes spin { to { transform: rotate(360deg); } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        `}</style>
      </Head>

      <div style={{minHeight:'100vh',background:B.navy,color:B.white}}>
        {/* TOP NAV */}
        <nav style={{background:B.navy2,borderBottom:`1px solid rgba(255,255,255,0.08)`,
          padding:'0 16px',position:'sticky',top:0,zIndex:100}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:4}}>
            <div style={{marginRight:12,padding:'12px 0'}}>
              <img src="/E-E-Logo.jpg" alt="EN" style={{width:32,height:32,borderRadius:'50%'}}/>
            </div>
            {TOP_NAV.map(n => (
              <button key={n.id} onClick={()=>handleNav(n.id)}
                style={{background:'none',border:'none',color:nav===n.id?B.red:B.gray,
                  padding:'16px 14px',cursor:'pointer',fontSize:13,fontWeight:nav===n.id?700:400,
                  borderBottom:`2px solid ${nav===n.id?B.red:'transparent'}`,
                  transition:'all 0.15s',whiteSpace:'nowrap'}}>
                {n.emoji} {n.label}
              </button>
            ))}
          </div>
        </nav>

        {/* SUB NAV */}
        {subItems && nav !== 'home' && (
          <div style={{background:'rgba(255,255,255,0.03)',borderBottom:`1px solid rgba(255,255,255,0.06)`,
            padding:'0 16px'}}>
            <div style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:4}}>
              {subItems.map(s => (
                <button key={s.id} onClick={()=>setSub(s.id)}
                  style={{background:'none',border:'none',color:sub===s.id?B.white:B.gray,
                    padding:'10px 14px',cursor:'pointer',fontSize:12,fontWeight:sub===s.id?700:400,
                    borderBottom:`2px solid ${sub===s.id?B.red:'transparent'}`,
                    transition:'all 0.15s',whiteSpace:'nowrap'}}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <main style={{maxWidth:1100,margin:'0 auto',padding:'2rem 16px'}}>
          {ActiveComponent
            ? <ActiveComponent setNav={handleNav} setSub={setSub}/>
            : (
              <div style={{textAlign:'center',padding:'4rem 0',color:B.gray}}>
                <p>Select a tool from the navigation above</p>
              </div>
            )
          }
        </main>
      </div>
    </>
  );
}
