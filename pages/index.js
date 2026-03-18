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
    ? `=== STRATEGY DOCUMENT / SOP ===
Follow this document as the authoritative source. Mirror its brand voice, content pillars, platform priorities, posting cadence, lead magnets, CTA split, content production standards, and success metrics exactly. Execute the strategy defined here - do not invent new frameworks.

${uploadedDoc}
=== END STRATEGY DOCUMENT ===`
    : `${VOICE}
${CONTENT_SOP}
${SWARBRICK}`;

  return `${sopSection}

=== CLIENT BRIEF ===
Goals: ${fields.goals}
Current State: ${fields.current}
Weekly Time Available: ${fields.hours} hours
Brand Personality: ${fields.brandPersonality}
Business Name: ${fields.businessName}
Affiliate / Brand Deals: ${fields.affiliateDeals}
Filming Schedule & Batch Capacity: ${fields.filmingSchedule}
Inspiration Accounts: ${fields.inspirationAccounts}
Off-Limit Topics: ${fields.offLimitTopics}
Content to Repurpose: ${fields.repurposeLinks}
Ideal Audience Profile: ${fields.idealAudience}
Desired Transformation: ${fields.desiredTransformation}
Emotional Journey (Before/After): ${fields.emotionalJourney}
Additional Context: ${fields.additionalContext}

=== OUTPUT FORMAT ===
Write a professional, structured 90-day strategy document. Be specific and data-driven.

# [Client Name] - 90-Day Content Strategy
## Executive Summary
2-3 sentences: who this is for, what the 90 days accomplish, the single strategic bet.

## Brand Positioning
- Social identity and unique positioning statement
- Voice and tone guardrails (do / never do)
- Ideal client profile: who to attract, who to repel
- Competitive edge

## Content Pillars
For each pillar (3-4 max): name, one-line description, 5 specific filmable content ideas, best format (Reel/Carousel/Long-form), CTA type.

## Platform Strategy
For each active platform: role in the ecosystem, posting frequency (specific X/week), content types, top 3 Week 1 actions.

## 90-Day Execution Plan

### Phase 1 - Foundation (Days 1-30)
Goal: [specific]
Weekly numbered action plan. Content to batch (specific topics). Success metrics.

### Phase 2 - Momentum (Days 31-60)
Goal: [specific]
Lead magnet (title, format, delivery). Community moves. Collaboration targets. Success metrics.

### Phase 3 - Scale (Days 61-90)
Goal: [specific]
Repurposing workflow step-by-step. Analytics review process. Revenue alignment. Success metrics.

## Content Production Standards
Opening, editing, and retention rules specific to this client.

## Engagement SOP
Pre-post and post-post windows. Daily comment and DM targets. Response time SLAs.

## Weekly Schedule Template
Based on ${fields.hours} hours/week. Specific day-by-day time blocks.

## Success Metrics
Primary KPIs with specific numerical targets. Secondary KPIs.

## Quick Wins - First 7 Days
5 specific actions, each under 2 hours, each producing a visible result.

${uploadedDoc ? 'CRITICAL: Match the exact section names, terminology, frameworks, and metric targets from the strategy document. This is a client-facing deliverable.' : 'Write in the client voice. Direct, specific, actionable. No corporate speak.'}
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
      <Output text={out}/>
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
      <Output text={out}/>
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
      <Output text={out}/>
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
      <Output text={out}/>
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
          <Output text={out}/>
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

      // Strict 24-48 hour window, 2M+ views only
      const todayStr = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
      const makeQuery = (niche) =>
        `Today is ${todayStr}. Search right now for a specific viral video about ${niche} posted on Instagram Reels or YouTube Shorts within the last 24-48 hours that has already surpassed 2 million views. This must be brand new content — posted today or yesterday only. Do not report anything older than 48 hours. Do not estimate view counts — only report if you can verify over 2M views. If no video in this niche meets both requirements (posted in last 48 hours AND verified 2M+ views), respond with exactly: NO_RESULT\n\nIf you find one, respond ONLY in this exact format:\n\nACCOUNT: [exact @handle or YouTube channel name]\nPLATFORM: [Instagram or YouTube]\nVIDEO TITLE: [exact title or caption]\nVIEWS: [verified count — must exceed 2M]\nPOSTED: [exact date posted, e.g. March 18, 2026]\nWHY IT BLEW UP: [one sentence — specific psychology or format reason]\nHOOK TO STEAL: [opening line Jason Fricka could use to make a similar video]`;

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

            // Skip if Perplexity couldn't find a verified 2M+ video
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

            // Hard filter — reject anything under 2M views
            if (views) {
              const vNum  = parseFloat(views.replace(/[^0-9.]/g, '')) || 0;
              const vUp   = views.toUpperCase();
              const vMil  = vUp.includes('B') ? vNum * 1000 : vUp.includes('M') ? vNum : vUp.includes('K') ? vNum / 1000 : vNum / 1000000;
              if (vMil < 2) return null;
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
                <span style={{color:B.red,fontWeight:700}}>{alerts.length} verified 2M+ trends found</span>
                {alerts.length < 8 && (
                  <span style={{color:'rgba(255,255,255,0.35)'}}>· {8 - alerts.length} angles had no verified 2M+ content this week</span>
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
    { id:'script',    emoji:'✍️',  label:'Script Engine' },
    { id:'batch',     emoji:'⚡',  label:'Bulk Batch' },
    { id:'episode',   emoji:'🎙️',  label:'Episode Clips' },
    { id:'repurpose', emoji:'♻️',  label:'Repurpose' },
    { id:'hooks',     emoji:'🪝',  label:'Hook Library' },
    { id:'design',    emoji:'🎨',  label:'Design Studio' },
  ],
  optimize: [
    { id:'review',  emoji:'📊', label:'Weekly Review' },
    { id:'roi',     emoji:'📈', label:'ROI Dashboard' },
    { id:'memory',  emoji:'🧠', label:'Content Memory' },
  ],
  agency: [
    { id:'clients', emoji:'👥', label:'Client Profiles' },
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
  batch: BulkBatch,
  episode: EpisodeClips,
  repurpose: RepurposeEngine,
  hooks: HookLibrary,
  design: DesignStudio,
  review: WeeklyReview,
  roi: ROIDashboard,
  memory: ContentMemory,
  clients: ClientMode,
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
