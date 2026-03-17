import { useState, useEffect } from 'react';
import Head from 'next/head';

const B = {
  navy:"#0A1628", navyMid:"#0F2040", navyLight:"#1A3A5C",
  red:"#E94560", redDark:"#9B2335", white:"#FFFFFF",
  offWhite:"#F8F9FC", border:"#E2E8F0", borderDark:"#1E2D45",
  text:"#0A1628", textMid:"#4A5568", textLight:"#718096",
  gold:"#F5A623", teal:"#0F3460", purple:"#6E2F8E", green:"#27AE60",
};

const ANGLES = [
  { id:"veteran",  label:"Veteran / Resilience",       icon:"🎖️" },
  { id:"mindset",  label:"Mindset & Mental Toughness",  icon:"🧠" },
  { id:"wins",     label:"Everyday Wins",               icon:"⚡" },
  { id:"outdoor",  label:"Outdoor Living & Community",  icon:"🏔️" },
  { id:"finance",  label:"Finance & Real Estate",       icon:"💰" },
  { id:"podcast",  label:"Podcast & Personal Growth",   icon:"🎙️" },
  { id:"family",   label:"Family & Life Lessons",       icon:"❤️" },
  { id:"health",   label:"Health & Physical Wellness",  icon:"💪" },
];

const SWARBRICK = `CONTENT WELLNESS FRAMEWORK (Dr. Peggy Swarbrick's 8 Dimensions -- apply as invisible infrastructure):
1. Mental/Emotional: stress management, emotional balance, mindset resilience
2. Physical: training, nutrition, recovery, endurance, body as tool
3. Social: relationships, community, Elevation Nation, connection
4. Environmental: Colorado outdoors, sustainable lifestyle, personal space
5. Financial: money management, real estate, debt reduction, wealth building
6. Intellectual: cognitive growth, learning, podcast insights, curiosity
7. Occupational: career satisfaction, work-life balance, veteran-to-civilian, HR
8. Spiritual: purpose, meaning, faith, existential peace, legacy
Do NOT mention dimensions or Swarbrick explicitly. Weave them invisibly.`;

const GREENSPAN_SOP = `GREENSPAN CONTENT STANDARDS:
- Opening: No intro. No fluff. Start with value. High-contrast caption from frame 1.
- Optimize for ACTION: saves, shares, comments, follows (in that priority)
- Hook must land in first 3 seconds
- CTA Distribution: 60% comment-based, 20% DM-trigger, 20% link in bio
- Success metrics: Shares + Saves first, non-follower reach second, qualified leads third
- Content types: Educational (saves), Trend-Responsive (shares), Personal Story (follows)`;

const VOICE = `VOICE: Jason Fricka @everydayelevations. Conversational, direct, no fluff. Veteran, mindset coach, endurance athlete, father in Colorado. Short punchy sentences. Elevation Nation community identity woven in naturally.`;

const PLATFORMS = [
  { id:"instagram", label:"Instagram Reel", icon:"📸", format:"30-60 sec vertical" },
  { id:"youtube",   label:"YouTube",        icon:"▶️", format:"Long-form or Shorts" },
  { id:"facebook",  label:"Facebook",       icon:"👥", format:"60-90 sec native video" },
  { id:"linkedin",  label:"LinkedIn",       icon:"💼", format:"Text post or 60s video" },
];

// ── UI PRIMITIVES ────────────────────────────────────────────────────────────

function Spin() {
  return <span style={{ display:"inline-block", width:14, height:14, border:`2px solid rgba(255,255,255,0.3)`, borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", marginRight:8 }} />;
}

function RedBtn({ onClick, disabled, children, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background:disabled?"#CBD5E0":B.red, color:B.white, border:"none", borderRadius:8, padding:"13px 28px", fontSize:14, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:12, padding:"16px 20px", marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", ...style }}>{children}</div>;
}

function SecLabel({ text }) {
  return <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2.5, color:B.textLight, marginBottom:8 }}>{text}</div>;
}

function SOPBadge() {
  return (
    <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"10px 14px", marginBottom:18, fontSize:11, color:"#1E40AF" }}>
      <span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, fontSize:10, color:"#1B4F72" }}>Greenspan SOP + Swarbrick Framework Active -- </span>
      Educational (saves) · Trend-Responsive (shares) · Personal Story (follows) · No intro · Value first
    </div>
  );
}

function AngleGrid({ value, onChange }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8 }}>
      {ANGLES.map(a => (
        <div key={a.id} onClick={() => onChange(a.id)}
          style={{ background:value===a.id?B.navy:B.white, border:`2px solid ${value===a.id?B.navy:B.border}`, borderRadius:10, padding:"12px", cursor:"pointer", transition:"all 0.15s" }}>
          <div style={{ fontSize:16, marginBottom:4 }}>{a.icon}</div>
          <div style={{ color:value===a.id?B.white:B.textMid, fontWeight:700, fontSize:11, lineHeight:1.3 }}>{a.label}</div>
        </div>
      ))}
    </div>
  );
}

function CopyBtn({ text, label="copy", copiedLabel="✓", id, cp, setCp }) {
  const copied = cp === id;
  function doCopy() { navigator.clipboard.writeText(text); setCp(id); setTimeout(() => setCp(""), 1800); }
  return (
    <button onClick={doCopy} style={{ background:copied?"#FEF2F2":B.offWhite, color:copied?B.red:B.textMid, border:`1px solid ${copied?"#FCA5A5":B.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
      {copied ? copiedLabel : label}
    </button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:16, marginBottom:24 }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:B.navy }}>{title}</div>
      {subtitle && <div style={{ color:B.textLight, fontSize:13, marginTop:3 }}>{subtitle}</div>}
    </div>
  );
}

async function ai(system, message) {
  const r = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ system, message }) });
  const d = await r.json();
  if (!d.text) throw new Error('No response');
  const clean = d.text.replace(/```json|```/g,'').trim();
  return JSON.parse(clean);
}

async function perp(query) {
  const r = await fetch('/api/perplexity', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ query }) });
  const d = await r.json();
  if (!d.text) throw new Error('No research');
  return d.text;
}

// ── PROMPTS ──────────────────────────────────────────────────────────────────

const SCRIPT_PROMPT = `You are a social media script writer. ${GREENSPAN_SOP} ${SWARBRICK} ${VOICE}
Generate 3 script variations. Return ONLY JSON:
{"platform":"","topic":"","variations":[{"type":"Educational|Trend-Responsive|Personal Story","typeNote":"why this type works","onScreenText":"opening text overlay","hook":"exact first line","hookNote":"delivery direction","body":["l1","l2","l3","l4","l5"],"bodyNotes":["n1","n2","n3","n4","n5"],"cta":"closing line","ctaNote":"delivery direction","ctaType":"comment-based|DM-trigger|link-in-bio","caption":"full caption 3-5 paragraphs","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"],"estimatedSeconds":45,"optimizesFor":"saves|shares|comments","whyItWorks":"1-2 sentences"}]}`;

const STITCH_PROMPT = `You are a viral stitch script writer. ${GREENSPAN_SOP} ${SWARBRICK} ${VOICE}
Write a stitch/response script. Return ONLY JSON:
{"stitchHook":"exact first line referencing original","stitchHookNote":"delivery direction","stance":"agree|disagree|add-nuance|personal-story","stanceReason":"why authentic to Jason","body":["l1","l2","l3","l4","l5"],"bodyNotes":["n1","n2","n3","n4","n5"],"cta":"comment-based closing line","ctaNote":"delivery","onScreenText":"opening overlay","caption":"full caption","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"],"estimatedSeconds":45,"whyItWillBeShared":"why this drives shares","stitchTip":"one production tip"}`;

const TREND_PROMPT = `You are a viral content researcher. Find what is going viral RIGHT NOW. Return ONLY JSON:
{"trends":[{"id":1,"title":"viral content description","platform":"Instagram|TikTok|YouTube|Facebook|Multiple","niche":"health|wellness|mindset|fitness|veteran|finance|family","estimatedViews":"2.3M+","whyViral":"what drives virality","stitchAngle":"specific angle for Jason as veteran mindset coach","stitchHookIdea":"suggested opening line","urgency":"hot-right-now|trending|evergreen-viral","difficulty":"easy|medium|hard"}]}
Find 6-8 genuinely current viral trends across health, wellness, mindset, fitness, veteran, and personal growth spaces.`;

const PIPELINE_EXTRACT = `You are the Elevation Nation Content Intelligence Engine. ${SWARBRICK} ${VOICE}
Analyze research and return ONLY JSON:
{"summary":"2-3 sentence synthesis","topGap":"single most important content gap","reelIdeas":[{"title":"hook-driven title","hook":"exact opening line","why":"why this drives follows","cta":"specific CTA","wellnessDimension":"which Swarbrick dimension"}],"elevationNationAngle":"how to leverage community identity"}`;

const PIPELINE_SCRIPT = `You are a Reel script writer. ${GREENSPAN_SOP} ${SWARBRICK} ${VOICE}
Return ONLY JSON:
{"hook":"first line","hookNote":"delivery","body":["l1","l2","l3","l4","l5"],"bodyNotes":["n1","n2","n3","n4","n5"],"cta":"closing","ctaNote":"delivery","onScreenText":"opening overlay","caption":"full caption 3-5 paragraphs","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"],"estimatedSeconds":45}`;

const CALENDAR_PROMPT = `You are a 30-day content calendar strategist. ${SWARBRICK} ${VOICE} ${GREENSPAN_SOP}
FRAMEWORK: Week 1: Pain Awareness (CTA: lead magnet). Week 2: Transformation (CTA: follow+email). Week 3: Authority (CTA: lead magnet+email). Week 4: Conversion (CTA: discovery call/DM).
Content mix: 50% Reels, 30% Carousels, 20% Static.
Return ONLY JSON:
{"month":"Month 1","theme":"overall theme","weeks":[{"week":1,"theme":"week theme","objective":"what this week achieves","posts":[{"day":1,"format":"Reel|Carousel|Static","angle":"content angle","topic":"specific topic title","hook":"exact hook line","cta":"exact CTA","ctaType":"comment|DM|link","wellnessDimension":"dimension","caption":"2-3 sentence caption preview"}]}]}
Generate all 4 weeks with 7-8 posts each (28-30 posts total). Be specific.`;

const EPISODE_PROMPT = `You are a podcast-to-social content extractor. ${SWARBRICK} ${VOICE} ${GREENSPAN_SOP}
Return ONLY JSON:
{"episodeTitle":"","clips":[{"clipNumber":1,"title":"clip title","hook":"exact opening hook","angle":"content angle","platform":"Instagram|YouTube|Facebook|LinkedIn|All","format":"Reel|Short|Native Video","keyInsight":"core insight in 1 sentence","body":["point 1","point 2","point 3"],"cta":"specific CTA","caption":"full caption","hashtags":["#t1","#t2","#t3","#t4","#t5"],"estimatedSeconds":45,"wellnessDimension":"Swarbrick dimension"}],"carouselIdea":{"title":"carousel series title","slides":["slide 1","slide 2","slide 3","slide 4","slide 5","CTA slide"]},"linkedInAngle":"how to adapt for HR/professional LinkedIn audience","quotableInsights":["quote 1","quote 2","quote 3"]}
Generate 5-7 clips. Make each feel distinct and platform-native.`;

const REPURPOSE_PROMPT = `You are a cross-platform content adapter. ${SWARBRICK} ${VOICE} ${GREENSPAN_SOP}
Take one Instagram Reel script and adapt it natively for all 4 platforms.
Return ONLY JSON:
{"originalTopic":"","instagram":{"format":"Reel","hook":"","body":["l1","l2","l3"],"cta":"","caption":"","hashtags":["#t1","#t2","#t3","#t4","#t5"]},"youtube":{"format":"YouTube Short OR Long-form intro","hook":"","outline":["point 1","point 2","point 3","point 4"],"cta":"","description":"","tags":["t1","t2","t3"]},"facebook":{"format":"Native video post","hook":"","body":["l1","l2","l3"],"cta":"","postCopy":"full facebook post copy with community angle"},"linkedin":{"format":"Text post or native video","hook":"","body":["l1","l2","l3"],"cta":"","postCopy":"professional framing for HR + podcast dual lane","angle":"which LinkedIn lane: HR expertise or podcast/mindset"}}`;

const HOOK_PROMPT = `You are a hook library curator for @everydayelevations. ${VOICE}
Generate a library of 40 proven hooks organized by type. Return ONLY JSON:
{"hooks":{"pattern_interrupt":[{"hook":"exact hook","template":"[X] that [Y]","angle":"best content angle","why":"why this stops scroll"}],"question":[{"hook":"","template":"","angle":"","why":""}],"bold_statement":[{"hook":"","template":"","angle":"","why":""}],"personal_story":[{"hook":"","template":"","angle":"","why":""}],"data_stat":[{"hook":"","template":"","angle":"","why":""}]}}
Each category should have 8 hooks. Specific to health, wellness, mindset, veteran, and Colorado lifestyle. No generic hooks.`;

const MAGNET_PROMPT = `You are a lead magnet strategist for @everydayelevations Elevation Nation community. ${SWARBRICK} ${VOICE}
Return ONLY JSON:
{"title":"compelling title","subtitle":"supporting line","format":"PDF Guide|Checklist|Email Series|Video Training|Worksheet","targetAudience":"who this attracts","hook":"one-line pitch for Reels","sections":[{"title":"section title","keyPoints":["point 1","point 2","point 3"]}],"deliveryReel":{"hook":"Reel hook to promote this","script":["line 1","line 2","line 3","line 4"],"cta":"comment KEYWORD to get this"},"emailSequence":["email 1 subject","email 2 subject","email 3 subject"],"followUpCTA":"what you sell after this magnet","wellnessDimensions":["dimension 1","dimension 2"]}`;

const COMMUNITY_PROMPT = `You are an Elevation Nation community strategist. ${VOICE}
Elevation Nation = "Everyday people who refuse to stay where they are."
Return ONLY JSON:
{"communityIdentity":{"name":"Elevation Nation","tagline":"","whoTheyAre":"member description","coreBeliefs":["belief 1","belief 2","belief 3"]},"namingConventions":{"memberName":"what to call members","contentSeries":["series 1","series 2","series 3"],"hashtags":["#communityTag1","#communityTag2","#communityTag3"]},"challenges":[{"name":"challenge name","duration":"7|14|21|30 days","hook":"challenge pitch","dailyAction":"what members do daily","cta":"how to join","announcementScript":["line 1","line 2","line 3"]}],"engagementTemplates":{"questionPrompts":["q1","q2","q3","q4","q5"],"callouts":["callout 1","callout 2","callout 3"],"memberSpotlight":{"template":"how to spotlight","cta":"how to get featured"}},"weeklyRhythm":[{"day":"Monday","content":"what to post","purpose":"why this day"}]}`;

const REVIEW_PROMPT = `You are a social media performance analyst for @everydayelevations. ${SWARBRICK}
Analyze top and bottom performing posts and return ONLY JSON:
{"weekSummary":"2-3 sentence summary","winningPatterns":["pattern 1","pattern 2","pattern 3"],"losingPatterns":["pattern 1","pattern 2","pattern 3"],"topPost":{"title":"","whyItWorked":"","whatToReplicate":""},"bottomPost":{"title":"","whyItFailed":"","whatToFix":""},"nextWeekPlan":{"focus":"what to double down on","avoid":"what to stop doing","testIdeas":["test 1","test 2"],"suggestedTopics":["topic 1","topic 2","topic 3","topic 4","topic 5"]},"growthInsight":"single most important strategic insight","swarbrickGap":"which wellness dimension is underrepresented"}`;

const PROFILE_PROMPT = `You are a social media profile optimizer for @everydayelevations. ${VOICE}
Jason Fricka: veteran, mindset coach, endurance athlete, HR professional, Colorado father, podcast host (Everyday Elevations), real estate agent (Fricka Sells Colorado), Elevation Nation community builder.
Return ONLY JSON:
{"instagram":{"bio":"optimized IG bio under 150 chars with line breaks","highlights":["Highlight 1","Highlight 2","Highlight 3","Highlight 4","Highlight 5"],"linkInBio":"what should be in link in bio","pinnedPost":"what to pin","callToAction":"primary CTA in bio"},"youtube":{"channelDescription":"full channel description","channelKeywords":["kw1","kw2","kw3","kw4","kw5"],"aboutSection":"full about section text"},"facebook":{"pageDescription":"Facebook page description","coverPhotoDirection":"visual direction","aboutSection":"full about section"},"linkedin":{"headline":"LinkedIn headline under 120 chars","about":"full about section 300-500 words","featuredSection":["feature 1","feature 2","feature 3"],"skillsToAdd":["skill 1","skill 2","skill 3","skill 4","skill 5"],"dualLaneBalance":"how to balance HR expertise vs podcast/coaching"}}`;

const COLLAB_PROMPT = `You are a collaboration strategist for @everydayelevations. ${VOICE}
Return ONLY JSON:
{"guestTargets":[{"name":"creator or expert name","handle":"@handle if known","platform":"strongest platform","niche":"their niche","followerRange":"estimated followers","whyPerfect":"why this collab works","pitchAngle":"how Jason should approach","contentIdea":"specific episode idea","mutualBenefit":"what they get"}],"stitchTargets":[{"creator":"name or type","contentType":"what they post","stitchAngle":"how Jason responds"}],"communityPartnerships":[{"organization":"org name","type":"partnership type","collaborationIdea":"specific idea"}],"pitchTemplate":{"subject":"email/DM subject","opening":"first line","body":"pitch body 2-3 sentences","cta":"what you ask for"}}
Find 8-10 guest targets, 5 stitch targets, 3 community partnerships.`;

const ONBOARD_PROMPT = `You are a senior social media strategist at Greenspan Consulting. ${GREENSPAN_SOP} ${SWARBRICK}
Generate a complete 90-day strategy. Return ONLY JSON:
{"clientName":"","brandName":"","strategyPeriod":"90 days","primaryGoal":"","primaryPlatforms":[],"brandPositioning":"","socialIdentity":[{"label":"","description":""}],"messagingTransformation":[{"from":"","to":""}],"uniquePositioning":"","idealClientTiers":[{"tier":"","description":"","strategy":""}],"contentPillars":[{"pillar":"","description":"","wellnessDimension":"","topics":["t1","t2","t3"]}],"platformStrategy":[{"platform":"","role":"","contentMix":"","cadence":""}],"contentDistribution":{"reels":22,"carousels":6,"statics":2,"youtubeEpisodes":4,"stories":"daily"},"goals90Day":[{"platform":"","metrics":[]}],"testsExperiments":[{"test":"","variantA":"","variantB":"","metric":""}],"emailStrategy":{"leadMagnets":[],"ctaDistribution":"60/20/20","keywordTriggers":[]},"postingEngagementSOP":[{"activity":"","timing":"","frequency":""}],"campaignPhases":[{"phase":"","days":"","goal":"","tactics":[]}],"successMetrics":{"primary":[],"secondary":[]},"implementationTimeline":[{"week":"","label":"","actions":[]}],"attractRepel":{"attract":[],"repel":[]}}`;

const DESIGN_PROMPT = `You are a social media content designer for @everydayelevations. Brand: Navy #0A1628, Red #E94560, White #FFFFFF. ${SWARBRICK}
Return ONLY JSON:
{"carousel":{"title":"series title","slideCount":6,"slides":[{"slideNumber":1,"type":"cover","headline":"bold hook","subtext":"1 line support","visualDirection":"background/image direction"}],"caption":"full Instagram caption","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"]},"static":{"headline":"bold headline under 8 words","subtext":"supporting line under 12 words","bodyText":"2-3 sentences","cta":"short action phrase","visualDirection":"image/background concept","caption":"full Instagram caption","hashtags":["#t1","#t2","#t3","#t4","#t5","#t6","#t7"]}}`;

const EP_PROMPT = `You are the Elevation Nation Content Intelligence Engine for @everydayelevations. ${SWARBRICK} ${VOICE}
Analyze pasted Perplexity research. Return ONLY JSON:
{"summary":"2-3 sentence synthesis","elevationNationAngle":"how to leverage community identity","competitors":[{"handle":"@h","insight":"tactical insight","threat":"low|medium|high"}],"contentGaps":[{"gap":"title","description":"why it matters","priority":"high|medium|low","format":"Reel|Carousel|Story|All","wellnessDimension":"dimension"}],"reelIdeas":[{"title":"hook-driven title","hook":"exact opening line","why":"why drives follows","cta":"specific CTA","wellnessDimension":"dimension"}],"growthTactics":[{"tactic":"name","description":"how to execute","effort":"low|medium|high","impact":"low|medium|high"}]}`;

const TIER_PROMPTS = {
  "Tier 1": "Who is the core audience following health and wellness mindset podcasts on Instagram in 2026? Break down by age, pain points, content consumption habits, and what motivates them to follow a new account. Compare @hubermanlab, @jayshetty, and @richroll audiences. Sources not older than 3 months.",
  "Tier 2": "Analyze the content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, and @richroll on Instagram. For each: their 3 core content themes, what topic they own, and gaps where audience demand exists but nobody is filling it.",
  "Tier 3": "Which health and wellness Instagram creators had the fastest organic follower growth in Q1 2026 and what specific tactics preceded those spikes? Focus on accounts under 100K followers.",
  "Tier 4": "Research the top 5 fastest-growing health and wellness podcast Instagram accounts right now. For each: follower count, growth rate, content format breakdown, posting frequency, and the single tactic most responsible for their growth.",
};

const VAULT_TABS = [
  { id:"market", label:"Market Research", icon:"🔍", color:"#1B4F72", sections:[
    { title:"Tier 1 -- Audience Intelligence", color:"#1B4F72", when:"Run first", prompts:[
      "Who is the core audience following health and wellness mindset podcasts on Instagram in 2026? Break down by age, pain points, content consumption habits, and what motivates them to follow a new account. Compare @hubermanlab, @jayshetty, and @richroll audiences specifically. Sources not older than 3 months.",
      "What emotional triggers cause someone to follow a health and wellness Instagram account vs. just watching one video and leaving? Pull from recent social behavior studies, Reddit discussions, and creator interviews from the past 6 months.",
      "What are the top audience complaints about health and wellness podcast Instagram accounts? Search Reddit, YouTube comments, and podcast review threads -- what do followers wish these creators did differently?",
    ]},
    { title:"Tier 2 -- Content Gap & Positioning", color:"#145A32", when:"Run second", prompts:[
      "Analyze the content pillars of @hubermanlab, @jayshetty, @mindpumpmedia, and @richroll on Instagram. For each: their 3 core content themes, what topic they own that nobody else does, and gaps where audience demand exists but nobody is filling it.",
      "What health and wellness Instagram content formats are generating the highest follower conversion rates in early 2026? Focus on Reels under 90 seconds.",
      "Analyze the top 10 performing content pieces from @hubermanlab, @jayshetty, @richroll in the past 3 months. What themes, formats, and hooks appear most frequently?",
    ]},
    { title:"Tier 3 -- Growth Mechanics", color:"#6E2F8E", when:"Run third", prompts:[
      "Which health and wellness Instagram creators had the fastest organic follower growth in Q1 2026 and what specific tactics preceded those spikes? Focus on accounts under 100K followers who broke through.",
      "What collaboration patterns are driving the most follower growth for mid-size health and wellness podcast Instagram accounts right now?",
      "Analyze how @jayshetty built his Instagram community identity -- specifically how he named his audience, when he introduced that naming convention, and how it affected his engagement and growth metrics.",
    ]},
    { title:"Tier 4 -- Deep Dive Research", color:"#7E5109", when:"Run fourth", prompts:[
      "Social media audit of top wellness podcast Instagram accounts -- posting cadence, content pillars, engagement patterns, growth signals. Comparison table with @hubermanlab, @jayshetty, @richroll, @mindpumpmedia as columns. Sources not older than 3 months.",
      "What questions are health and wellness audiences asking most on Reddit, Quora, and YouTube comments in early 2026? Group by theme and identify which ones no major creator is answering consistently.",
      "Research the top 5 fastest-growing health and wellness podcast Instagram accounts right now. For each: follower count, growth rate, content format breakdown, posting frequency, and the single tactic most responsible for their growth.",
    ]},
  ]},
  { id:"instagram", label:"Instagram", icon:"📸", color:"#E94560", sections:[
    { title:"Instagram Diagnostics -- @everydayelevations", color:"#E94560", when:"Run in order", prompts:[
      "Analyze the Instagram profile @everydayelevations. What does the bio, highlight structure, pinned content, and posting frequency signal to a first-time visitor? What specific elements would cause someone to leave without following?",
      "Compare the content style, hook patterns, caption length, and posting frequency of @everydayelevations vs @jayshetty and @hubermanlab. Where is @everydayelevations losing potential followers in the first 3 seconds of a Reel?",
      "What specific elements are missing from @everydayelevations Instagram that accounts with 50K-200K followers in the health and mindset space consistently have?",
      "Analyze the last 30 days of visible content from @everydayelevations on Instagram. Is there a clear content identity and brand voice? Does each post reinforce a single clear message?",
      "What are the most common reasons a health and wellness Instagram account stays stuck under 10K followers despite consistent posting? Which of these blockers apply to @everydayelevations?",
    ]},
  ]},
  { id:"facebook", label:"Facebook", icon:"👥", color:"#1877F2", sections:[
    { title:"Facebook Diagnostics -- facebook.com/jason.fricka", color:"#1877F2", when:"Run in order", prompts:[
      "Analyze the Facebook profile facebook.com/jason.fricka. What does the current page structure, about section, and content mix signal to someone discovering Jason Fricka for the first time?",
      "How does Facebook's 2026 algorithm treat health and wellness mindset content from personal profiles vs. pages? What content formats are getting the most organic reach?",
      "What are the top Facebook growth strategies working for health and wellness coaches and podcast hosts in 2026? How does facebook.com/jason.fricka compare to these benchmarks?",
      "What Facebook community-building tactics are driving the most engagement for mindset and wellness creators right now? Should @everydayelevations be running a Facebook Group?",
      "How can Jason Fricka at facebook.com/jason.fricka best repurpose Instagram and podcast content for Facebook without it feeling like cross-posted filler?",
    ]},
  ]},
  { id:"youtube", label:"YouTube", icon:"▶️", color:"#CC0000", sections:[
    { title:"YouTube Diagnostics -- @everydayelevations", color:"#CC0000", when:"Run in order", prompts:[
      "Analyze the YouTube channel youtube.com/@everydayelevations. What does the channel art, about section, playlist structure, and upload frequency signal to a first-time visitor?",
      "What YouTube SEO strategies are working best for health and wellness podcast channels in 2026? What keywords, thumbnail styles, and title formats are driving the most discovery?",
      "How does YouTube's algorithm in 2026 treat long-form podcast content vs. short-form clips for health and wellness creators? What is the optimal content mix?",
      "What are the most common reasons a health and wellness YouTube channel stays under 1K subscribers despite good content? Which blockers apply to youtube.com/@everydayelevations?",
      "How can youtube.com/@everydayelevations best use YouTube Shorts in 2026 to drive subscribers to long-form content?",
    ]},
  ]},
  { id:"linkedin", label:"LinkedIn", icon:"💼", color:"#0A66C2", sections:[
    { title:"LinkedIn Diagnostics -- Jason Fricka (HR + Podcast Dual Lane)", color:"#0A66C2", when:"Run in order", prompts:[
      "Analyze the LinkedIn profile linkedin.com/in/jason-fricka. He operates in two professional lanes: HR leadership (Highland Cabinetry HR Manager, HiBob HRIS) and health/wellness mindset coaching via Everyday Elevations podcast. Is the current profile clearly communicating both lanes?",
      "What LinkedIn content strategy would allow Jason Fricka to build authority in both HR leadership and health/wellness mindset coaching without the two lanes conflicting?",
      "What are the fastest-growing LinkedIn content formats for HR professionals in 2026? How can Jason leverage his Highland Cabinetry HR experience and veteran background to build a People & Culture following?",
      "What LinkedIn content formats and topics are driving the most growth for mindset coaches and podcast hosts in 2026? How can Jason bridge Everyday Elevations with his professional HR audience?",
      "How should Jason Fricka position the Everyday Elevations podcast on LinkedIn to attract both HR professionals and general professionals interested in personal growth?",
    ]},
  ]},
  { id:"crossplatform", label:"Cross-Platform", icon:"🌐", color:"#6E2F8E", sections:[
    { title:"Cross-Platform Strategy", color:"#6E2F8E", when:"Run after individual audits", prompts:[
      "Analyze brand consistency of Jason Fricka across Instagram (@everydayelevations), Facebook (facebook.com/jason.fricka), YouTube (youtube.com/@everydayelevations), and LinkedIn (linkedin.com/in/jason-fricka). Where does messaging break down?",
      "What content from Everyday Elevations podcast and @everydayelevations Instagram is being left on the table in terms of repurposing across Facebook, YouTube, and LinkedIn? Build a repurposing framework.",
      "What is the optimal cross-platform posting sequence for a health and wellness podcast creator in 2026? If Jason records one episode, what is the ideal workflow to extract maximum content?",
      "Which platform should be Jason Fricka's primary growth focus in 2026 given his goals? Rank platforms by growth potential and explain the sequencing strategy.",
      "What cross-platform collaboration opportunities exist for a veteran health and wellness podcast host in Colorado? Which creator types would make the strongest cross-promotion partners?",
    ]},
  ]},
];

// ── HOME ─────────────────────────────────────────────────────────────────────

function Home({ go }) {
  const cards = [
    { section:"strategy", sub:"onboard",    icon:"📋", label:"Onboarding",          desc:"Generate your 90-day strategy document using Greenspan's proven framework." },
    { section:"strategy", sub:"calendar",   icon:"📅", label:"Content Calendar",     desc:"Build a 30-day content plan with specific topics, hooks, and CTAs per day." },
    { section:"strategy", sub:"profile",    icon:"👤", label:"Profile Audit",        desc:"Optimize your bio and profile across all 4 platforms in one generation." },
    { section:"strategy", sub:"magnet",     icon:"🧲", label:"Lead Magnet Builder",  desc:"Create a complete lead magnet concept with delivery Reel and email sequence." },
    { section:"strategy", sub:"community",  icon:"🏔️", label:"Community Builder",    desc:"Build Elevation Nation -- challenges, naming conventions, engagement templates." },
    { section:"research", sub:"pipeline",   icon:"🚀", label:"Full Pipeline",        desc:"One button: Perplexity research → Claude extraction → camera-ready script." },
    { section:"research", sub:"vault",      icon:"🗂️", label:"Prompt Vault",         desc:"25+ research and diagnostic prompts across 6 platform tabs." },
    { section:"research", sub:"collab",     icon:"🤝", label:"Collab Finder",        desc:"Find guest targets, stitch creators, and community partnership opportunities." },
    { section:"research", sub:"extract",    icon:"🔍", label:"Insight Extractor",    desc:"Paste Perplexity research. Get competitor intel, gaps, Reel ideas, tactics." },
    { section:"create",   sub:"script",     icon:"🎬", label:"Script Engine",        desc:"3 script variations per topic -- Educational, Trend-Responsive, Personal Story." },
    { section:"create",   sub:"episode",    icon:"🎙️", label:"Episode-to-Clips",     desc:"Turn one podcast episode into 5-7 platform-native short-form clips." },
    { section:"create",   sub:"repurpose",  icon:"♻️", label:"Repurpose Engine",     desc:"One script → adapted natively for Instagram, YouTube, Facebook, LinkedIn." },
    { section:"create",   sub:"hooks",      icon:"🎣", label:"Hook Library",         desc:"40 proven hooks organized by type -- pattern interrupt, question, story, data." },
    { section:"create",   sub:"design",     icon:"🎨", label:"Design Studio",        desc:"Carousel + static post concepts with slide copy and visual direction." },
    { section:"optimize", sub:"review",     icon:"📊", label:"Weekly Review",        desc:"Paste your top and bottom posts -- get data-driven next week recommendations." },
  ];
  return (
    <div style={{ padding:"32px 40px" }}>
      <div style={{ background:B.navy, borderRadius:16, padding:"28px 32px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, right:0, width:"40%", height:"100%", background:`radial-gradient(ellipse at top right, ${B.red}30 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:4, color:B.red, marginBottom:6 }}>ELEVATION NATION CONTENT INTELLIGENCE SYSTEM</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:2, color:B.white, lineHeight:1.1, marginBottom:8 }}>EN·CIS</div>
        <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, lineHeight:1.7, maxWidth:480 }}>Research. Strategy. Scripts. Design. All 4 platforms. Greenspan SOP + Swarbrick 8 Dimensions baked in.</div>
        <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap" }}>
          {[["15 tools","complete system"],["4 platforms","one workflow"],["8 angles","8 dimensions"]].map(([n,l],i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 14px" }}>
              <div style={{ color:B.red, fontSize:14, fontWeight:800, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{n}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
        {cards.map((c, i) => (
          <div key={i} onClick={() => go(c.section, c.sub)}
            style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=B.red; e.currentTarget.style.boxShadow="0 4px 12px rgba(233,69,96,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=B.border; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; }}>
            <div style={{ fontSize:20, marginBottom:8 }}>{c.icon}</div>
            <div style={{ color:B.navy, fontWeight:700, fontSize:14, marginBottom:4 }}>{c.label}</div>
            <div style={{ color:B.textLight, fontSize:12, lineHeight:1.6 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ONBOARDING ───────────────────────────────────────────────────────────────

function Onboarding() {
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [section, setSection] = useState(0);
  const [form, setForm] = useState({
    clientName:"Jason Fricka", brandName:"Everyday Elevations",
    primaryGoal:"Grow @everydayelevations and establish thought leadership in health, wellness, and mindset",
    platforms:"Instagram (Primary), YouTube (Authority), Facebook (Support), LinkedIn (HR + Podcast)",
    brandPersonality:"Conversational, Direct, Authentic, Veteran, Resilient",
    idealClient:"Everyday people on a health and wellness journey. Veterans, professionals, parents, endurance athletes. Ages 25-55. Want real talk, not hype.",
    transformation:"From feeling stuck and without direction -- to showing up every day with purpose, mental toughness, and small wins that compound.",
    contentPillars:"Veteran/Resilience, Mindset, Everyday Wins, Outdoor/Community, Finance/Real Estate, Podcast/Personal Growth, Family/Life Lessons, Health/Physical Wellness",
    competitors:"@hubermanlab, @jayshetty, @richroll, @mindpumpmedia",
    primaryCTA:"Comment NATION, follow for daily elevation, DM for coaching",
    goals90Day:"Grow Instagram following, establish consistent content cadence, launch Elevation Nation community identity, build email list",
    additionalContext:"Community: Elevation Nation. Tagline: Everyday people who refuse to stay where they are. Jason is a veteran, mindset coach, endurance athlete, HR professional, Colorado father, podcast host, real estate agent.",
  });
  function upd(k,v) { setForm(f => ({...f,[k]:v})); }
  async function generate() {
    setLoad(true); setErr(null); setResult(null);
    try {
      const intake = Object.entries(form).map(([k,v]) => `${k}: ${v}`).join('\n');
      const d = await ai(ONBOARD_PROMPT, `Generate complete 90-day strategy for:\n\n${intake}`);
      setResult(d); setSection(0);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const SECS = ["Brand","Messaging","Ideal Client","Content Pillars","Platforms","Distribution","Goals","Tests","Email","SOP","Phases","Metrics","Timeline"];
  const fields = [
    {k:"clientName",l:"Client Name"},{k:"brandName",l:"Brand Name"},{k:"primaryGoal",l:"Primary Goal",multi:true},
    {k:"platforms",l:"Platforms"},{k:"brandPersonality",l:"Brand Personality"},{k:"idealClient",l:"Ideal Client",multi:true},
    {k:"transformation",l:"Desired Transformation",multi:true},{k:"contentPillars",l:"Content Pillars"},
    {k:"competitors",l:"Inspiration Accounts"},{k:"primaryCTA",l:"Primary CTA"},
    {k:"goals90Day",l:"90-Day Goals",multi:true},{k:"additionalContext",l:"Additional Context",multi:true},
  ];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="ONBOARDING" subtitle="Complete intake form to generate a full 90-day strategy document using Greenspan's framework." />
      {!result ? (
        <>
          <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#1E40AF" }}>
            Pre-filled for @everydayelevations. Review, edit anything needed, then generate.
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
            {fields.map(f => (
              <div key={f.k}>
                <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:5 }}>{f.l}</label>
                {f.multi
                  ? <textarea value={form[f.k]} onChange={e => upd(f.k,e.target.value)} rows={2} style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:7, padding:"10px 12px", fontSize:12, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
                  : <input value={form[f.k]} onChange={e => upd(f.k,e.target.value)} style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:7, padding:"10px 12px", fontSize:12, fontFamily:"'Barlow',sans-serif" }} />
                }
              </div>
            ))}
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load}>{load ? <><Spin />Generating Strategy...</> : "📋 Generate 90-Day Strategy"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>{result.clientName} -- 90-Day Strategy</div>
              <div style={{ color:B.textLight, fontSize:12 }}>{result.strategyPeriod} · {result.primaryPlatforms?.join(" · ")}</div>
            </div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Regenerate</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
            {SECS.map((s,i) => (
              <button key={i} onClick={() => setSection(i)}
                style={{ background:section===i?B.navy:B.white, color:section===i?B.white:B.textMid, border:`1px solid ${section===i?B.navy:B.border}`, borderRadius:16, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                {s}
              </button>
            ))}
          </div>
          {section===0 && <Card><SecLabel text="Brand Positioning" /><div style={{ color:B.text, fontSize:13, lineHeight:1.8, fontStyle:"italic", marginBottom:12 }}>{result.brandPositioning}</div>{result.socialIdentity?.map((x,i) => <div key={i} style={{ display:"flex", gap:10, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${B.border}` }}><span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700, whiteSpace:"nowrap" }}>{x.label}</span><span style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{x.description}</span></div>)}<div style={{ background:B.navy, borderRadius:8, padding:"12px 16px" }}><div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Unique Positioning</div><div style={{ color:B.white, fontSize:13, fontWeight:600, fontStyle:"italic" }}>{result.uniquePositioning}</div></div></Card>}
          {section===1 && <Card><SecLabel text="Messaging Transformation" /><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, border:`1px solid ${B.border}`, borderRadius:8, overflow:"hidden" }}><div style={{ background:B.offWhite, padding:"8px 12px", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:1, color:B.textLight, borderBottom:`1px solid ${B.border}` }}>Where They Start</div><div style={{ background:B.navy, padding:"8px 12px", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:1, color:B.red, borderBottom:`1px solid ${B.border}` }}>Where They End Up</div>{result.messagingTransformation?.map((x,i) => [<div key={"f"+i} style={{ padding:"8px 12px", borderBottom:`1px solid ${B.border}`, color:B.textMid, fontSize:12 }}>{x.from}</div>,<div key={"t"+i} style={{ padding:"8px 12px", borderBottom:`1px solid ${B.border}`, color:B.navy, fontSize:12, fontWeight:600, background:"#F0FDF4" }}>{x.to}</div>])}</div></Card>}
          {section===2 && <div><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:14 }}>{result.idealClientTiers?.map((t,i) => <Card key={i} style={{ borderTop:`3px solid ${B.red}`, marginBottom:0 }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:B.navy, marginBottom:4 }}>{t.tier}</div><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginBottom:6 }}>{t.description}</div><span style={{ background:B.navy, color:B.red, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{t.strategy}</span></Card>)}</div><Card><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}><div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderRadius:8, padding:"12px" }}><div style={{ color:"#14532D", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Attract</div>{result.attractRepel?.attract?.map((a,i) => <div key={i} style={{ color:"#14532D", fontSize:12, marginBottom:3 }}>+ {a}</div>)}</div><div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"12px" }}><div style={{ color:"#9B1C1C", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Repel</div>{result.attractRepel?.repel?.map((r,i) => <div key={i} style={{ color:"#9B1C1C", fontSize:12, marginBottom:3 }}>- {r}</div>)}</div></div></Card></div>}
          {section===3 && <div>{result.contentPillars?.map((p,i) => <Card key={i}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}><span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>P{i+1}</span><span style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{p.pillar}</span>{p.wellnessDimension && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"1px 7px", fontSize:10 }}>{p.wellnessDimension}</span>}</div><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginBottom:8 }}>{p.description}</div><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{p.topics?.map((t,j) => <span key={j} style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{t}</span>)}</div></Card>)}</div>}
          {section===4 && <div>{result.platformStrategy?.map((p,i) => <Card key={i} style={{ borderTop:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:B.navy }}>{p.platform}</div><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{p.cadence}</span></div><div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Role</div><div style={{ color:B.textMid, fontSize:12, marginBottom:8 }}>{p.role}</div><div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Content Mix</div><div style={{ color:B.textMid, fontSize:12 }}>{p.contentMix}</div></Card>)}</div>}
          {section===5 && <Card><SecLabel text="Monthly Content Distribution" /><div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>{Object.entries(result.contentDistribution||{}).map(([k,v],i) => <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px", textAlign:"center" }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:B.red, lineHeight:1 }}>{v}</div><div style={{ color:B.textMid, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginTop:3 }}>{k}</div></div>)}</div></Card>}
          {section===6 && <div>{result.goals90Day?.map((g,i) => <Card key={i}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, color:B.navy, letterSpacing:1, marginBottom:8 }}>{g.platform}</div>{g.metrics?.map((m,j) => <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}><div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} /><div style={{ color:B.text, fontSize:12 }}>{m}</div></div>)}</Card>)}</div>}
          {section===7 && <Card><SecLabel text="Tests & Experiments" /><div style={{ overflowX:"auto" }}><table style={{ width:"100%", borderCollapse:"collapse" }}><thead><tr style={{ background:B.navy }}>{["Test","Variant A","Variant B","Metric"].map(h => <th key={h} style={{ padding:"8px 10px", color:B.white, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, textAlign:"left" }}>{h}</th>)}</tr></thead><tbody>{result.testsExperiments?.map((t,i) => <tr key={i} style={{ background:i%2===0?B.offWhite:B.white }}><td style={{ padding:"8px 10px", color:B.navy, fontWeight:700, fontSize:11 }}>{t.test}</td><td style={{ padding:"8px 10px", color:B.textMid, fontSize:11 }}>{t.variantA}</td><td style={{ padding:"8px 10px", color:B.textMid, fontSize:11 }}>{t.variantB}</td><td style={{ padding:"8px 10px", color:B.red, fontSize:11, fontWeight:600 }}>{t.metric}</td></tr>)}</tbody></table></div></Card>}
          {section===8 && <Card><SecLabel text="Email & Lead Magnet Strategy" /><div style={{ marginBottom:12 }}>{result.emailStrategy?.leadMagnets?.map((m,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.red }} /><div style={{ color:B.text, fontSize:12 }}>{m}</div></div>)}</div><div style={{ background:B.navy, borderRadius:8, padding:"12px", marginBottom:10 }}><div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>CTA Distribution</div><div style={{ color:B.white, fontSize:12 }}>{result.emailStrategy?.ctaDistribution}</div></div><div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>{result.emailStrategy?.keywordTriggers?.map((k,i) => <span key={i} style={{ background:B.red, color:B.white, borderRadius:4, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{k}</span>)}</div></Card>}
          {section===9 && <Card><SecLabel text="Posting & Engagement SOP" />{result.postingEngagementSOP?.map((x,i) => <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, paddingBottom:8, marginBottom:8, borderBottom:`1px solid ${B.border}` }}><div style={{ color:B.text, fontSize:12, fontWeight:600 }}>{x.activity}</div><div style={{ color:B.red, fontSize:11, fontWeight:700 }}>{x.timing}</div><div style={{ color:B.textLight, fontSize:11 }}>{x.frequency}</div></div>)}</Card>}
          {section===10 && <div>{result.campaignPhases?.map((p,i) => <Card key={i} style={{ borderLeft:`3px solid ${i===0?B.red:i===1?B.gold:B.green}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><div><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:B.navy }}>{p.phase}</div><div style={{ color:B.textLight, fontSize:11 }}>{p.days}</div></div><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{p.goal}</span></div>{p.tactics?.map((t,j) => <div key={j} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.red }} /><div style={{ color:B.textMid, fontSize:12 }}>{t}</div></div>)}</Card>)}</div>}
          {section===11 && <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}><Card><SecLabel text="Primary Metrics" />{result.successMetrics?.primary?.map((m,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}><div style={{ width:7, height:7, borderRadius:"50%", background:B.red }} /><div style={{ color:B.text, fontSize:12, fontWeight:600 }}>{m}</div></div>)}</Card><Card><SecLabel text="Secondary Metrics" />{result.successMetrics?.secondary?.map((m,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}><div style={{ width:7, height:7, borderRadius:"50%", background:B.border }} /><div style={{ color:B.textMid, fontSize:12 }}>{m}</div></div>)}</Card></div>}
          {section===12 && <div>{result.implementationTimeline?.map((x,i) => <div key={i} style={{ display:"flex", gap:14, marginBottom:14 }}><div style={{ background:B.navy, color:B.white, borderRadius:8, padding:"10px 12px", minWidth:80, textAlign:"center", alignSelf:"flex-start" }}><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:B.red, letterSpacing:1 }}>{x.week}</div><div style={{ color:"rgba(255,255,255,0.6)", fontSize:9, marginTop:1 }}>{x.label}</div></div><Card style={{ flex:1, marginBottom:0 }}>{x.actions?.map((a,j) => <div key={j} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.red }} /><div style={{ color:B.textMid, fontSize:12 }}>{a}</div></div>)}</Card></div>)}</div>}
        </div>
      )}
    </div>
  );
}

// ── CONTENT CALENDAR ─────────────────────────────────────────────────────────

function ContentCalendar() {
  const [angle, setAngle] = useState("");
  const [theme, setTheme] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [cp, setCp] = useState("");
  async function generate() {
    if (!angle) return;
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    try {
      const d = await ai(CALENDAR_PROMPT, `Primary angle: ${a?.label}\nTheme: ${theme || "Elevation Nation -- everyday people who refuse to stay where they are"}\nGenerate 30-day calendar for @everydayelevations`);
      setResult(d); setActiveWeek(0);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const fmtColors = { Reel:"#E94560", Carousel:"#1B4F72", Static:"#27AE60" };
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="CONTENT CALENDAR" subtitle="30-day content plan with specific topics, hooks, and CTAs. Greenspan weekly framework baked in." />
      {!result ? (
        <>
          <SOPBadge />
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Primary Content Angle</label>
            <AngleGrid value={angle} onChange={setAngle} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Monthly Theme <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Building the unbreakable foundation"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load || !angle}>{load ? <><Spin />Building Calendar...</> : "📅 Generate 30-Day Calendar"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>{result.month} -- {result.theme}</div>
              <div style={{ color:B.textLight, fontSize:12 }}>~{result.weeks?.reduce((a,w) => a+(w.posts?.length||0),0)} posts</div>
            </div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Calendar</button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {result.weeks?.map((w,i) => (
              <button key={i} onClick={() => setActiveWeek(i)}
                style={{ background:activeWeek===i?B.navy:B.white, color:activeWeek===i?B.white:B.textMid, border:`1px solid ${activeWeek===i?B.navy:B.border}`, borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", flex:1 }}>
                Week {w.week}
              </button>
            ))}
          </div>
          {result.weeks?.[activeWeek] && (
            <div>
              <Card style={{ background:"#F0F7FF", borderColor:"#BFDBFE" }}>
                <div style={{ color:"#1B4F72", fontWeight:700, fontSize:13 }}>Week {result.weeks[activeWeek].week}: {result.weeks[activeWeek].theme}</div>
                <div style={{ color:"#1E40AF", fontSize:12, marginTop:3 }}>{result.weeks[activeWeek].objective}</div>
              </Card>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {result.weeks[activeWeek].posts?.map((post,i) => (
                  <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>Day {post.day}</span>
                        <span style={{ background:fmtColors[post.format]||B.navy, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{post.format}</span>
                        {post.wellnessDimension && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"1px 7px", fontSize:10 }}>{post.wellnessDimension}</span>}
                      </div>
                      <CopyBtn text={`Topic: ${post.topic}\nHook: ${post.hook}\nCTA: ${post.cta}\nCaption: ${post.caption}`} label="copy" copiedLabel="✓" id={`p${i}`} cp={cp} setCp={setCp} />
                    </div>
                    <div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:4 }}>{post.topic}</div>
                    <div style={{ color:B.textMid, fontSize:12, fontStyle:"italic", marginBottom:4 }}>Hook: "{post.hook}"</div>
                    <div style={{ color:B.textLight, fontSize:12 }}>CTA: {post.cta} <span style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:3, padding:"1px 6px", fontSize:10, marginLeft:4 }}>{post.ctaType}</span></div>
                    {post.caption && <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:4 }}>{post.caption}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── PROFILE AUDIT ─────────────────────────────────────────────────────────────

function ProfileAudit() {
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [plat, setPlat] = useState("instagram");
  const [cp, setCp] = useState("");
  async function generate() {
    setLoad(true); setErr(null); setResult(null);
    try {
      const d = await ai(PROFILE_PROMPT, "Generate optimized profiles for all 4 platforms for @everydayelevations / Jason Fricka.");
      setResult(d);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const platTabs = [{ id:"instagram",label:"Instagram",icon:"📸" },{ id:"youtube",label:"YouTube",icon:"▶️" },{ id:"facebook",label:"Facebook",icon:"👥" },{ id:"linkedin",label:"LinkedIn",icon:"💼" }];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="PROFILE AUDIT" subtitle="AI-optimized bios, about sections, and profile structure for all 4 platforms in one generation." />
      {!result ? (
        <>
          <Card style={{ background:"#F0F7FF", borderColor:"#BFDBFE", marginBottom:20 }}>
            <div style={{ color:"#1B4F72", fontSize:12, lineHeight:1.7 }}>Generates optimized profiles for Instagram, YouTube, Facebook, and LinkedIn simultaneously -- bios, about sections, highlights, CTAs, and LinkedIn dual-lane positioning (HR + podcast).</div>
          </Card>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load}>{load ? <><Spin />Auditing Profiles...</> : "👤 Generate Profile Optimization"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Profile Optimization Ready</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Regenerate</button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {platTabs.map(p => <button key={p.id} onClick={() => setPlat(p.id)} style={{ background:plat===p.id?B.navy:B.white, color:plat===p.id?B.white:B.textMid, border:`1px solid ${plat===p.id?B.navy:B.border}`, borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><span>{p.icon}</span>{p.label}</button>)}
          </div>
          {plat==="instagram" && result.instagram && <div>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Bio" /><CopyBtn text={result.instagram.bio} id="igbio" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", fontWeight:600 }}>{result.instagram.bio}</div></Card>
            <Card><SecLabel text="Story Highlights" /><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{result.instagram.highlights?.map((h,i) => <span key={i} style={{ background:B.navy, color:B.white, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:700 }}>{h}</span>)}</div></Card>
            <Card><SecLabel text="Primary CTA" /><div style={{ color:B.text, fontSize:13 }}>{result.instagram.callToAction}</div></Card>
            <Card><SecLabel text="Link in Bio Strategy" /><div style={{ color:B.text, fontSize:13 }}>{result.instagram.linkInBio}</div></Card>
          </div>}
          {plat==="youtube" && result.youtube && <div>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Channel Description" /><CopyBtn text={result.youtube.channelDescription} id="ytdesc" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.youtube.channelDescription}</div></Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="About Section" /><CopyBtn text={result.youtube.aboutSection} id="ytabout" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.youtube.aboutSection}</div></Card>
            <Card><SecLabel text="Channel Keywords" /><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{result.youtube.channelKeywords?.map((k,i) => <span key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, color:B.text, borderRadius:6, padding:"5px 12px", fontSize:12 }}>{k}</span>)}</div></Card>
          </div>}
          {plat==="facebook" && result.facebook && <div>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Page Description" /><CopyBtn text={result.facebook.pageDescription} id="fbdesc" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.facebook.pageDescription}</div></Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="About Section" /><CopyBtn text={result.facebook.aboutSection} id="fbabout" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.facebook.aboutSection}</div></Card>
            <Card><SecLabel text="Cover Photo Direction" /><div style={{ color:B.textMid, fontSize:12, fontStyle:"italic" }}>📸 {result.facebook.coverPhotoDirection}</div></Card>
          </div>}
          {plat==="linkedin" && result.linkedin && <div>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Headline" /><CopyBtn text={result.linkedin.headline} id="lihead" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:15, fontWeight:700 }}>{result.linkedin.headline}</div></Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="About Section" /><CopyBtn text={result.linkedin.about} id="liabout" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result.linkedin.about}</div></Card>
            <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #0A66C2`, borderRadius:8, padding:"12px 14px", marginBottom:14 }}><div style={{ color:"#0A66C2", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Dual-Lane Balance</div><div style={{ color:"#1E40AF", fontSize:12, lineHeight:1.6 }}>{result.linkedin.dualLaneBalance}</div></div>
            <Card><SecLabel text="Featured Section" />{result.linkedin.featuredSection?.map((f,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}><div style={{ width:5, height:5, borderRadius:"50%", background:"#0A66C2" }} /><div style={{ color:B.text, fontSize:12 }}>{f}</div></div>)}</Card>
          </div>}
        </div>
      )}
    </div>
  );
}

// ── LEAD MAGNET ───────────────────────────────────────────────────────────────

function LeadMagnet() {
  const [angle, setAngle] = useState("");
  const [focus, setFocus] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [cp, setCp] = useState("");
  async function generate() {
    if (!angle) return;
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    try {
      const d = await ai(MAGNET_PROMPT, `Content angle: ${a?.label}\nWellness focus: ${focus || "general elevation and mindset"}\nCreate lead magnet for @everydayelevations Elevation Nation community.`);
      setResult(d);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="LEAD MAGNET BUILDER" subtitle="Complete lead magnet concept with outline, delivery Reel script, and email sequence." />
      {!result ? (
        <>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <AngleGrid value={angle} onChange={setAngle} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Wellness Focus <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <input value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. morning routines, financial freedom, veteran transition..."
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load || !angle}>{load ? <><Spin />Building Lead Magnet...</> : "🧲 Generate Lead Magnet"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>{result.title}</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Magnet</button>
          </div>
          <div style={{ background:B.navy, borderRadius:12, padding:"20px 24px", marginBottom:16 }}>
            <div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>One-Line Pitch</div>
            <div style={{ color:B.white, fontSize:15, fontWeight:600, fontStyle:"italic", marginBottom:8 }}>{result.hook}</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <span style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", borderRadius:4, padding:"2px 8px", fontSize:11 }}>{result.format}</span>
              {result.wellnessDimensions?.map((d,i) => <span key={i} style={{ background:"rgba(233,69,96,0.2)", color:B.red, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{d}</span>)}
            </div>
          </div>
          <Card><SecLabel text="Content Outline" />{result.sections?.map((s,i) => <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${B.border}` }}><div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:6 }}>Section {i+1}: {s.title}</div>{s.keyPoints?.map((p,j) => <div key={j} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.red }} /><div style={{ color:B.textMid, fontSize:12 }}>{p}</div></div>)}</div>)}</Card>
          <Card style={{ borderLeft:`3px solid ${B.red}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <SecLabel text="Delivery Reel Script" />
              <CopyBtn text={(result.deliveryReel?.script||[]).join("\n")} label="copy script" copiedLabel="✓" id="reel" cp={cp} setCp={setCp} />
            </div>
            <div style={{ background:B.offWhite, borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
              <div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>Hook</div>
              <div style={{ color:B.navy, fontSize:14, fontWeight:700, fontStyle:"italic" }}>"{result.deliveryReel?.hook}"</div>
            </div>
            {result.deliveryReel?.script?.map((line,i) => <div key={i} style={{ color:B.text, fontSize:13, lineHeight:1.6, padding:"6px 0", borderBottom:`1px solid ${B.border}` }}>"{line}"</div>)}
            <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:6, padding:"8px 12px", marginTop:8 }}><div style={{ color:B.red, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>CTA</div><div style={{ color:B.navy, fontSize:13, fontWeight:700 }}>{result.deliveryReel?.cta}</div></div>
          </Card>
          <Card><SecLabel text="Email Sequence" />{result.emailSequence?.map((e,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:700 }}>Email {i+1}</span><span style={{ color:B.text, fontSize:12 }}>{e}</span></div>)}</Card>
          <Card><SecLabel text="Follow-Up CTA" /><div style={{ color:B.text, fontSize:13 }}>{result.followUpCTA}</div></Card>
        </div>
      )}
    </div>
  );
}

// ── COMMUNITY BUILDER ─────────────────────────────────────────────────────────

function CommunityBuilder() {
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("identity");
  const [cp, setCp] = useState("");
  async function generate() {
    setLoad(true); setErr(null); setResult(null);
    try {
      const d = await ai(COMMUNITY_PROMPT, "Build the complete Elevation Nation community system for @everydayelevations.");
      setResult(d);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const tabs = [{ id:"identity",label:"Identity" },{ id:"challenges",label:"Challenges" },{ id:"engagement",label:"Engagement" },{ id:"rhythm",label:"Weekly Rhythm" }];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="COMMUNITY BUILDER" subtitle="Build Elevation Nation -- naming conventions, challenges, engagement templates, and weekly rhythm." />
      {!result ? (
        <>
          <Card style={{ background:"#FFF7ED", borderColor:"#FED7AA", marginBottom:20 }}>
            <div style={{ color:"#92400E", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>Elevation Nation</div>
            <div style={{ color:"#78350F", fontSize:12, lineHeight:1.7 }}>Generates your community identity system -- member naming, content series names, community challenges, engagement templates, member spotlight framework, and a weekly posting rhythm.</div>
          </Card>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load}>{load ? <><Spin />Building Community...</> : "🏔️ Build Elevation Nation System"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Elevation Nation System</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Regenerate</button>
          </div>
          <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:`1px solid ${B.border}` }}>
            {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t.id?B.red:"transparent"}`, color:tab===t.id?B.navy:B.textLight, padding:"9px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t.label}</button>)}
          </div>
          {tab==="identity" && result.communityIdentity && (
            <div>
              <div style={{ background:B.navy, borderRadius:12, padding:"20px 24px", marginBottom:16 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:B.white, letterSpacing:2 }}>{result.communityIdentity.name}</div>
                <div style={{ color:B.red, fontSize:14, fontWeight:600, marginTop:4 }}>{result.communityIdentity.tagline}</div>
                <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, lineHeight:1.7, marginTop:8 }}>{result.communityIdentity.whoTheyAre}</div>
              </div>
              <Card><SecLabel text="Core Beliefs" />{result.communityIdentity.coreBeliefs?.map((b,i) => <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:8 }}><div style={{ background:B.red, color:B.white, borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div><div style={{ color:B.text, fontSize:13, lineHeight:1.6 }}>{b}</div></div>)}</Card>
              <Card><SecLabel text="Naming & Hashtags" /><div style={{ marginBottom:10 }}><div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Member Name</div><span style={{ background:B.navy, color:B.white, borderRadius:6, padding:"5px 14px", fontSize:13, fontWeight:700 }}>{result.namingConventions?.memberName}</span></div><div style={{ marginBottom:10 }}><div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Content Series</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{result.namingConventions?.contentSeries?.map((s,i) => <span key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, color:B.text, borderRadius:6, padding:"4px 12px", fontSize:12, fontWeight:600 }}>{s}</span>)}</div></div><div><div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Community Hashtags</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{result.namingConventions?.hashtags?.map((h,i) => <CopyBtn key={i} text={h} label={h} copiedLabel="✓" id={`ht${i}`} cp={cp} setCp={setCp} />)}</div></div></Card>
            </div>
          )}
          {tab==="challenges" && result.challenges && result.challenges.map((c,i) => (
            <Card key={i} style={{ borderLeft:`3px solid ${B.red}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{c.name}</div><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"2px 8px", fontSize:11 }}>{c.duration}</span></div>
              <div style={{ color:B.textMid, fontSize:12, marginBottom:8 }}>{c.hook}</div>
              <div style={{ color:B.textLight, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Daily Action</div>
              <div style={{ color:B.text, fontSize:12, marginBottom:8 }}>{c.dailyAction}</div>
              <div style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"8px 10px" }}>{c.announcementScript?.map((line,j) => <div key={j} style={{ color:B.text, fontSize:12, lineHeight:1.6, fontStyle:"italic" }}>"{line}"</div>)}</div>
            </Card>
          ))}
          {tab==="engagement" && result.engagementTemplates && (
            <div>
              <Card><SecLabel text="Question Prompts" />{result.engagementTemplates.questionPrompts?.map((q,i) => <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"10px 12px", marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between" }}><div style={{ color:B.text, fontSize:13 }}>{q}</div><CopyBtn text={q} id={`q${i}`} cp={cp} setCp={setCp} /></div></div>)}</Card>
              <Card><SecLabel text="Community Callouts" />{result.engagementTemplates.callouts?.map((c,i) => <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"10px 12px", marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between" }}><div style={{ color:B.text, fontSize:13, fontStyle:"italic" }}>"{c}"</div><CopyBtn text={c} id={`co${i}`} cp={cp} setCp={setCp} /></div></div>)}</Card>
              {result.engagementTemplates.memberSpotlight && <Card><SecLabel text="Member Spotlight" /><div style={{ color:B.text, fontSize:13, lineHeight:1.7, marginBottom:8 }}>{result.engagementTemplates.memberSpotlight.template}</div><div style={{ background:B.red, color:B.white, borderRadius:6, padding:"8px 12px" }}><div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>How to Get Featured</div><div style={{ fontSize:12 }}>{result.engagementTemplates.memberSpotlight.cta}</div></div></Card>}
            </div>
          )}
          {tab==="rhythm" && result.weeklyRhythm && result.weeklyRhythm.map((day,i) => (
            <div key={i} style={{ display:"flex", gap:14, marginBottom:10 }}>
              <div style={{ background:B.navy, color:B.white, borderRadius:8, padding:"10px 12px", minWidth:90, textAlign:"center", alignSelf:"flex-start" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:B.red, letterSpacing:1 }}>{day.day}</div>
              </div>
              <Card style={{ flex:1, marginBottom:0 }}>
                <div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:3 }}>{day.content}</div>
                <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>{day.purpose}</div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FULL PIPELINE ─────────────────────────────────────────────────────────────

function Pipeline() {
  const [tier, setTier] = useState("");
  const [angle, setAngle] = useState("");
  const [stage, setStage] = useState("idle");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [cp, setCp] = useState("");
  const [tab, setTab] = useState("script");
  async function run() {
    if (!tier || !angle) return;
    setStage("researching"); setErr(null); setResult(null);
    try {
      const research = await perp(TIER_PROMPTS[tier]);
      setStage("extracting");
      const a = ANGLES.find(x => x.id === angle);
      const extracted = await ai(PIPELINE_EXTRACT, `Angle: ${a?.label}\nResearch:\n${research}`);
      setStage("scripting");
      const topIdea = extracted.reelIdeas?.[0];
      const script = await ai(PIPELINE_SCRIPT, `Topic: ${topIdea?.title || extracted.topGap}\nAngle: ${a?.label}\nContext: ${extracted.elevationNationAngle}`);
      setResult({ extracted, script }); setStage("done");
    } catch { setErr("Pipeline failed. Check your Perplexity API key in Vercel."); setStage("idle"); }
  }
  const stageProgress = { researching:33, extracting:66, scripting:90, done:100, idle:0 };
  const stageLabels = { researching:"Researching market...", extracting:"Extracting intelligence...", scripting:"Writing script...", done:"Complete" };
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="FULL PIPELINE" subtitle="One button: Perplexity market research → Claude extraction → camera-ready script." />
      {stage==="idle" || stage==="done" ? (
        !result ? (
          <>
            <SOPBadge />
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Research Tier</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {[["Tier 1","Audience Intel"],["Tier 2","Content Gaps"],["Tier 3","Growth Tactics"],["Tier 4","Deep Research"]].map(([t,d]) => (
                  <div key={t} onClick={() => setTier(t)} style={{ background:tier===t?B.navy:B.white, border:`2px solid ${tier===t?B.navy:B.border}`, borderRadius:10, padding:"12px", cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:tier===t?B.red:B.textLight, letterSpacing:1 }}>{t.split(" ")[1]}</div>
                    <div style={{ color:tier===t?B.white:B.textMid, fontWeight:700, fontSize:11, marginTop:2 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
              <AngleGrid value={angle} onChange={setAngle} />
            </div>
            {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
            <RedBtn onClick={run} disabled={!tier || !angle}>🚀 Run Full Pipeline</RedBtn>
          </>
        ) : (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", gap:8 }}><span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{tier}</span><span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"2px 9px", fontSize:11, fontWeight:700 }}>{ANGLES.find(x=>x.id===angle)?.icon} {ANGLES.find(x=>x.id===angle)?.label}</span></div>
              <button onClick={() => { setResult(null); setStage("idle"); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Run Again</button>
            </div>
            <Card style={{ background:"#F0FDF4", borderColor:"#86EFAC" }}><SecLabel text="Research Summary" /><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.extracted.summary}</div></Card>
            <Card style={{ borderLeft:`3px solid ${B.red}` }}><SecLabel text="Top Gap" /><div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{result.extracted.topGap}</div></Card>
            <Card style={{ borderLeft:`3px solid ${B.gold}` }}><SecLabel text="Top Reel Idea" /><div style={{ color:B.navy, fontWeight:700, fontSize:14, marginBottom:4 }}>{result.extracted.reelIdeas?.[0]?.title}</div><div style={{ color:B.textMid, fontSize:13, fontStyle:"italic", marginBottom:4 }}>"{result.extracted.reelIdeas?.[0]?.hook}"</div></Card>
            <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:16 }}>
              {["script","caption","hashtags"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?B.red:"transparent"}`, color:tab===t?B.navy:B.textLight, padding:"9px 16px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>)}
            </div>
            {tab==="script" && <div>
              <Card style={{ background:"#FFFBF0", borderColor:"#FCD34D" }}><SecLabel text="On Screen Text" /><div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{result.script.onScreenText}"</div></Card>
              <Card style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><SecLabel text="Hook" /><CopyBtn text={result.script.hook} id="ph" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:16, fontWeight:700, fontStyle:"italic" }}>"{result.script.hook}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:3 }}>📹 {result.script.hookNote}</div></Card>
              <div style={{ marginBottom:12 }}><SecLabel text="Body" />{result.script.body?.map((line,i) => <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px", marginBottom:7 }}><div style={{ display:"flex", justifyContent:"space-between", gap:8 }}><div style={{ flex:1 }}><div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:3 }}>"{line}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {result.script.bodyNotes?.[i]}</div></div><CopyBtn text={line} id={`pb${i}`} cp={cp} setCp={setCp} /></div></div>)}</div>
              <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><SecLabel text="CTA" /><CopyBtn text={result.script.cta} id="pcta" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:14, fontWeight:700, fontStyle:"italic" }}>"{result.script.cta}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:3 }}>📹 {result.script.ctaNote}</div></Card>
            </div>}
            {tab==="caption" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(result.script.caption||"")+"\n\n"+(result.script.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="pcap" cp={cp} setCp={setCp} /></div><Card style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{result.script.caption}</Card></div>}
            {tab==="hashtags" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(result.script.hashtags||[]).join(" ")} label="Copy All" copiedLabel="✓ Copied" id="ptags" cp={cp} setCp={setCp} /></div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{result.script.hashtags?.map((tag,i) => <div key={i} onClick={() => { navigator.clipboard.writeText(tag); setCp(`pt${i}`); setTimeout(()=>setCp(""),1800); }} style={{ background:cp===`pt${i}`?"#FEF2F2":B.white, border:`1px solid ${cp===`pt${i}`?"#FCA5A5":B.border}`, color:cp===`pt${i}`?B.red:B.text, borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{tag}</div>)}</div></div>}
          </div>
        )
      ) : (
        <div style={{ padding:"40px 0" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ color:B.textMid, fontSize:13, fontWeight:600 }}>{stageLabels[stage]}</div>
              <div style={{ color:B.textLight, fontSize:12 }}>{stageProgress[stage]}%</div>
            </div>
            <div style={{ background:B.offWhite, borderRadius:6, height:8, overflow:"hidden" }}>
              <div style={{ background:B.red, height:"100%", width:`${stageProgress[stage]}%`, borderRadius:6, transition:"width 0.5s ease" }} />
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[["researching","🔍 Market Research"],["extracting","🧠 Intelligence Extraction"],["scripting","🎬 Script Generation"]].map(([s,l]) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:10, color:stage===s?B.navy:stageProgress[stage]>stageProgress[s]?B.green:B.textLight, fontSize:13 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:stage===s?B.red:stageProgress[stage]>stageProgress[s]?B.green:B.border, flexShrink:0 }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── VAULT ─────────────────────────────────────────────────────────────────────

function Vault() {
  const [activeTab, setActiveTab] = useState("market");
  const [cp, setCp] = useState("");
  const current = VAULT_TABS.find(t => t.id === activeTab);
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="PROMPT VAULT" subtitle="Market research + platform diagnostics. Run in Perplexity, paste results into Insight Extractor." />
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24 }}>
        {VAULT_TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background:activeTab===t.id?t.color:B.white, color:activeTab===t.id?B.white:B.textMid, border:`1px solid ${activeTab===t.id?t.color:B.border}`, borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:13 }}>{t.icon}</span>{t.label}</button>)}
      </div>
      {current?.sections.map((section, si) => (
        <div key={si} style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:3, height:18, background:section.color, borderRadius:2 }} />
            <div><div style={{ color:section.color, fontWeight:700, fontSize:13 }}>{section.title}</div><div style={{ color:B.textLight, fontSize:11 }}>{section.when}</div></div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {section.prompts.map((prompt, i) => (
              <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${section.color}`, borderRadius:8, padding:"12px 16px" }}>
                <div style={{ color:B.text, fontSize:12, lineHeight:1.7, marginBottom:8 }}>{prompt}</div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <CopyBtn text={prompt} label="Copy Prompt" copiedLabel="✓ Copied" id={`p${si}${i}`} cp={cp} setCp={setCp} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── COLLAB FINDER ─────────────────────────────────────────────────────────────

function CollabFinder() {
  const [angle, setAngle] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("guests");
  const [cp, setCp] = useState("");
  async function find() {
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    try {
      const research = await perp(`Who are the best podcast guests, collaboration partners, and cross-promotion opportunities for a veteran mindset coach and endurance athlete named Jason Fricka who runs @everydayelevations in 2026? Focus on health, wellness, mindset, veteran, finance, Colorado outdoor, and personal growth spaces.${a ? ` Primary angle: ${a.label}.` : ""}`);
      const d = await ai(COLLAB_PROMPT, `Based on this research, find collaboration opportunities for @everydayelevations:\n\n${research}`);
      setResult(d);
    } catch { setErr("Search failed. Check your Perplexity API key."); }
    finally { setLoad(false); }
  }
  const tabs = [{ id:"guests",label:"Guest Targets" },{ id:"stitch",label:"Stitch Targets" },{ id:"community",label:"Community Partners" },{ id:"pitch",label:"Pitch Template" }];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="COLLAB FINDER" subtitle="Find guest targets, stitch creators, and community partnerships. Perplexity-powered." />
      {!result ? (
        <>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Focus Angle <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional -- leave blank for all angles)</span></label>
            <AngleGrid value={angle} onChange={setAngle} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={find} disabled={load}>{load ? <><Spin />Finding Opportunities...</> : "🤝 Find Collaboration Opportunities"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Collaboration Opportunities</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Search Again</button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:20, borderBottom:`1px solid ${B.border}` }}>
            {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t.id?B.red:"transparent"}`, color:tab===t.id?B.navy:B.textLight, padding:"9px 14px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t.label}</button>)}
          </div>
          {tab==="guests" && <div>{result.guestTargets?.map((g,i) => <Card key={i} style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}><div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{g.name} {g.handle && <span style={{ color:B.textLight, fontSize:12, fontWeight:400 }}>{g.handle}</span>}</div><div style={{ display:"flex", gap:6 }}><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10 }}>{g.platform}</span><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10 }}>{g.followerRange}</span></div></div><div style={{ color:B.textMid, fontSize:12, marginBottom:8 }}>{g.whyPerfect}</div><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:6 }}><div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderRadius:6, padding:"8px 10px" }}><div style={{ color:"#14532D", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Content Idea</div><div style={{ color:"#166534", fontSize:11 }}>{g.contentIdea}</div></div><div style={{ background:"#EFF6FF", border:`1px solid #BFDBFE`, borderRadius:6, padding:"8px 10px" }}><div style={{ color:"#1E3A8A", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Mutual Benefit</div><div style={{ color:"#1E40AF", fontSize:11 }}>{g.mutualBenefit}</div></div></div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>Pitch angle: {g.pitchAngle}</div></Card>)}</div>}
          {tab==="stitch" && <div>{result.stitchTargets?.map((s,i) => <Card key={i}><div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:4 }}>{s.creator}</div><div style={{ color:B.textMid, fontSize:12, marginBottom:4 }}>{s.contentType}</div><div style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"8px 10px" }}><div style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>Your Stitch Angle</div><div style={{ color:B.navy, fontSize:12 }}>{s.stitchAngle}</div></div></Card>)}</div>}
          {tab==="community" && <div>{result.communityPartnerships?.map((p,i) => <Card key={i} style={{ borderLeft:`3px solid ${B.gold}` }}><div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:4 }}>{p.organization}</div><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10, marginBottom:8, display:"inline-block" }}>{p.type}</span><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6, marginTop:6 }}>{p.collaborationIdea}</div></Card>)}</div>}
          {tab==="pitch" && result.pitchTemplate && <Card><SecLabel text="Outreach Template" /><div style={{ marginBottom:12 }}><SecLabel text="Subject" /><div style={{ color:B.navy, fontWeight:700, fontSize:13 }}>{result.pitchTemplate.subject}</div></div><div style={{ marginBottom:12 }}><SecLabel text="Opening" /><div style={{ color:B.textMid, fontSize:12, fontStyle:"italic" }}>{result.pitchTemplate.opening}</div></div><div style={{ marginBottom:12 }}><SecLabel text="Body" /><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.pitchTemplate.body}</div></div><div style={{ marginBottom:12 }}><SecLabel text="CTA" /><div style={{ color:B.navy, fontWeight:700, fontSize:13 }}>{result.pitchTemplate.cta}</div></div><CopyBtn text={`${result.pitchTemplate.subject}\n\n${result.pitchTemplate.opening}\n\n${result.pitchTemplate.body}\n\n${result.pitchTemplate.cta}`} label="Copy Full Pitch" copiedLabel="✓ Copied" id="pitch" cp={cp} setCp={setCp} /></Card>}
        </div>
      )}
    </div>
  );
}

// ── INSIGHT EXTRACTOR ─────────────────────────────────────────────────────────

function Extract({ onScript }) {
  const [text, setText] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("summary");
  async function extract() {
    if (!text.trim()) return;
    setLoad(true); setErr(null); setResult(null);
    try { const d = await ai(EP_PROMPT, text); setResult(d); }
    catch { setErr("Extraction failed. Try again."); }
    finally { setLoad(false); }
  }
  const threatColor = { low:B.green, medium:B.gold, high:B.red };
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="INSIGHT EXTRACTOR" subtitle="Paste Perplexity research. Get competitor intel, content gaps, Reel ideas, and growth tactics." />
      {!result ? (
        <>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Paste Research Below</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={12} placeholder="Paste your Perplexity research output here..."
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={extract} disabled={load || !text.trim()}>{load ? <><Spin />Extracting Intelligence...</> : "🔍 Extract Intelligence"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Intelligence Extracted</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Research</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20, borderBottom:`1px solid ${B.border}` }}>
            {["summary","competitors","gaps","ideas","tactics"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?B.red:"transparent"}`, color:tab===t?B.navy:B.textLight, padding:"9px 14px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>)}
          </div>
          {tab==="summary" && <div><Card style={{ background:"#F0FDF4", borderColor:"#86EFAC" }}><SecLabel text="Summary" /><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.summary}</div></Card><Card><SecLabel text="Elevation Nation Angle" /><div style={{ color:B.navy, fontWeight:600, fontSize:13, lineHeight:1.6 }}>{result.elevationNationAngle}</div></Card></div>}
          {tab==="competitors" && <div>{result.competitors?.map((c,i) => <Card key={i}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{c.handle}</div><span style={{ background:threatColor[c.threat]+"20", color:threatColor[c.threat], border:`1px solid ${threatColor[c.threat]}40`, borderRadius:4, padding:"1px 8px", fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{c.threat} threat</span></div><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{c.insight}</div></Card>)}</div>}
          {tab==="gaps" && <div>{result.contentGaps?.map((g,i) => <Card key={i} style={{ borderLeft:`3px solid ${g.priority==="high"?B.red:g.priority==="medium"?B.gold:B.green}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}><div style={{ color:B.navy, fontWeight:700, fontSize:13 }}>{g.gap}</div><div style={{ display:"flex", gap:6 }}><span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10 }}>{g.format}</span>{g.wellnessDimension && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"1px 7px", fontSize:10 }}>{g.wellnessDimension}</span>}</div></div><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{g.description}</div></Card>)}</div>}
          {tab==="ideas" && <div>{result.reelIdeas?.map((r,i) => <Card key={i} style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:4 }}>{r.title}</div><div style={{ color:B.textMid, fontSize:12, fontStyle:"italic", marginBottom:4 }}>"{r.hook}"</div><div style={{ color:B.textLight, fontSize:12, marginBottom:8 }}>{r.why}</div><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>{r.wellnessDimension && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"2px 8px", fontSize:10 }}>{r.wellnessDimension}</span>}<button onClick={() => onScript(r.title)} style={{ background:B.red, color:B.white, border:"none", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>Send to Script Engine</button></div></Card>)}</div>}
          {tab==="tactics" && <div>{result.growthTactics?.map((t,i) => <Card key={i}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}><div style={{ color:B.navy, fontWeight:700, fontSize:13 }}>{t.tactic}</div><div style={{ display:"flex", gap:6 }}><span style={{ background:"#F0FDF4", color:B.green, border:`1px solid #86EFAC`, borderRadius:4, padding:"1px 7px", fontSize:10, fontWeight:700 }}>effort: {t.effort}</span><span style={{ background:"#FEF2F2", color:B.red, border:`1px solid #FCA5A5`, borderRadius:4, padding:"1px 7px", fontSize:10, fontWeight:700 }}>impact: {t.impact}</span></div></div><div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{t.description}</div></Card>)}</div>}
        </div>
      )}
    </div>
  );
}

// ── SCRIPT ENGINE ─────────────────────────────────────────────────────────────

function ScriptEngine({ prefill }) {
  const [mode, setMode] = useState("write");
  const [topic, setTopic] = useState(prefill || "");
  const [angle, setAngle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [ctx, setCtx] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [activeV, setActiveV] = useState(0);
  const [err, setErr] = useState(null);
  const [cp, setCp] = useState("");
  const [tab, setTab] = useState("script");
  const [trendLoad, setTrendLoad] = useState(false);
  const [trends, setTrends] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [stitchLoad, setStitchLoad] = useState(false);
  const [stitchResult, setStitchResult] = useState(null);
  const [stitchErr, setStitchErr] = useState(null);
  const [stitchTab, setStitchTab] = useState("script");
  useEffect(() => { if (prefill) { setTopic(prefill); setMode("write"); } }, [prefill]);
  async function gen() {
    if (!topic.trim() || !angle) return;
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    const p = PLATFORMS.find(x => x.id === platform);
    try {
      const d = await ai(SCRIPT_PROMPT, `Platform: ${p?.label}\nTopic: ${topic}\nAngle: ${a?.label}\n${ctx ? `Context: ${ctx}\n` : ""}Generate 3 variations.`);
      setResult(d); setActiveV(0);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  async function findTrends() {
    setTrendLoad(true); setTrends(null); setSelectedTrend(null); setStitchResult(null); setStitchErr(null);
    try {
      const research = await perp("What health wellness mindset fitness veteran personal growth content is going viral RIGHT NOW on Instagram Reels TikTok YouTube Shorts Facebook in 2026? Find specific viral videos, trends, and content patterns. Focus on content a veteran mindset coach and endurance athlete in Colorado could stitch with a unique POV.");
      const d = await ai(TREND_PROMPT, `Based on this research, identify 6-8 specific viral trends:\n\n${research}`);
      setTrends(d.trends);
    } catch { setStitchErr("Trend search failed. Check your Perplexity API key."); }
    finally { setTrendLoad(false); }
  }
  async function generateStitch() {
    if (!selectedTrend) return;
    setStitchLoad(true); setStitchResult(null); setStitchErr(null);
    try {
      const d = await ai(STITCH_PROMPT, `Viral content to stitch:\nTitle: ${selectedTrend.title}\nPlatform: ${selectedTrend.platform}\nWhy viral: ${selectedTrend.whyViral}\nStitch angle: ${selectedTrend.stitchAngle}\nHook idea: ${selectedTrend.stitchHookIdea}`);
      setStitchResult(d);
    } catch { setStitchErr("Script generation failed. Try again."); }
    finally { setStitchLoad(false); }
  }
  const scr = result?.variations?.[activeV];
  const uc = { "hot-right-now":B.red, "trending":B.gold, "evergreen-viral":B.green };
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="SCRIPT ENGINE" subtitle="Write original scripts or find viral trends to stitch. Greenspan SOP + Swarbrick baked in." />
      <div style={{ display:"flex", gap:0, marginBottom:24, background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:10, padding:3, width:"fit-content" }}>
        {[{id:"write",icon:"✍️",label:"Write Script"},{id:"stitch",icon:"🔥",label:"Viral Stitch"}].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setTrends(null); setSelectedTrend(null); setStitchResult(null); setErr(null); setStitchErr(null); }}
            style={{ background:mode===m.id?B.navy:"transparent", color:mode===m.id?B.white:B.textMid, border:"none", borderRadius:8, padding:"8px 18px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:14 }}>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>
      {mode==="write" && (!result ? (
        <>
          <SOPBadge />
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Platform</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {PLATFORMS.map(p => <div key={p.id} onClick={() => setPlatform(p.id)} style={{ background:platform===p.id?B.navy:B.white, border:`2px solid ${platform===p.id?B.navy:B.border}`, borderRadius:10, padding:"11px", cursor:"pointer", transition:"all 0.15s" }}><div style={{ fontSize:16, marginBottom:3 }}>{p.icon}</div><div style={{ color:platform===p.id?B.white:B.textMid, fontWeight:700, fontSize:11 }}>{p.label}</div><div style={{ color:platform===p.id?"rgba(255,255,255,0.5)":B.textLight, fontSize:9, marginTop:1 }}>{p.format}</div></div>)}
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Topic</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. What the Army taught me about starting over"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <AngleGrid value={angle} onChange={setAngle} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Context <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea value={ctx} onChange={e => setCtx(e.target.value)} rows={2} placeholder="Real memory or detail that makes it authentic..."
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={gen} disabled={load || !topic.trim() || !angle}>{load ? <><Spin />Writing 3 Scripts...</> : "⚡ Generate 3 Script Variations"}</RedBtn>
        </>
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy }}>{topic}</div>
            <button onClick={() => { setResult(null); setErr(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Script</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
            {(result.variations||[]).map((v,i) => (
              <div key={i} onClick={() => { setActiveV(i); setTab("script"); }} style={{ background:activeV===i?B.navy:B.white, border:`2px solid ${activeV===i?B.navy:B.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ color:activeV===i?B.red:"#7E5109", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{v.type}</div>
                <div style={{ color:activeV===i?"rgba(255,255,255,0.7)":B.textLight, fontSize:11, lineHeight:1.4, marginBottom:6 }}>{v.typeNote}</div>
                <div style={{ color:activeV===i?"rgba(255,255,255,0.5)":B.textLight, fontSize:10, fontWeight:600 }}>Optimizes: {v.optimizesFor}</div>
              </div>
            ))}
          </div>
          {scr && <>
            <div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#9B1C1C", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <span><span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10 }}>Why it works: </span>{scr.whyItWorks}</span>
              <CopyBtn text={[`[${scr.onScreenText}]`,`Hook: "${scr.hook}"`,`(${scr.hookNote})`,...(scr.body||[]).map((l,i)=>`"${l}"\n(${(scr.bodyNotes||[])[i]})`),`CTA: "${scr.cta}"\n(${scr.ctaNote})`].join("\n\n")} label="Copy Script" copiedLabel="✓ Copied" id="full" cp={cp} setCp={setCp} />
            </div>
            <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:14 }}>
              {["script","caption","hashtags"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?B.red:"transparent"}`, color:tab===t?B.navy:B.textLight, padding:"8px 14px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>)}
            </div>
            {tab==="script" && <div>
              <Card style={{ background:"#FFFBF0", borderColor:"#FCD34D" }}><SecLabel text="On Screen Text" /><div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{scr.onScreenText}"</div></Card>
              <Card style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="Hook 0-3 sec" /><CopyBtn text={scr.hook} id="hook" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic", lineHeight:1.4, marginBottom:4 }}>"{scr.hook}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {scr.hookNote}</div></Card>
              <div style={{ marginBottom:12 }}><SecLabel text="Body" />{(scr.body||[]).map((line,i) => <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px", marginBottom:6 }}><div style={{ display:"flex", justifyContent:"space-between", gap:8 }}><div style={{ flex:1 }}><div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:3 }}>"{line}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {(scr.bodyNotes||[])[i]}</div></div><CopyBtn text={line} id={`b${i}`} cp={cp} setCp={setCp} /></div></div>)}</div>
              <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><div><SecLabel text="CTA" /><span style={{ background:"#FEF2F2", color:B.red, border:`1px solid #FCA5A5`, borderRadius:3, padding:"1px 6px", fontSize:9, fontWeight:700 }}>{scr.ctaType}</span></div><CopyBtn text={scr.cta} id="cta" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:14, fontWeight:700, fontStyle:"italic", marginBottom:4 }}>"{scr.cta}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {scr.ctaNote}</div></Card>
            </div>}
            {tab==="caption" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(scr.caption||"")+"\n\n"+(scr.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="cap" cp={cp} setCp={setCp} /></div><Card style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{scr.caption}</Card></div>}
            {tab==="hashtags" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(scr.hashtags||[]).join(" ")} label="Copy All" copiedLabel="✓ Copied" id="tags" cp={cp} setCp={setCp} /></div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{(scr.hashtags||[]).map((tag,i) => <div key={i} onClick={() => { navigator.clipboard.writeText(tag); setCp(`t${i}`); setTimeout(()=>setCp(""),1800); }} style={{ background:cp===`t${i}`?"#FEF2F2":B.white, border:`1px solid ${cp===`t${i}`?"#FCA5A5":B.border}`, color:cp===`t${i}`?B.red:B.text, borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{tag}</div>)}</div></div>}
          </>}
        </>
      ))}
      {mode==="stitch" && (
        <div>
          {!stitchResult ? (
            <>
              {!trends && !trendLoad && <>
                <div style={{ background:"#FFF7ED", border:`1px solid #FED7AA`, borderLeft:`3px solid ${B.gold}`, borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
                  <div style={{ color:"#92400E", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>How Viral Stitching Works</div>
                  <div style={{ color:"#78350F", fontSize:12, lineHeight:1.7 }}>Perplexity finds what is going viral RIGHT NOW. You pick the trend. The app writes your stitch script in your voice.</div>
                </div>
                {stitchErr && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{stitchErr}</div>}
                <RedBtn onClick={findTrends}>🔥 Find Viral Trends Now</RedBtn>
              </>}
              {trendLoad && <div style={{ display:"flex", alignItems:"center", gap:10, padding:"24px 0" }}><Spin /><div style={{ color:B.textMid, fontSize:13 }}>Searching for what is going viral right now...</div></div>}
              {trends && !selectedTrend && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Trending Now</div>
                    <button onClick={findTrends} style={{ background:"transparent", color:B.textMid, border:`1px solid ${B.border}`, borderRadius:6, padding:"6px 12px", fontSize:11, cursor:"pointer" }}>Refresh</button>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {trends.map((trend,i) => (
                      <div key={i} onClick={() => setSelectedTrend(trend)} style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${uc[trend.urgency]||B.red}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                          <div style={{ color:B.navy, fontWeight:700, fontSize:13, flex:1 }}>{trend.title}</div>
                          <div style={{ display:"flex", gap:5 }}>
                            <span style={{ background:uc[trend.urgency]||B.red, color:B.white, borderRadius:4, padding:"1px 7px", fontSize:9, fontWeight:800, textTransform:"uppercase" }}>{(trend.urgency||"").replace(/-/g," ")}</span>
                            <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:9 }}>{trend.platform}</span>
                          </div>
                        </div>
                        <div style={{ color:B.red, fontSize:11, fontWeight:700, marginBottom:4 }}>{trend.estimatedViews}</div>
                        <div style={{ color:B.textMid, fontSize:12, lineHeight:1.5, marginBottom:6 }}>{trend.whyViral}</div>
                        <div style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"7px 10px" }}>
                          <div style={{ color:B.red, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Your Stitch Angle</div>
                          <div style={{ color:B.navy, fontSize:11 }}>{trend.stitchAngle}</div>
                          <div style={{ color:B.textLight, fontSize:10, fontStyle:"italic", marginTop:2 }}>Hook: "{trend.stitchHookIdea}"</div>
                        </div>
                        <div style={{ marginTop:8, color:B.red, fontSize:11, fontWeight:700, textAlign:"right" }}>Stitch This →</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedTrend && !stitchLoad && <div>
                <Card style={{ borderLeft:`3px solid ${B.red}` }}>
                  <SecLabel text="Selected Trend" />
                  <div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:4 }}>{selectedTrend.title}</div>
                  <div style={{ color:B.textMid, fontSize:12 }}>{selectedTrend.stitchAngle}</div>
                  <button onClick={() => setSelectedTrend(null)} style={{ marginTop:8, background:"transparent", color:B.textLight, border:"none", fontSize:11, cursor:"pointer" }}>← Choose different trend</button>
                </Card>
                {stitchErr && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{stitchErr}</div>}
                <RedBtn onClick={generateStitch}>🔥 Generate Stitch Script</RedBtn>
              </div>}
              {stitchLoad && <div style={{ display:"flex", alignItems:"center", gap:10, padding:"24px 0" }}><Spin /><div style={{ color:B.textMid, fontSize:13 }}>Writing your stitch script...</div></div>}
            </>
          ) : (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div><div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy }}>Stitch Script Ready</div><div style={{ color:B.red, fontSize:12, fontWeight:700, marginTop:2, textTransform:"capitalize" }}>Stance: {(stitchResult.stance||"").replace(/-/g," ")}</div></div>
                <button onClick={() => { setStitchResult(null); setSelectedTrend(null); }} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Stitch</button>
              </div>
              <div style={{ background:"#FFF7ED", border:`1px solid #FED7AA`, borderLeft:`3px solid ${B.gold}`, borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#78350F" }}><span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:1, fontSize:10, color:"#92400E" }}>Why it will be shared: </span>{stitchResult.whyItWillBeShared}</div>
              <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:14 }}>
                {["script","caption","hashtags"].map(t => <button key={t} onClick={() => setStitchTab(t)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${stitchTab===t?B.red:"transparent"}`, color:stitchTab===t?B.navy:B.textLight, padding:"8px 14px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", marginBottom:-1 }}>{t}</button>)}
              </div>
              {stitchTab==="script" && <div>
                <Card style={{ background:"#FFFBF0", borderColor:"#FCD34D" }}><SecLabel text="On Screen Text" /><div style={{ color:B.text, fontSize:13, fontWeight:600 }}>"{stitchResult.onScreenText}"</div></Card>
                <Card style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="Stitch Hook 0-3 sec" /><CopyBtn text={stitchResult.stitchHook} id="sh" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{stitchResult.stitchHook}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:3 }}>📹 {stitchResult.stitchHookNote}</div></Card>
                <div style={{ marginBottom:12 }}><SecLabel text="Response Body" />{(stitchResult.body||[]).map((line,i) => <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px", marginBottom:6 }}><div style={{ display:"flex", justifyContent:"space-between", gap:8 }}><div style={{ flex:1 }}><div style={{ color:B.text, fontSize:13, lineHeight:1.5, marginBottom:3 }}>"{line}"</div><div style={{ color:B.textLight, fontSize:11, fontStyle:"italic" }}>📹 {(stitchResult.bodyNotes||[])[i]}</div></div><CopyBtn text={line} id={"sb"+i} cp={cp} setCp={setCp} /></div></div>)}</div>
                <Card style={{ borderLeft:`3px solid ${B.red}`, background:"#FEF2F2" }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="CTA" /><CopyBtn text={stitchResult.cta} id="scta" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:14, fontWeight:700, fontStyle:"italic" }}>"{stitchResult.cta}"</div></Card>
              </div>}
              {stitchTab==="caption" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(stitchResult.caption||"")+"\n\n"+(stitchResult.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="scap" cp={cp} setCp={setCp} /></div><Card style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.9, color:B.text }}>{stitchResult.caption}</Card></div>}
              {stitchTab==="hashtags" && <div><div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}><CopyBtn text={(stitchResult.hashtags||[]).join(" ")} label="Copy All" copiedLabel="✓ Copied" id="stags" cp={cp} setCp={setCp} /></div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{(stitchResult.hashtags||[]).map((tag,i) => <div key={i} onClick={() => { navigator.clipboard.writeText(tag); setCp("st"+i); setTimeout(()=>setCp(""),1800); }} style={{ background:cp==="st"+i?"#FEF2F2":B.white, border:`1px solid ${cp==="st"+i?"#FCA5A5":B.border}`, color:cp==="st"+i?B.red:B.text, borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{tag}</div>)}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── EPISODE TO CLIPS ──────────────────────────────────────────────────────────

function EpisodeClips() {
  const [episode, setEpisode] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [activeClip, setActiveClip] = useState(0);
  const [cp, setCp] = useState("");
  async function generate() {
    if (!episode.trim()) return;
    setLoad(true); setErr(null); setResult(null);
    try {
      const d = await ai(EPISODE_PROMPT, `Podcast: Everyday Elevations with Jason Fricka\nEpisode info:\n${episode}\n\nExtract maximum short-form content.`);
      setResult(d); setActiveClip(0);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="EPISODE-TO-CLIPS" subtitle="Paste episode title, description, or key points. Get 5-7 platform-native short-form clips." />
      {!result ? (
        <>
          <SOPBadge />
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Episode Information</label>
            <textarea value={episode} onChange={e => setEpisode(e.target.value)} rows={8}
              placeholder={"Paste episode title, guest name, key talking points, or full description...\n\nExample:\nEpisode: 'How I Dealt With Losing a Fellow Veteran'\nKey points: grief doesn't have a timeline, how to support someone who is grieving, what helped me through it..."}
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load || !episode.trim()}>{load ? <><Spin />Extracting Clips...</> : "🎙️ Extract Clips"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>{result.episodeTitle}</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Episode</button>
          </div>
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
            {result.clips?.map((clip,i) => (
              <div key={i} onClick={() => setActiveClip(i)}
                style={{ flexShrink:0, background:activeClip===i?B.navy:B.white, border:`2px solid ${activeClip===i?B.navy:B.border}`, borderRadius:8, padding:"8px 14px", cursor:"pointer", transition:"all 0.15s", minWidth:90, textAlign:"center" }}>
                <div style={{ color:activeClip===i?B.red:B.textLight, fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Clip {clip.clipNumber}</div>
                <div style={{ color:activeClip===i?B.white:B.textMid, fontSize:11, fontWeight:700, marginTop:3, lineHeight:1.3 }}>{clip.platform}</div>
              </div>
            ))}
          </div>
          {result.clips?.[activeClip] && (() => {
            const clip = result.clips[activeClip];
            return (
              <div>
                <Card style={{ borderTop:`3px solid ${B.red}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, flexWrap:"wrap", gap:6 }}>
                    <div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{clip.title}</div>
                    <div style={{ display:"flex", gap:6 }}>
                      <span style={{ background:B.navy, color:B.white, borderRadius:4, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{clip.format}</span>
                      <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10 }}>{clip.estimatedSeconds}s</span>
                      {clip.wellnessDimension && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"1px 7px", fontSize:10 }}>{clip.wellnessDimension}</span>}
                    </div>
                  </div>
                  <div style={{ color:B.textMid, fontSize:12, lineHeight:1.6 }}>{clip.keyInsight}</div>
                </Card>
                <Card style={{ borderLeft:`3px solid ${B.red}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="Hook" /><CopyBtn text={clip.hook} id="ch" cp={cp} setCp={setCp} /></div>
                  <div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{clip.hook}"</div>
                </Card>
                <div style={{ marginBottom:12 }}><SecLabel text="Talking Points" />{(clip.body||[]).map((p,i) => <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.red, flexShrink:0, marginTop:5 }} /><div style={{ color:B.text, fontSize:13, lineHeight:1.5 }}>{p}</div></div>)}</div>
                <Card style={{ background:"#FEF2F2", borderLeft:`3px solid ${B.red}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="CTA" /><CopyBtn text={clip.cta} id="ccta" cp={cp} setCp={setCp} /></div>
                  <div style={{ color:B.navy, fontSize:13, fontWeight:700, fontStyle:"italic" }}>"{clip.cta}"</div>
                </Card>
                <Card>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Caption + Hashtags" /><CopyBtn text={(clip.caption||"")+"\n\n"+(clip.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="ccap" cp={cp} setCp={setCp} /></div>
                  <div style={{ color:B.text, fontSize:13, lineHeight:1.8, marginBottom:10 }}>{clip.caption}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{(clip.hashtags||[]).map((tag,i) => <span key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, color:B.text, borderRadius:6, padding:"4px 10px", fontSize:11 }}>{tag}</span>)}</div>
                </Card>
              </div>
            );
          })()}
          {result.carouselIdea && <Card style={{ background:"#FFFBF0", borderColor:"#FCD34D" }}><SecLabel text="Carousel Idea from This Episode" /><div style={{ color:B.navy, fontWeight:700, fontSize:13, marginBottom:8 }}>{result.carouselIdea.title}</div>{(result.carouselIdea.slides||[]).map((s,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}><span style={{ background:B.navy, color:B.white, borderRadius:3, padding:"1px 6px", fontSize:9, fontWeight:700 }}>S{i+1}</span><span style={{ color:B.textMid, fontSize:12 }}>{s}</span></div>)}</Card>}
          {result.linkedInAngle && <Card style={{ background:"#F0F7FF", borderColor:"#BFDBFE" }}><SecLabel text="LinkedIn Adaptation (HR + Podcast Dual Lane)" /><div style={{ color:"#1E40AF", fontSize:12, lineHeight:1.7 }}>{result.linkedInAngle}</div></Card>}
          {(result.quotableInsights||[]).length > 0 && <Card><SecLabel text="Quotable Insights" />{result.quotableInsights.map((q,i) => <div key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"10px 12px", marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between" }}><div style={{ color:B.navy, fontSize:12, fontStyle:"italic", fontWeight:600 }}>"{q}"</div><CopyBtn text={`"${q}" -- Jason Fricka, Everyday Elevations`} id={"qi"+i} cp={cp} setCp={setCp} /></div></div>)}</Card>}
        </div>
      )}
    </div>
  );
}

// ── REPURPOSE ENGINE ──────────────────────────────────────────────────────────

function RepurposeEngine() {
  const [script, setScript] = useState("");
  const [topic, setTopic] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [plat, setPlat] = useState("instagram");
  const [cp, setCp] = useState("");
  async function generate() {
    if (!script.trim()) return;
    setLoad(true); setErr(null); setResult(null);
    try {
      const d = await ai(REPURPOSE_PROMPT, `Original topic: ${topic || "from script below"}\nOriginal Instagram Reel script:\n${script}\n\nAdapt natively for all 4 platforms.`);
      setResult(d);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const platTabs = [{ id:"instagram",label:"Instagram",icon:"📸" },{ id:"youtube",label:"YouTube",icon:"▶️" },{ id:"facebook",label:"Facebook",icon:"👥" },{ id:"linkedin",label:"LinkedIn",icon:"💼" }];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="REPURPOSE ENGINE" subtitle="Paste one script. Get it adapted natively for Instagram, YouTube, Facebook, and LinkedIn." />
      {!result ? (
        <>
          <SOPBadge />
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Topic <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Morning discipline for veterans"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Original Script</label>
            <textarea value={script} onChange={e => setScript(e.target.value)} rows={10} placeholder="Paste your Instagram Reel script here..."
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"12px 14px", fontSize:13, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load || !script.trim()}>{load ? <><Spin />Adapting for All Platforms...</> : "♻️ Repurpose to All Platforms"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>All Platforms Ready</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Script</button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {platTabs.map(p => <button key={p.id} onClick={() => setPlat(p.id)} style={{ background:plat===p.id?B.navy:B.white, color:plat===p.id?B.white:B.textMid, border:`1px solid ${plat===p.id?B.navy:B.border}`, borderRadius:8, padding:"8px 14px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><span>{p.icon}</span>{p.label}</button>)}
          </div>
          {plat==="instagram" && result.instagram && <div>
            <Card style={{ borderLeft:`3px solid ${B.red}` }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><SecLabel text="Hook" /><CopyBtn text={result.instagram.hook} id="ighook" cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{result.instagram.hook}"</div></Card>
            <div style={{ marginBottom:12 }}><SecLabel text="Body" />{(result.instagram.body||[]).map((l,i) => <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderRadius:7, padding:"9px 12px", marginBottom:6, color:B.text, fontSize:13 }}>"{l}"</div>)}</div>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Caption + Hashtags" /><CopyBtn text={(result.instagram.caption||"")+"\n\n"+(result.instagram.hashtags||[]).join(" ")} label="Copy" copiedLabel="✓" id="igcap" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, marginBottom:8 }}>{result.instagram.caption}</div><div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{(result.instagram.hashtags||[]).map((tag,i) => <span key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, borderRadius:6, padding:"3px 9px", fontSize:11, color:B.text }}>{tag}</span>)}</div></Card>
          </div>}
          {plat==="youtube" && result.youtube && <div>
            <Card style={{ borderLeft:`3px solid #CC0000` }}><SecLabel text="Hook" /><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{result.youtube.hook}"</div></Card>
            <Card><SecLabel text="Video Outline" />{(result.youtube.outline||[]).map((p,i) => <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:7 }}><span style={{ background:"#CC0000", color:B.white, borderRadius:3, padding:"1px 6px", fontSize:9, fontWeight:700, flexShrink:0 }}>{i+1}</span><div style={{ color:B.text, fontSize:13 }}>{p}</div></div>)}</Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Description" /><CopyBtn text={result.youtube.description} id="ytdesc" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.youtube.description}</div></Card>
          </div>}
          {plat==="facebook" && result.facebook && <div>
            <Card style={{ borderLeft:`3px solid #1877F2` }}><SecLabel text="Hook" /><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{result.facebook.hook}"</div></Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Full Facebook Post" /><CopyBtn text={result.facebook.postCopy} id="fbpost" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result.facebook.postCopy}</div></Card>
          </div>}
          {plat==="linkedin" && result.linkedin && <div>
            <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #0A66C2`, borderRadius:8, padding:"10px 14px", marginBottom:14 }}><div style={{ color:"#0A66C2", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:3 }}>LinkedIn Lane</div><div style={{ color:"#1E40AF", fontSize:12 }}>{result.linkedin.angle}</div></div>
            <Card style={{ borderLeft:`3px solid #0A66C2` }}><SecLabel text="Hook" /><div style={{ color:B.navy, fontSize:15, fontWeight:700, fontStyle:"italic" }}>"{result.linkedin.hook}"</div></Card>
            <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><SecLabel text="Full LinkedIn Post" /><CopyBtn text={result.linkedin.postCopy} id="lipost" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result.linkedin.postCopy}</div></Card>
          </div>}
        </div>
      )}
    </div>
  );
}

// ── HOOK LIBRARY ──────────────────────────────────────────────────────────────

function HookLibrary() {
  const [load, setLoad] = useState(false);
  const [hooks, setHooks] = useState(null);
  const [err, setErr] = useState(null);
  const [activeType, setActiveType] = useState("pattern_interrupt");
  const [cp, setCp] = useState("");
  async function generate() {
    setLoad(true); setErr(null); setHooks(null);
    try {
      const d = await ai(HOOK_PROMPT, "Generate 40 proven hooks for @everydayelevations across all 5 categories. Specific to health, wellness, mindset, veteran, Colorado lifestyle, finance, family, and personal growth.");
      setHooks(d.hooks);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  const hookTypes = [
    { id:"pattern_interrupt", label:"Pattern Interrupt", icon:"⚡" },
    { id:"question",          label:"Question",          icon:"❓" },
    { id:"bold_statement",    label:"Bold Statement",    icon:"🎯" },
    { id:"personal_story",    label:"Personal Story",    icon:"❤️" },
    { id:"data_stat",         label:"Data & Stats",      icon:"📊" },
  ];
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="HOOK LIBRARY" subtitle="40 proven hooks organized by type. Browse, remix, and inject into any script." />
      {!hooks ? (
        <>
          <Card style={{ marginBottom:20 }}>
            <div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>Generates 40 hooks across 5 categories -- Pattern Interrupt, Question, Bold Statement, Personal Story, and Data & Stats. All specific to your 8 content angles and voice.</div>
          </Card>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load}>{load ? <><Spin />Building Hook Library...</> : "🎣 Generate Hook Library"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>40 Proven Hooks</div>
            <button onClick={() => setHooks(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Regenerate</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
            {hookTypes.map(t => <button key={t.id} onClick={() => setActiveType(t.id)} style={{ background:activeType===t.id?B.navy:B.white, color:activeType===t.id?B.white:B.textMid, border:`1px solid ${activeType===t.id?B.navy:B.border}`, borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><span>{t.icon}</span>{t.label}</button>)}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {(hooks[activeType]||[]).map((hook,i) => (
              <div key={i} style={{ background:B.white, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.red}`, borderRadius:8, padding:"12px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ color:B.navy, fontWeight:700, fontSize:13, flex:1, lineHeight:1.4 }}>"{hook.hook}"</div>
                  <CopyBtn text={hook.hook} id={`hk${i}`} cp={cp} setCp={setCp} />
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {hook.template && <span style={{ background:B.offWhite, color:B.textMid, border:`1px solid ${B.border}`, borderRadius:4, padding:"1px 7px", fontSize:10 }}>{hook.template}</span>}
                  {hook.angle && <span style={{ background:"#EDE9FE", color:"#5B21B6", borderRadius:4, padding:"1px 7px", fontSize:10 }}>{hook.angle}</span>}
                </div>
                {hook.why && <div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:4 }}>{hook.why}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DESIGN STUDIO ─────────────────────────────────────────────────────────────

function DesignStudio() {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [view, setView] = useState("carousel");
  const [cp, setCp] = useState("");
  async function generate() {
    if (!topic.trim() || !angle) return;
    setLoad(true); setErr(null); setResult(null);
    const a = ANGLES.find(x => x.id === angle);
    try {
      const d = await ai(DESIGN_PROMPT, `Topic: ${topic}\nAngle: ${a?.label}\nGenerate carousel and static post concepts for @everydayelevations.`);
      setResult(d);
    } catch { setErr("Generation failed. Try again."); }
    finally { setLoad(false); }
  }
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="DESIGN STUDIO" subtitle="6-slide carousel + static post concepts with slide copy and visual direction. One tap to open in Canva." />
      {!result ? (
        <>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:6 }}>Post Topic</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. 5 mindset shifts that changed how I handle hard days"
              style={{ width:"100%", background:B.white, color:B.text, border:`1px solid ${B.border}`, borderRadius:8, padding:"11px 14px", fontSize:13, fontFamily:"'Barlow',sans-serif" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.textLight, marginBottom:8 }}>Content Angle</label>
            <AngleGrid value={angle} onChange={setAngle} />
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={generate} disabled={load || !topic.trim() || !angle}>{load ? <><Spin />Generating Concepts...</> : "🎨 Generate Design Concepts"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:B.navy }}>Design Concepts Ready</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Concept</button>
          </div>
          <div style={{ display:"flex", borderBottom:`1px solid ${B.border}`, marginBottom:18 }}>
            {[{ id:"carousel",label:"🎠 Carousel" },{ id:"static",label:"🖼️ Static Post" }].map(t => <button key={t.id} onClick={() => setView(t.id)} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${view===t.id?B.red:"transparent"}`, color:view===t.id?B.navy:B.textLight, padding:"9px 18px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", marginBottom:-1 }}>{t.label}</button>)}
          </div>
          {view==="carousel" && result.carousel && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:8 }}>
                <div><div style={{ color:B.navy, fontWeight:700, fontSize:14 }}>{result.carousel.title}</div><div style={{ color:B.textLight, fontSize:11 }}>{result.carousel.slideCount} slides</div></div>
                <button onClick={() => window.open("https://www.canva.com/create/instagram-posts/","_blank")} style={{ background:B.navy, color:B.white, border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Open in Canva ↗</button>
              </div>
              <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10, marginBottom:16 }}>
                {(result.carousel.slides||[]).map((slide,i) => (
                  <div key={i} style={{ flexShrink:0, width:150, background:slide.type==="cover"?B.navy:slide.type==="cta"?B.red:B.white, border:`1px solid ${B.border}`, borderRadius:10, padding:"12px", minHeight:190, position:"relative" }}>
                    <div style={{ position:"absolute", top:6, right:6, background:B.red, color:B.white, borderRadius:3, padding:"1px 5px", fontSize:9, fontWeight:800 }}>{slide.slideNumber}</div>
                    <div style={{ color:slide.type!=="content"?B.white:B.navy, fontWeight:800, fontSize:11, lineHeight:1.3, marginBottom:6 }}>{slide.headline}</div>
                    <div style={{ color:slide.type==="content"?B.textMid:"rgba(255,255,255,0.75)", fontSize:10, lineHeight:1.4, marginBottom:6 }}>{slide.subtext}</div>
                    <div style={{ background:"rgba(0,0,0,0.08)", borderRadius:4, padding:"4px 6px" }}><div style={{ color:slide.type==="content"?B.textLight:"rgba(255,255,255,0.5)", fontSize:9, fontStyle:"italic" }}>📸 {slide.visualDirection}</div></div>
                  </div>
                ))}
              </div>
              <Card><SecLabel text="Slide Copy -- Ready to Paste into Canva" />{(result.carousel.slides||[]).map((slide,i) => <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:10, marginBottom:10 }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ background:slide.type==="cover"?B.navy:slide.type==="cta"?B.red:B.offWhite, color:slide.type==="content"?B.textMid:B.white, borderRadius:3, padding:"1px 6px", fontSize:9, fontWeight:700 }}>Slide {slide.slideNumber}</span><span style={{ color:B.textLight, fontSize:10 }}>{slide.type}</span></div><CopyBtn text={`${slide.headline}\n${slide.subtext}`} id={"sl"+i} cp={cp} setCp={setCp} /></div><div style={{ color:B.navy, fontWeight:700, fontSize:12, marginBottom:2 }}>{slide.headline}</div><div style={{ color:B.textMid, fontSize:11, marginBottom:3 }}>{slide.subtext}</div><div style={{ color:B.textLight, fontSize:10, fontStyle:"italic" }}>📸 {slide.visualDirection}</div></div>)}</Card>
              <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><SecLabel text="Caption" /><CopyBtn text={(result.carousel.caption||"")+"\n\n"+(result.carousel.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="cc" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:12 }}>{result.carousel.caption}</div><div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>{(result.carousel.hashtags||[]).map((tag,i) => <CopyBtn key={i} text={tag} label={tag} copiedLabel="✓" id={"ct"+i} cp={cp} setCp={setCp} />)}</div></Card>
            </div>
          )}
          {view==="static" && result.static && (
            <div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
                <button onClick={() => window.open("https://www.canva.com/create/instagram-posts/","_blank")} style={{ background:B.navy, color:B.white, border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>Open in Canva ↗</button>
              </div>
              <div style={{ background:B.navy, borderRadius:14, padding:"28px", marginBottom:16, position:"relative", overflow:"hidden", minHeight:200 }}>
                <div style={{ position:"absolute", top:0, right:0, width:"50%", height:"100%", background:`radial-gradient(ellipse at top right, ${B.red}25 0%, transparent 70%)`, pointerEvents:"none" }} />
                <div style={{ position:"relative" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:B.white, letterSpacing:1, lineHeight:1.1, marginBottom:8 }}>{result.static.headline}</div>
                  <div style={{ color:B.red, fontSize:13, fontWeight:600, marginBottom:10 }}>{result.static.subtext}</div>
                  <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12, lineHeight:1.7, maxWidth:440, marginBottom:14 }}>{result.static.bodyText}</div>
                  <div style={{ background:B.red, color:B.white, borderRadius:5, padding:"6px 14px", fontSize:11, fontWeight:700, display:"inline-block" }}>{result.static.cta}</div>
                </div>
              </div>
              <Card><SecLabel text="Post Copy" />{[{l:"Headline",v:result.static.headline},{l:"Subtext",v:result.static.subtext},{l:"Body",v:result.static.bodyText},{l:"CTA",v:result.static.cta}].map((x,i) => <div key={i} style={{ borderBottom:`1px solid ${B.border}`, paddingBottom:8, marginBottom:8 }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ color:B.textLight, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{x.l}</span><CopyBtn text={x.v||""} id={"stp"+i} cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:12 }}>{x.v}</div></div>)}<div style={{ color:B.textLight, fontSize:11, fontStyle:"italic", marginTop:4 }}>📸 {result.static.visualDirection}</div></Card>
              <Card><div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}><SecLabel text="Caption" /><CopyBtn text={(result.static.caption||"")+"\n\n"+(result.static.hashtags||[]).join(" ")} label="Copy Caption + Tags" copiedLabel="✓ Copied" id="sc" cp={cp} setCp={setCp} /></div><div style={{ color:B.text, fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:12 }}>{result.static.caption}</div><div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>{(result.static.hashtags||[]).map((tag,i) => <CopyBtn key={i} text={tag} label={tag} copiedLabel="✓" id={"sth"+i} cp={cp} setCp={setCp} />)}</div></Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── WEEKLY REVIEW ─────────────────────────────────────────────────────────────

function WeeklyReview() {
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const [load, setLoad] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  async function analyze() {
    if (!top.trim() || !bottom.trim()) return;
    setLoad(true); setErr(null); setResult(null);
    try {
      const d = await ai(REVIEW_PROMPT, `TOP PERFORMING POSTS THIS WEEK:\n${top}\n\nBOTTOM PERFORMING POSTS THIS WEEK:\n${bottom}\n\nAnalyze and provide next week recommendations for @everydayelevations.`);
      setResult(d);
    } catch { setErr("Analysis failed. Try again."); }
    finally { setLoad(false); }
  }
  return (
    <div style={{ padding:"32px 40px" }}>
      <SectionHeader title="WEEKLY REVIEW" subtitle="Paste your top and bottom posts. Get data-driven recommendations for next week." />
      {!result ? (
        <>
          <div style={{ background:"#F0F7FF", border:`1px solid #BFDBFE`, borderLeft:`3px solid #1B4F72`, borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#1E40AF" }}>
            Pull your top 3 and bottom 3 posts from Instagram Insights (or any platform). Paste the topic, format, and any metrics you have. The more context the better.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            <div>
              <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.green, marginBottom:6 }}>Top Performing Posts</label>
              <textarea value={top} onChange={e => setTop(e.target.value)} rows={8}
                placeholder={"Post 1: Topic, format (Reel/Carousel), metrics...\nPost 2: ...\nPost 3: ..."}
                style={{ width:"100%", background:B.white, color:B.text, border:`1px solid #86EFAC`, borderRadius:8, padding:"10px 12px", fontSize:12, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:B.red, marginBottom:6 }}>Bottom Performing Posts</label>
              <textarea value={bottom} onChange={e => setBottom(e.target.value)} rows={8}
                placeholder={"Post 1: Topic, format, metrics...\nPost 2: ...\nPost 3: ..."}
                style={{ width:"100%", background:B.white, color:B.text, border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 12px", fontSize:12, lineHeight:1.7, fontFamily:"'Barlow',sans-serif", resize:"vertical" }} />
            </div>
          </div>
          {err && <div style={{ color:B.red, background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{err}</div>}
          <RedBtn onClick={analyze} disabled={load || !top.trim() || !bottom.trim()}>{load ? <><Spin />Analyzing Performance...</> : "📊 Analyze & Get Next Week Plan"}</RedBtn>
        </>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:B.navy }}>Weekly Analysis</div>
            <button onClick={() => setResult(null)} style={{ background:B.red, color:B.white, border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer" }}>New Review</button>
          </div>
          <Card style={{ background:"#F0FDF4", borderColor:"#86EFAC" }}><SecLabel text="Week Summary" /><div style={{ color:B.text, fontSize:13, lineHeight:1.7 }}>{result.weekSummary}</div></Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Card><SecLabel text="What's Working" />{(result.winningPatterns||[]).map((p,i) => <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, marginBottom:6 }}><div style={{ color:B.green, fontWeight:700, fontSize:12 }}>+</div><div style={{ color:B.text, fontSize:12 }}>{p}</div></div>)}</Card>
            <Card><SecLabel text="What's Not Working" />{(result.losingPatterns||[]).map((p,i) => <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, marginBottom:6 }}><div style={{ color:B.red, fontWeight:700, fontSize:12 }}>-</div><div style={{ color:B.text, fontSize:12 }}>{p}</div></div>)}</Card>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <Card style={{ borderLeft:`3px solid ${B.green}` }}><SecLabel text="Top Post -- Why It Worked" /><div style={{ color:B.navy, fontWeight:700, fontSize:12, marginBottom:4 }}>{result.topPost?.title}</div><div style={{ color:B.textMid, fontSize:12, marginBottom:6 }}>{result.topPost?.whyItWorked}</div><div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderRadius:5, padding:"6px 9px" }}><div style={{ color:"#14532D", fontSize:10, fontWeight:700, marginBottom:2 }}>REPLICATE</div><div style={{ color:"#166534", fontSize:11 }}>{result.topPost?.whatToReplicate}</div></div></Card>
            <Card style={{ borderLeft:`3px solid ${B.red}` }}><SecLabel text="Bottom Post -- What Failed" /><div style={{ color:B.navy, fontWeight:700, fontSize:12, marginBottom:4 }}>{result.bottomPost?.title}</div><div style={{ color:B.textMid, fontSize:12, marginBottom:6 }}>{result.bottomPost?.whyItFailed}</div><div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:5, padding:"6px 9px" }}><div style={{ color:"#9B1C1C", fontSize:10, fontWeight:700, marginBottom:2 }}>FIX</div><div style={{ color:"#7F1D1D", fontSize:11 }}>{result.bottomPost?.whatToFix}</div></div></Card>
          </div>
          <Card style={{ borderTop:`3px solid ${B.red}` }}><SecLabel text="Next Week Plan" /><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}><div style={{ background:"#F0FDF4", border:`1px solid #86EFAC`, borderRadius:6, padding:"10px" }}><div style={{ color:"#14532D", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Double Down On</div><div style={{ color:"#166534", fontSize:12 }}>{result.nextWeekPlan?.focus}</div></div><div style={{ background:"#FEF2F2", border:`1px solid #FCA5A5`, borderRadius:6, padding:"10px" }}><div style={{ color:"#9B1C1C", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Stop Doing</div><div style={{ color:"#7F1D1D", fontSize:12 }}>{result.nextWeekPlan?.avoid}</div></div></div><div style={{ marginBottom:10 }}><SecLabel text="Test Ideas" />{(result.nextWeekPlan?.testIdeas||[]).map((t,i) => <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}><div style={{ width:5, height:5, borderRadius:"50%", background:B.gold }} /><div style={{ color:B.text, fontSize:12 }}>{t}</div></div>)}</div><div><SecLabel text="Suggested Topics" /><div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>{(result.nextWeekPlan?.suggestedTopics||[]).map((t,i) => <span key={i} style={{ background:B.offWhite, border:`1px solid ${B.border}`, color:B.text, borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:600 }}>{t}</span>)}</div></div></Card>
          <Card style={{ background:"#FFF7ED", borderColor:"#FED7AA" }}><SecLabel text="Strategic Insight" /><div style={{ color:"#78350F", fontSize:13, fontWeight:600, lineHeight:1.7, marginBottom:8 }}>{result.growthInsight}</div>{result.swarbrickGap && <div style={{ background:"#FED7AA", borderRadius:6, padding:"8px 10px" }}><div style={{ color:"#92400E", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Underrepresented Wellness Dimension</div><div style={{ color:"#78350F", fontSize:12 }}>{result.swarbrickGap}</div></div>}</Card>
        </div>
      )}
    </div>
  );
}

// ── NAV & APP ─────────────────────────────────────────────────────────────────

const TOP_NAV = [
  { id:"home",     icon:"⚡", label:"Command Center" },
  { id:"strategy", icon:"📋", label:"Strategy" },
  { id:"research", icon:"🔬", label:"Research" },
  { id:"create",   icon:"🎬", label:"Create" },
  { id:"optimize", icon:"📊", label:"Optimize" },
];

const SUB_NAV = {
  strategy: [
    { id:"onboard",   icon:"📋", label:"Onboarding"       },
    { id:"calendar",  icon:"📅", label:"Content Calendar" },
    { id:"profile",   icon:"👤", label:"Profile Audit"    },
    { id:"magnet",    icon:"🧲", label:"Lead Magnet"      },
    { id:"community", icon:"🏔️", label:"Community"        },
  ],
  research: [
    { id:"pipeline",  icon:"🚀", label:"Full Pipeline"    },
    { id:"vault",     icon:"🗂️", label:"Prompt Vault"     },
    { id:"collab",    icon:"🤝", label:"Collab Finder"    },
    { id:"extract",   icon:"🔍", label:"Insight Extractor"},
  ],
  create: [
    { id:"script",    icon:"🎬", label:"Script Engine"    },
    { id:"episode",   icon:"🎙️", label:"Episode-to-Clips" },
    { id:"repurpose", icon:"♻️", label:"Repurpose"        },
    { id:"hooks",     icon:"🎣", label:"Hook Library"     },
    { id:"design",    icon:"🎨", label:"Design Studio"    },
  ],
  optimize: [
    { id:"review",    icon:"📊", label:"Weekly Review"    },
  ],
};

export default function App() {
  const [topPage, setTopPage] = useState("home");
  const [subPage, setSubPage] = useState(null);
  const [scriptPrefill, setScriptPrefill] = useState("");
  function go(section, sub) {
    setTopPage(section);
    setSubPage(sub || (SUB_NAV[section]?.[0]?.id || null));
  }
  function toScript(text) {
    setScriptPrefill(text);
    setTopPage("create");
    setSubPage("script");
  }
  const activeSub = subPage || (SUB_NAV[topPage]?.[0]?.id);
  return (
    <>
      <Head>
        <title>EN·CIS -- Elevation Nation Content Intelligence System</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:'Barlow',sans-serif; background:${B.offWhite}; }
          @keyframes spin { to { transform:rotate(360deg); } }
          ::-webkit-scrollbar { width:4px; height:4px; }
          ::-webkit-scrollbar-track { background:transparent; }
          ::-webkit-scrollbar-thumb { background:${B.border}; border-radius:2px; }
          input, textarea { outline:none; }
          input:focus, textarea:focus { border-color:${B.red} !important; }
          button:disabled { opacity:0.6; }
        `}</style>
      </Head>
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:B.offWhite }}>
        <div style={{ background:B.navy, borderBottom:`1px solid ${B.borderDark}`, display:"flex", alignItems:"center", padding:"0 20px", height:52, flexShrink:0, gap:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:20 }}>
            <img src="/E-E-Logo.jpg" alt="EE" style={{ width:32, height:32, borderRadius:6, objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:B.white, letterSpacing:2 }}>EN·CIS</div>
          </div>
          {TOP_NAV.map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              style={{ background:topPage===n.id?"rgba(233,69,96,0.15)":"transparent", color:topPage===n.id?B.red:B.textLight, border:`1px solid ${topPage===n.id?"rgba(233,69,96,0.3)":"transparent"}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}>
              <span style={{ fontSize:13 }}>{n.icon}</span>{n.label}
            </button>
          ))}
          <div style={{ marginLeft:"auto", background:B.red, color:B.white, borderRadius:6, padding:"4px 12px", fontSize:10, fontWeight:800, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2 }}>ELEVATION NATION</div>
        </div>
        {SUB_NAV[topPage] && (
          <div style={{ background:B.white, borderBottom:`1px solid ${B.border}`, display:"flex", alignItems:"center", padding:"0 20px", height:40, flexShrink:0, gap:2, overflowX:"auto" }}>
            {SUB_NAV[topPage].map(s => (
              <button key={s.id} onClick={() => setSubPage(s.id)}
                style={{ background:"transparent", color:activeSub===s.id?B.navy:B.textLight, border:"none", borderBottom:`2px solid ${activeSub===s.id?B.red:"transparent"}`, padding:"0 14px", height:"100%", fontSize:11, fontWeight:700, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"all 0.15s" }}>
                <span style={{ fontSize:12 }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto" }}>
          {topPage==="home"     && <Home go={go} />}
          {topPage==="strategy" && activeSub==="onboard"   && <Onboarding />}
          {topPage==="strategy" && activeSub==="calendar"  && <ContentCalendar />}
          {topPage==="strategy" && activeSub==="profile"   && <ProfileAudit />}
          {topPage==="strategy" && activeSub==="magnet"    && <LeadMagnet />}
          {topPage==="strategy" && activeSub==="community" && <CommunityBuilder />}
          {topPage==="research" && activeSub==="pipeline"  && <Pipeline />}
          {topPage==="research" && activeSub==="vault"     && <Vault />}
          {topPage==="research" && activeSub==="collab"    && <CollabFinder />}
          {topPage==="research" && activeSub==="extract"   && <Extract onScript={toScript} />}
          {topPage==="create"   && activeSub==="script"    && <ScriptEngine prefill={scriptPrefill} />}
          {topPage==="create"   && activeSub==="episode"   && <EpisodeClips />}
          {topPage==="create"   && activeSub==="repurpose" && <RepurposeEngine />}
          {topPage==="create"   && activeSub==="hooks"     && <HookLibrary />}
          {topPage==="create"   && activeSub==="design"    && <DesignStudio />}
          {topPage==="optimize" && activeSub==="review"    && <WeeklyReview />}
        </div>
      </div>
    </>
  );
}
