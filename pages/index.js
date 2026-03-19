import { useState, useEffect, useCallback, useRef } from 'react';
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
  try {
    const res = await fetch('/api/perplexity', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ query })
    });
    if (!res.ok) return `API error: ${res.status}`;
    const d = await res.json();
    return d.text || d.result || d.content || d.answer || d.output || d.error || 'No response';
  } catch(e) {
    return `Network error: ${e.message}`;
  }
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

// ── Strategy Markdown Renderer ───────────────────────────────────────────────
const StrategyOutput = ({text, onCopy, onDownload, downloading}) => {
  if (!text) return null;

  // Parse markdown into structured sections
  const renderLine = (line, idx) => {
    if (line.startsWith('# ')) return (
      <div key={idx} style={{fontSize:22,fontWeight:900,color:B.white,marginBottom:8,marginTop:24,paddingBottom:10,borderBottom:`2px solid ${B.red}`}}>
        {line.replace('# ','')}
      </div>
    );
    if (line.startsWith('## ')) return (
      <div key={idx} style={{fontSize:15,fontWeight:800,color:B.red,letterSpacing:1.5,textTransform:'uppercase',marginTop:28,marginBottom:10}}>
        {line.replace('## ','')}
      </div>
    );
    if (line.startsWith('### ')) return (
      <div key={idx} style={{fontSize:13,fontWeight:700,color:'#00d4ff',marginTop:18,marginBottom:8,paddingLeft:12,borderLeft:'3px solid #00d4ff'}}>
        {line.replace('### ','')}
      </div>
    );
    if (line.startsWith('#### ')) return (
      <div key={idx} style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.7)',marginTop:12,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>
        {line.replace('#### ','')}
      </div>
    );
    // Numbered items
    if (/^\d+\.\s/.test(line)) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:7,paddingLeft:4}}>
        <span style={{color:B.red,fontWeight:800,fontSize:13,minWidth:20,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span>
        <span style={{color:'rgba(255,255,255,0.88)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^\d+\.\s/,''))}</span>
      </div>
    );
    // Bullet items
    if (line.startsWith('- ') || line.startsWith('* ')) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:6,paddingLeft:4}}>
        <span style={{color:B.red,fontSize:12,marginTop:3,flexShrink:0}}>▸</span>
        <span style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^[-*]\s/,''))}</span>
      </div>
    );
    // Bold-only lines (labels)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) return (
      <div key={idx} style={{color:B.white,fontWeight:700,fontSize:13,marginTop:12,marginBottom:4}}>
        {line.replace(/\*\*/g,'')}
      </div>
    );
    // Horizontal rule
    if (line === '---' || line === '***') return (
      <div key={idx} style={{borderTop:'1px solid rgba(255,255,255,0.08)',margin:'16px 0'}}/>
    );
    // Empty line -> spacing
    if (!line.trim()) return <div key={idx} style={{height:6}}/>;
    // Regular paragraph
    return (
      <div key={idx} style={{color:'rgba(255,255,255,0.82)',fontSize:13,lineHeight:1.75,marginBottom:6}}>
        {renderInline(line)}
      </div>
    );
  };

  const renderInline = (text) => {
    // Handle **bold** inline
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} style={{color:B.white,fontWeight:700}}>{p.replace(/\*\*/g,'')}</strong>
        : p
    );
  };

  const lines = text.split('\n');

  return (
    <div style={{marginTop:20}}>
      {/* Header bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div style={{color:B.white,fontWeight:700,fontSize:15}}>Your 90-Day Strategy</div>
        <div style={{display:'flex',gap:8}}>
          <CopyBtn text={text}/>
          <button onClick={onDownload} disabled={downloading}
            style={{background:downloading?B.gray:B.red,color:'#fff',border:'none',
              borderRadius:8,padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',
              fontSize:13,display:'flex',alignItems:'center',gap:6}}>
            {downloading ? 'Preparing...' : '⬇ Download Doc'}
          </button>
        </div>
      </div>

      {/* Rendered strategy */}
      <div style={{background:B.navy2,border:`1px solid rgba(255,255,255,0.08)`,borderRadius:14,padding:'28px 32px'}}>
        {lines.map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
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

const CALENDAR_PROMPT = (pillars, platform, duration, strategyDoc='') => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

${strategyDoc ? `\n=== 90-DAY STRATEGY (source of truth) ===\n${strategyDoc}\n===END===\n` : ''}

Build a ${duration}-day ${platform} content calendar.
Content pillars: ${pillars || 'Use pillars from strategy document above'}

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

const MAGNET_PROMPT = (audience, problem, offer, currentContent, whatWorks) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

Who Jason is trying to reach: ${audience}
The core problem he solves: ${problem}
Existing offer or service: ${offer}
What Jason currently posts / his content style: ${currentContent || 'Not provided'}
What has resonated most with his audience so far: ${whatWorks || 'Not provided'}

Build a lead magnet system grounded in what Jason actually does and what his audience already responds to. Not a generic template — specific to him and Elevation Nation.

1. **Lead Magnet Concept**
   - Title (specific, sounds like Jason said it — not a marketer)
   - Format (checklist/guide/video series/challenge/email course)
   - Core promise (one sentence, no fluff)
   - 5-7 key deliverables inside it

2. **Why This Magnet Works for Elevation Nation**
   (connect it directly to what already resonates with his audience)

3. **Delivery Reel Script** (the Reel that gets people to request it)
   - Hook (3 seconds, pattern interrupt)
   - Value preview (tease 3 things inside without giving them away)
   - CTA: "Comment [KEYWORD] and I'll send it to you"

4. **3-Email Welcome Sequence**
   Email 1: Deliver the magnet + one quick win they can use today
   Email 2: Personal story that connects to the problem + deeper value
   Email 3: Soft CTA to next step (coaching, call, community)

5. **Instagram Story Sequence** (5 slides to promote it organically)`;

const COMMUNITY_PROMPT = (focus, currentEngagement, whereTheyAre, whatTheyAsk) => `
${VOICE}
${SWARBRICK}

Community focus / theme: ${focus}
What Jason's current engagement looks like: ${currentEngagement || 'Not provided'}
Where his audience currently lives (comments, DMs, Facebook, etc.): ${whereTheyAre || 'Not provided'}
What people ask Jason most or respond to most: ${whatTheyAsk || 'Not provided'}

Build an Elevation Nation community system built around what is actually happening in Jason's audience right now. Not a theoretical framework. One that works with the people already showing up.

1. **Community Identity Statement**
   (why people belong here — specific to Elevation Nation, in Jason's voice)

2. **The Core Ritual**
   (one recurring weekly or monthly thing members do together — simple enough to actually happen)

3. **Engagement Architecture**
   - Daily: [specific prompt or question in Jason's voice]
   - Weekly: [challenge or event tied to his content angles]
   - Monthly: [milestone or celebration that recognizes members]

4. **New Member Onboarding**
   (exactly what they see and receive when they join — what to say, what to send)

5. **5 Recurring Content Series**
   (series name + what it is + why people keep coming back for it)

6. **Growth Loop**
   (how members naturally bring other people in without being asked to)`;

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

const PROFILE_PROMPT = (platform, liveData, extraContext) => `
${VOICE}
${CONTENT_SOP}

Platform: ${platform}
Live profile data pulled from the web: ${liveData}
Extra context from Jason: ${extraContext || 'None'}

You are auditing Jason Fricka's actual live ${platform} profile based on real data above. Not assumptions. Be specific. Call out exactly what is working, what is dead weight, and what is missing. Then rewrite it.

1. **What's Actually on the Profile Right Now** (summarize what the live data shows)
2. **What's Working** (keep this, say why)
3. **What's Killing Conversions** (specific problems, no softening)
4. **Rewritten Bio** (ready to copy-paste)
5. **Name Field** (SEO + searchability)
6. **Link Strategy** (what belongs in link-in-bio and why)
${platform === 'Instagram' ? '7. **Highlight Cover Strategy** (names + what goes in each)\n8. **Pinned Post Recommendation** (what and why)' : ''}
${platform === 'LinkedIn' ? '7. **Dual-Lane Strategy** (HR Manager at Highland Cabinetry + Everyday Elevations podcast)\n8. **Featured Section** (what to pin, in order)\n9. **Rewritten About Section** (full copy, ready to paste)' : ''}
${platform === 'YouTube' ? '7. **Channel Description Rewrite** (searchable, keyword-rich)\n8. **About Section** (full copy)\n9. **Thumbnail and Banner Direction**' : ''}
${platform === 'Facebook' ? '7. **Page vs Profile Strategy** (which to prioritize and why)\n8. **About Section Rewrite**\n9. **Cover Photo Direction**' : ''}

Be direct. Write like Jason would actually use this today.`;

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

const ONBOARD_PROMPT = (fields, uploadedDoc='') => {
  const sopSection = uploadedDoc
    ? `=== UPLOADED STRATEGY DOCUMENT (treat as authoritative source) ===
${uploadedDoc}
=== END UPLOADED DOCUMENT ===
Mirror this document's voice, frameworks, and structure exactly. Use it as the foundation and expand every section with full depth below.`
    : `${VOICE}
${CONTENT_SOP}
${SWARBRICK}`;

  return `${sopSection}

=== CLIENT BRIEF ===
Goals: ${fields.goals}
Current State: ${fields.current}
Weekly Time Available: ${fields.hours} hours/week
Brand Personality: ${fields.brandPersonality}
Business Name: ${fields.businessName}
Affiliate / Brand Deals: ${fields.affiliateDeals}
Filming Schedule & Batch Capacity: ${fields.filmingSchedule}
Inspiration Accounts (study structure, NOT style): ${fields.inspirationAccounts}
Off-Limit Topics: ${fields.offLimitTopics}
Content to Repurpose: ${fields.repurposeLinks}
Ideal Audience: ${fields.idealAudience}
Desired Transformation: ${fields.desiredTransformation}
Emotional Journey (Before/After): ${fields.emotionalJourney}
Additional Context: ${fields.additionalContext}

=== YOUR TASK ===
Write a complete, specific, client-ready 90-day content strategy document. Every section must be fully built out — no placeholders, no vague instructions. Write what you would actually hand to a client tomorrow. Use the client's real voice, real goals, and real constraints throughout.

Mandatory frameworks to weave throughout (never name them explicitly):
- Swarbrick 8 Dimensions: content must serve Mental/Emotional, Physical, Social, Environmental, Financial, Intellectual, Occupational, and Spiritual dimensions naturally
- 4-Layer Viewer Journey on every content recommendation: See It (pattern interrupt) → Click It (avatar callout + credibility) → Watch It (value delivery, no filler) → Go Deeper (CTA that drives action)
- CTA Distribution rule: 60% comment-based, 20% DM-trigger, 20% link-in-bio — apply this across all content recommendations
- Saves and shares are the primary success signal, not likes — prioritize content that earns saves

=== REQUIRED SECTIONS (build ALL of these fully) ===

# [Client/Brand Name] — 90-Day Content Strategy

## Executive Summary
3-4 sentences. Who this is for. What the 90 days accomplish. The single strategic bet. Why this approach over others.

## Brand Positioning

### Social Identity
One sharp paragraph: who this person is online, what category they own, what makes them impossible to confuse with anyone else.

### Voice & Tone Guardrails
DO (minimum 6 specific rules with examples):
NEVER (minimum 6 specific rules with examples):

### Ideal Client Profile
Attract — list 5 specific types with why they belong
Repel — list 5 specific types with why they don't

### Competitive Edge
What nobody else in this space is doing. Be specific — name the gap.

### The Transformation Promise
Before state (exactly how the audience feels before finding this creator) → After state (how they feel after engaging consistently). One sentence version.

## Content Pillars

For EACH pillar (build 4 pillars minimum):

### Pillar [N]: [Name]
**Core Idea:** One sentence — the specific angle this pillar owns
**Why It Works:** The psychological reason this resonates with the audience
**Swarbrick Dimension:** Which life dimension(s) this serves
**5 Specific Filmable Ideas:** (specific enough to film tomorrow — not topics, actual titles/hooks)
**Best Format:** Reel / Carousel / Long-form — with exact reason why
**Ideal Length:** Specific seconds or minutes
**CTA Type:** Which CTA from the 60/20/20 split and exact wording
**Hashtag Strategy:** 5 niche + 5 mid + 5 broad tags specific to this pillar

## Platform Strategy

For EACH active platform:

### [Platform Name]
**Role in Ecosystem:** One sentence — what this platform does that no other platform does
**Posting Frequency:** X posts/week — specific days
**Content Types:** List with % breakdown (e.g. 70% Reels, 20% Carousels, 10% Static)
**4-Layer Journey Application:** How See It → Click It → Watch It → Go Deeper applies specifically on this platform
**Algorithm Priority:** What this platform's algorithm rewards right now and how to exploit it
**Week 1 Priority Actions:** 3 specific numbered actions with time estimates
**What to Never Post Here:** 3 things that kill reach on this platform

## 90-Day Execution Plan

### Phase 1 — Foundation (Days 1–30)
**Goal:** [Specific, measurable]
**Theme:** [The one thing this phase is about]

Week 1 — Day by Day:
(List Day 1 through Day 7 with specific tasks and time estimates)

Week 2:
(3-4 key focus areas with specific actions)

Week 3:
(3-4 key focus areas with specific actions)

Week 4:
(3-4 key focus areas with specific actions)

Content to Batch This Phase:
(List 15-20 specific content pieces with titles, format, and platform)

Success Gate — Phase 1 Complete When:
(3 specific measurable conditions)

### Phase 2 — Momentum (Days 31–60)
**Goal:** [Specific, measurable]
**Theme:** [The one thing this phase is about]

Lead Magnet:
- Title:
- Format:
- Delivery mechanism:
- The exact DM or comment trigger word:
- Welcome email first line:

Community Building Moves:
(5 specific actions with timelines)

Collaboration Targets:
(3 specific creator types + why + how to pitch)

Content Evolution from Phase 1:
(What changes, what stays, what gets added)

Success Gate — Phase 2 Complete When:
(3 specific measurable conditions)

### Phase 3 — Scale (Days 61–90)
**Goal:** [Specific, measurable]
**Theme:** [The one thing this phase is about]

Repurposing Workflow (step-by-step):
Step 1: [Source content]
Step 2: [First derivative]
Step 3: [Second derivative]
Step 4: [Third derivative]
Step 5: [Distribution]

Revenue Pathway:
(Exactly how content converts to money — specific funnel with steps)

Analytics Review Process:
(What to check, when, what decisions to make based on what data)

Success Gate — Phase 3 Complete When:
(3 specific measurable conditions)

## Content Production Standards

### Pre-Production
(What to prepare before filming — specific checklist)

### Opening Rules
(Specific rules for the first 3 seconds of every piece of content — with examples)

### Editing Standards
(Jump cuts, captions, pacing, overlays — specific rules)

### Retention Rules
(The 4-layer journey applied to editing — how to keep people watching)

### What Kills Content (Never Do List)
(8-10 specific things that will tank performance)

## Engagement SOP

### Pre-Post Window (15-30 min before publishing)
(Exact actions to prime the algorithm)

### Post-Post Window (first 60 min after publishing)
(Exact actions to boost early engagement signal)

### Daily Engagement Targets
- Comments on aligned accounts: [specific number] meaningful comments (not emoji)
- DM outreach: [specific number] targeted conversations
- Story engagement: [specific actions]
- Response time SLA: Comments within [X hours], DMs within [X hours]

### Comment Response Framework
(How to respond to: positive comments / questions / negative comments / spam)

## Weekly Schedule Template

Based on ${fields.hours} hours/week. Build a realistic day-by-day schedule.

For each active day: Start time, task, duration, platform, specific output

## Lead Magnet System

### Lead Magnet 1
- Title:
- Core promise:
- Format:
- 5-7 key deliverables inside:
- Delivery Reel script (hook + preview + CTA):
- Welcome email subject line + first paragraph:

### Lead Magnet 2 (Phase 2)
- Title:
- Core promise:
- Format:
- Trigger content that promotes it:

## Success Metrics

### Primary KPIs (the numbers that matter most)
For each: metric name, current baseline, 30-day target, 60-day target, 90-day target

### Secondary KPIs
List 5-6 with specific targets

### What to Ignore
(Vanity metrics that don't drive the business — with explanation)

## Quick Wins — First 7 Days
List 7 specific actions (one per day):
- Day 1: [action] — [time required] — [expected result]
- Day 2: [action] — [time required] — [expected result]
(continue through Day 7)

## The Non-Negotiables
3-5 rules that cannot be broken regardless of what's happening. These are the foundation everything else is built on.

${uploadedDoc ? 'This is a client-facing deliverable. Every section must be complete. No placeholders. Match the voice and energy of the uploaded document exactly.' : 'Write in the client voice throughout. Direct, specific, no corporate speak. Every recommendation should feel like it came from someone who knows this person and their business.'}
`;
};


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
// TIER 1 — CONTENT MEMORY
// ═══════════════════════════════════════════════════════════════════════════════

const MEMORY_KEY = 'encis_content_log';
const CLIENTS_KEY = 'encis_clients';
const ACTIVE_CLIENT_KEY = 'encis_active_client';

function useContentMemory() {
  const [log, setLog] = useState([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) setLog(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}),
      timestamp: Date.now(),
      perf: '',
      notes: '',
      ...entry,
    };
    setLog(prev => {
      const updated = [newEntry, ...prev].slice(0, 200);
      try { localStorage.setItem(MEMORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    return newEntry.id;
  }, []);

  const update = useCallback((id, changes) => {
    setLog(prev => {
      const updated = prev.map(e => e.id === id ? {...e,...changes} : e);
      try { localStorage.setItem(MEMORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const remove = useCallback((id) => {
    setLog(prev => {
      const updated = prev.filter(e => e.id !== id);
      try { localStorage.setItem(MEMORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setLog([]);
    try { localStorage.removeItem(MEMORY_KEY); } catch {}
  }, []);

  return { log, save, update, remove, clear };
}

// Global memory instance — shared across all tools
let _memorySave = null;
function registerMemorySave(fn) { _memorySave = fn; }
function logToMemory(entry) { if (_memorySave) _memorySave(entry); }

function ContentMemory() {
  const { log, save, update, remove, clear } = useContentMemory();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const perfColors = { '':'rgba(255,255,255,0.06)', '⭐':'rgba(245,166,35,0.15)', '🔥':'rgba(233,69,96,0.15)', '💀':'rgba(100,100,100,0.15)' };
  const perfLabels = { '':'No rating', '⭐':'Good', '🔥':'Viral', '💀':'Flopped' };
  const typeColors = { script:'#1B4F72', calendar:'#145A32', onboard:'#6E2F8E', batch:'#7E5109', profile:'#0A66C2', magnet:'#C0392B', community:'#1A5276', instagram:'#C13584', facebook:'#1877F2', default:'#2C3E50' };

  // ── CSV Parser ────────────────────────────────────────────────────────────
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    // Handle quoted fields
    const parseRow = (line) => {
      const cols = []; let cur = ''; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQ = !inQ; }
        else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += c; }
      }
      cols.push(cur.trim());
      return cols;
    };
    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g,'_'));
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const vals = parseRow(line);
      return Object.fromEntries(headers.map((h,i) => [h, vals[i] || '']));
    });
  };

  // ── Auto-rate by engagement ───────────────────────────────────────────────
  const autoRate = (saves, shares, reach) => {
    const s = parseInt(saves)||0, sh = parseInt(shares)||0, r = parseInt(reach)||1;
    const engRate = (s + sh*2) / r;
    if (engRate > 0.05 || s > 50 || sh > 20) return '🔥';
    if (engRate > 0.01 || s > 10) return '⭐';
    if (r > 100 && s === 0 && sh === 0) return '💀';
    return '';
  };

  // ── Import Handler ────────────────────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true); setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let imported = 0; let skipped = 0;

        // ── Detect format ──────────────────────────────────────────────────
        const isJSON = text.trim().startsWith('{') || text.trim().startsWith('[');

        if (isJSON) {
          // Instagram "Download Your Information" JSON format
          let data;
          try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }

          // Handle both array and {media:[...]} shapes
          const posts = Array.isArray(data) ? data : (data.media || data.posts || []);
          posts.forEach(post => {
            if (!post) return;
            const caption = post.title || post.media_metadata?.photo_metadata?.exif_data?.[0]?.source || '';
            const ts = post.creation_timestamp || post.timestamp;
            const dateStr = ts ? new Date(ts * 1000).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Unknown';
            save({
              type: 'instagram',
              platform: 'Instagram',
              title: caption ? caption.slice(0, 80) : 'Instagram Post',
              preview: caption.slice(0, 200),
              date: dateStr,
              timestamp: ts ? ts * 1000 : Date.now(),
              notes: '',
              perf: '',
              source: 'instagram-export',
            });
            imported++;
          });

        } else {
          // CSV format — Meta Business Suite / Creator Studio export
          const rows = parseCSV(text);
          if (!rows.length) throw new Error('No rows found in CSV');

          // Detect platform by sniffing headers
          const firstRow = rows[0];
          const keys = Object.keys(firstRow).join(' ');
          const isIG = keys.includes('description') || keys.includes('permalink') || keys.includes('saves');
          const isFB = keys.includes('post_message') || keys.includes('lifetime_post_total_reach');

          rows.forEach(row => {
            // ── Instagram CSV mapping ──────────────────────────────────────
            if (isIG) {
              const caption = row.description || row.post_caption || '';
              const postType = row.post_type || row.type || 'Post';
              const reach = row.reach || row.impressions || '0';
              const saves = row.saves || '0';
              const shares = row.shares || '0';
              const likes = row.likes || '0';
              const comments = row.comments || '0';
              const published = row.published || row.date_published || '';
              const dateStr = published ? new Date(published).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Unknown';

              save({
                type: 'instagram',
                platform: 'Instagram',
                title: caption ? caption.slice(0,80) : `Instagram ${postType}`,
                preview: caption.slice(0,200),
                format: postType,
                date: dateStr,
                timestamp: published ? new Date(published).getTime() : Date.now(),
                perf: autoRate(saves, shares, reach),
                notes: `Reach: ${reach} · Likes: ${likes} · Comments: ${comments} · Saves: ${saves} · Shares: ${shares}`,
                stats: { reach, saves, shares, likes, comments },
                permalink: row.permalink || '',
                source: 'instagram-csv',
              });
              imported++;

            // ── Facebook CSV mapping ───────────────────────────────────────
            } else if (isFB) {
              const caption = row.post_message || row.description || '';
              const reach = row.lifetime_post_total_reach || row.reach || '0';
              const shares = row.share_count || '0';
              const reactions = row.lifetime_post_reactions_by_type_total || row.likes || '0';
              const comments = row.comment_count || '0';
              const published = row.post_published || row.published_date || '';
              const dateStr = published ? new Date(published).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Unknown';

              save({
                type: 'facebook',
                platform: 'Facebook',
                title: caption ? caption.slice(0,80) : 'Facebook Post',
                preview: caption.slice(0,200),
                date: dateStr,
                timestamp: published ? new Date(published).getTime() : Date.now(),
                perf: autoRate('0', shares, reach),
                notes: `Reach: ${reach} · Reactions: ${reactions} · Comments: ${comments} · Shares: ${shares}`,
                stats: { reach, shares, reactions, comments },
                source: 'facebook-csv',
              });
              imported++;

            } else {
              // Generic CSV — best-effort mapping
              const caption = row.description || row.caption || row.message || row.title || row.text || '';
              if (caption) {
                save({
                  type: 'social',
                  platform: 'Social',
                  title: caption.slice(0,80),
                  preview: caption.slice(0,200),
                  date: new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}),
                  timestamp: Date.now(),
                  perf: '',
                  notes: Object.entries(row).filter(([k,v])=>v&&v!=='0').map(([k,v])=>`${k}: ${v}`).slice(0,6).join(' · '),
                  source: 'csv-import',
                });
                imported++;
              } else { skipped++; }
            }
          });
        }

        setImportResult({ imported, skipped, success: true });
      } catch(err) {
        setImportResult({ error: err.message, success: false });
      }
      setImporting(false);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const types = ['all', ...new Set(log.map(e => e.type).filter(Boolean))];
  const filtered = log.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (search && !JSON.stringify(e).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const igSteps = [
    '1. Open Instagram app → Profile → ☰ Menu',
    '2. Settings → Account → Download Your Information',
    '3. Select "Posts" and format: JSON',
    '4. Download and upload the posts_1.json file here',
    '── OR for stats (requires Business/Creator account) ──',
    '5. Go to Meta Business Suite → Insights → Export',
    '6. Choose date range → Export as CSV',
    '7. Upload that CSV here instead',
  ];

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:32}}>🧠</span>
          <div><h2 style={{color:B.white,margin:0}}>Content Memory</h2>
            <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>
              {log.length > 0 ? `${log.length} pieces saved — rate, note, and track what works` : 'Auto-saves every generated piece. Import your social posts below.'}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={() => setShowImport(p=>!p)}
            style={{background:showImport?B.red:'rgba(255,255,255,0.08)',color:B.white,border:`1px solid ${showImport?B.red:'rgba(255,255,255,0.15)'}`,borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            📥 Import Social Posts
          </button>
          {log.length > 0 && (
            <button onClick={() => { if(window.confirm('Clear all content history?')) clear(); }}
              style={{background:'rgba(233,69,96,0.1)',color:B.red,border:'1px solid rgba(233,69,96,0.2)',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Import Panel */}
      {showImport && (
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'20px',marginBottom:20}}>
          <div style={{fontWeight:700,color:B.white,fontSize:15,marginBottom:4}}>📥 Import Instagram / Facebook Posts</div>
          <div style={{color:B.gray,fontSize:12,lineHeight:1.8,marginBottom:16}}>
            Upload your Instagram export (JSON) or Meta Business Suite insights export (CSV).<br/>
            Posts auto-import with engagement stats. Performance is rated automatically based on saves and shares.
          </div>

          {/* How to export steps */}
          <div style={{background:'rgba(0,0,0,0.25)',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:B.red,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>How to Export</div>
            {igSteps.map((step, i) => (
              <div key={i} style={{fontSize:12,color:step.startsWith('──')?B.red:'rgba(255,255,255,0.7)',lineHeight:1.9,fontStyle:step.startsWith('──')?'italic':'normal'}}>
                {step}
              </div>
            ))}
          </div>

          {/* Upload zone */}
          <label style={{cursor:'pointer',display:'block'}}>
            <div style={{border:'2px dashed rgba(233,69,96,0.35)',borderRadius:10,padding:'24px',textAlign:'center',
              background:'rgba(255,255,255,0.02)',transition:'all 0.2s'}}>
              {importing ? (
                <><div style={{fontSize:28,marginBottom:8}}>⏳</div>
                  <div style={{color:B.white,fontWeight:600,fontSize:14}}>Importing...</div></>
              ) : (
                <><div style={{fontSize:32,marginBottom:8}}>📂</div>
                  <div style={{color:B.white,fontWeight:600,fontSize:14}}>Click to upload Instagram JSON or Meta CSV</div>
                  <div style={{color:B.gray,fontSize:12,marginTop:4}}>.json or .csv files accepted</div></>
              )}
            </div>
            <input type="file" accept=".json,.csv,text/csv,application/json" onChange={handleImport}
              style={{display:'none'}} disabled={importing}/>
          </label>

          {/* Import result */}
          {importResult && (
            <div style={{marginTop:12,padding:'12px 16px',borderRadius:8,
              background:importResult.success?'rgba(39,174,96,0.1)':'rgba(233,69,96,0.1)',
              border:`1px solid ${importResult.success?'rgba(39,174,96,0.3)':'rgba(233,69,96,0.3)'}`}}>
              {importResult.success ? (
                <div style={{color:'rgba(39,174,96,0.9)',fontWeight:700,fontSize:13}}>
                  ✅ Imported {importResult.imported} post{importResult.imported!==1?'s':''} successfully
                  {importResult.skipped > 0 && <span style={{color:B.gray,fontWeight:400}}> · {importResult.skipped} skipped (no caption)</span>}
                  <div style={{color:B.gray,fontWeight:400,fontSize:12,marginTop:4}}>
                    Posts with high saves/shares were auto-rated 🔥. Scroll down to review and adjust.
                  </div>
                </div>
              ) : (
                <div style={{color:B.red,fontWeight:700,fontSize:13}}>
                  ❌ Import failed: {importResult.error}
                  <div style={{color:B.gray,fontWeight:400,fontSize:12,marginTop:4}}>
                    Make sure you uploaded the correct file format (Instagram JSON or Meta Business Suite CSV).
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {log.length === 0 && !showImport && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:48,marginBottom:16}}>📭</div>
          <div style={{color:B.white,fontWeight:700,fontSize:18,marginBottom:8}}>Nothing here yet</div>
          <div style={{color:B.gray,fontSize:14,lineHeight:1.7,marginBottom:20}}>
            Content you generate auto-saves here. Or import your existing posts above.
          </div>
          <button onClick={() => setShowImport(true)}
            style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            📥 Import Instagram / Facebook Posts
          </button>
        </div>
      )}

      {/* Main content when log has entries */}
      {log.length > 0 && (
        <>
          {/* Search + Filter */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content..."
              style={{flex:1,minWidth:200,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 12px',color:B.white,fontSize:13}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  style={{background:filter===t?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:filter===t?700:400,textTransform:'capitalize'}}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            {[
              ['Total','📝',log.length,''],
              ['Viral 🔥','🔥',log.filter(e=>e.perf==='🔥').length,'rgba(233,69,96,0.15)'],
              ['Good ⭐','⭐',log.filter(e=>e.perf==='⭐').length,'rgba(245,166,35,0.1)'],
              ['Flopped 💀','💀',log.filter(e=>e.perf==='💀').length,'rgba(100,100,100,0.1)'],
            ].map(([label,icon,count,bg]) => (
              <div key={label} style={{background:bg||'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:B.white}}>{count}</div>
                <div style={{fontSize:11,color:B.gray,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Content Log */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map(entry => (
              <div key={entry.id} style={{background:perfColors[entry.perf]||perfColors[''],border:'1px solid rgba(255,255,255,0.07)',borderLeft:`3px solid ${typeColors[entry.type]||typeColors.default}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                      <span style={{background:typeColors[entry.type]||typeColors.default,color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{entry.type}</span>
                      <span style={{color:B.gray,fontSize:11}}>{entry.date}</span>
                      {entry.client && <span style={{background:'rgba(255,255,255,0.08)',color:B.gray,borderRadius:4,padding:'2px 7px',fontSize:10}}>👤 {entry.client}</span>}
                      {entry.platform && <span style={{background:'rgba(255,255,255,0.05)',color:B.gray,borderRadius:4,padding:'2px 7px',fontSize:10}}>{entry.platform}</span>}
                      {entry.permalink && <a href={entry.permalink} target="_blank" rel="noopener noreferrer" style={{color:B.red,fontSize:10,textDecoration:'none'}}>↗ View</a>}
                    </div>
                    <div style={{color:B.white,fontWeight:600,fontSize:13,marginBottom:4,wordBreak:'break-word'}}>{entry.title || entry.topic || 'Untitled'}</div>
                    {entry.notes && editingId !== entry.id && <div style={{color:B.gray,fontSize:12,lineHeight:1.6,marginTop:4}}>{entry.notes}</div>}
                    {editingId === entry.id && (
                      <div style={{marginTop:8}}>
                        <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={2}
                          placeholder="Add performance notes, what you learned, what to replicate..."
                          style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,padding:'8px',color:B.white,fontSize:12,resize:'vertical',boxSizing:'border-box'}}/>
                        <div style={{display:'flex',gap:8,marginTop:6}}>
                          <button onClick={() => { update(entry.id, {notes:editNotes}); setEditingId(null); }}
                            style={{background:B.red,color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Save</button>
                          <button onClick={() => setEditingId(null)}
                            style={{background:'rgba(255,255,255,0.08)',color:B.gray,border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer'}}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    {['⭐','🔥','💀'].map(p => (
                      <button key={p} onClick={() => update(entry.id, {perf: entry.perf===p?'':p})}
                        title={perfLabels[p]}
                        style={{background:entry.perf===p?'rgba(255,255,255,0.15)':'transparent',border:`1px solid ${entry.perf===p?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:6,padding:'4px 7px',fontSize:14,cursor:'pointer',opacity:entry.perf&&entry.perf!==p?0.4:1}}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => { setEditingId(entry.id); setEditNotes(entry.notes||''); }}
                      style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'4px 9px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                      {entry.notes ? 'Edit' : '+ Note'}
                    </button>
                    <button onClick={() => remove(entry.id)}
                      style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:6,padding:'4px 7px',fontSize:14,cursor:'pointer'}}>✕</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && log.length > 0 && (
              <div style={{textAlign:'center',padding:'3rem',color:B.gray,fontSize:13}}>No results match your filter.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1 — BULK CONTENT BATCHING
// ═══════════════════════════════════════════════════════════════════════════════

const BULK_PROMPT = (angle, platform, topic, client) => `
${client ? `CLIENT: ${client.name}. Voice and brand: ${client.voice}` : VOICE}
${CONTENT_SOP}
${SWARBRICK}

Platform: ${platform}
Content Angle: ${angle}
Topic/Theme: ${topic}

Generate a complete content batch for this angle and topic. This is bulk production — make every piece distinct, not variations of the same thing.

**POST 1 — Educational (optimizes for saves)**
Hook:
Body (3 points, punchy):
CTA:
Caption (3-4 sentences):
Hashtags (15):

**POST 2 — Personal Story (optimizes for follows)**
Hook:
Body (story arc — real moment, shift, result):
CTA:
Caption:
Hashtags (15):

**POST 3 — Pattern Interrupt / Controversial (optimizes for shares)**
Hook:
Body:
CTA:
Caption:
Hashtags (15):

**POST 4 — Quick Win / Tactical (optimizes for saves + DMs)**
Hook:
Body (actionable, specific steps):
CTA:
Caption:
Hashtags (15):

**POST 5 — Community / Engagement (optimizes for comments)**
Hook:
Body:
CTA (question that drives comments):
Caption:
Hashtags (15):

**CAROUSEL CONCEPT**
Title:
Slide 1 (cover):
Slides 2-6 (content):
Slide 7 (CTA):
Caption:

**STORY SEQUENCE (5 slides)**
Slide 1-5:

Keep every hook under 10 words. No "Hey guys." No intros. Value first, always.`;

function BulkBatch() {
  const [angle, setAngle] = useState('veteran');
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeClient] = useActiveClient();

  const run = async () => {
    if (!topic) return;
    setLoading(true); setOut('');
    const angleLabel = ANGLES.find(a=>a.id===angle)?.label || angle;
    const res = await ai(BULK_PROMPT(angleLabel, platform, topic, activeClient));
    setOut(res);
    logToMemory({ type:'batch', title:`Batch: ${topic}`, topic, platform, angle:angleLabel, client:activeClient?.name, preview:res.slice(0,200) });
    setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>⚡</span>
        <div><h2 style={{color:B.white,margin:0}}>Bulk Content Batch</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>One topic → 5 posts + carousel + story sequence. Full week of content in one shot.</p></div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}
      <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        Pick an angle, pick a platform, give it one topic or theme — get back 5 platform-native posts, a carousel outline, and a story sequence. One generation. Ready to schedule.
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:B.red,textTransform:'uppercase',marginBottom:8}}>Platform</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={()=>setPlatform(p)}
                style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                  borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:B.red,textTransform:'uppercase',marginBottom:8}}>Content Angle</div>
          <AngleGrid selected={angle} onSelect={setAngle}/>
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:B.red,textTransform:'uppercase',marginBottom:8}}>Topic or Theme for This Batch</div>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. 'Morning discipline', 'What the Army taught me about rest', 'Why most people quit week 3'..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
      </div>
      <RedBtn onClick={run} disabled={loading||!topic}>
        {loading ? 'Generating full batch...' : '⚡ Generate Full Content Batch'}
      </RedBtn>
      {loading && <Spin/>}
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1 — CLIENT MODE
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CLIENT = {
  id: 'jason',
  name: 'Jason Fricka',
  handle: '@everydayelevations',
  platforms: 'Instagram, YouTube, Facebook, LinkedIn',
  voice: `Direct, real, no corporate speak. Veteran energy. Short sentences. Elevation Nation community — everyday people who refuse to stay where they are.`,
  angles: 'Veteran/Resilience, Mindset, Everyday Wins, Outdoor/Colorado, Finance/Real Estate, Podcast/Growth, Family, Health/Fitness',
  colors: '#0A1628, #E94560, #FFFFFF',
  notes: 'HR Manager at Highland Cabinetry. Podcast host. Real estate agent. Colorado father. Endurance athlete.',
  isDefault: true,
};

function useActiveClient() {
  const [activeClient, setActiveClientState] = useState(DEFAULT_CLIENT);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_CLIENT_KEY);
      if (stored) setActiveClientState(JSON.parse(stored));
    } catch {}
  }, []);
  const setActiveClient = (client) => {
    setActiveClientState(client);
    try { localStorage.setItem(ACTIVE_CLIENT_KEY, JSON.stringify(client)); } catch {}
  };
  return [activeClient, setActiveClient];
}

function useClients() {
  const [clients, setClientsState] = useState([DEFAULT_CLIENT]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLIENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setClientsState([DEFAULT_CLIENT, ...parsed.filter(c => !c.isDefault)]);
      }
    } catch {}
  }, []);
  const saveClients = (list) => {
    const nonDefault = list.filter(c => !c.isDefault);
    try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(nonDefault)); } catch {}
    setClientsState([DEFAULT_CLIENT, ...nonDefault]);
  };
  return [clients, saveClients];
}

function ClientBanner({ client }) {
  if (!client || client.isDefault) return null;
  return (
    <div style={{background:'rgba(245,166,35,0.08)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:8,padding:'8px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:16}}>👤</span>
      <span style={{color:'rgba(245,166,35,0.9)',fontSize:12,fontWeight:700}}>CLIENT MODE — {client.name}</span>
      <span style={{color:B.gray,fontSize:12}}>{client.handle} · {client.platforms}</span>
    </div>
  );
}

function ClientMode({ setActiveClientExternal }) {
  const [clients, saveClients] = useClients();
  const [activeClient, setActiveClient] = useActiveClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const blank = { id:'', name:'', handle:'', platforms:'Instagram, YouTube', voice:'', angles:'', colors:'', notes:'' };
  const [form, setForm] = useState(blank);

  const activate = (client) => {
    setActiveClient(client);
    if (setActiveClientExternal) setActiveClientExternal(client);
  };

  const saveClient = () => {
    if (!form.name) return;
    const client = { ...form, id: form.id || Date.now().toString() };
    if (editing) {
      saveClients(clients.map(c => c.id === editing ? client : c));
    } else {
      saveClients([...clients, client]);
    }
    setForm(blank); setShowForm(false); setEditing(null);
  };

  const deleteClient = (id) => {
    if (id === 'jason') return;
    saveClients(clients.filter(c => c.id !== id));
    if (activeClient?.id === id) activate(DEFAULT_CLIENT);
  };

  const fields = [
    {k:'name',l:'Client / Brand Name',ph:'e.g. Jane Smith Fitness'},
    {k:'handle',l:'Primary Handle',ph:'e.g. @janesmith'},
    {k:'platforms',l:'Platforms',ph:'e.g. Instagram, LinkedIn'},
    {k:'voice',l:'Voice & Tone',ph:'e.g. Warm, motivational, no jargon. Speaks to busy moms...'},
    {k:'angles',l:'Content Angles',ph:'e.g. Weight loss, Meal prep, Mindset for moms...'},
    {k:'colors',l:'Brand Colors',ph:'e.g. #FF6B6B, #4ECDC4, #FFFFFF'},
    {k:'notes',l:'Additional Context',ph:'e.g. Life coach, 2 kids, based in Austin, sells a $997 program...'},
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:32}}>👥</span>
          <div><h2 style={{color:B.white,margin:0}}>Client Mode</h2>
            <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Switch clients and every tool rewires to their voice, angles, and brand.</p></div>
        </div>
        <button onClick={() => { setForm(blank); setEditing(null); setShowForm(true); }}
          style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Add Client
        </button>
      </div>

      {/* Active client indicator */}
      <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'16px',marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:B.red,textTransform:'uppercase',marginBottom:8}}>Currently Active</div>
        <div style={{color:B.white,fontWeight:700,fontSize:16}}>{activeClient?.name || 'Jason Fricka'}</div>
        <div style={{color:B.gray,fontSize:13,marginTop:2}}>{activeClient?.handle} · {activeClient?.platforms}</div>
      </div>

      {/* Client grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12,marginBottom:24}}>
        {clients.map(client => (
          <div key={client.id}
            style={{background:activeClient?.id===client.id?'rgba(233,69,96,0.1)':'rgba(255,255,255,0.03)',
              border:`1px solid ${activeClient?.id===client.id?'rgba(233,69,96,0.4)':'rgba(255,255,255,0.07)'}`,
              borderRadius:12,padding:'16px',transition:'all 0.15s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div>
                <div style={{color:B.white,fontWeight:700,fontSize:14}}>{client.name}</div>
                <div style={{color:B.gray,fontSize:12,marginTop:2}}>{client.handle}</div>
              </div>
              {client.isDefault && <span style={{background:'rgba(233,69,96,0.15)',color:B.red,borderRadius:4,padding:'2px 7px',fontSize:10,fontWeight:700}}>YOU</span>}
            </div>
            <div style={{color:B.gray,fontSize:11,lineHeight:1.6,marginBottom:12,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
              {client.voice || client.notes || 'No description'}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => activate(client)}
                style={{flex:1,background:activeClient?.id===client.id?B.red:'rgba(255,255,255,0.08)',color:'#fff',border:'none',
                  borderRadius:7,padding:'7px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                {activeClient?.id===client.id ? '✓ Active' : 'Activate'}
              </button>
              {!client.isDefault && (
                <>
                  <button onClick={() => { setForm({...client}); setEditing(client.id); setShowForm(true); }}
                    style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',borderRadius:7,padding:'7px 10px',fontSize:12,cursor:'pointer'}}>Edit</button>
                  <button onClick={() => deleteClient(client.id)}
                    style={{background:'rgba(233,69,96,0.08)',color:B.red,border:'none',borderRadius:7,padding:'7px 10px',fontSize:12,cursor:'pointer'}}>✕</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'24px',marginBottom:20}}>
          <div style={{color:B.white,fontWeight:700,fontSize:16,marginBottom:20}}>{editing ? 'Edit Client' : 'New Client'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {fields.map(f => (
              <div key={f.k} style={{gridColumn:['voice','angles','notes'].includes(f.k)?'1/-1':'auto'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:B.red,textTransform:'uppercase',marginBottom:6}}>{f.l}</div>
                {['voice','angles','notes'].includes(f.k) ? (
                  <textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                    style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                ) : (
                  <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                    style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
                )}
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:18}}>
            <RedBtn onClick={saveClient} disabled={!form.name}>{editing ? 'Save Changes' : 'Add Client'}</RedBtn>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(blank); }}
              style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{background:'rgba(255,255,255,0.02)',borderRadius:10,padding:'16px',border:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{color:B.gray,fontSize:12,lineHeight:1.8}}>
          <strong style={{color:B.white}}>How Client Mode works:</strong> When a client is active, every tool — scripts, calendars, profiles, lead magnets — automatically uses their voice, angles, and brand context. Switch back to Jason anytime. Client data stays on your device.
        </div>
      </div>
    </div>
  );
}

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
  const [mode,        setMode]       = useState('form');
  const [goals,       setGoals]      = useState(
    `Grow @everydayelevations from ~2,400 Instagram followers to 10,000 by end of 2026. Post consistently 5x/week on Instagram. Launch Elevation Nation as a recognizable community identity. Start building an email list from zero — target 500 subscribers in 90 days. Book 3 meaningful podcast guests. Generate at least 1 real estate lead per month through content. Keep it real — no fake hype, no gimmicks.`
  );
  const [current,     setCurrent]    = useState(
    `Instagram: ~2,400 followers, posting 2-3x/week inconsistently, no clear content schedule. YouTube: @everydayelevations exists but underused. Facebook: facebook.com/jason.fricka active but no strategy. LinkedIn: linkedin.com/in/jason-fricka — HR Manager at Highland Cabinetry + podcast host, dual-lane not leveraged. No email list. No lead magnet. Everyday Elevations podcast running. Colorado-based. Full-time HR job + real estate license + family.`
  );
  const [hours,            setHours]            = useState('10');
  const [brandPersonality, setBrandPersonality] = useState('Direct, Authentic, Gritty, Grounded, Motivating');
  const [businessName,     setBusinessName]     = useState('Everyday Elevations / Fricka Sells Colorado');
  const [affiliateDeals,   setAffiliateDeals]   = useState('');
  const [filmingSchedule,  setFilmingSchedule]  = useState('Weekends + occasional weekday evenings. Can batch 2-3 hours on Saturdays.');
  const [inspirationAccounts, setInspirationAccounts] = useState('@hubermanlab, @jayshetty, @richroll, @mindpumpmedia');
  const [offLimitTopics,   setOffLimitTopics]   = useState('No divisive politics. No fake hype or get-rich-quick angles.');
  const [repurposeLinks,   setRepurposeLinks]   = useState('');
  const [idealAudience,    setIdealAudience]    = useState(
    `Everyday people who refuse to stay where they are — veterans transitioning out, working parents, professionals who feel stuck, athletes, people grinding toward something better. Ages 28-50, Colorado-based but broader online. They believe in doing the work nobody sees.`
  );
  const [desiredTransformation, setDesiredTransformation] = useState(
    `From stuck, inconsistent, and invisible — to showing up daily, building a real community, and turning content into real estate leads, coaching clients, and podcast listeners.`
  );
  const [emotionalJourney, setEmotionalJourney] = useState(
    `Before: Overwhelmed, scattered, feeling like they are behind. After: Clear, consistent, part of a community that pushes them forward. One sentence: They came in stuck and left with a plan they actually believe in.`
  );
  const [additionalContext, setAdditionalContext] = useState('');
  const [uploadedDoc,      setUploadedDoc]      = useState('');
  const [uploadFileName,   setUploadFileName]   = useState('');
  const [out,              setOut]              = useState('');
  const [loading,          setLoading]          = useState(false);
  const [downloading,      setDownloading]      = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedDoc(ev.target.result);
    reader.readAsText(file);
  };

  const run = async () => {
    setLoading(true); setOut('');
    const fields = { goals, current, hours, brandPersonality, businessName, affiliateDeals,
      filmingSchedule, inspirationAccounts, offLimitTopics, repurposeLinks,
      idealAudience, desiredTransformation, emotionalJourney, additionalContext };
    const res = await ai(ONBOARD_PROMPT(fields, uploadedDoc));
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
          message: `Convert this strategy document into clean HTML that could be printed or saved as a document. Use proper headings (h1, h2, h3), bullet points, and bold text. Make it professional and readable. Return ONLY the HTML body content, no <html> or <body> tags:\n\n${out}`,
          system: 'You convert markdown/text strategy documents into clean, well-formatted HTML. Return only the inner HTML content.'
        })
      });
      const d = await res.json();
      const html = d.text || d.result || '';
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

  const fldStyle = {width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'};
  const taStyle = {...fldStyle,resize:'vertical',lineHeight:1.6};
  const sectionHead = (emoji, label) => (
    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:B.red,textTransform:'uppercase',
      marginBottom:12,marginTop:20,paddingBottom:6,borderBottom:'1px solid rgba(233,69,96,0.25)'}}>
      {emoji} {label}
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🚀</span>
        <div><h2 style={{color:B.white,margin:0}}>90-Day Strategy Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Pre-filled with your numbers. Edit anything, then generate a complete strategy document.</p></div>
      </div>
      <Card>
        {sectionHead('📍','Goals & Current State')}
        <SecLabel>Your Goals</SecLabel>
        <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={4} style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Current State</SecLabel>
        <textarea value={current} onChange={e=>setCurrent(e.target.value)} rows={4} style={taStyle}/>

        {sectionHead('🎯','Brand Identity')}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <SecLabel>Brand Personality (3-5 adjectives)</SecLabel>
            <input value={brandPersonality} onChange={e=>setBrandPersonality(e.target.value)} style={fldStyle}/>
          </div>
          <div>
            <SecLabel>Business Name</SecLabel>
            <input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={fldStyle}/>
          </div>
        </div>
        <SecLabel>Affiliate / Brand Deals</SecLabel>
        <textarea value={affiliateDeals} onChange={e=>setAffiliateDeals(e.target.value)} rows={2}
          placeholder="List any active affiliate partnerships or brand deals..."
          style={taStyle}/>

        {sectionHead('🎬','Content Details')}
        <SecLabel>Filming Schedule & Batch Capacity</SecLabel>
        <textarea value={filmingSchedule} onChange={e=>setFilmingSchedule(e.target.value)} rows={2} style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Inspiration Accounts</SecLabel>
        <textarea value={inspirationAccounts} onChange={e=>setInspirationAccounts(e.target.value)} rows={2} style={taStyle}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          <div>
            <SecLabel>Off-Limit Topics</SecLabel>
            <textarea value={offLimitTopics} onChange={e=>setOffLimitTopics(e.target.value)} rows={3}
              placeholder="Topics or angles to avoid..." style={taStyle}/>
          </div>
          <div>
            <SecLabel>Content to Repurpose (links/notes)</SecLabel>
            <textarea value={repurposeLinks} onChange={e=>setRepurposeLinks(e.target.value)} rows={3}
              placeholder="YouTube links, podcast episodes, Google Drive links..." style={taStyle}/>
          </div>
        </div>

        {sectionHead('👥','Ideal Audience & Transformation')}
        <SecLabel>Ideal Audience Profile</SecLabel>
        <textarea value={idealAudience} onChange={e=>setIdealAudience(e.target.value)} rows={3}
          placeholder="Age, demographics, pain points, beliefs, lifestyle..." style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Desired Transformation</SecLabel>
        <textarea value={desiredTransformation} onChange={e=>setDesiredTransformation(e.target.value)} rows={2} style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Emotional Journey (Before → After)</SecLabel>
        <textarea value={emotionalJourney} onChange={e=>setEmotionalJourney(e.target.value)} rows={2}
          placeholder="How they feel before finding you, how they feel after, one-sentence summary..." style={taStyle}/>

        {sectionHead('📎','Optional Upload & Additional Context')}
        <label style={{cursor:'pointer',display:'block',marginBottom:12}}>
          <div style={{border:`2px dashed ${uploadedDoc?'rgba(39,174,96,0.5)':'rgba(233,69,96,0.3)'}`,borderRadius:8,
            padding:'12px 16px',display:'flex',alignItems:'center',gap:12,
            background:uploadedDoc?'rgba(39,174,96,0.07)':'rgba(255,255,255,0.02)'}}>
            <span style={{fontSize:20}}>{uploadedDoc?'✅':'📎'}</span>
            <div>
              {uploadedDoc
                ? <><div style={{color:B.white,fontWeight:700,fontSize:13}}>{uploadFileName}</div>
                    <div style={{color:'rgba(39,174,96,0.9)',fontSize:11,marginTop:2}}>Doc loaded — will be included in strategy</div></>
                : <><div style={{color:B.white,fontWeight:600,fontSize:13}}>Upload existing doc or notes (optional)</div>
                    <div style={{color:B.gray,fontSize:11,marginTop:2}}>.txt or .md</div></>}
            </div>
          </div>
          <input type="file" accept=".txt,.md,text/plain" onChange={handleFileUpload} style={{display:'none'}}/>
        </label>
        <textarea value={additionalContext} onChange={e=>setAdditionalContext(e.target.value)} rows={2}
          placeholder="Anything else — recent wins, struggles, offers launching, audience DM insights..."
          style={taStyle}/>

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
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading}>
          {loading?'Building Strategy...':'🚀 Build 90-Day Strategy'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      {out && (
        <StrategyOutput text={out} onDownload={downloadDoc} downloading={downloading}/>
      )}
    </div>
  );
}

function ContentCalendar() {
  const [pillars,        setPillars]        = useState('');
  const [platform,       setPlatform]       = useState('Instagram');
  const [duration,       setDuration]       = useState('30');
  const [strategyDoc,    setStrategyDoc]    = useState('');
  const [strategyFileName,setStrategyFileName] = useState('');
  const [out,            setOut]            = useState('');
  const [loading,        setLoading]        = useState(false);

  const handleStrategyUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStrategyFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setStrategyDoc(ev.target.result);
    reader.readAsText(file);
  };

  const run = async () => {
    if(!pillars && !strategyDoc) return;
    setLoading(true); setOut('');
    const res = await ai(CALENDAR_PROMPT(pillars, platform, duration, strategyDoc));
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
        {/* Strategy Doc Upload */}
        <div style={{marginBottom:16}}>
          <SecLabel>
            📄 Upload Strategy Doc{' '}
            <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:11,color:B.gray}}>
              (optional — upload your 90-Day Strategy for calendar continuity)
            </span>
          </SecLabel>
          <label style={{cursor:'pointer',display:'block'}}>
            <div style={{border:`2px dashed ${strategyDoc?'rgba(39,174,96,0.5)':'rgba(233,69,96,0.3)'}`,borderRadius:8,
              padding:'12px 16px',display:'flex',alignItems:'center',gap:12,
              background:strategyDoc?'rgba(39,174,96,0.07)':'rgba(255,255,255,0.02)'}}>
              <span style={{fontSize:20}}>{strategyDoc?'✅':'📎'}</span>
              <div style={{flex:1}}>
                {strategyDoc
                  ? <><div style={{color:B.white,fontWeight:700,fontSize:13}}>{strategyFileName}</div>
                      <div style={{color:'rgba(39,174,96,0.9)',fontSize:11,marginTop:2}}>Strategy loaded — calendar will align with your goals and brand voice</div></>
                  : <><div style={{color:B.white,fontWeight:600,fontSize:13}}>Upload your 90-Day Strategy Doc</div>
                      <div style={{color:B.gray,fontSize:11,marginTop:2}}>Download from Strategy Builder then upload here — gives the calendar full context</div></>}
              </div>
              {strategyDoc && (
                <button onClick={e=>{e.preventDefault();setStrategyDoc('');setStrategyFileName('');}}
                  style={{background:'rgba(255,255,255,0.08)',border:'none',color:B.gray,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>
                  ✕ Remove
                </button>
              )}
            </div>
            <input type="file" accept=".txt,.md,text/plain" onChange={handleStrategyUpload} style={{display:'none'}}/>
          </label>
        </div>

        <SecLabel>Content Pillars</SecLabel>
        <input value={pillars} onChange={e=>setPillars(e.target.value)}
          placeholder={strategyDoc ? 'Override pillars here, or leave blank to use pillars from strategy doc...' : 'e.g. Veteran mindset, Real estate tips, Family lessons, Fitness...'}
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
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||(!pillars&&!strategyDoc)}>
          {loading ? 'Building Calendar...' : '📅 Build Calendar'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

function ProfileAudit() {
  const [platform, setPlatform] = useState('Instagram');
  const [extraContext, setExtraContext] = useState('');
  const [liveData, setLiveData] = useState('');
  const [out, setOut] = useState('');
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  const handles = {
    Instagram: '@everydayelevations on Instagram — instagram.com/everydayelevations',
    YouTube: 'youtube.com/@everydayelevations',
    Facebook: 'facebook.com/jason.fricka',
    LinkedIn: 'linkedin.com/in/jason-fricka — HR Manager + podcast host Jason Fricka',
  };

  const fetchLive = async () => {
    setFetching(true); setLiveData(''); setOut('');
    const res = await perp(`Audit this social media profile right now and report exactly what is on it: ${handles[platform]}. Report the exact bio text, follower count if visible, recent post types, highlights or featured sections, and overall profile structure. Be specific and factual.`);
    setLiveData(res); setFetching(false);
  };

  const run = async () => {
    if (!liveData) return;
    setLoading(true); setOut('');
    const res = await ai(PROFILE_PROMPT(platform, liveData, extraContext));
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>👤</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Profile Audit</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Perplexity pulls your live profile first. Then Claude audits what's actually there.</p>
        </div>
      </div>

      <Card style={{marginBottom:16}}>
        <SecLabel>Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => { setPlatform(p); setLiveData(''); setOut(''); }}
              style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
              {p}{p==='LinkedIn'?' (Dual-Lane)':''}
            </button>
          ))}
        </div>

        <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
          <strong style={{color:B.red}}>Step 1</strong> — Perplexity looks up your live {platform} profile right now. Hit the button below.
        </div>
        <button onClick={fetchLive} disabled={fetching}
          style={{background:fetching?B.gray:'rgba(255,255,255,0.08)',color:B.white,border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:8,padding:'9px 20px',fontWeight:700,cursor:fetching?'not-allowed':'pointer',fontSize:13,marginBottom:16}}>
          {fetching ? 'Pulling live profile...' : `🔍 Pull Live ${platform} Profile`}
        </button>

        {liveData && (
          <div style={{marginBottom:16}}>
            <SecLabel>What Perplexity Found</SecLabel>
            <div style={{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'12px',fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.7,maxHeight:180,overflowY:'auto'}}>
              {liveData}
            </div>
          </div>
        )}

        <SecLabel>Anything Perplexity Can't See (optional)</SecLabel>
        <textarea value={extraContext} onChange={e=>setExtraContext(e.target.value)} rows={3}
          placeholder={`e.g. My current DM volume, what posts get the most saves, my email list size, what my audience asks most...`}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading || !liveData}>
            {loading ? 'Auditing...' : 'Run Full Audit'}
          </RedBtn>
          {!liveData && <span style={{color:B.gray,fontSize:12,marginLeft:12}}>Pull live profile first</span>}
        </div>
      </Card>
      {loading && <Spin/>}
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

function LeadMagnet() {
  const [audience, setAudience] = useState('Veterans transitioning out, everyday people working on their mindset, people who feel stuck and want to start moving again');
  const [problem, setProblem] = useState("They know they need to change but don't know where to start. They feel like everyone else has it figured out. They're showing up but not seeing results.");
  const [offer, setOffer] = useState('Mindset coaching, Everyday Elevations podcast, Elevation Nation community, real estate (Fricka Sells Colorado)');
  const [currentContent, setCurrentContent] = useState('Reels on mindset, veteran life, everyday wins, outdoor Colorado lifestyle, family lessons, real estate tips. Voice is direct, real, no hype.');
  const [whatWorks, setWhatWorks] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');
    const res = await ai(MAGNET_PROMPT(audience, problem, offer, currentContent, whatWorks));
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🧲</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Lead Magnet Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Pre-filled with your context. Add what's actually working, then generate.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Who You're Trying to Reach</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>The Core Problem You Solve</SecLabel>
        <textarea value={problem} onChange={e=>setProblem(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>Your Offers / Services</SecLabel>
        <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What You Currently Post / Your Content Style</SecLabel>
        <textarea value={currentContent} onChange={e=>setCurrentContent(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What's Resonated Most With Your Audience (comments, DMs, saves, shares)</SecLabel>
        <textarea value={whatWorks} onChange={e=>setWhatWorks(e.target.value)} rows={3}
          placeholder="e.g. My veteran transition story got 200 saves. Posts about early mornings get the most DMs. People always ask me about my morning routine..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading}>
            {loading ? 'Building...' : 'Build Lead Magnet System'}
          </RedBtn>
        </div>
      </Card>
      {loading && <Spin/>}
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

function CommunityBuilder() {
  const [focus, setFocus] = useState("Everyday people who refuse to stay where they are. Mindset, resilience, showing up when it's hard. Veterans, parents, professionals, athletes.");
  const [currentEngagement, setCurrentEngagement] = useState('');
  const [whereTheyAre, setWhereTheyAre] = useState('Instagram comments and DMs primarily. Some Facebook. Podcast listeners.');
  const [whatTheyAsk, setWhatTheyAsk] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');
    const res = await ai(COMMUNITY_PROMPT(focus, currentEngagement, whereTheyAre, whatTheyAsk));
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🏔️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Community Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Built from what's actually happening in your audience — not a template.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Who Elevation Nation Is For</SecLabel>
        <textarea value={focus} onChange={e=>setFocus(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What Your Current Engagement Actually Looks Like</SecLabel>
        <textarea value={currentEngagement} onChange={e=>setCurrentEngagement(e.target.value)} rows={2}
          placeholder="e.g. I get 10-15 DMs a week. Most comments are people saying they needed this today. My veteran posts get the most replies..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>Where Your Audience Lives Right Now</SecLabel>
        <textarea value={whereTheyAre} onChange={e=>setWhereTheyAre(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What People Ask You or Tell You Most (comments, DMs, real life)</SecLabel>
        <textarea value={whatTheyAsk} onChange={e=>setWhatTheyAsk(e.target.value)} rows={3}
          placeholder="e.g. How do you stay consistent? How did you get through your transition? Can you do more content on morning routines?..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading}>
            {loading ? 'Building...' : 'Build Elevation Nation System'}
          </RedBtn>
        </div>
      </Card>
      {loading && <Spin/>}
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

function Pipeline() {
  const [query,setQuery] = useState('');
  const [angle,setAngle] = useState('veteran');
  const [platform,setPlatform] = useState('Instagram');
  const [tier,setTier] = useState(0);
  const [step,setStep] = useState('idle');
  const [research,setResearch] = useState('');
  const [intel,setIntel] = useState('');
  const [script,setScript] = useState('');

  // Pull trending topics from the shared Trend Alerts cache
  const trendingChips = (() => {
    try {
      const stored = localStorage.getItem('encis_trend_alerts');
      if (!stored) return [];
      const alerts = JSON.parse(stored);
      return alerts
        .filter(a => a.title || a.text)
        .map(a => ({
          label: a.title || a.text?.slice(0, 50),
          angle: a.angle,
          views: a.views,
          account: a.account,
        }))
        .slice(0, 8);
    } catch { return []; }
  })();

  // Map angle label back to angle id for auto-selecting the grid
  const angleIdFromLabel = (label) => {
    return ANGLES.find(a => a.label === label)?.id || 'mindset';
  };

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

        {/* Trending topic chips — tap to auto-fill */}
        {trendingChips.length > 0 && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(0,212,255,0.7)',
              textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <span>🔥</span> Trending Right Now — tap to research
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {trendingChips.map((chip, i) => (
                <button key={i}
                  onClick={() => {
                    setQuery(chip.label);
                    if (chip.angle) setAngle(angleIdFromLabel(chip.angle));
                  }}
                  style={{
                    background: query === chip.label ? B.red : 'rgba(0,212,255,0.08)',
                    border: `1px solid ${query === chip.label ? B.red : 'rgba(0,212,255,0.2)'}`,
                    borderRadius:20,padding:'5px 12px',cursor:'pointer',
                    color: query === chip.label ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontSize:12,fontWeight:500,textAlign:'left',
                    display:'flex',alignItems:'center',gap:6,
                    maxWidth:280,
                  }}>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>
                    {chip.label}
                  </span>
                  {chip.views && (
                    <span style={{color:B.red,fontSize:10,fontWeight:700,flexShrink:0}}>
                      {chip.views}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

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
      <OutputWithTeleprompter text={out}/>
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
      <OutputWithTeleprompter text={out}/>
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
  const [teleprompter,setTeleprompter] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');
    let res;
    if(mode==='write') {
      if(!topic) { setLoading(false); return; }
      const angleLabel = ANGLES.find(a=>a.id===angle)?.label;
      res = await ai(SCRIPT_PROMPT(topic, angleLabel, platform));
      logToMemory({ type:'script', title:topic, topic, platform, angle:angleLabel, preview:res.slice(0,200) });
    } else {
      if(!stitchContent) { setLoading(false); return; }
      const angleLabel = ANGLES.find(a=>a.id===angle)?.label;
      res = await ai(STITCH_PROMPT(stitchContent, angleLabel));
      logToMemory({ type:'script', title:`Stitch: ${stitchContent.slice(0,60)}`, platform, angle:angleLabel, preview:res.slice(0,200) });
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

      {/* Output + Teleprompter launch */}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <span style={{color:B.white,fontWeight:700,fontSize:14}}>Your Script</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={()=>setTeleprompter(true)}
                style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00d4ff',
                  border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'7px 16px',
                  fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                📺 Teleprompter Mode
              </button>
            </div>
          </div>
          <OutputWithTeleprompter text={out}/>
        </div>
      )}

      {/* Teleprompter fullscreen overlay */}
      {teleprompter && (
        <Teleprompter text={out} onClose={()=>setTeleprompter(false)}/>
      )}
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
      <OutputWithTeleprompter text={out}/>
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
      <OutputWithTeleprompter text={out}/>
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
      <OutputWithTeleprompter text={out}/>
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
      <OutputWithTeleprompter text={out}/>
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
      <OutputWithTeleprompter text={out}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEPROMPTER
// ═══════════════════════════════════════════════════════════════════════════════

function Teleprompter({ text, onClose }) {
  const [speed, setSpeed] = useState(2);        // px per second × 10
  const [running, setRunning] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [mirror, setMirror] = useState(false);
  const scrollRef = useRef(null);
  const rafRef   = useRef(null);
  const lastRef  = useRef(null);

  // Clean script text — strip markdown bold/italic, keep structure
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3} /g, '')
    .trim();

  const tick = (ts) => {
    if (!lastRef.current) lastRef.current = ts;
    const delta = ts - lastRef.current;
    lastRef.current = ts;
    if (scrollRef.current) {
      scrollRef.current.scrollTop += (speed * delta) / 1000;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (running) {
      lastRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, speed]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRunning(r => !r); }
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp')   setSpeed(s => Math.min(s + 0.5, 10));
      if (e.key === 'ArrowDown') setSpeed(s => Math.max(s - 0.5, 0.5));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column'}}>
      {/* Controls bar */}
      <div style={{background:'rgba(255,255,255,0.05)',borderBottom:'1px solid rgba(255,255,255,0.1)',
        padding:'10px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',flexShrink:0}}>
        <button onClick={() => setRunning(r => !r)}
          style={{background:running?B.red:'#00d4ff',color:'#000',border:'none',borderRadius:8,
            padding:'8px 22px',fontWeight:900,fontSize:14,cursor:'pointer',minWidth:90}}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:B.gray,fontSize:12}}>Speed</span>
          <button onClick={()=>setSpeed(s=>Math.max(s-0.5,0.5))}
            style={{background:'rgba(255,255,255,0.1)',color:B.white,border:'none',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:16}}>−</button>
          <span style={{color:B.white,fontWeight:700,fontSize:13,minWidth:24,textAlign:'center'}}>{speed.toFixed(1)}</span>
          <button onClick={()=>setSpeed(s=>Math.min(s+0.5,10))}
            style={{background:'rgba(255,255,255,0.1)',color:B.white,border:'none',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:16}}>+</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:B.gray,fontSize:12}}>Size</span>
          <button onClick={()=>setFontSize(s=>Math.max(s-4,24))}
            style={{background:'rgba(255,255,255,0.1)',color:B.white,border:'none',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:14}}>A-</button>
          <button onClick={()=>setFontSize(s=>Math.min(s+4,80))}
            style={{background:'rgba(255,255,255,0.1)',color:B.white,border:'none',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:14}}>A+</button>
        </div>
        <button onClick={()=>setMirror(m=>!m)}
          style={{background:mirror?'rgba(0,212,255,0.15)':'rgba(255,255,255,0.07)',
            color:mirror?'#00d4ff':B.gray,border:`1px solid ${mirror?'rgba(0,212,255,0.4)':'transparent'}`,
            borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>
          ↔ Mirror
        </button>
        <div style={{marginLeft:'auto',color:B.gray,fontSize:11,lineHeight:1.6,textAlign:'right'}}>
          Space/Enter — play/pause<br/>↑↓ — speed &nbsp;·&nbsp; Esc — exit
        </div>
        <button onClick={onClose}
          style={{background:'rgba(233,69,96,0.15)',color:B.red,border:'1px solid rgba(233,69,96,0.3)',
            borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:700}}>
          ✕ Exit
        </button>
      </div>

      {/* Focus line */}
      <div style={{position:'absolute',top:'42%',left:0,right:0,height:4,
        background:'rgba(0,212,255,0.25)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:'42%',left:0,right:0,height:'18%',
        background:'linear-gradient(transparent,rgba(0,212,255,0.04),transparent)',
        pointerEvents:'none',zIndex:1}}/>

      {/* Script text */}
      <div ref={scrollRef} style={{flex:1,overflowY:'hidden',padding:'0 10vw',
        transform:mirror?'scaleX(-1)':'none'}}>
        <div style={{paddingTop:'44vh',paddingBottom:'60vh'}}>
          {cleanText.split('\n').filter(l=>l.trim()).map((line, i) => {
            const isHook = i === 0;
            const isCTA  = line.toLowerCase().includes('cta') || line.toLowerCase().startsWith('comment') || line.toLowerCase().startsWith('follow');
            return (
              <p key={i} style={{
                fontSize: isHook ? fontSize * 1.15 : fontSize,
                fontWeight: isHook ? 900 : (line.startsWith('**')||line.startsWith('VARIATION')||line.startsWith('Hook')||line.startsWith('Body')||line.startsWith('CTA') ? 700 : 400),
                color: isCTA ? '#00d4ff' : isHook ? B.white : 'rgba(255,255,255,0.88)',
                lineHeight: 1.55,
                marginBottom: '0.9em',
                textAlign: 'center',
                letterSpacing: fontSize > 50 ? '-0.02em' : 'normal',
                transition: 'color 0.3s',
              }}>
                {line.replace(/^\*\*|\*\*$/g,'').replace(/^#+\s/,'')}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TREND ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

const TREND_ALERTS_KEY  = 'encis_trend_alerts';
const TREND_ALERTS_DATE = 'encis_trend_date';
const APP_VERSION_KEY   = 'encis_version';
const CURRENT_VERSION   = '2.1';

// One-time migration: clear stale data from old format on version bump
try {
  if (typeof window !== 'undefined' && localStorage.getItem(APP_VERSION_KEY) !== CURRENT_VERSION) {
    localStorage.removeItem(TREND_ALERTS_KEY);
    localStorage.removeItem(TREND_ALERTS_DATE);
    localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
  }
} catch {}

function useTrendAlerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREND_ALERTS_KEY);
      const date   = localStorage.getItem(TREND_ALERTS_DATE);
      if (stored) setAlerts(JSON.parse(stored));
      if (date)   setLastRun(date);
    } catch {}
  }, []);

  const checkTrends = async () => {
    setLoading(true);
    try {
      const today = new Date().toDateString();

      // Strict 24-48 hour window, 1M+ views only
      const todayStr = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
      const makeQuery = (niche) =>
        `Today is ${todayStr}. Search right now for a specific viral video about ${niche} posted on Instagram Reels or YouTube Shorts within the last 24-48 hours that has already surpassed 1 million views. This must be brand new content — posted today or yesterday only. Do not report anything older than 48 hours. Do not estimate view counts — only report if you can verify over 1M views. If no video in this niche meets both requirements (posted in last 48 hours AND verified 1M+ views), respond with exactly: NO_RESULT\n\nIf you find one, respond ONLY in this exact format:\n\nACCOUNT: [exact @handle or YouTube channel name]\nPLATFORM: [Instagram or YouTube]\nVIDEO TITLE: [exact title or caption]\nVIEWS: [verified count — must exceed 1M]\nPOSTED: [exact date posted, e.g. March 18, 2026]\nWHY IT BLEW UP: [one sentence — specific psychology or format reason]\nHOOK TO STEAL: [opening line Jason Fricka could use to make a similar video]`;

      const angleQueries = [
        { angle: "Veteran / Resilience",       q: makeQuery("veteran, military resilience, or veteran transition") },
        { angle: "Mindset & Mental Toughness", q: makeQuery("mindset, mental toughness, or discipline") },
        { angle: "Everyday Wins",              q: makeQuery("consistency, daily habits, or showing up every day") },
        { angle: "Outdoor Living & Community", q: makeQuery("outdoor lifestyle, nature, or tight-knit community") },
        { angle: "Finance & Real Estate",      q: makeQuery("personal finance, real estate investing, or money mindset") },
        { angle: "Podcast & Personal Growth",  q: makeQuery("podcast clips, personal growth, or self-improvement") },
        { angle: "Family & Life Lessons",      q: makeQuery("family, parenting, or life lessons") },
        { angle: "Health & Physical Wellness", q: makeQuery("fitness, health, or physical wellness") },
      ];

      const results = await Promise.all(
        angleQueries.map(async ({ angle, q }, i) => {
          try {
            const res = await fetch('/api/perplexity', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: q })
            });
            const d = await res.json();
            const raw = (d.result || d.text || '').trim();

            // Skip if Perplexity couldn't find a verified 1M+ video
            if (!raw || raw.includes('NO_RESULT') || raw.toLowerCase().includes('cannot find') ||
                raw.toLowerCase().includes('no specific') || raw.toLowerCase().includes("i don't have")) {
              return null;
            }


            // Parse structured labeled fields from the response
            const getField = (label) => {
              const regex = new RegExp(`${label}:\\s*(.+)`, 'i');
              const match = raw.match(regex);
              return match ? match[1].replace(/\*\*/g,'').trim() : null;
            };

            const account  = getField('ACCOUNT');
            const platform = getField('PLATFORM') || 'Instagram';
            const title    = getField('VIDEO TITLE');
            const views    = getField('VIEWS');
            const posted   = getField('POSTED');
            const why      = getField('WHY IT BLEW UP');
            const hook     = getField('HOOK TO STEAL');

            // Hard filter — reject anything under 1M views
            if (views) {
              const vNum  = parseFloat(views.replace(/[^0-9.]/g, '')) || 0;
              const vUp   = views.toUpperCase();
              const vMil  = vUp.includes('B') ? vNum * 1000 : vUp.includes('M') ? vNum : vUp.includes('K') ? vNum / 1000 : vNum / 1000000;
              if (vMil < 1) return null;
            }
            // Reject if account is missing or clearly fabricated
            if (!account || account.toLowerCase().includes('not available') || account === 'N/A') return null;


            // Clean handle — strip @ for URL construction
            const handleRaw = account || '';
            const handle    = handleRaw.replace(/^@/, '');

            // Build direct profile + search links
            const isYT   = platform.toLowerCase().includes('youtube');
            const isIG   = platform.toLowerCase().includes('instagram');

            // Profile link — goes straight to the creator
            const profileUrl = isYT
              ? `https://www.youtube.com/@${handle}`
              : `https://www.instagram.com/${handle}/reels/`;

            // Search link — title search on the right platform
            const titleEnc   = encodeURIComponent(title || handle || angle);
            const searchUrl  = isYT
              ? `https://www.youtube.com/results?search_query=${titleEnc}&sp=EgQIARAB`
              : `https://www.instagram.com/explore/search/keyword/?q=${titleEnc}`;

            // Perplexity deep-dive link
            const perpLink = 'https://www.perplexity.ai/search?q=' + encodeURIComponent(
              (handleRaw || angle) + ' ' + (title || '') + ' viral video 2026'
            );

            // Main display text
            const text = [
              title && ('"' + title + '"'),
              why,
            ].filter(Boolean).join(' — ') || raw.slice(0, 200);

            return {
              id: Date.now() + i,
              angle,
              account: handleRaw || null,
              platform,
              title,
              views,
              posted,
              text,
              hook,
              profileUrl,
              searchUrl,
              perpLink,
              raw,
              ts: Date.now(),
              seen: false,
            };
          } catch { return null; }
        })
      );

      const parsed = results.filter(Boolean);
      localStorage.setItem(TREND_ALERTS_KEY, JSON.stringify(parsed));
      localStorage.setItem(TREND_ALERTS_DATE, Date.now().toString());
      setAlerts(parsed);
      setLastRun(new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', month:'short', day:'numeric'}));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // Auto-check twice per day — trends move fast, 12-hour refresh window
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREND_ALERTS_DATE) || '0';
      const lastTs = /^\d+$/.test(stored) ? parseInt(stored) : 0; // guard against old date-string format
      const hoursSinceLast = (Date.now() - lastTs) / (1000 * 60 * 60);
      if (hoursSinceLast > 12 && !loading) checkTrends();
    } catch {}
  }, []);

  const markSeen = () => {
    const updated = alerts.map(a => ({...a, seen:true}));
    setAlerts(updated);
    try { localStorage.setItem(TREND_ALERTS_KEY, JSON.stringify(updated)); } catch {}
  };

  const unseen = alerts.filter(a => !a.seen).length;
  return { alerts, loading, lastRun, checkTrends, markSeen, unseen };
}

function TrendAlertBanner() {
  const { alerts, loading, lastRun, checkTrends, markSeen, unseen } = useTrendAlerts();
  const [expanded, setExpanded] = useState(false);

  if (!alerts.length && !loading) return null;

  // Angle emoji map
  const angleEmoji = {
    'Veteran / Resilience': '🎖️',
    'Mindset & Mental Toughness': '🧠',
    'Everyday Wins': '⚡',
    'Outdoor Living & Community': '🏔️',
    'Finance & Real Estate': '💰',
    'Podcast & Personal Growth': '🎙️',
    'Family & Life Lessons': '❤️',
    'Health & Physical Wellness': '💪',
  };

  // Truncate alert text cleanly
  const preview = alerts.find(a => a.text?.length > 10)?.text?.slice(0, 90) || 'Checking your 8 content angles...';

  return (
    <div style={{background:'rgba(233,69,96,0.06)',borderBottom:'1px solid rgba(233,69,96,0.15)',
      position:'sticky',top:52,zIndex:90}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 16px'}}>

        {/* Collapsed bar — toggle button only, no full-row onClick so links inside always work */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',minHeight:40}}>
          <span style={{fontSize:14,flexShrink:0}}>🔥</span>
          <span style={{color:B.red,fontWeight:700,fontSize:12,whiteSpace:'nowrap',flexShrink:0}}>Trend Alerts</span>
          {unseen > 0 && !expanded && (
            <span style={{background:B.red,color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10,fontWeight:700,flexShrink:0}}>
              {unseen} new
            </span>
          )}
          {loading
            ? <span style={{color:B.gray,fontSize:12,flex:1}}>Checking all 8 content angles...</span>
            : !expanded && <span style={{color:'rgba(255,255,255,0.55)',fontSize:12,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{preview}...</span>
          }
          <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto',flexShrink:0}}>
            <button onClick={checkTrends}
              style={{background:'rgba(255,255,255,0.07)',color:B.gray,border:'none',
                borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>
              {loading ? '⏳' : '↻ Refresh'}
            </button>
            <button
              onClick={()=>{ setExpanded(e=>!e); if(unseen>0) markSeen(); }}
              style={{background:'rgba(255,255,255,0.07)',color:B.gray,border:'none',
                borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',fontWeight:700}}>
              {expanded ? '▲ Hide' : '▼ Show All'}
            </button>
          </div>
        </div>

        {/* Expanded grid */}
        {expanded && (
          <div style={{paddingBottom:16}}>
            {lastRun && (
              <div style={{color:B.gray,fontSize:11,marginBottom:10,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                <span>Last checked: {lastRun}</span>
                <span style={{color:B.red,fontWeight:700}}>{alerts.length} verified 1M+ trends found</span>
                {alerts.length < 8 && (
                  <span style={{color:'rgba(255,255,255,0.35)'}}>· {8 - alerts.length} angles had no verified 1M+ content this week</span>
                )}
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:10}}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  background:'rgba(0,0,0,0.25)',
                  border:`1px solid ${alert.seen?'rgba(255,255,255,0.07)':'rgba(233,69,96,0.3)'}`,
                  borderRadius:12,padding:'14px 16px',
                  display:'flex',flexDirection:'column',gap:8,
                }}>
                  {/* Angle label + badge */}
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:15}}>{angleEmoji[alert.angle] || '📌'}</span>
                    <span style={{color:B.red,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,flex:1}}>
                      {alert.angle}
                    </span>
                    {!alert.seen && (
                      <span style={{background:B.red,color:'#fff',borderRadius:8,padding:'1px 6px',fontSize:9,fontWeight:700}}>NEW</span>
                    )}
                  </div>

                  {/* Views + Account + Posted row */}
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    {alert.views && (
                      <span style={{background:'rgba(233,69,96,0.2)',color:B.red,borderRadius:6,padding:'3px 9px',fontSize:11,fontWeight:800}}>
                        🔥 {alert.views}
                      </span>
                    )}
                    {alert.account && (
                      <span style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.85)',borderRadius:6,padding:'3px 9px',fontSize:11,fontWeight:700}}>
                        {alert.account}
                      </span>
                    )}
                    {alert.platform && (
                      <span style={{color:B.gray,fontSize:10,textTransform:'uppercase',letterSpacing:1}}>
                        {alert.platform}
                      </span>
                    )}
                    {alert.posted && (
                      <span style={{color:'rgba(0,212,255,0.7)',fontSize:10,marginLeft:'auto'}}>
                        📅 {alert.posted}
                      </span>
                    )}
                  </div>

                  {/* Video title */}
                  {alert.title && (
                    <div style={{color:B.white,fontWeight:700,fontSize:13,lineHeight:1.5}}>
                      "{alert.title}"
                    </div>
                  )}

                  {/* Why it blew up */}
                  <div style={{color:alert.seen?'rgba(255,255,255,0.45)':'rgba(255,255,255,0.78)',fontSize:12,lineHeight:1.7}}>
                    {alert.text}
                  </div>

                  {/* Hook to steal */}
                  {alert.hook && (
                    <div style={{background:'rgba(0,212,255,0.07)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:'9px 12px'}}>
                      <div style={{color:'#00d4ff',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Hook to Steal</div>
                      <div style={{color:'rgba(255,255,255,0.85)',fontSize:12,lineHeight:1.65,fontStyle:'italic'}}>"{alert.hook}"</div>
                    </div>
                  )}

                  {/* Action links — stop propagation so clicks work inside the banner */}
                  <div style={{display:'flex',gap:6,marginTop:'auto',flexWrap:'wrap'}} onClick={e=>e.stopPropagation()}>
                    {alert.account && (
                      <a href={alert.profileUrl} target="_blank" rel="noopener noreferrer"
                        style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:5,
                          background:B.red,color:'#fff',borderRadius:8,padding:'9px 12px',
                          fontSize:12,fontWeight:700,textDecoration:'none'}}>
                        👤 View {alert.account}
                      </a>
                    )}
                    <a href={alert.searchUrl} target="_blank" rel="noopener noreferrer"
                      style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:4,
                        background:'rgba(255,255,255,0.07)',color:B.white,border:'1px solid rgba(255,255,255,0.12)',
                        borderRadius:8,padding:'9px 10px',fontSize:12,fontWeight:600,textDecoration:'none'}}>
                      🔎 Search
                    </a>
                    <a href={alert.perpLink} target="_blank" rel="noopener noreferrer"
                      style={{display:'flex',alignItems:'center',justifyContent:'center',
                        background:'rgba(255,255,255,0.04)',color:B.gray,border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:8,padding:'9px 10px',fontSize:11,textDecoration:'none',whiteSpace:'nowrap'}}>
                      🔍 Deep Dive
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROI DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const ROI_KEY = 'encis_roi_data';

function ROIDashboard() {
  const [weeks,    setWeeks]    = useState([]);
  const [form,     setForm]     = useState({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', topContent:'', notes:'' });
  const [showForm, setShowForm] = useState(false);
  const [editIdx,  setEditIdx]  = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ROI_KEY);
      if (stored) setWeeks(JSON.parse(stored));
    } catch {}
  }, []);

  const saveWeeks = (updated) => {
    setWeeks(updated);
    try { localStorage.setItem(ROI_KEY, JSON.stringify(updated)); } catch {}
  };

  const submit = () => {
    if (!form.week) return;
    const entry = { ...form, id: editIdx !== null ? weeks[editIdx].id : Date.now() };
    let updated;
    if (editIdx !== null) {
      updated = weeks.map((w,i) => i === editIdx ? entry : w);
      setEditIdx(null);
    } else {
      updated = [...weeks, entry].sort((a,b) => new Date(a.week) - new Date(b.week));
    }
    saveWeeks(updated);
    setForm({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', topContent:'', notes:'' });
    setShowForm(false);
  };

  const deleteWeek = (i) => {
    if (window.confirm('Delete this week?')) saveWeeks(weeks.filter((_,idx)=>idx!==i));
  };

  // Simple SVG sparkline
  const Sparkline = ({ data, color='#E94560', height=40 }) => {
    if (data.length < 2) return null;
    const nums = data.map(Number).filter(n=>!isNaN(n));
    if (!nums.length) return null;
    const min = Math.min(...nums), max = Math.max(...nums);
    const range = max - min || 1;
    const w = 120, h = height;
    const pts = nums.map((v,i) => `${(i/(nums.length-1))*w},${h - ((v-min)/range)*(h-4)+2}`).join(' ');
    return (
      <svg width={w} height={h} style={{display:'block'}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
        <circle cx={(nums.length-1)/(nums.length-1)*w} cy={h - ((nums[nums.length-1]-min)/range)*(h-4)+2} r="3" fill={color}/>
      </svg>
    );
  };

  // Growth calculations
  const latest  = weeks[weeks.length - 1];
  const prev    = weeks[weeks.length - 2];
  const growth  = (field) => {
    if (!latest || !prev || !latest[field] || !prev[field]) return null;
    const pct = ((Number(latest[field]) - Number(prev[field])) / Number(prev[field]) * 100);
    return pct.toFixed(1);
  };

  const fields = [
    { k:'followers', label:'Followers',  color:'#00d4ff' },
    { k:'reach',     label:'Weekly Reach', color:'#E94560' },
    { k:'saves',     label:'Saves',       color:'#f5a623' },
    { k:'shares',    label:'Shares',      color:'#27ae60' },
    { k:'leads',     label:'Leads/DMs',   color:'#9b59b6' },
  ];

  const formFields = [
    { k:'week',       label:'Week (date)',       ph:'e.g. Jan 13, 2025',            full:false },
    { k:'followers',  label:'Total Followers',   ph:'e.g. 2847',                    full:false },
    { k:'reach',      label:'Total Reach',       ph:'e.g. 18400',                   full:false },
    { k:'saves',      label:'Total Saves',       ph:'e.g. 234',                     full:false },
    { k:'shares',     label:'Total Shares',      ph:'e.g. 67',                      full:false },
    { k:'leads',      label:'Leads / DMs',       ph:'e.g. 8',                       full:false },
    { k:'topContent', label:'Top Performing Post',ph:'e.g. Veteran morning routine got 900 saves', full:true },
    { k:'notes',      label:'Notes',             ph:'e.g. Tried shorter captions — engagement up 40%', full:true },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:32}}>📈</span>
          <div>
            <h2 style={{color:B.white,margin:0}}>ROI Dashboard</h2>
            <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Weekly scorecard — track growth, identify what drives real results</p>
          </div>
        </div>
        <button onClick={()=>{ setForm({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', topContent:'', notes:'' }); setEditIdx(null); setShowForm(true); }}
          style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Log This Week
        </button>
      </div>

      {/* Empty state */}
      {weeks.length === 0 && !showForm && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:48,marginBottom:16}}>📊</div>
          <div style={{color:B.white,fontWeight:700,fontSize:18,marginBottom:8}}>No data yet</div>
          <div style={{color:B.gray,fontSize:14,lineHeight:1.7,marginBottom:20}}>Log your first week of metrics and the dashboard builds automatically.<br/>Takes 60 seconds. Pays off every week after.</div>
          <button onClick={()=>setShowForm(true)}
            style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            + Log First Week
          </button>
        </div>
      )}

      {/* Metric cards + sparklines */}
      {weeks.length > 0 && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:24}}>
            {fields.map(f => {
              const g = growth(f.k);
              const vals = weeks.map(w => w[f.k]);
              return (
                <div key={f.k} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:B.gray,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>{f.label}</div>
                  <div style={{fontSize:26,fontWeight:800,color:B.white,marginBottom:4}}>{latest?.[f.k] || '—'}</div>
                  {g !== null && (
                    <div style={{fontSize:12,fontWeight:700,color:Number(g)>=0?'#27ae60':'#e74c3c',marginBottom:8}}>
                      {Number(g)>=0?'▲':'▼'} {Math.abs(Number(g))}% vs last week
                    </div>
                  )}
                  <Sparkline data={vals} color={f.color}/>
                </div>
              );
            })}
          </div>

          {/* Top content tracker */}
          {weeks.some(w=>w.topContent) && (
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'16px',marginBottom:20}}>
              <div style={{fontSize:11,color:B.red,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>Top Content Log</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[...weeks].reverse().filter(w=>w.topContent).slice(0,6).map((w,i) => (
                  <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                    <span style={{color:B.gray,fontSize:11,whiteSpace:'nowrap',paddingTop:2}}>{w.week}</span>
                    <span style={{color:B.white,fontSize:13,lineHeight:1.5}}>{w.topContent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week log table */}
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,overflow:'hidden',marginBottom:20}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    {['Week','Followers','Reach','Saves','Shares','Leads','Notes',''].map(h => (
                      <th key={h} style={{padding:'10px 12px',textAlign:'left',color:B.gray,fontWeight:700,letterSpacing:1,fontSize:10,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...weeks].reverse().map((w,i) => (
                    <tr key={w.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'10px 12px',color:B.white,fontWeight:600,whiteSpace:'nowrap'}}>{w.week}</td>
                      {['followers','reach','saves','shares','leads'].map(f => (
                        <td key={f} style={{padding:'10px 12px',color:'rgba(255,255,255,0.75)'}}>{w[f]||'—'}</td>
                      ))}
                      <td style={{padding:'10px 12px',color:B.gray,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.notes||'—'}</td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={()=>{ setForm({...w}); setEditIdx(weeks.length-1-i); setShowForm(true); }}
                            style={{background:'rgba(255,255,255,0.07)',color:B.gray,border:'none',borderRadius:5,padding:'3px 8px',fontSize:11,cursor:'pointer'}}>Edit</button>
                          <button onClick={()=>deleteWeek(weeks.length-1-i)}
                            style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:5,padding:'3px 6px',fontSize:12,cursor:'pointer'}}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Entry form */}
      {showForm && (
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'22px',marginBottom:20}}>
          <div style={{color:B.white,fontWeight:700,fontSize:15,marginBottom:18}}>{editIdx!==null?'Edit Week':'Log This Week'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {formFields.map(f => (
              <div key={f.k} style={{gridColumn:f.full?'1/-1':'auto'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:B.red,textTransform:'uppercase',marginBottom:5}}>{f.label}</div>
                {f.full
                  ? <textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                      style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                  : <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                      style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
                }
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:18}}>
            <RedBtn onClick={submit} disabled={!form.week}>{editIdx!==null?'Save Changes':'Log Week'}</RedBtn>
            <button onClick={()=>{ setShowForm(false); setEditIdx(null); }}
              style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
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
  { id:'agency',   emoji:'🏢', label:'Agency' },
  { id:'youtube',  emoji:'▶️',  label:'YouTube' },
];

const SUB_NAV = {
  strategy: [
    { id:'onboard',   emoji:'🚀', label:'Onboarding' },
    { id:'calendar',  emoji:'📅', label:'Calendar' },
    { id:'profile',   emoji:'👤', label:'Profile Audit' },
    { id:'magnet',    emoji:'🧲', label:'Lead Magnet' },
    { id:'community', emoji:'🏔️', label:'Community' },
    { id:'email',     emoji:'📧',  label:'Email Sequences' },
    { id:'challenge', emoji:'🔥',  label:'Challenge Builder' },
  ],
  research: [
    { id:'pipeline', emoji:'🔬', label:'Pipeline' },
    { id:'vault',    emoji:'🗄️', label:'Prompt Vault' },
    { id:'collab',   emoji:'🤝', label:'Collab Finder' },
    { id:'extract',  emoji:'💡', label:'Insight Extractor' },
    { id:'spy',      emoji:'🕵️', label:'Competitor Spy' },
  ],
  create: [
    { id:'script',    emoji:'✍️',  label:'Script Engine' },
    { id:'caption',   emoji:'💬',  label:'Caption Writer' },
    { id:'batch',     emoji:'⚡',  label:'Bulk Batch' },
    { id:'episode',   emoji:'🎙️',  label:'Episode Clips' },
    { id:'repurpose', emoji:'♻️',  label:'Repurpose' },
    { id:'hooks',     emoji:'🪝',  label:'Hook Library' },
    { id:'design',    emoji:'🎨',  label:'Design Studio' },
    { id:'comment',   emoji:'💬',  label:'Comment Responder' },
    { id:'hooktester',emoji:'🧪',  label:'Hook Tester' },
    { id:'podcast',   emoji:'🎙️',  label:'Podcast Prep' },
    { id:'dmscripts', emoji:'📩',  label:'DM Scripts' },
  ],
  optimize: [
    { id:'review',   emoji:'📊', label:'Weekly Review' },
    { id:'roi',      emoji:'📈', label:'ROI Dashboard' },
    { id:'memory',   emoji:'🧠', label:'Content Memory' },
    { id:'schedule', emoji:'🗓️', label:'Schedule' },
    { id:'gaps',     emoji:'🔍', label:'Gap Analyzer' },
  ],
  agency: [
    { id:'clients', emoji:'👥', label:'Client Profiles' },
    { id:'tracker', emoji:'📋', label:'Collab Tracker' },
  ],
  youtube: [
    { id:'yttoolkit', emoji:'▶️', label:'YouTube Toolkit' },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 1 — CAPTION WRITER
// ═══════════════════════════════════════════════════════════════════════════════

const CAPTION_PROMPT = (topic, platform, angle, hook, cta) => `
${VOICE}
${CONTENT_SOP}

Topic: ${topic}
Platform: ${platform}
Angle: ${angle}
Hook to open with: ${hook || 'Write your own strong hook'}
CTA style: ${cta}

Write 3 caption variations for this ${platform} post. Each must feel completely different — different energy, different structure, different length.

**CAPTION 1 — SHORT & PUNCHY** (under 100 words)
[Hook line]
[2-3 lines of value]
[CTA]
[10 hashtags]

**CAPTION 2 — STORY-DRIVEN** (150-250 words)
[Personal moment or scene-setter]
[The lesson or shift]
[Connect to audience]
[CTA]
[15 hashtags]

**CAPTION 3 — EDUCATE & CONVERT** (100-150 words)
[Bold statement hook]
[3 punchy insight lines]
[CTA with keyword trigger]
[15 hashtags]

Rules: No "Hey guys." No emojis unless they add something. Hashtags tiered — 5 niche, 5 mid, 5 broad. CTA matches the platform's culture.`;

function CaptionWriter() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [angle, setAngle] = useState('mindset');
  const [hook, setHook] = useState('');
  const [cta, setCta] = useState('comment');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [teleprompter, setTeleprompter] = useState(false);
  const [activeClient] = useActiveClient();

  const run = async () => {
    if (!topic) return;
    setLoading(true); setOut('');
    const angleLabel = ANGLES.find(a => a.id === angle)?.label || angle;
    const res = await ai(CAPTION_PROMPT(topic, platform, angleLabel, hook, cta));
    setOut(res);
    logToMemory({ type:'caption', title:`Caption: ${topic}`, topic, platform, angle:angleLabel, client:activeClient?.name, preview:res.slice(0,200) });
    setLoading(false);
  };

  const ctaTypes = [
    { id:'comment', label:'Comment CTA', desc:'Drop a word to get something' },
    { id:'dm', label:'DM CTA', desc:'Send me a message' },
    { id:'link', label:'Link CTA', desc:'Check link in bio' },
    { id:'save', label:'Save CTA', desc:'Save this for later' },
    { id:'share', label:'Share CTA', desc:'Send this to someone' },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>✍️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Caption Writer</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>3 caption variations — short, story, and educational. Platform-native, saves-first.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SecLabel>CTA Type</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {ctaTypes.map(c => (
                <button key={c.id} onClick={() => setCta(c.id)}
                  style={{background:cta===c.id?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:cta===c.id?700:400}}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SecLabel>Topic / What the post is about</SecLabel>
        <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={2}
          placeholder="e.g. Why I wake up at 4:45 AM even on weekends, what nobody tells you about veteran transition..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>

        <SecLabel>Opening Hook (optional — paste from Script Engine or write your own)</SecLabel>
        <input value={hook} onChange={e=>setHook(e.target.value)}
          placeholder="e.g. Nobody talks about what happens the week after you get out..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>

        <SecLabel>Content Angle</SecLabel>
        <AngleGrid selected={angle} onSelect={setAngle}/>

        <RedBtn onClick={run} disabled={loading||!topic}>
          {loading ? 'Writing Captions...' : 'Write 3 Caption Variations'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <span style={{color:B.white,fontWeight:700,fontSize:14}}>Your Captions</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={() => setTeleprompter(true)}
                style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00d4ff',
                  border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'7px 16px',
                  fontSize:12,fontWeight:700,cursor:'pointer'}}>
                📺 Teleprompter
              </button>
            </div>
          </div>
          <OutputWithTeleprompter text={out}/>
        </div>
      )}
      {teleprompter && <Teleprompter text={out} onClose={() => setTeleprompter(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 2 — SCHEDULE OPTIMIZER
// ═══════════════════════════════════════════════════════════════════════════════

function ScheduleOptimizer() {
  const [weeks] = useState(() => {
    try { const s = localStorage.getItem('encis_roi_data'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [log] = useState(() => {
    try { const s = localStorage.getItem('encis_content_log'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState('10');

  const run = async () => {
    setLoading(true); setOut('');
    const roiSummary = weeks.length
      ? weeks.slice(-8).map(w => `Week of ${w.week}: Followers ${w.followers}, Reach ${w.reach}, Saves ${w.saves}, Shares ${w.shares}, Top content: ${w.topContent || 'none'}, Notes: ${w.notes || 'none'}`).join('\n')
      : 'No ROI data logged yet.';
    const memorySummary = log.length
      ? log.slice(0, 30).map(e => `${e.date} — ${e.type} — ${e.title} — Rating: ${e.perf || 'unrated'}`).join('\n')
      : 'No content memory logged yet.';

    const prompt = `${VOICE}

You are analyzing Jason Fricka's actual content performance data to build a specific posting schedule.

ROI DATA (last 8 weeks):
${roiSummary}

CONTENT MEMORY (recent 30 pieces):
${memorySummary}

Available hours per week: ${hours}

Based on this actual data, build a specific weekly posting schedule. Do not give generic advice — base every recommendation on what the data shows.

# Optimal Posting Schedule for @everydayelevations

## What the Data Shows
[Specific patterns from the ROI and content memory data above — what's working, what's not, best performing content types]

## Recommended Weekly Schedule
[Day-by-day posting plan based on ${hours} hours/week]
For each day: Platform, Content Type, Best Time to Post, Why (based on data)

## Content Mix Breakdown
[Exact % split across content types based on what's performing]

## What to Stop Doing
[Specific underperforming patterns from the data]

## 30-Day Execution Plan
[Week by week focus based on what the numbers say]

## Key Metrics to Watch
[The 3 numbers that matter most based on this data]`;

    const res = await ai(prompt);
    setOut(res);
    setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🗓️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Schedule Optimizer</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Reads your ROI data and Content Memory — tells you exactly when and what to post.</p>
        </div>
      </div>

      {weeks.length === 0 && log.length === 0 && (
        <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
          ⚠️ No performance data yet. Log a few weeks in the ROI Dashboard and generate some content first — then come back for a data-driven schedule.
        </div>
      )}

      <Card>
        <SecLabel>Hours Available Per Week</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {['3','5','10','15','20+'].map(h => (
            <button key={h} onClick={() => setHours(h)}
              style={{background:hours===h?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:hours===h?700:400}}>
              {h}h
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'14px'}}>
            <div style={{fontSize:11,color:B.red,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>ROI Data</div>
            <div style={{fontSize:22,fontWeight:800,color:B.white}}>{weeks.length}</div>
            <div style={{fontSize:12,color:B.gray}}>weeks logged</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'14px'}}>
            <div style={{fontSize:11,color:B.red,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Content Memory</div>
            <div style={{fontSize:22,fontWeight:800,color:B.white}}>{log.length}</div>
            <div style={{fontSize:12,color:B.gray}}>pieces tracked</div>
          </div>
        </div>

        <RedBtn onClick={run} disabled={loading}>
          {loading ? 'Analyzing your data...' : '🗓️ Build My Optimal Schedule'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <StrategyOutput text={out} onDownload={null} downloading={false}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 3 — CONTENT GAP ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

function ContentGapAnalyzer() {
  const [log] = useState(() => {
    try { const s = localStorage.getItem('encis_content_log'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut('');

    // Build angle frequency map
    const angleCount = {};
    const typeCount = {};
    const rated = { viral: [], good: [], flopped: [] };
    const recent = log.slice(0, 50);

    recent.forEach(e => {
      if (e.angle) angleCount[e.angle] = (angleCount[e.angle] || 0) + 1;
      if (e.type) typeCount[e.type] = (typeCount[e.type] || 0) + 1;
      if (e.perf === '🔥') rated.viral.push(e.title || e.topic);
      if (e.perf === '⭐') rated.good.push(e.title || e.topic);
      if (e.perf === '💀') rated.flopped.push(e.title || e.topic);
    });

    const summary = `
Content logged: ${log.length} total pieces
Most used angles: ${Object.entries(angleCount).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} (${v}x)`).join(', ') || 'none'}
Content types used: ${Object.entries(typeCount).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} (${v}x)`).join(', ') || 'none'}
Viral content: ${rated.viral.slice(0,5).join(' | ') || 'none rated yet'}
Good performers: ${rated.good.slice(0,5).join(' | ') || 'none rated yet'}
Flopped content: ${rated.flopped.slice(0,5).join(' | ') || 'none rated yet'}
Available angles: ${ANGLES.map(a=>a.label).join(', ')}
`;

    const prompt = `${VOICE}

You are analyzing Jason Fricka's content library to find gaps, over-posting, and missed opportunities.

CONTENT AUDIT DATA:
${summary}

# Content Gap Analysis — @everydayelevations

## What You're Over-Posting
[Angles and formats appearing too frequently — risk of audience fatigue]

## What You're Under-Posting
[Angles with zero or low coverage — specific missed opportunities for each]

## Dead Angles (Not Touched in 30+ Days)
[List each untouched angle with ONE specific content idea for each]

## Your Viral Pattern
[What the 🔥 rated content has in common — format, angle, topic type]

## What's Flopping and Why
[Pattern in the 💀 content — what to stop or change]

## 10 Specific Pieces to Create This Week
[Based on the gaps — specific filmable titles, not generic topics]

## 30-Day Content Rebalancing Plan
[How to fix the distribution over the next month]`;

    const res = await ai(prompt);
    setOut(res);
    setLoading(false);
  };

  const angleCount = {};
  log.slice(0, 50).forEach(e => {
    if (e.angle) angleCount[e.angle] = (angleCount[e.angle] || 0) + 1;
  });
  const allAngles = ANGLES.map(a => a.label);
  const missingAngles = allAngles.filter(a => !angleCount[a]);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🔍</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Content Gap Analyzer</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Scans your content library — finds what you're over-posting, under-posting, and missing entirely.</p>
        </div>
      </div>

      {log.length === 0 && (
        <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
          ⚠️ No content in memory yet. Generate content using any tool — it auto-saves here — then run the analyzer.
        </div>
      )}

      {log.length > 0 && (
        <>
          {/* Quick visual breakdown */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8,marginBottom:20}}>
            {ANGLES.map(a => {
              const count = angleCount[a.label] || 0;
              const max = Math.max(...Object.values(angleCount), 1);
              const pct = Math.round((count / max) * 100);
              return (
                <div key={a.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'12px'}}>
                  <div style={{fontSize:12,color:B.white,fontWeight:600,marginBottom:6}}>{a.emoji} {a.label}</div>
                  <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:2,marginBottom:4}}>
                    <div style={{height:'100%',width:`${pct}%`,background:count===0?'rgba(233,69,96,0.3)':count===max?B.red:'#00d4ff',borderRadius:2,transition:'width 0.3s'}}/>
                  </div>
                  <div style={{fontSize:11,color:count===0?B.red:B.gray}}>{count===0?'⚠️ Gap':count + ' pieces'}</div>
                </div>
              );
            })}
          </div>

          {missingAngles.length > 0 && (
            <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.8)'}}>
              <strong style={{color:B.red}}>⚠️ Untouched angles:</strong> {missingAngles.join(', ')}
            </div>
          )}
        </>
      )}

      <Card>
        <div style={{color:B.gray,fontSize:13,lineHeight:1.7,marginBottom:16}}>
          Analyzing <strong style={{color:B.white}}>{log.length} pieces</strong> across your content library.
          {log.filter(e=>e.perf==='🔥').length > 0 && <span> Found <strong style={{color:B.red}}>{log.filter(e=>e.perf==='🔥').length} viral hits</strong> to pattern-match.</span>}
        </div>
        <RedBtn onClick={run} disabled={loading||log.length===0}>
          {loading ? 'Analyzing library...' : '🔍 Run Gap Analysis'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <StrategyOutput text={out} onDownload={null} downloading={false}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 4 — TELEPROMPTER BUTTON ON ALL OUTPUTS
// (injected via enhanced Output component)
// ═══════════════════════════════════════════════════════════════════════════════

function OutputWithTeleprompter({text}) {
  const [teleprompter, setTeleprompter] = useState(false);
  if (!text) return null;
  return (
    <div style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:8}}>
        <CopyBtn text={text}/>
        <button onClick={() => setTeleprompter(true)}
          style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00d4ff',
            border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'6px 14px',
            fontSize:12,fontWeight:700,cursor:'pointer'}}>
          📺 Teleprompter
        </button>
      </div>
      <div style={{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'1rem',
        border:'1px solid rgba(255,255,255,0.1)'}}>
        <pre style={{color:B.white,fontSize:13,whiteSpace:'pre-wrap',margin:0,lineHeight:1.7,
          fontFamily:'inherit'}}>{text}</pre>
      </div>
      {teleprompter && <Teleprompter text={text} onClose={() => setTeleprompter(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 5 — COLLAB OUTREACH TRACKER
// ═══════════════════════════════════════════════════════════════════════════════

const COLLAB_TRACKER_KEY = 'encis_collab_tracker';

function CollabTracker() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');
  const blank = { name:'', handle:'', platform:'Instagram', type:'podcast guest', status:'not contacted', notes:'', pitchSent:'', lastContact:'' };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    try { const s = localStorage.getItem(COLLAB_TRACKER_KEY); if (s) setContacts(JSON.parse(s)); } catch {}
  }, []);

  const save = (list) => {
    setContacts(list);
    try { localStorage.setItem(COLLAB_TRACKER_KEY, JSON.stringify(list)); } catch {}
  };

  const submit = () => {
    if (!form.name) return;
    const entry = { ...form, id: editId || Date.now().toString(), updatedAt: Date.now() };
    if (editId) {
      save(contacts.map(c => c.id === editId ? entry : c));
    } else {
      save([entry, ...contacts]);
    }
    setForm(blank); setShowForm(false); setEditId(null);
  };

  const remove = (id) => { if (window.confirm('Remove this contact?')) save(contacts.filter(c => c.id !== id)); };

  const statusColors = {
    'not contacted': 'rgba(255,255,255,0.15)',
    'pitched': 'rgba(245,166,35,0.4)',
    'in conversation': 'rgba(0,212,255,0.4)',
    'confirmed': 'rgba(39,174,96,0.4)',
    'passed': 'rgba(233,69,96,0.3)',
  };
  const statusText = {
    'not contacted': B.gray,
    'pitched': '#f5a623',
    'in conversation': '#00d4ff',
    'confirmed': '#27ae60',
    'passed': B.red,
  };

  const statuses = ['not contacted','pitched','in conversation','confirmed','passed'];
  const types = ['podcast guest','stitch/collab','community partner','brand deal'];
  const platforms = ['Instagram','YouTube','Facebook','LinkedIn','Podcast','Other'];

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.status === filter);

  const stats = statuses.map(s => ({ status:s, count:contacts.filter(c=>c.status===s).length }));

  const formFields = [
    { k:'name', l:'Name / Brand', ph:'e.g. Joe Schmoe', full:false },
    { k:'handle', l:'Handle / Channel', ph:'e.g. @joeschmoe', full:false },
    { k:'pitchSent', l:'Pitch Sent On', ph:'e.g. Mar 18, 2026', full:false },
    { k:'lastContact', l:'Last Contact', ph:'e.g. Mar 20, 2026', full:false },
    { k:'notes', l:'Notes / Context', ph:'e.g. Responded positively, wants to schedule for May...', full:true },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:32}}>📋</span>
          <div>
            <h2 style={{color:B.white,margin:0}}>Collab Outreach Tracker</h2>
            <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Track every pitch, conversation, and confirmed collab in one place.</p>
          </div>
        </div>
        <button onClick={() => { setForm(blank); setEditId(null); setShowForm(true); }}
          style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Add Contact
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {stats.map(s => (
          <div key={s.status} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${statusColors[s.status]}`,
            borderRadius:8,padding:'10px 16px',textAlign:'center',minWidth:100}}>
            <div style={{fontSize:20,fontWeight:800,color:statusText[s.status]}}>{s.count}</div>
            <div style={{fontSize:10,color:B.gray,textTransform:'capitalize',marginTop:2}}>{s.status}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {['all', ...statuses].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{background:filter===s?B.red:'rgba(255,255,255,0.06)',color:B.white,border:'none',
              borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:filter===s?700:400,textTransform:'capitalize'}}>
            {s} {s!=='all'?`(${contacts.filter(c=>c.status===s).length})`:`(${contacts.length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'rgba(255,255,255,0.02)',borderRadius:16,border:'1px solid rgba(255,255,255,0.06)',marginBottom:20}}>
          <div style={{fontSize:48,marginBottom:12}}>🤝</div>
          <div style={{color:B.white,fontWeight:700,fontSize:16,marginBottom:8}}>No contacts yet</div>
          <div style={{color:B.gray,fontSize:13,marginBottom:20}}>Add podcast guests, collab targets, and brand partners. Track every conversation.</div>
          <button onClick={() => setShowForm(true)}
            style={{background:B.red,color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            + Add First Contact
          </button>
        </div>
      )}

      {/* Contact cards */}
      {filtered.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {filtered.map(contact => (
            <div key={contact.id} style={{background:'rgba(255,255,255,0.03)',
              border:`1px solid ${statusColors[contact.status] || 'rgba(255,255,255,0.07)'}`,
              borderRadius:12,padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{color:B.white,fontWeight:700,fontSize:14}}>{contact.name}</span>
                    <span style={{color:B.gray,fontSize:12}}>{contact.handle}</span>
                    <span style={{background:'rgba(255,255,255,0.07)',color:B.gray,borderRadius:4,padding:'2px 7px',fontSize:10}}>{contact.platform}</span>
                    <span style={{background:'rgba(255,255,255,0.07)',color:B.gray,borderRadius:4,padding:'2px 7px',fontSize:10,textTransform:'capitalize'}}>{contact.type}</span>
                  </div>
                  {contact.notes && (
                    <div style={{color:'rgba(255,255,255,0.65)',fontSize:12,lineHeight:1.6,marginBottom:6}}>{contact.notes}</div>
                  )}
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    {contact.pitchSent && <span style={{color:B.gray,fontSize:11}}>Pitched: {contact.pitchSent}</span>}
                    {contact.lastContact && <span style={{color:B.gray,fontSize:11}}>Last contact: {contact.lastContact}</span>}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                  {/* Status selector */}
                  <select value={contact.status}
                    onChange={e => save(contacts.map(c => c.id===contact.id ? {...c,status:e.target.value,updatedAt:Date.now()} : c))}
                    style={{background:'rgba(0,0,0,0.4)',color:statusText[contact.status],border:`1px solid ${statusColors[contact.status]}`,
                      borderRadius:6,padding:'4px 8px',fontSize:11,fontWeight:700,cursor:'pointer',textTransform:'capitalize'}}>
                    {statuses.map(s => <option key={s} value={s} style={{color:'#fff',background:'#0D1F3C'}}>{s}</option>)}
                  </select>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={() => { setForm({...contact}); setEditId(contact.id); setShowForm(true); }}
                      style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>
                      Edit
                    </button>
                    <button onClick={() => remove(contact.id)}
                      style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer'}}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Platform + Type selector in form */}
      {showForm && (
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'22px',marginBottom:20}}>
          <div style={{color:B.white,fontWeight:700,fontSize:15,marginBottom:16}}>{editId ? 'Edit Contact' : 'Add Contact'}</div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {platforms.map(p => (
                  <button key={p} onClick={() => setForm(f => ({...f, platform:p}))}
                    style={{background:form.platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                      borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:form.platform===p?700:400}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SecLabel>Collab Type</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {types.map(t => (
                  <button key={t} onClick={() => setForm(f => ({...f, type:t}))}
                    style={{background:form.type===t?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                      borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:form.type===t?700:400,textTransform:'capitalize'}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {formFields.map(f => (
              <div key={f.k} style={{gridColumn:f.full?'1/-1':'auto'}}>
                <SecLabel>{f.l}</SecLabel>
                {f.full
                  ? <textarea value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                      style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                  : <input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                      style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'9px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
                }
              </div>
            ))}
          </div>

          <div style={{marginTop:16}}>
            <SecLabel>Status</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
              {statuses.map(s => (
                <button key={s} onClick={() => setForm(f => ({...f, status:s}))}
                  style={{background:form.status===s?statusColors[s]:'rgba(255,255,255,0.05)',
                    color:form.status===s?statusText[s]:B.gray,
                    border:`1px solid ${form.status===s?statusColors[s]:'rgba(255,255,255,0.08)'}`,
                    borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:form.status===s?700:400,textTransform:'capitalize'}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            <RedBtn onClick={submit} disabled={!form.name}>{editId ? 'Save Changes' : 'Add Contact'}</RedBtn>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(blank); }}
              style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT RESPONDER
// ═══════════════════════════════════════════════════════════════════════════════

const COMMENT_REPLY_PROMPT = (comments, mode, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}

${mode === 'bulk'
  ? `Write a reply to EACH of these comments. Number your replies to match. Each reply should feel personal and human — not copy-pasted. Build community, acknowledge what they said, and where natural, invite more conversation.`
  : `Write 3 different reply options for this comment. Each option should have a different energy — one warm/personal, one direct/punchy, one community-building. All in Jason's voice.`
}

${mode === 'bulk' ? 'COMMENTS:\n' + comments : 'COMMENT:\n' + comments}

Rules:
- Sound like a real person talking, not a brand
- No "Great comment!" or "Thanks for sharing!" openers — they're dead
- Keep replies under 3 sentences unless the comment warrants more
- Use the person's name if they signed it
- If it's a question, answer it directly first
- End with something that invites the next reply where it makes sense`;

function CommentResponder() {
  const [mode, setMode] = useState('single');
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [teleprompter, setTeleprompter] = useState(false);
  const [activeClient] = useActiveClient();

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setOut('');
    const res = await ai(COMMENT_REPLY_PROMPT(input, mode, activeClient));
    setOut(res);
    setLoading(false);
  };

  const placeholder = mode === 'single'
    ? 'Paste the comment here...\n\ne.g. "This hit different today. Been struggling with the transition and nobody talks about how lonely it gets. How did you get through it?"'
    : 'Paste multiple comments, one per line or numbered:\n\n1. This is exactly what I needed today\n2. How long did it take you to get consistent?\n3. Do you offer coaching?\n4. Sharing this with my whole team';

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>💬</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Comment Responder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Reply in your voice — single comment with 3 options, or bulk paste up to 20 at once.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <div style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        💡 The first-hour engagement window is everything. Respond fast, respond real, and the algorithm rewards you. Use bulk mode after a post drops to clear your comment queue in one shot.
      </div>

      <Card>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[{id:'single',label:'Single Comment',desc:'3 reply options'},
            {id:'bulk',label:'Bulk Mode',desc:'Up to 20 comments at once'}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setOut(''); }}
              style={{flex:1,background:mode===m.id?B.red:'rgba(255,255,255,0.06)',color:B.white,
                border:`1px solid ${mode===m.id?B.red:'rgba(255,255,255,0.1)'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:13}}>{m.label}</div>
              <div style={{color:mode===m.id?'rgba(255,255,255,0.8)':B.gray,fontSize:11,marginTop:2}}>{m.desc}</div>
            </button>
          ))}
        </div>

        <SecLabel>{mode === 'single' ? 'The Comment' : 'Comments (paste all at once)'}</SecLabel>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          rows={mode === 'bulk' ? 8 : 4}
          placeholder={placeholder}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box',lineHeight:1.6}}/>

        <RedBtn onClick={run} disabled={loading||!input.trim()}>
          {loading ? 'Writing replies...' : mode === 'single' ? '💬 Write 3 Reply Options' : '💬 Reply to All Comments'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <span style={{color:B.white,fontWeight:700,fontSize:14}}>
              {mode === 'single' ? '3 Reply Options' : 'Bulk Replies'}
            </span>
            <CopyBtn text={out}/>
          </div>
          <Output text={out}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK TESTER
// ═══════════════════════════════════════════════════════════════════════════════

const HOOK_TEST_PROMPT = (hooks, topic) => `
${VOICE}

Topic: ${topic}

You are a viral content strategist who has analyzed thousands of hooks. Score and improve each of these hook variations.

HOOKS TO TEST:
${hooks.map((h,i) => `${i+1}. ${h}`).join('\n')}

For EACH hook, provide:

**HOOK [N]: [quote the hook]**
Score: [X/10]
Scroll-Stop Power: [1-10] — does the first word make them stop?
Curiosity Gap: [1-10] — does it create an itch they need to scratch?
Specificity: [1-10] — is it concrete or vague?
Weakness: [one sentence — the exact problem]
Rewrite: [improved version that fixes the weakness]

---

After scoring all hooks:

**WINNER:** Hook [N] — [one sentence why it wins]

**THE OPTIMAL HOOK:**
[Best possible version combining the strongest elements from all of them]

**Why This Wins:**
[3 specific reasons — psychology, format, first word]`;

function HookTester() {
  const [topic, setTopic] = useState('');
  const [hooks, setHooks] = useState(['', '', '']);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const addHook = () => { if (hooks.length < 6) setHooks([...hooks, '']); };
  const removeHook = (i) => { if (hooks.length > 2) setHooks(hooks.filter((_,idx) => idx !== i)); };
  const updateHook = (i, val) => setHooks(hooks.map((h,idx) => idx === i ? val : h));

  const run = async () => {
    const filledHooks = hooks.filter(h => h.trim());
    if (!topic || filledHooks.length < 2) return;
    setLoading(true); setOut('');
    const res = await ai(HOOK_TEST_PROMPT(filledHooks, topic));
    setOut(res);
    setLoading(false);
  };

  const filledCount = hooks.filter(h => h.trim()).length;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🧪</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Hook Tester</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Write 2-6 hook variations — AI scores each one and builds the optimal version.</p>
        </div>
      </div>

      <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        🎯 Your hook is 80% of the result. Same video, different hook = 10x difference in views. Test before you post.
      </div>

      <Card>
        <SecLabel>What's the video about?</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. Why most people quit before they see results"
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            marginBottom:20,boxSizing:'border-box'}}/>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <SecLabel style={{margin:0}}>Your Hook Variations ({filledCount} entered, 2 minimum)</SecLabel>
          {hooks.length < 6 && (
            <button onClick={addHook}
              style={{background:'rgba(255,255,255,0.07)',color:B.gray,border:'none',
                borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:12}}>
              + Add Hook
            </button>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {hooks.map((hook, i) => (
            <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{color:B.red,fontWeight:800,fontSize:13,minWidth:20}}>{i+1}.</span>
              <input value={hook} onChange={e=>updateHook(i,e.target.value)}
                placeholder={i === 0 ? 'e.g. Nobody told me this about getting out...' :
                             i === 1 ? 'e.g. I spent 3 years doing it wrong. Here\'s the truth.' :
                             'Another hook variation...'}
                style={{flex:1,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
              {hooks.length > 2 && (
                <button onClick={() => removeHook(i)}
                  style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',
                    borderRadius:6,padding:'4px 8px',fontSize:16,cursor:'pointer',flexShrink:0}}>✕</button>
              )}
            </div>
          ))}
        </div>

        <RedBtn onClick={run} disabled={loading || !topic || filledCount < 2}>
          {loading ? 'Testing hooks...' : `🧪 Test ${filledCount} Hook${filledCount!==1?'s':''}`}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{color:B.white,fontWeight:700,fontSize:14}}>Hook Analysis</span>
            <CopyBtn text={out}/>
          </div>
          <Output text={out}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL SEQUENCE BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

const EMAIL_PROMPT = (magnet, audience, offer, length, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}
${SWARBRICK}

Lead Magnet: ${magnet}
Audience: ${audience}
Offer / Next Step: ${offer}
Sequence Length: ${length} emails

Write a complete ${length}-email nurture sequence for someone who just opted in to receive "${magnet}".

This is not a corporate drip campaign. It reads like real emails from a real person.

${length >= 3 ? `
**EMAIL 1 — DELIVER + QUICK WIN**
Subject: [subject line]
Preview text: [50 chars]
Body: Deliver the magnet. Give one immediate action they can take today. Make them glad they signed up.
[Full email body]

**EMAIL 2 — PERSONAL STORY**
Subject: [subject line]
Preview text: [50 chars]
Body: The real story behind why this matters. A specific moment from Jason's life. No pitch. Just connection.
[Full email body]

**EMAIL 3 — PURE VALUE**
Subject: [subject line]
Preview text: [50 chars]
Body: Teach something they didn't get in the lead magnet. Make it so good they forward it.
[Full email body]` : ''}

${length >= 5 ? `
**EMAIL 4 — SOCIAL PROOF + SHIFT**
Subject: [subject line]
Preview text: [50 chars]
Body: A win from the community. Something that happened when someone applied the method. Transition toward the offer.
[Full email body]

**EMAIL 5 — SOFT PITCH**
Subject: [subject line]
Preview text: [50 chars]
Body: The invitation. What the next step is, why now, what it costs to stay stuck. No pressure — real talk.
[Full email body]` : ''}

${length >= 7 ? `
**EMAIL 6 — OBJECTION HANDLER**
Subject: [subject line]
Preview text: [50 chars]
Body: Address the real reasons people haven't taken the next step yet. Be honest about what this is and isn't.
[Full email body]

**EMAIL 7 — LAST CALL**
Subject: [subject line]
Preview text: [50 chars]
Body: Final email in the sequence. Clear, direct, no drama. Either they're in or they're not — respect both.
[Full email body]` : ''}

Rules: No corporate speak. No "I hope this email finds you well." No numbered lists in the body — write like a person. Short paragraphs. Real subject lines people actually open.`;

function EmailSequenceBuilder() {
  const [magnet, setMagnet] = useState('');
  const [audience, setAudience] = useState('Veterans transitioning out, everyday people working on mindset, people who feel stuck');
  const [offer, setOffer] = useState('Mindset coaching, Everyday Elevations podcast, Elevation Nation community, real estate');
  const [length, setLength] = useState('5');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeClient] = useActiveClient();

  const run = async () => {
    if (!magnet) return;
    setLoading(true); setOut('');
    const res = await ai(EMAIL_PROMPT(magnet, audience, offer, length, activeClient));
    setOut(res);
    logToMemory({ type:'email', title:`Email Seq: ${magnet}`, preview:res.slice(0,200), client:activeClient?.name });
    setLoading(false);
  };

  const downloadEmails = async () => {
    if (!out) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          message: `Convert this email sequence into clean HTML. Each email should be in its own section with a clear header. Use proper formatting — subject lines bold, body text readable, preview text in italics. Return only the HTML body content:\n\n${out}`,
          system: 'You convert email sequences into clean HTML. Return only inner HTML content.'
        })
      });
      const d = await res.json();
      const html = d.text || d.result || '';
      const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Email Sequence</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#111;line-height:1.8}h1{color:#0A1628;border-bottom:3px solid #E94560;padding-bottom:8px}h2{color:#E94560;margin-top:48px;border-top:1px solid #eee;padding-top:24px}strong{color:#0A1628}.subject{font-size:18px;font-weight:bold;margin-bottom:4px}.preview{color:#666;font-style:italic;font-size:13px;margin-bottom:20px}@media print{body{margin:24px}}</style></head><body><h1>${magnet} — Email Sequence</h1>${html}</body></html>`;
      const blob = new Blob([full], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'EmailSequence.html';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>📧</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Email Sequence Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Full nurture sequences — deliver, connect, convert. Written in your voice, not a template.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <Card>
        <SecLabel>Lead Magnet / Opt-in Trigger</SecLabel>
        <input value={magnet} onChange={e=>setMagnet(e.target.value)}
          placeholder="e.g. 5 AM Success Protocol PDF, Performance Longevity Blueprint, Free Mindset Audit"
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Who Opted In</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Your Offer / Next Step You Want Them to Take</SecLabel>
        <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Sequence Length</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {[
            {v:'3', label:'3 emails', desc:'Quick intro'},
            {v:'5', label:'5 emails', desc:'Standard nurture'},
            {v:'7', label:'7 emails', desc:'Full funnel'},
          ].map(opt => (
            <button key={opt.v} onClick={() => setLength(opt.v)}
              style={{flex:1,background:length===opt.v?B.red:'rgba(255,255,255,0.06)',
                color:B.white,border:`1px solid ${length===opt.v?B.red:'rgba(255,255,255,0.1)'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'center'}}>
              <div style={{fontWeight:700,fontSize:14}}>{opt.label}</div>
              <div style={{color:length===opt.v?'rgba(255,255,255,0.8)':B.gray,fontSize:11,marginTop:2}}>{opt.desc}</div>
            </button>
          ))}
        </div>

        <RedBtn onClick={run} disabled={loading||!magnet}>
          {loading ? 'Writing sequence...' : `Write ${length}-Email Sequence`}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:10}}>
            <span style={{color:B.white,fontWeight:700,fontSize:15}}>Your Email Sequence</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={downloadEmails} disabled={downloading}
                style={{background:B.red,color:'#fff',border:'none',borderRadius:8,
                  padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',fontSize:13}}>
                {downloading ? 'Preparing...' : '⬇ Download Emails'}
              </button>
            </div>
          </div>
          <Output text={out}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PODCAST PRE-PRODUCTION SUITE
// ═══════════════════════════════════════════════════════════════════════════════

const PODCAST_PREPROD_PROMPT = (guestName, guestBio, episode_angle, showContext) => `
${VOICE}

Show: Everyday Elevations Podcast (Host: Jason Fricka — veteran, HR manager, mindset coach, Colorado)
Guest: ${guestName}
Guest Background: ${guestBio}
Episode Angle / Theme: ${episode_angle}
Additional Context: ${showContext || 'None'}

Build the complete pre-production package for this episode.

# ${guestName} — Episode Pre-Production

## Guest Intelligence Brief
- Who they are in 3 sentences (what Jason needs to know before the call)
- Their core message / what they stand for
- What their audience cares about
- One potential point of disagreement or productive tension
- The thing they probably never get asked

## Episode Positioning
- Episode title (3 options — specific, not generic)
- The one thing this episode must deliver
- Why Elevation Nation specifically needs to hear this

## Opening (First 3 Minutes)
[Full scripted intro Jason reads — sets the guest up without overselling, teases the transformation]

## Interview Outline (12 questions)
Grouped in 3 acts:
Act 1 — Who They Are (3 questions): Background, journey, the turn
Act 2 — The Method (5 questions): What they know, how they know it, the counterintuitive stuff
Act 3 — The Application (4 questions): What listeners do Monday morning, the hard truth, the invitation

For each question: the question + why it matters + the follow-up if they give a surface answer

## Closing Script
[Full word-for-word outro — thanks guest, tells audience what to do next, teases next episode]

## Show Notes (SEO-optimized)
[Full show notes — 200 words, guest bio, key topics, timestamps placeholder, links section]

## Content Extraction Plan
5 specific clip moments to watch for during the interview (with suggested hooks for each)
1 carousel concept from this episode
LinkedIn post angle for Jason post-release`;

const PODCAST_SOLO_PROMPT = (topic, angle, duration) => `
${VOICE}
${SWARBRICK}

Solo episode topic: ${topic}
Angle: ${angle}
Target length: ${duration} minutes

Build the complete solo episode framework.

# Solo Episode: ${topic}

## Episode Hook (First 60 Seconds)
[Full scripted cold open — drop them into a moment or a question, no intro yet]

## Why This Episode, Why Now
[2-3 sentences Jason says before diving in — context without fluff]

## Episode Outline
For a ${duration}-minute episode, structured in acts:

Opening Hook (60 sec)
Act 1 — The Problem / Setup (${Math.round(parseInt(duration)*0.2)} min)
Act 2 — The Turn / Insight (${Math.round(parseInt(duration)*0.4)} min)
Act 3 — The Method / Application (${Math.round(parseInt(duration)*0.3)} min)
Close + CTA (${Math.round(parseInt(duration)*0.1)} min)

For each section: talking points, transitions, stories to pull from Jason's life

## Retention Hooks (3 mid-episode teases)
[Specific lines to say mid-episode to keep people listening]

## Show Notes
[150-word SEO-optimized description]

## 5 Short-Form Clips to Pull
[Specific moments from the outline that will work as Reels/Shorts — with hooks]`;

function PodcastPreProd() {
  const [mode, setMode] = useState('guest');
  const [guestName, setGuestName] = useState('');
  const [guestBio, setGuestBio] = useState('');
  const [angle, setAngle] = useState('');
  const [showContext, setShowContext] = useState('');
  const [soloTopic, setSoloTopic] = useState('');
  const [soloAngle, setSoloAngle] = useState('veteran');
  const [duration, setDuration] = useState('30');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchGuestIntel = async () => {
    if (!guestName) return;
    setFetching(true);
    const res = await perp(`Who is ${guestName}? What do they do, what is their background, what are they known for, what podcast or speaking topics do they cover? Give me a detailed bio.`);
    setGuestBio(res);
    setFetching(false);
  };

  const run = async () => {
    setLoading(true); setOut('');
    let res;
    if (mode === 'guest') {
      res = await ai(PODCAST_PREPROD_PROMPT(guestName, guestBio, angle, showContext));
      logToMemory({ type:'podcast', title:`Episode Prep: ${guestName}`, preview:res.slice(0,200) });
    } else {
      const angleLabel = ANGLES.find(a=>a.id===soloAngle)?.label || soloAngle;
      res = await ai(PODCAST_SOLO_PROMPT(soloTopic, angleLabel, duration));
      logToMemory({ type:'podcast', title:`Solo Episode: ${soloTopic}`, preview:res.slice(0,200) });
    }
    setOut(res);
    setLoading(false);
  };

  const canRun = mode === 'guest' ? (guestName && guestBio && angle) : (soloTopic);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🎙️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Podcast Pre-Production</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Guest research brief, full interview outline, show notes, and clip plan — before you hit record.</p>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'guest',label:'🎤 Guest Episode',desc:'Interview prep + research'},
          {id:'solo',label:'🎙️ Solo Episode',desc:'Outline + structure'}].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setOut(''); }}
            style={{flex:1,background:mode===m.id?B.red:'rgba(255,255,255,0.06)',color:B.white,
              border:`1px solid ${mode===m.id?B.red:'rgba(255,255,255,0.1)'}`,
              borderRadius:10,padding:'14px',cursor:'pointer',textAlign:'left'}}>
            <div style={{fontWeight:700,fontSize:14}}>{m.label}</div>
            <div style={{color:mode===m.id?'rgba(255,255,255,0.8)':B.gray,fontSize:11,marginTop:3}}>{m.desc}</div>
          </button>
        ))}
      </div>

      <Card>
        {mode === 'guest' ? (
          <>
            <SecLabel>Guest Name</SecLabel>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              <input value={guestName} onChange={e=>setGuestName(e.target.value)}
                placeholder="e.g. David Goggins, Jocko Willink, your next guest..."
                style={{flex:1,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
              <button onClick={fetchGuestIntel} disabled={fetching||!guestName}
                style={{background:'rgba(0,212,255,0.1)',color:'#00d4ff',border:'1px solid rgba(0,212,255,0.3)',
                  borderRadius:8,padding:'10px 16px',fontWeight:700,cursor:(!guestName||fetching)?'not-allowed':'pointer',
                  fontSize:12,whiteSpace:'nowrap'}}>
                {fetching ? 'Researching...' : '🔍 Research Guest'}
              </button>
            </div>

            <SecLabel>Guest Bio / Background</SecLabel>
            <textarea value={guestBio} onChange={e=>setGuestBio(e.target.value)} rows={4}
              placeholder="Paste their bio, or hit Research Guest above to pull it automatically..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

            <SecLabel>Episode Angle / What This Episode Is Really About</SecLabel>
            <input value={angle} onChange={e=>setAngle(e.target.value)}
              placeholder="e.g. How high performers recover from identity loss, The truth about discipline nobody talks about"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>

            <SecLabel>Additional Context (optional)</SecLabel>
            <textarea value={showContext} onChange={e=>setShowContext(e.target.value)} rows={2}
              placeholder="e.g. We connected at a veteran event, he's been on Rogan twice, my audience loved my last episode on recovery..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                resize:'vertical',boxSizing:'border-box'}}/>
          </>
        ) : (
          <>
            <SecLabel>Episode Topic</SecLabel>
            <input value={soloTopic} onChange={e=>setSoloTopic(e.target.value)}
              placeholder="e.g. Why I almost quit at month 4, What the Army taught me about consistency, The real cost of staying comfortable"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <SecLabel>Content Angle</SecLabel>
                <AngleGrid selected={soloAngle} onSelect={setSoloAngle}/>
              </div>
              <div>
                <SecLabel>Target Length</SecLabel>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['15','20','30','45','60'].map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      style={{background:duration===d?B.red:'rgba(255,255,255,0.07)',color:B.white,
                        border:'none',borderRadius:6,padding:'8px 14px',cursor:'pointer',
                        fontSize:13,fontWeight:duration===d?700:400}}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{marginTop:20}}>
          <RedBtn onClick={run} disabled={loading||!canRun}>
            {loading ? 'Building pre-production package...' : mode==='guest' ? '🎤 Build Full Episode Package' : '🎙️ Build Solo Episode Framework'}
          </RedBtn>
          {mode === 'guest' && !guestBio && guestName && (
            <span style={{color:B.gray,fontSize:12,marginLeft:12}}>Research guest first for best results</span>
          )}
        </div>
      </Card>
      {loading && <Spin/>}
      {out && <StrategyOutput text={out} onDownload={null} downloading={false}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUTUBE TOOLKIT
// ═══════════════════════════════════════════════════════════════════════════════

// ─── VIDIQ SOP ───────────────────────────────────────────────────────────────
const VIDIQ_SOP = `
VIDIQ OUTLIER SCORE FRAMEWORK (follow this to the letter):
- Outlier Score > 1.0 = video outperforms channel average → study and replicate these elements
- Outlier Score ≈ 1.0 = performing average → analyze for engagement improvements
- Outlier Score < 1.0 = underperforming → diagnose: was it topic, title, thumbnail, or timing?
- Score 2.0+ = 2x-10x+ above norm → break down thumbnail, topic, title, length, and style and repeat exactly
- High outlier videos ARE the content blueprint — never guess when you have outlier data

UPLOAD TIMING SOP (non-negotiable):
- Best days: Tuesday through Friday — avoid Saturday
- Best times: 1 PM, 2 PM, 5 PM, or 9 PM Eastern Time
- Upload 1-2 hours BEFORE peak activity — gives YouTube time to index before audience goes active
- Strong early engagement in first 24-48 hours = algorithm signals = more recommendations
- Consistency > perfection — uploading regularly gives more outlier data to learn from

CONTENT STRATEGY FROM OUTLIER DATA:
- After every upload, check outlier score vs channel average
- Top outliers → extract: topic angle, title format, thumbnail style, video length, opening hook
- Replicate those exact elements in next 3 uploads
- Low outliers → do NOT delete — compare to high outliers and identify the specific difference
- More variety early = more data = faster discovery of channel superpowers

PERFORMANCE SIGNALS THAT MATTER MOST (in order):
1. Click-through rate (CTR) — title + thumbnail combo
2. Average view duration — hook and content quality
3. Subscriber conversion rate — are viewers becoming fans
4. Early engagement velocity — first 24-48 hours determines algorithm push
`;

const YT_SCRIPT_PROMPT = (topic, angle, duration, style) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}

${VIDIQ_SOP}

Video Topic: "${topic}"
Content Angle: ${angle}
Target Duration: ${duration}
Script Style: ${style}

Using the VIDIQ SOP framework above, write a complete YouTube video script optimized for outlier performance. This must maximize early engagement velocity, CTR, and average view duration.

# YouTube Script: "${topic}"

## PRE-PRODUCTION CHECKLIST (VIDIQ-aligned)
- **Upload Window:** Tuesday-Friday, target 1-2 hours before your audience's peak (aim for 12PM-3PM ET upload so it's indexed for 1-5PM peak)
- **Outlier Target:** Aim for 2.0+ outlier score — this script is built to beat your channel average
- **Primary Signal to Optimize:** [CTR hook in title + first 30 seconds for AVD]

## TITLE OPTIONS (3 variations — test for CTR)
Title 1: [Curiosity gap format]
Title 2: [Personal story format]
Title 3: [Outcome/transformation format]
**Recommended A/B Test:** Title 1 vs Title 2

## THUMBNAIL DIRECTION
Text overlay (5 words max): [exact words]
Visual concept: [what Jason is doing/showing]
Emotion to convey: [specific feeling that drives clicks]

## FULL SCRIPT

### HOOK (First 30 seconds — CRITICAL for AVD)
[No intro. No "Hey guys." Drop into value or conflict immediately. This is where outlier videos are won or lost.]

[Word-for-word hook script — designed to stop scroll and lock in viewers for the next section]

### SECTION 1: [Title] (~${duration === '10 min' ? '2-3' : '1-2'} minutes)
[Content with natural retention pattern: statement → evidence → implication]

[Timestamp marker: ~${duration === '10 min' ? '0:45' : '0:30'}]

### SECTION 2: [Title] (~${duration === '10 min' ? '2-3' : '1-2'} minutes)
[Content]

[Timestamp marker]

### SECTION 3: [Title] (~${duration === '10 min' ? '2-3' : '1-2'} minutes)
[Content]

[Timestamp marker]

${duration === '10 min' ? `### SECTION 4: [Title] (~2 minutes)
[Content]

[Timestamp marker]

### SECTION 5: [Title] (~2 minutes)
[Content]

[Timestamp marker]` : ''}

### PATTERN INTERRUPT (Mid-video retention hook)
[A line that re-engages viewers who are drifting — creates a reason to keep watching]

### END SCREEN SETUP (~Last 30 seconds)
[Lead into end screen naturally — tease next video, prompt subscribe, mention email list]

## CHAPTER MARKERS (for description)
0:00 [Hook]
[Timestamp]: [Section 1 title]
[Timestamp]: [Section 2 title]
[Timestamp]: [Section 3 title]
${duration === '10 min' ? '[Timestamp]: [Section 4 title]
[Timestamp]: [Section 5 title]' : ''}

## SEO PACKAGE
**Primary keyword:** [exact phrase viewers search]
**Secondary keywords:** [3-4 supporting terms]
**Description (first 2 lines before "Show More"):**
[Hook line with primary keyword — what shows before click]
[Supporting line with channel identity]

**Full Description:**
[150-200 word description with natural keyword integration]

**Tags (20 tags):**
[comma-separated list]

**Pinned Comment (post within 5 minutes of going live):**
[Drives early engagement — question, CTA, or value add]

## VIDIQ PERFORMANCE PREDICTION
**Expected outlier score range:** [estimate based on topic and approach]
**Biggest CTR risk:** [what might hurt click-through]
**Biggest AVD risk:** [where viewers are most likely to drop off and how to fix it]
**What to measure at 48 hours:** [specific metrics to check]
`;

const YT_TITLE_PROMPT = (topic, angle) => `
${VOICE}

Topic: ${topic}
Angle: ${angle}

Write 7 YouTube title variations for this topic. Each must be distinct — different psychological trigger, different format.

For each title:
**TITLE [N]:** [The title]
CTR Trigger: [curiosity / controversy / how-to / personal story / data / listicle / fear of missing out]
Thumbnail Direction: [what image/text overlay makes this title pop]
Why It Works: [one sentence]

After all 7:
**WINNER:** Title [N]
**Best Thumbnail Text:** [3-5 words that go on the thumbnail]
**A/B Test:** Title [X] vs Title [Y] — test these two first`;

const YT_CHAPTERS_PROMPT = (script) => `
You are a YouTube SEO specialist. Based on this video script, create:

1. **Timestamp Chapters** (for YouTube description)
Format: 0:00 Title
Create chapters every 2-4 minutes at natural topic breaks. First chapter always 0:00.

2. **SEO Description** (for YouTube)
- First 2 sentences: hook with primary keywords (these show before "Show More")
- Full description: 200-300 words, keyword-rich, natural language
- Relevant links section placeholder
- Hashtags: 5 most relevant

3. **Tags** (30 tags, comma-separated)
Mix: exact match, broad match, related topics, creator name variations

4. **Pinned Comment** (to post immediately after publishing)
Something that drives engagement and adds value

SCRIPT:
${script}`;

const YT_AUDIT_PROMPT = (channelData, auditExtra='') => `
${VOICE}

YouTube Channel Data (from Perplexity):
${channelData}

${auditExtra ? `Additional Context from Jason (treat this as ground truth — he knows his channel better than any search):
${auditExtra}` : ''}

You are auditing Jason Fricka's YouTube channel @everydayelevations using the VIDIQ outlier framework. Be direct. No softening. Use the additional context above to make every recommendation specific.

# YouTube Channel Audit — @everydayelevations

## Channel Health Score: [X/10]

## What the Data Shows
[Specific observations from the channel data above]

## 3 Biggest Problems Right Now
[Specific, actionable — not generic YouTube advice]

## What's Actually Working
[Double down on these immediately]

## Title & Thumbnail Audit
[Score the approach, specific fixes]

## The Content Gap
[What your audience is searching for that you're not making]

## 30-Day YouTube Sprint
[Specific week-by-week plan to grow the channel]

## The One Change That Moves the Needle Most
[Single highest-leverage action]

## VIDIQ Outlier Action Plan
Based on the data above:
- **Your likely outlier score range:** [estimate current average performance]
- **What would push a video to 2.0+ outlier:** [specific topic + format + timing combination]
- **Upload timing recommendation:** [specific day + time in ET based on your audience]
- **Next 3 videos to test:** [specific topics with outlier potential, in priority order]
- **What to measure at 48 hours post-upload:** [specific metrics and what to do if they're low]`;

const YT_ENDSCREEN_PROMPT = (videoTopic, channelGoal) => `
${VOICE}

Video topic: ${videoTopic}
Channel goal: ${channelGoal}

Write 3 end screen CTA scripts (last 20 seconds of video). Each version has a different primary goal.

**VERSION 1 — SUBSCRIBE FOCUS**
[Word-for-word script, 15-20 seconds when spoken]
Visual direction: [what should be on screen]

**VERSION 2 — NEXT VIDEO FOCUS**
[Word-for-word script]
Visual direction: [what video to suggest and why]

**VERSION 3 — EMAIL LIST FOCUS**
[Word-for-word script]
Visual direction: [how to point to link in description]

Make them feel like Jason is talking to a friend, not reading a script.`;

function YouTubeToolkit() {
  const [tool, setTool] = useState('script');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('mindset');
  const [script, setScript] = useState('');
  const [channelData, setChannelData] = useState('');
  const [channelGoal, setChannelGoal] = useState('grow subscribers and build email list');
  const [auditExtra, setAuditExtra] = useState('');
  const [ytDuration, setYtDuration] = useState('8-10 min');
  const [ytStyle, setYtStyle] = useState('Educational Story');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const tools = [
    { id:'script',   emoji:'🎬', label:'Script Writer',      desc:'Full VIDIQ-optimized script + SEO package' },
    { id:'titles',   emoji:'📝', label:'Title Optimizer',    desc:'7 title variations + CTR analysis' },
    { id:'seo',      emoji:'🔍', label:'SEO + Chapters',     desc:'Description, tags, chapters, pinned comment' },
    { id:'audit',    emoji:'📊', label:'Channel Audit',      desc:'Perplexity pulls your channel, Claude audits it' },
    { id:'endscreen',emoji:'📺', label:'End Screen Scripts', desc:'3 CTA variations for last 20 seconds' },
  ];

  const fetchChannel = async () => {
    setFetching(true); setChannelData('');
    const res = await perp(`Audit the YouTube channel @everydayelevations. Report: subscriber count, total views, number of videos, recent upload frequency, most viewed videos (titles + approximate views), channel description, content topics covered, what's working and what isn't based on the data visible.`);
    setChannelData(res);
    setFetching(false);
  };

  const run = async () => {
    setLoading(true); setOut('');
    let res;
    const angleLabel = ANGLES.find(a=>a.id===angle)?.label || angle;

    if (tool === 'script') res = await ai(YT_SCRIPT_PROMPT(topic, angleLabel, ytDuration, ytStyle));
    else if (tool === 'titles') res = await ai(YT_TITLE_PROMPT(topic, angleLabel));
    else if (tool === 'seo') res = await ai(YT_CHAPTERS_PROMPT(script));
    else if (tool === 'audit') res = await ai(YT_AUDIT_PROMPT(channelData, auditExtra));
    else if (tool === 'endscreen') res = await ai(YT_ENDSCREEN_PROMPT(topic, channelGoal));

    setOut(res);
    logToMemory({ type:'youtube', title:`YT ${tool}: ${topic || 'audit'}`, preview:res.slice(0,200) });
    setLoading(false);
  };

  const canRun = () => {
    if (tool === 'script') return !!topic;
    if (tool === 'titles') return !!topic;
    if (tool === 'seo') return !!script;
    if (tool === 'audit') return !!channelData;
    if (tool === 'endscreen') return !!topic;
    return false;
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>▶️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>YouTube Toolkit</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Title optimizer, SEO engine, channel audit, and end screen scripts — built for YouTube's algorithm.</p>
        </div>
      </div>

      {/* Tool selector */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {tools.map(t => (
          <button key={t.id} onClick={() => { setTool(t.id); setOut(''); }}
            style={{background:tool===t.id?B.red:'rgba(255,255,255,0.04)',color:B.white,
              border:`1px solid ${tool===t.id?B.red:'rgba(255,255,255,0.08)'}`,
              borderRadius:10,padding:'14px',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
            <div style={{fontSize:18,marginBottom:4}}>{t.emoji}</div>
            <div style={{fontWeight:700,fontSize:13}}>{t.label}</div>
            <div style={{color:tool===t.id?'rgba(255,255,255,0.75)':B.gray,fontSize:11,marginTop:2}}>{t.desc}</div>
          </button>
        ))}
      </div>

      <Card>
        {tool === 'script' && (
          <>
            <div style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(0,212,255,0.85)',lineHeight:1.7}}>
              📊 <strong>VIDIQ-Optimized:</strong> Every script is built to maximize outlier score — upload timing, hook structure, chapter markers, SEO package, and CTR analysis included.
            </div>
            <SecLabel>Video Topic</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why I stopped chasing motivation and what I do instead..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                marginBottom:12,boxSizing:'border-box'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <SecLabel>Target Duration</SecLabel>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['3-5 min','8-10 min','15-20 min'].map(d => (
                    <button key={d} onClick={() => setYtDuration(d)}
                      style={{background:ytDuration===d?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                        borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:ytDuration===d?700:400}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SecLabel>Script Style</SecLabel>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['Educational Story','Personal Experience','Tutorial','Interview Prep'].map(s => (
                    <button key={s} onClick={() => setYtStyle(s)}
                      style={{background:ytStyle===s?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                        borderRadius:6,padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:ytStyle===s?700:400}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <SecLabel>Content Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
          </>
        )}

        {tool === 'titles' && (
          <>
            <SecLabel>Video Topic</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why I stopped chasing motivation and what I do instead"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>
            <SecLabel>Content Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
          </>
        )}

        {tool === 'seo' && (
          <>
            <SecLabel>Video Script or Summary</SecLabel>
            <textarea value={script} onChange={e=>setScript(e.target.value)} rows={8}
              placeholder="Paste your full script or a detailed summary of the video content..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                resize:'vertical',boxSizing:'border-box'}}/>
          </>
        )}

        {tool === 'audit' && (
          <>
            <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
              <strong style={{color:B.red}}>Step 1</strong> — Pull your live channel data from Perplexity, then add any additional context the audit should know, then run.
            </div>
            <button onClick={fetchChannel} disabled={fetching}
              style={{background:'rgba(255,255,255,0.08)',color:B.white,border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:8,padding:'10px 20px',fontWeight:700,cursor:fetching?'not-allowed':'pointer',
                fontSize:13,marginBottom:16}}>
              {fetching ? 'Pulling channel data...' : '🔍 Pull @everydayelevations Data'}
            </button>
            {channelData && (
              <div style={{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'12px',marginBottom:16,
                fontSize:12,color:'rgba(255,255,255,0.7)',maxHeight:160,overflowY:'auto',lineHeight:1.7}}>
                {channelData}
              </div>
            )}
            <SecLabel>Additional Channel Context</SecLabel>
            <textarea value={auditExtra} onChange={e=>setAuditExtra(e.target.value)} rows={4}
              placeholder="Add anything Perplexity can't see: your VIDIQ outlier scores, which videos performed best, current upload frequency, subscriber growth rate, what you've already tried, content goals, target audience details, monetization status, recent changes..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                resize:'vertical',marginBottom:4,boxSizing:'border-box'}}/>
            <div style={{color:B.gray,fontSize:11,marginBottom:12}}>This context gets sent directly to the audit — the more specific, the better the recommendations.</div>
          </>
        )}

        {tool === 'endscreen' && (
          <>
            <SecLabel>Video Topic</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why discipline beats motivation every time"
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>
            <SecLabel>Primary Channel Goal Right Now</SecLabel>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
              {['grow subscribers','build email list','drive real estate leads','promote podcast'].map(g => (
                <button key={g} onClick={() => setChannelGoal(g)}
                  style={{background:channelGoal===g?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,
                    fontWeight:channelGoal===g?700:400,textTransform:'capitalize'}}>
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={{marginTop:20}}>
          <RedBtn onClick={run} disabled={loading||!canRun()}>
            {loading ? 'Working...' : tools.find(t=>t.id===tool)?.label}
          </RedBtn>
        </div>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <span style={{color:B.white,fontWeight:700,fontSize:14}}>{tools.find(t=>t.id===tool)?.label} Results</span>
            <CopyBtn text={out}/>
          </div>
          <Output text={out}/>
        </div>
      )}
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// DM SCRIPT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

const DM_SCRIPTS_KEY = 'encis_dm_scripts';

const DM_GEN_PROMPT = (trigger, context, goal, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}

Someone just triggered a DM conversation. Write the scripts for handling this.

Trigger: ${trigger}
Context: ${context || 'Standard inbound DM'}
Goal: ${goal}

Write a complete DM conversation flow — not just one message. The full sequence from first reply to close.

**OPENING MESSAGE** (the first reply you send)
[Write it — under 3 sentences, warm, human, direct]

**IF THEY RESPOND POSITIVELY** (they're interested)
[Next message — move toward the goal without being pushy]

**IF THEY GIVE A SHORT REPLY** (one word, emoji, low engagement)
[Re-engage message — ask one good question]

**IF THEY ASK FOR PRICE/MORE INFO**
[How to handle this — deliver value before the ask]

**THE CLOSE MESSAGE** (when the time is right)
[Clear ask — specific, easy to say yes to]

**IF THEY GO COLD** (no reply in 48+ hours)
[Follow-up message — no desperation, just a genuine check-in]

Rules: Sound like Jason texting a real person. No emojis unless they feel natural. No "Hey there!" No corporate words. Move the conversation forward with every message.`;

function DMScriptLibrary() {
  const [saved, setSaved] = useState([]);
  const [showGen, setShowGen] = useState(false);
  const [showSaved, setShowSaved] = useState(true);
  const [trigger, setTrigger] = useState('');
  const [context, setContext] = useState('');
  const [goal, setGoal] = useState('book a call');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scriptName, setScriptName] = useState('');
  const [activeClient] = useActiveClient();

  useEffect(() => {
    try {
      const s = localStorage.getItem(DM_SCRIPTS_KEY);
      if (s) setSaved(JSON.parse(s));
    } catch {}
  }, []);

  const saveScript = (list) => {
    setSaved(list);
    try { localStorage.setItem(DM_SCRIPTS_KEY, JSON.stringify(list)); } catch {}
  };

  const run = async () => {
    if (!trigger) return;
    setLoading(true); setOut('');
    const res = await ai(DM_GEN_PROMPT(trigger, context, goal, activeClient));
    setOut(res);
    setLoading(false);
  };

  const saveToLibrary = () => {
    if (!out || !scriptName) return;
    const entry = {
      id: Date.now().toString(),
      name: scriptName || trigger,
      trigger,
      goal,
      script: out,
      createdAt: new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}),
    };
    saveScript([entry, ...saved]);
    setScriptName('');
    setSaving(false);
  };

  const removeScript = (id) => saveScript(saved.filter(s => s.id !== id));

  const goals = [
    'book a call',
    'deliver lead magnet',
    'podcast guest invite',
    'real estate inquiry',
    'coaching interest',
    'collab pitch',
    'community invite',
  ];

  const quickTriggers = [
    { label: 'Commented keyword', trigger: 'They commented a keyword (PERFORMANCE, BRAIN, FREE, etc.) on a post to receive a lead magnet' },
    { label: 'Asked about coaching', trigger: 'They sent a DM asking about coaching or working together' },
    { label: 'Real estate inquiry', trigger: 'They saw a real estate post and asked about buying or selling in Colorado' },
    { label: 'Podcast guest interest', trigger: 'They expressed interest in being on Everyday Elevations podcast or had me on theirs' },
    { label: 'Just followed', trigger: 'They just followed the account and sent a generic hello or no message' },
    { label: 'Shared my post', trigger: 'They shared one of my posts and I want to start a conversation' },
    { label: 'Cold outreach', trigger: 'I am reaching out cold to someone I want to collaborate with or connect with' },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:32}}>📩</span>
          <div>
            <h2 style={{color:B.white,margin:0}}>DM Script Library</h2>
            <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Build and save full conversation flows — from first reply to close.</p>
          </div>
        </div>
        <button onClick={() => { setShowGen(g => !g); setOut(''); }}
          style={{background:showGen?B.red:'rgba(255,255,255,0.08)',color:B.white,border:'none',
            borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {showGen ? '✕ Close' : '+ Generate New Script'}
        </button>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      {/* Generator */}
      {showGen && (
        <Card style={{marginBottom:20}}>
          <SecLabel>Quick Trigger Templates</SecLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
            {quickTriggers.map((qt, i) => (
              <button key={i} onClick={() => setTrigger(qt.trigger)}
                style={{background:trigger===qt.trigger?B.red:'rgba(255,255,255,0.06)',
                  color:trigger===qt.trigger?'#fff':'rgba(255,255,255,0.75)',
                  border:`1px solid ${trigger===qt.trigger?B.red:'rgba(255,255,255,0.1)'}`,
                  borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:500}}>
                {qt.label}
              </button>
            ))}
          </div>

          <SecLabel>What Triggered This DM?</SecLabel>
          <textarea value={trigger} onChange={e=>setTrigger(e.target.value)} rows={2}
            placeholder="e.g. They commented PERFORMANCE on my reel about morning routines..."
            style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
              resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>

          <SecLabel>Goal of This Conversation</SecLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
            {goals.map(g => (
              <button key={g} onClick={() => setGoal(g)}
                style={{background:goal===g?B.red:'rgba(255,255,255,0.06)',color:B.white,border:'none',
                  borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,
                  fontWeight:goal===g?700:400,textTransform:'capitalize'}}>
                {g}
              </button>
            ))}
          </div>

          <SecLabel>Extra Context (optional)</SecLabel>
          <input value={context} onChange={e=>setContext(e.target.value)}
            placeholder="e.g. They have 5K followers, run a fitness account, mentioned they're a veteran..."
            style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
              marginBottom:16,boxSizing:'border-box'}}/>

          <RedBtn onClick={run} disabled={loading||!trigger}>
            {loading ? 'Writing scripts...' : '📩 Build Full DM Flow'}
          </RedBtn>

          {loading && <Spin/>}

          {out && (
            <div style={{marginTop:16}}>
              <div style={{background:'rgba(0,0,0,0.3)',borderRadius:8,padding:'1rem',
                border:'1px solid rgba(255,255,255,0.1)',marginBottom:12}}>
                <pre style={{color:B.white,fontSize:13,whiteSpace:'pre-wrap',margin:0,
                  lineHeight:1.7,fontFamily:'inherit'}}>{out}</pre>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <CopyBtn text={out}/>
                {!saving ? (
                  <button onClick={() => setSaving(true)}
                    style={{background:'rgba(39,174,96,0.15)',color:'#27ae60',
                      border:'1px solid rgba(39,174,96,0.3)',borderRadius:8,
                      padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    💾 Save to Library
                  </button>
                ) : (
                  <div style={{display:'flex',gap:8,flex:1}}>
                    <input value={scriptName} onChange={e=>setScriptName(e.target.value)}
                      placeholder="Name this script (e.g. Lead Magnet Delivery)..."
                      style={{flex:1,background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                        borderRadius:8,padding:'7px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
                    <button onClick={saveToLibrary} disabled={!scriptName}
                      style={{background:B.red,color:'#fff',border:'none',borderRadius:8,
                        padding:'7px 14px',fontSize:12,fontWeight:700,cursor:scriptName?'pointer':'not-allowed'}}>
                      Save
                    </button>
                    <button onClick={() => setSaving(false)}
                      style={{background:'rgba(255,255,255,0.06)',color:B.gray,border:'none',
                        borderRadius:8,padding:'7px 12px',fontSize:12,cursor:'pointer'}}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Saved Library */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{color:B.white,fontWeight:700,fontSize:14}}>
          Saved Scripts <span style={{color:B.gray,fontWeight:400,fontSize:12}}>({saved.length})</span>
        </div>
        {saved.length > 0 && (
          <button onClick={() => setShowSaved(s => !s)}
            style={{background:'none',border:'none',color:B.gray,cursor:'pointer',fontSize:12}}>
            {showSaved ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {saved.length === 0 && !showGen && (
        <div style={{textAlign:'center',padding:'3rem 2rem',background:'rgba(255,255,255,0.02)',
          borderRadius:16,border:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:40,marginBottom:12}}>📩</div>
          <div style={{color:B.white,fontWeight:700,fontSize:15,marginBottom:8}}>No saved scripts yet</div>
          <div style={{color:B.gray,fontSize:13,marginBottom:20}}>Generate a DM flow and save it — build your library over time.</div>
          <button onClick={() => setShowGen(true)}
            style={{background:B.red,color:'#fff',border:'none',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            + Generate First Script
          </button>
        </div>
      )}

      {showSaved && saved.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {saved.map(s => (
            <div key={s.id} style={{background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div>
                  <div style={{color:B.white,fontWeight:700,fontSize:13}}>{s.name}</div>
                  <div style={{color:B.gray,fontSize:11,marginTop:2}}>
                    Goal: {s.goal} · Saved {s.createdAt}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <CopyBtn text={s.script}/>
                  <button onClick={() => removeScript(s.id)}
                    style={{background:'transparent',color:'rgba(255,255,255,0.2)',
                      border:'none',fontSize:16,cursor:'pointer',padding:'4px 8px'}}>✕</button>
                </div>
              </div>
              <div style={{padding:'14px 16px',maxHeight:200,overflowY:'auto'}}>
                <pre style={{color:'rgba(255,255,255,0.7)',fontSize:12,whiteSpace:'pre-wrap',
                  margin:0,lineHeight:1.7,fontFamily:'inherit'}}>{s.script}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 30-DAY CHALLENGE BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

const CHALLENGE_PROMPT = (name, transformation, audience, platform, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}
${SWARBRICK}
${CONTENT_SOP}

Challenge Name: ${name}
Transformation Promise: ${transformation}
Target Audience: ${audience}
Primary Platform: ${platform}

Build a complete 30-day challenge system. This is not a generic template — it needs to feel like Jason built it specifically for Elevation Nation.

# ${name} — Complete Challenge System

## The Concept
- Core promise in one sentence (what they have at day 30 that they didn't at day 1)
- Why 30 days (the psychology of this timeframe)
- The one rule that makes this work

## Lead Magnet Integration
- Challenge landing page headline
- Email opt-in hook (what they get when they sign up)
- Welcome email subject line + first paragraph

## Week-by-Week Architecture
**Week 1 — Foundation (Days 1-7)**
Theme: [what this week is about]
Daily prompt format: [how each day works]
Days 1-7: [specific daily challenge for each day]
Week 1 win: [what they achieve by Sunday]

**Week 2 — Resistance (Days 8-14)**
Theme: [this is where people quit — what you do about it]
Days 8-14: [specific daily challenges]
Mid-challenge check-in: [what you post on day 14]

**Week 3 — Momentum (Days 15-21)**
Theme: [the turn — things start clicking]
Days 15-21: [specific daily challenges]
Community spotlight: [how you feature participants]

**Week 4 — Identity (Days 22-30)**
Theme: [they're not the same person they were on day 1]
Days 22-30: [specific daily challenges]
Day 30 celebration: [exactly what happens]

## Content Series (10 posts that run alongside the challenge)
For each: day to post, format, hook, topic

## Engagement Mechanics
- Daily accountability prompt (the question you ask every day)
- How participants share progress (hashtag, format, where)
- How you feature participant wins
- What happens when someone misses a day (the re-entry script)

## Email Sequence (5 emails during the 30 days)
Day 1, Day 7, Day 14, Day 21, Day 30 — subject line + 2-sentence summary of each

## Post-Challenge Offer
- What you invite them into at day 30
- The transition message (how you move from challenge to offer without it feeling like a pitch)`;

function ChallengeBuilder() {
  const [name, setName] = useState('');
  const [transformation, setTransformation] = useState('');
  const [audience, setAudience] = useState('Everyday people who want to build a daily discipline practice — veterans, parents, professionals who feel stuck');
  const [platform, setPlatform] = useState('Instagram');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeClient] = useActiveClient();

  const quickChallenges = [
    { name: '30-Day 5AM Club', transformation: 'Wake up at 5AM every day for 30 days and build the morning routine that changes everything' },
    { name: '30-Day No Excuse Challenge', transformation: 'Show up every single day regardless of how you feel — build the identity of someone who does not quit' },
    { name: '30-Day Elevation Challenge', transformation: 'One small elevation action per day — in mindset, fitness, relationships, or finances' },
    { name: '30-Day Real Talk Challenge', transformation: 'Say the hard thing, do the hard thing, face the hard thing — daily prompts for radical honesty' },
  ];

  const run = async () => {
    if (!name || !transformation) return;
    setLoading(true); setOut('');
    const res = await ai(CHALLENGE_PROMPT(name, transformation, audience, platform, activeClient));
    setOut(res);
    logToMemory({ type:'challenge', title:`Challenge: ${name}`, preview:res.slice(0,200), client:activeClient?.name });
    setLoading(false);
  };

  const downloadChallenge = async () => {
    if (!out) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/claude', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          message: `Convert this 30-day challenge plan into clean, well-formatted HTML. Use proper headings, tables for the daily schedule, and make it easy to read and print. Return only the HTML body content:\n\n${out}`,
          system: 'Convert challenge plans to clean HTML. Return only inner HTML.'
        })
      });
      const d = await res.json();
      const html = d.text || d.result || '';
      const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#111;line-height:1.7}h1{color:#0A1628;border-bottom:3px solid #E94560;padding-bottom:8px}h2{color:#E94560;margin-top:36px}h3{color:#0A1628}strong{color:#0A1628}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#0A1628;color:#fff}@media print{body{margin:24px}}</style></head><body>${html}</body></html>`;
      const blob = new Blob([full], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${name.replace(/\s+/g,'-')}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🔥</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>30-Day Challenge Builder</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Full challenge system — 30 daily prompts, content series, email sequence, and post-challenge offer.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <Card>
        <SecLabel>Quick Start Templates</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:8,marginBottom:20}}>
          {quickChallenges.map((qc, i) => (
            <button key={i} onClick={() => { setName(qc.name); setTransformation(qc.transformation); }}
              style={{background:name===qc.name?'rgba(233,69,96,0.15)':'rgba(255,255,255,0.04)',
                border:`1px solid ${name===qc.name?'rgba(233,69,96,0.4)':'rgba(255,255,255,0.08)'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'left'}}>
              <div style={{color:B.white,fontWeight:700,fontSize:12,marginBottom:4}}>{qc.name}</div>
              <div style={{color:B.gray,fontSize:11,lineHeight:1.5}}>{qc.transformation.slice(0,70)}...</div>
            </button>
          ))}
        </div>

        <SecLabel>Challenge Name</SecLabel>
        <input value={name} onChange={e=>setName(e.target.value)}
          placeholder="e.g. 30-Day Elevation Challenge, 30-Day 5AM Club..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>The Transformation Promise</SecLabel>
        <textarea value={transformation} onChange={e=>setTransformation(e.target.value)} rows={2}
          placeholder="What does someone have at day 30 that they didn't at day 1? Be specific."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Target Audience</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Primary Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
              {p}
            </button>
          ))}
        </div>

        <RedBtn onClick={run} disabled={loading||!name||!transformation}>
          {loading ? 'Building challenge system...' : '🔥 Build Full 30-Day Challenge'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:10}}>
            <span style={{color:B.white,fontWeight:700,fontSize:15}}>{name}</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={downloadChallenge} disabled={downloading}
                style={{background:B.red,color:'#fff',border:'none',borderRadius:8,
                  padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',fontSize:13}}>
                {downloading ? 'Preparing...' : '⬇ Download Plan'}
              </button>
            </div>
          </div>
          <StrategyOutput text={out} onDownload={downloadChallenge} downloading={downloading}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPETITOR CONTENT SPY
// ═══════════════════════════════════════════════════════════════════════════════

const SPY_PROMPT = (handle, platform, rawData, angle) => `
${VOICE}

You are analyzing a competitor's content strategy to find gaps Jason Fricka can own.

Creator: ${handle}
Platform: ${platform}
Live data pulled: ${rawData}
Jason's angle to compete from: ${angle || 'Veteran/mindset/real estate/Colorado lifestyle'}

This is intelligence work — not copying. Find what they are missing so Jason can own it.

# Competitor Intel: ${handle}

## Who They Are (Quick Brief)
[3 sentences — what they do, who their audience is, what they're known for]

## What's Working for Them
[Top 3-5 content formats/topics that are clearly resonating — with specific examples from the data]

## Their Posting Pattern
[Frequency, timing, content mix — what's consistent]

## Audience They're Attracting
[Who comments, what they ask, what the community looks like]

## THE GAPS — What They're NOT Doing
[This is the most important section. Be specific. What angles, formats, or topics are they avoiding or doing poorly?]

## What Jason Can Own That They Can't
[Based on Jason's unique background — veteran, HR, real estate, Colorado, endurance athlete — what can he cover authentically that this creator cannot?]

## 5 Specific Content Ideas to Beat Them
[Specific filmable concepts — not generic topics. Each one directly counters a gap you identified above]

## The One Thing That Would Make Jason Stand Out in This Space
[Single highest-leverage differentiator]`;

function CompetitorSpy() {
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [angle, setAngle] = useState('');
  const [rawData, setRawData] = useState('');
  const [out, setOut] = useState('');
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem('encis_spy_history');
      if (s) setHistory(JSON.parse(s));
    } catch {}
  }, []);

  const fetchProfile = async () => {
    if (!handle) return;
    setFetching(true); setRawData(''); setOut('');
    const cleanHandle = handle.replace('@','');
    const q = platform === 'YouTube'
      ? `Analyze the YouTube channel ${handle}. Report: subscriber count, total views, upload frequency, most popular videos with view counts, content topics, what formats they use, what their audience responds to most.`
      : `Analyze the ${platform} account ${handle.startsWith('@') ? handle : '@'+handle}. Report: follower count, engagement patterns, most popular recent posts, content themes, posting frequency, what their audience engages with most, what hashtags they use.`;
    const res = await perp(q);
    setRawData(res);
    setFetching(false);
  };

  const run = async () => {
    if (!rawData) return;
    setLoading(true); setOut('');
    const res = await ai(SPY_PROMPT(handle, platform, rawData, angle));
    setOut(res);
    // Save to history
    const entry = { id: Date.now().toString(), handle, platform, date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), preview: res.slice(0,100) };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    try { localStorage.setItem('encis_spy_history', JSON.stringify(updated)); } catch {}
    setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <span style={{fontSize:32}}>🕵️</span>
        <div>
          <h2 style={{color:B.white,margin:0}}>Competitor Content Spy</h2>
          <p style={{color:B.gray,margin:'4px 0 0',fontSize:13}}>Pull any creator's content strategy — find the gaps Jason can own.</p>
        </div>
      </div>

      <div style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        🎯 This is intelligence, not imitation. The goal is to find what they are NOT doing so you can own it. Every gap they leave is an opening.
      </div>

      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:16,alignItems:'end'}}>
          <div>
            <SecLabel>Creator Handle or Channel</SecLabel>
            <input value={handle} onChange={e=>setHandle(e.target.value)}
              placeholder="e.g. @hubermanlab, @davidgoggins, ThinkMedia..."
              style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{background:platform===p?B.red:'rgba(255,255,255,0.07)',color:B.white,border:'none',
                    borderRadius:6,padding:'8px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={fetchProfile} disabled={fetching||!handle}
          style={{background:fetching?B.gray:'rgba(0,212,255,0.1)',color:'#00d4ff',
            border:'1px solid rgba(0,212,255,0.3)',borderRadius:8,padding:'10px 20px',
            fontWeight:700,cursor:(!handle||fetching)?'not-allowed':'pointer',
            fontSize:13,marginBottom:16,display:'block'}}>
          {fetching ? 'Pulling profile data...' : `🔍 Pull ${platform} Data for ${handle||'this creator'}`}
        </button>

        {rawData && (
          <div style={{background:'rgba(0,0,0,0.25)',borderRadius:8,padding:'12px',marginBottom:16,
            maxHeight:140,overflowY:'auto',border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:10,color:B.red,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Live Data Pulled</div>
            <div style={{color:'rgba(255,255,255,0.65)',fontSize:12,lineHeight:1.7}}>{rawData}</div>
          </div>
        )}

        <SecLabel>Jason's Angle (optional — helps focus the gap analysis)</SecLabel>
        <input value={angle} onChange={e=>setAngle(e.target.value)}
          placeholder="e.g. Veteran mindset, Colorado real estate, endurance athlete over 40..."
          style={{width:'100%',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:8,padding:'10px 12px',color:B.white,fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <RedBtn onClick={run} disabled={loading||!rawData}>
          {loading ? 'Running intel analysis...' : '🕵️ Run Competitor Intel'}
        </RedBtn>
      </Card>

      {loading && <Spin/>}
      {out && <StrategyOutput text={out} onDownload={null} downloading={false}/>}

      {/* Recent spy history */}
      {history.length > 0 && (
        <div style={{marginTop:24}}>
          <div style={{fontSize:11,color:B.gray,fontWeight:700,letterSpacing:1.5,
            textTransform:'uppercase',marginBottom:10}}>Recent Profiles Analyzed</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {history.map(h => (
              <button key={h.id}
                onClick={() => { setHandle(h.handle); setPlatform(h.platform); }}
                style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:8,padding:'6px 12px',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:12}}>
                {h.handle} <span style={{color:B.gray}}>· {h.platform} · {h.date}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


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
  batch: BulkBatch,
  episode: EpisodeClips,
  repurpose: RepurposeEngine,
  hooks: HookLibrary,
  design: DesignStudio,
  review: WeeklyReview,
  roi: ROIDashboard,
  memory: ContentMemory,
  caption: CaptionWriter,
  schedule: ScheduleOptimizer,
  gaps: ContentGapAnalyzer,
  tracker: CollabTracker,
  clients: ClientMode,
  comment: CommentResponder,
  hooktester: HookTester,
  email: EmailSequenceBuilder,
  podcast: PodcastPreProd,
  yttoolkit: YouTubeToolkit,
  dmscripts: DMScriptLibrary,
  challenge: ChallengeBuilder,
  spy: CompetitorSpy,
};

export default function App() {
  const [nav, setNav] = useState('home');
  const [sub, setSub] = useState(null);
  const { save: memorySave } = useContentMemory();
  const [activeClient] = useActiveClient();

  // Register memory save function globally so all tools can log to it
  useEffect(() => { registerMemorySave(memorySave); }, [memorySave]);
  useEffect(() => { document.title = 'EN-CIS | Elevation Nation CIS'; }, []);

  const handleNav = (id) => {
    setNav(id);
    if(id === 'home') { setSub(null); return; }
    if(id === 'youtube') { setSub('yttoolkit'); return; }
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
            {/* Active client indicator in nav */}
            {activeClient && !activeClient.isDefault && (
              <div style={{marginLeft:'auto',background:'rgba(245,166,35,0.12)',border:'1px solid rgba(245,166,35,0.25)',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:700,color:'rgba(245,166,35,0.9)',whiteSpace:'nowrap'}}>
                👤 {activeClient.name}
              </div>
            )}
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

        {/* TREND ALERT BANNER */}
        <TrendAlertBanner/>

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
