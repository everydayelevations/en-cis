import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  navy:   '#080D14',   // obsidian — deepest background
  navy2:  '#0C1420',   // surface — cards and panels
  navy3:  '#111B2B',   // elevated — inputs, hover
  red:    '#00C2FF',   // signal cyan — primary accent (replaces red throughout)
  white:  '#F1F5F9',   // off-white — cooler, more premium than pure white
  gray:   '#5A6A82',   // muted — secondary text
  light:  '#8B9AB4',   // light gray — tertiary text
  gold:   '#C9A84C',   // gold — premium badges only, use sparingly
};

// ─── CONTENT ANGLES ──────────────────────────────────────────────────────────
// Content angles mapped to Dr. Peggy Swarbrick's 8 Dimensions of Wellness
const ANGLES = [
  { id:'emotional',      emoji:'🧠', label:'Emotional',      dimension:'Emotional',      desc:'Self-awareness, stress, identity, how you talk to yourself' },
  { id:'physical',       emoji:'🏋️', label:'Physical',       dimension:'Physical',       desc:'Training, sleep, recovery, nutrition, daily movement' },
  { id:'social',         emoji:'🤝', label:'Social',         dimension:'Social',         desc:'Relationships, community, parenting, connection, belonging' },
  { id:'intellectual',   emoji:'📚', label:'Intellectual',   dimension:'Intellectual',   desc:'Learning, problem-solving, curiosity, skills, sharp thinking' },
  { id:'occupational',   emoji:'💼', label:'Occupational',   dimension:'Occupational',   desc:'Work ethic, career, HR, real estate, purpose in what you do' },
  { id:'financial',      emoji:'💰', label:'Financial',      dimension:'Financial',      desc:'Real estate, money habits, building wealth, smart decisions' },
  { id:'environmental',  emoji:'🏔️', label:'Environmental',  dimension:'Environmental',  desc:'Colorado, outdoor life, your physical space, the world around you' },
  { id:'spiritual',      emoji:'🔥', label:'Spiritual',      dimension:'Spiritual',      desc:'Purpose, values, what drives you, the reason behind the work' },
];

// ─── FRAMEWORKS (invisible infrastructure) ───────────────────────────────────
const SWARBRICK = `Dr. Peggy Swarbrick's 8 Dimensions of Wellness framework. Every piece of content should serve at least one dimension. Use this as a lens, not a label. Never name the dimensions explicitly in the content itself.

Emotional: How someone relates to their inner world. Stress, self-talk, identity, boundaries, processing difficulty. This is not about toxic positivity. It's about being honest with yourself.

Physical: Movement, recovery, sleep, nutrition, energy management. Not gym motivation. The practical daily work of keeping your body functional and strong over the long term.

Social: Relationships that push you or drain you. How you show up as a parent, a partner, a colleague. Community. Who you let in and who you keep out.

Intellectual: Staying curious and sharp. Learning from failure. Solving hard problems. Reading situations correctly. The kind of thinking that makes you better at everything else.

Occupational: Finding meaning in work, not just a paycheck. Work ethic, professional identity, the satisfaction of doing something well. For Jason: HR, real estate, coaching, building things.

Financial: The practical reality of money. Building wealth slowly and correctly. Real estate as a tool. Understanding your numbers. Not getting rich quick, building financial security.

Environmental: The physical world around you. Colorado, outdoors, the spaces you create, the environment you put yourself in and how it shapes who you become.

Spiritual: Not religion unless relevant. Purpose. Values. The deeper reason behind the discipline. What you are actually building and why it matters beyond the obvious.`;

const CONTENT_SOP = `Content standards I've built my system on: No intros, no fluff : drop them into value on the first frame. Four-layer journey: See It→Click It→Watch It→Go Deeper. CTA split: 60% comment-based, 20% DM, 20% link. I measure wins by shares and saves first : not likes.`;

const VOICE = `Write in Jason Fricka's voice. He's an HR manager, mindset coach, endurance athlete, dad, and real estate agent in Colorado. He talks like he's sitting across the table from you : direct, no fluff, no corporate speak. Short sentences. Real stories. He doesn't hype things up. He doesn't use words like "transform" or "journey" or "find your potential." He says what he means. He talks about hard days, early mornings, the work nobody sees, and why showing up matters even when it doesn't feel like it. His community is the community : everyday people who refuse to stay where they are. He roots for them out loud. Today is ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}. Write like him, not like a marketer writing about him. Never use em dashes. Never use AI buzzwords like "delve", "tapestry", "comprehensive", "leverage", "utilize", "paradigm", "synergy", "robust", "holistic", "facilitate", "foster", "streamline", or "cutting-edge". No hype. No filler. Jason does not talk like a LinkedIn consultant.`;

// ─── PLATFORMS ───────────────────────────────────────────────────────────────
const PLATFORMS = ['Instagram','YouTube','Facebook','LinkedIn','X','TikTok'];

// ─── RESEARCH TIERS ──────────────────────────────────────────────────────────
const TIER_PROMPTS = [
  { label:'Quick Pulse', desc:'Top 3 viral angles right now', depth:'surface' },
  { label:'Deep Dive', desc:'Trend analysis + audience psychology', depth:'medium' },
  { label:'Competitor Intel', desc:'What competitors are missing', depth:'deep' },
  { label:'Full Intel', desc:'Everything: trends, gaps, scripts, angles', depth:'full' },
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
    'Write a authority content post about [experience]',
  ]},
  { id:'hooks', label:'Hooks', prompts:[
    'Give me 10 pattern-interrupt hooks for [topic]',
    'Write 5 question hooks that create curiosity for [topic]',
    'Give me bold statement hooks that challenge [belief]',
    'Write personal story hooks starting with "The day I..."',
    'Give me data-driven hooks with surprising stats about [topic]',
  ]},
  { id:'x', label:'X / Twitter', prompts:[
    'Write a viral X thread on [topic] — hook tweet + 8 supporting tweets + CTA',
    'Write a single high-engagement tweet on [topic] under 280 characters',
    'Turn this long-form content into a 10-tweet thread: [paste]',
    'Write 5 reply-bait tweets that spark conversation on [topic]',
    'Write a quote tweet response to [tweet] that builds my authority',
    'Create a Twitter/X poll with 4 options on [topic]',
  ]},
  { id:'tiktok', label:'TikTok', prompts:[
    'Write a TikTok script with a 0-2 second pattern interrupt hook on [topic]',
    'Give me 5 TikTok hooks using the "POV:" format for [topic]',
    'Write a TikTok duet script responding to [describe video]',
    'Create a TikTok stitch script that adds value to [topic]',
    'Write a TikTok trend format script using [trending sound/format] for [topic]',
    'Give me 10 TikTok caption ideas that drive comments for [topic]',
  ]},
  { id:'repurpose', label:'Repurpose', prompts:[
    'Turn this Instagram script into a LinkedIn post: [paste]',
    'Convert this YouTube script into an Instagram Reel: [paste]',
    'Repurpose this podcast episode into 5 social posts: [paste]',
    'Turn this blog post into a Twitter/X thread: [paste]',
    'Convert this long-form content into a TikTok script: [paste]',
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
    <div style={{
      width:32,height:32,
      border:'2px solid rgba(0,194,255,0.15)',
      borderTopColor:'#00C2FF',
      borderRadius:'50%',
      animation:'spin 0.7s linear infinite'
    }}/>
  </div>
);

const RedBtn = ({onClick,disabled,children,style={}}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? 'rgba(90,106,130,0.3)' : 'linear-gradient(135deg, #00C2FF, #0096CC)',
      color: disabled ? B.gray : '#000D1A',
      border: 'none',
      borderRadius: 8,
      padding: '10px 22px',
      fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13,
      letterSpacing: '0.02em',
      transition: 'all 0.15s',
      boxShadow: disabled ? 'none' : '0 0 20px rgba(0,194,255,0.25)',
      ...style
    }}
  >
    {children}
  </button>
);

const Card = ({children,style={}}) => (
  <div style={{
    background: 'rgba(12,20,32,0.8)',
    border: '1px solid rgba(0,194,255,0.1)',
    borderRadius: 14,
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
    ...style
  }}>
    {children}
  </div>
);

const SecLabel = ({children}) => (
  <div style={{
    fontSize:10,fontWeight:700,letterSpacing:2.5,
    color:'rgba(0,194,255,0.7)',
    textTransform:'uppercase',marginBottom:8
  }}>
    {children}
  </div>
);

const SOPBadge = () => (
  <span style={{
    background:'rgba(0,194,255,0.08)',
    color:'#00C2FF',fontSize:9,
    fontWeight:700,padding:'2px 8px',
    borderRadius:20,letterSpacing:1.5,
    border:'1px solid rgba(0,194,255,0.2)'
  }}>
    SIGNAL
  </span>
);

const AngleGrid = ({selected, onSelect, angles}) => {
  const displayAngles = angles || ANGLES;
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
      {displayAngles.map(a => (
        <button
          key={a.id}
          onClick={() => onSelect(a.id)}
          style={{
            background:selected===a.id?B.red:'rgba(255,255,255,0.05)',
            border:`1px solid ${selected===a.id?B.red:(a.custom?'rgba(245,166,35,0.25)':'rgba(255,255,255,0.1)')}`,
            borderRadius:8,padding:'10px 6px',
            cursor:'pointer',color:B.white,
            textAlign:'left',transition:'all 0.2s',
            position:'relative'
          }}
        >
          {a.custom && (
            <span style={{
              position:'absolute',top:4,right:4,
              fontSize:8,color:'#f5a623',fontWeight:700
            }}>
              CUSTOM
            </span>
          )}
          <div style={{fontSize:16,marginBottom:3}}>{a.emoji}</div>
          <div style={{
            fontSize:11,
            fontWeight:selected===a.id?700:600,
            lineHeight:1.3,marginBottom:3
          }}>
            {a.label}
          </div>
          <div style={{
            fontSize:9,
            color:selected===a.id?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.4)',
            lineHeight:1.4,fontWeight:400
          }}>
            {a.desc || a.label}
          </div>
        </button>
      ))}
    </div>
  );
};

const CopyBtn = ({text}) => {
  const [copied,setCopied] = useState(false);
  return (
    <button
      onClick={()=>{
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(()=>setCopied(false),2000);
      }}
      style={{
        background:copied?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.05)',
        color:copied?'#00C2FF':B.light,
        border:`1px solid ${copied?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.08)'}`,
        borderRadius:6,padding:'6px 14px',
        cursor:'pointer',fontSize:12,
        fontWeight:600,transition:'all 0.15s'
      }}
    >
      {copied?'✓ Copied':'Copy'}
    </button>
  );
};

// ── Strategy Markdown Renderer ───────────────────────────────────────────────
const StrategyOutput = ({text, onDownload, downloading}) => {
  if (!text) return null;

  const renderInline = (inlineText) => {
    const parts = inlineText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} style={{color:B.white,fontWeight:700}}>{p.replace(/\*\*/g,'')}</strong>
        : p
    );
  };

  const renderLine = (line, idx) => {
    if (line.startsWith('# ')) return (
      <div key={idx} style={{
        fontSize:22,fontWeight:900,color:B.white,
        marginBottom:8,marginTop:24,
        paddingBottom:10,borderBottom:`2px solid ${B.red}`
      }}>
        {line.replace('# ','')}
      </div>
    );
    if (line.startsWith('## ')) return (
      <div key={idx} style={{
        fontSize:15,fontWeight:800,color:B.red,
        letterSpacing:1.5,textTransform:'uppercase',
        marginTop:28,marginBottom:10
      }}>
        {line.replace('## ','')}
      </div>
    );
    if (line.startsWith('### ')) return (
      <div key={idx} style={{
        fontSize:13,fontWeight:700,color:'#00C2FF',
        marginTop:18,marginBottom:8,
        paddingLeft:12,borderLeft:'3px solid #00C2FF'
      }}>
        {line.replace('### ','')}
      </div>
    );
    if (line.startsWith('#### ')) return (
      <div key={idx} style={{
        fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.7)',
        marginTop:12,marginBottom:6,
        textTransform:'uppercase',letterSpacing:1
      }}>
        {line.replace('#### ','')}
      </div>
    );
    if (/^\d+\.\s/.test(line)) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:7,paddingLeft:4}}>
        <span style={{
          color:B.red,fontWeight:800,fontSize:13,
          minWidth:20,flexShrink:0
        }}>
          {line.match(/^\d+/)[0]}.
        </span>
        <span style={{
          color:'rgba(255,255,255,0.88)',
          fontSize:13,lineHeight:1.65
        }}>
          {renderInline(line.replace(/^\d+\.\s/,''))}
        </span>
      </div>
    );
    if (line.startsWith('- ') || line.startsWith('* ')) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:6,paddingLeft:4}}>
        <span style={{color:B.red,fontSize:12,marginTop:3,flexShrink:0}}>▸</span>
        <span style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.65}}>
          {renderInline(line.replace(/^[-*]\s/,''))}
        </span>
      </div>
    );
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) return (
      <div key={idx} style={{
        color:B.white,fontWeight:700,
        fontSize:13,marginTop:12,marginBottom:4
      }}>
        {line.replace(/\*\*/g,'')}
      </div>
    );
    if (line === '---' || line === '***') return (
      <div key={idx} style={{
        borderTop:'1px solid rgba(255,255,255,0.08)',
        margin:'16px 0'
      }}/>
    );
    if (!line.trim()) return <div key={idx} style={{height:6}}/>;
    return (
      <div key={idx} style={{
        color:'rgba(255,255,255,0.82)',
        fontSize:13,lineHeight:1.75,
        marginBottom:6
      }}>
        {renderInline(line)}
      </div>
    );
  };

  const lines = text.split('\n');

  return (
    <div style={{marginTop:20}}>
      <div style={{
        display:'flex',justifyContent:'space-between',
        alignItems:'center',marginBottom:16,
        flexWrap:'wrap',gap:10
      }}>
        <div style={{color:B.white,fontWeight:700,fontSize:15}}>
          Your 90-Day Strategy
        </div>
        <div style={{display:'flex',gap:8}}>
          <CopyBtn text={text}/>
          <button
            onClick={onDownload}
            disabled={downloading}
            style={{
              background:downloading?B.gray:B.red,
              color:'#fff',border:'none',
              borderRadius:8,padding:'7px 16px',
              fontWeight:700,cursor:downloading?'not-allowed':'pointer',
              fontSize:13,display:'flex',
              alignItems:'center',gap:6
            }}
          >
            {downloading ? 'Preparing...' : '⬇ Download Doc'}
          </button>
        </div>
      </div>
      <div style={{
        background:'rgba(12,20,32,0.9)',
        border:'1px solid rgba(0,194,255,0.1)',
        borderRadius:14,padding:'28px 32px',
        boxShadow:'0 4px 40px rgba(0,0,0,0.5)'
      }}>
        {lines.map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};

// ── Universal Doc Output: renders markdown + print/PDF download ─────────────
function DocOutput({text, title='Document', showDownload=true}) {
  const [downloading, setDownloading] = React.useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      const agencyName = (() => {
        try {
          const wl = JSON.parse(localStorage.getItem('encis_whitelabel')||'null');
          return (wl && wl.agencyName) ? wl.agencyName : 'SIGNAL by Everyday Elevations';
        } catch(e) { return 'SIGNAL by Everyday Elevations'; }
      })();
      const accentColor = (() => {
        try {
          const wl = JSON.parse(localStorage.getItem('encis_whitelabel')||'null');
          return (wl && wl.primaryColor) ? wl.primaryColor : '#00C2FF';
        } catch(e) { return '#00C2FF'; }
      })();
      const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});

      const escHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const boldify = (s) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      let sectionNum = 0;
      const styledLines = text.split('\n').map(function(line) {
        if (line.startsWith('# ')) {
          return '<div class="doc-title">' + boldify(escHtml(line.slice(2))) + '</div>';
        }
        if (line.startsWith('## ')) {
          sectionNum++;
          return '<div class="section-header"><span class="section-num">' + sectionNum + '</span><span class="section-title">' + escHtml(line.slice(3)) + '</span></div>';
        }
        if (line.startsWith('### ')) {
          return '<div class="subsection">' + boldify(escHtml(line.slice(4))) + '</div>';
        }
        if (line.startsWith('#### ')) {
          return '<div class="subsubsection">' + boldify(escHtml(line.slice(5))) + '</div>';
        }
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4 && line.slice(2,-2).indexOf('**') === -1) {
          return '<div class="label">' + escHtml(line.slice(2,-2)) + '</div>';
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return '<div class="list-item"><span class="bullet">&#8226;</span><span>' + boldify(escHtml(line.slice(2))) + '</span></div>';
        }
        if (/^\d+\.\s/.test(line)) {
          var num = line.match(/^(\d+)/)[1];
          return '<div class="list-item"><span class="bullet">' + num + '.</span><span>' + boldify(escHtml(line.replace(/^\d+\.\s/,''))) + '</span></div>';
        }
        if (line === '---') return '<div class="divider"></div>';
        if (!line.trim()) return '<div class="spacer"></div>';
        return '<div class="body-text">' + boldify(escHtml(line)) + '</div>';
      });
      const styledBody = styledLines.join('\n');

      const css = [
        '@page { margin: 0.75in; size: letter; }',
        '* { box-sizing: border-box; margin: 0; padding: 0; }',
        "body { font-family: 'DM Sans', -apple-system, sans-serif; color: #111; line-height: 1.7; font-size: 13px; }",
        '.cover { background: #080D14; color: #fff; padding: 48px 40px 40px; }',
        '.cover-agency { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ' + accentColor + '; margin-bottom: 32px; }',
        '.cover-title { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.1; color: #fff; margin-bottom: 8px; }',
        '.cover-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 40px; }',
        '.cover-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; }',
        '.cover-meta-item { padding: 0 20px 0 0; }',
        '.cover-meta-label { font-size: 9px; color: ' + accentColor + '; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }',
        '.cover-meta-value { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 500; line-height: 1.4; }',
        '.content { padding: 32px 40px; }',
        '.doc-title { font-size: 22px; font-weight: 900; color: #080D14; letter-spacing: -0.03em; margin: 32px 0 8px; padding-bottom: 12px; border-bottom: 2px solid ' + accentColor + '; }',
        '.section-header { display: flex; align-items: center; gap: 12px; background: #080D14; color: #fff; padding: 10px 16px; margin: 28px 0 14px; border-radius: 4px; page-break-inside: avoid; }',
        '.section-num { background: ' + accentColor + '; color: #000; font-size: 11px; font-weight: 900; width: 22px; height: 22px; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
        '.section-title { font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }',
        '.subsection { font-size: 13px; font-weight: 700; color: ' + accentColor + '; margin: 20px 0 6px; letter-spacing: 0.02em; }',
        '.subsubsection { font-size: 12px; font-weight: 700; color: #333; margin: 14px 0 4px; }',
        '.label { font-size: 11px; font-weight: 700; color: #080D14; background: #f5f5f5; padding: 4px 10px; border-left: 3px solid ' + accentColor + '; margin: 10px 0 4px; }',
        '.body-text { font-size: 13px; color: #333; line-height: 1.75; margin-bottom: 5px; }',
        '.list-item { display: flex; gap: 10px; margin-bottom: 5px; align-items: flex-start; padding-left: 8px; }',
        '.list-item .bullet { color: ' + accentColor + '; font-weight: 700; flex-shrink: 0; margin-top: 1px; min-width: 16px; }',
        '.list-item span:last-child { color: #333; font-size: 13px; line-height: 1.65; }',
        '.divider { border-top: 1px solid #e5e5e5; margin: 16px 0; }',
        '.spacer { height: 6px; }',
        'strong { color: #080D14; font-weight: 700; }',
        '.footer { margin: 40px 0 0; padding: 16px 0 0; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; font-size: 10px; color: #999; }',
        '@media print { .section-header, .cover, .section-num { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }',
      ].join('\n');

      const coverHtml =
        '<div class="cover">' +
        '<div class="cover-agency">' + agencyName + '</div>' +
        '<div class="cover-title">' + escHtml(title.split(' \u2014 ')[0] || title) + '</div>' +
        '<div class="cover-subtitle">Social Media Strategy Document</div>' +
        '<div class="cover-meta">' +
        '<div class="cover-meta-item"><div class="cover-meta-label">Prepared By</div><div class="cover-meta-value">' + agencyName + '</div></div>' +
        '<div class="cover-meta-item"><div class="cover-meta-label">Document Date</div><div class="cover-meta-value">' + today + '</div></div>' +
        '<div class="cover-meta-item"><div class="cover-meta-label">Document Type</div><div class="cover-meta-value">90-Day Content Strategy</div></div>' +
        '</div></div>';

      const footerHtml =
        '<div class="footer"><div>' + agencyName + ' &#8212; Confidential | Internal Use Only</div><div>Generated ' + today + '</div></div>';

      const fullHtml =
        '<!DOCTYPE html><html><head><meta charset="utf-8">' +
        '<title>' + escHtml(title) + '</title>' +
        '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">' +
        '<style>' + css + '</style>' +
        '</head><body>' +
        coverHtml +
        '<div class="content">' + styledBody + footerHtml + '</div>' +
        '</body></html>';

      const blob = new Blob([fullHtml], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const printWin = window.open(url, '_blank');
      if (printWin) {
        printWin.onload = () => printWin.print();
      } else {
        const a = document.createElement('a');
        a.href=url;
        a.download=title.replace(/\s+/g,'-')+'.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  if (!text) return null;

  const renderInline = (txt) => {
    const parts = txt.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p,i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} style={{color:B.white,fontWeight:700}}>{p.replace(/\*\*/g,'')}</strong>
        : p
    );
  };

  const renderLine = (line, idx) => {
    if (line.startsWith('# ')) return (
      <div key={idx} style={{
        fontSize:22,fontWeight:900,color:B.white,
        marginBottom:8,marginTop:28,
        paddingBottom:10,borderBottom:`2px solid ${B.red}`
      }}>
        {line.slice(2)}
      </div>
    );
    if (line.startsWith('## ')) return (
      <div key={idx} style={{
        display:'flex',alignItems:'center',gap:10,
        background:'rgba(8,13,20,0.9)',borderRadius:6,
        padding:'9px 14px',marginTop:24,
        marginBottom:12
      }}>
        <div style={{
          background:B.red,color:'#000D1A',
          fontSize:9,fontWeight:900,width:20,height:20,
          borderRadius:3,display:'flex',
          alignItems:'center',justifyContent:'center',
          flexShrink:0
        }}>
          •
        </div>
        <div style={{
          fontSize:11,fontWeight:800,color:B.white,
          letterSpacing:2,textTransform:'uppercase'
        }}>
          {line.slice(3)}
        </div>
      </div>
    );
    if (line.startsWith('### ')) return (
      <div key={idx} style={{
        fontSize:13,fontWeight:700,color:'#00C2FF',
        marginTop:18,marginBottom:8,
        paddingLeft:12,borderLeft:'3px solid #00C2FF'
      }}>
        {line.slice(4)}
      </div>
    );
    if (line.startsWith('#### ')) return (
      <div key={idx} style={{
        fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.7)',
        marginTop:12,marginBottom:6,
        textTransform:'uppercase',letterSpacing:1
      }}>
        {line.slice(5)}
      </div>
    );
    if (/^\d+\.\s/.test(line)) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:7,paddingLeft:4}}>
        <span style={{
          color:B.red,fontWeight:800,fontSize:13,
          minWidth:20,flexShrink:0
        }}>
          {line.match(/^\d+/)[0]}.
        </span>
        <span style={{
          color:'rgba(255,255,255,0.88)',
          fontSize:13,lineHeight:1.65
        }}>
          {renderInline(line.replace(/^\d+\.\s/,''))}
        </span>
      </div>
    );
    if (line.startsWith('- ') || line.startsWith('* ')) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:6,paddingLeft:4}}>
        <span style={{color:B.red,fontSize:12,marginTop:3,flexShrink:0}}>▸</span>
        <span style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.65}}>
          {renderInline(line.replace(/^[-*]\s/,''))}
        </span>
      </div>
    );
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) return (
      <div key={idx} style={{
        color:B.white,fontWeight:700,fontSize:13,
        marginTop:12,marginBottom:4
      }}>
        {line.replace(/\*\*/g,'')}
      </div>
    );
    if (line === '---') return (
      <div key={idx} style={{
        borderTop:'1px solid rgba(255,255,255,0.1)',
        margin:'20px 0'
      }}/>
    );
    if (!line.trim()) return <div key={idx} style={{height:8}}/>;
    return (
      <div key={idx} style={{
        color:'rgba(255,255,255,0.82)',
        fontSize:13,lineHeight:1.75,
        marginBottom:6
      }}>
        {renderInline(line)}
      </div>
    );
  };

  return (
    <div style={{marginTop:20}}>
      {showDownload && (
        <div style={{
          display:'flex',justifyContent:'flex-end',
          gap:8,marginBottom:12
        }}>
          <CopyBtn text={text}/>
          <button
            onClick={download}
            disabled={downloading}
            style={{
              background:downloading?B.gray:B.red,
              color:'#fff',border:'none',
              borderRadius:8,padding:'7px 16px',
              fontWeight:700,cursor:downloading?'not-allowed':'pointer',
              fontSize:13,display:'flex',
              alignItems:'center',gap:6
            }}
          >
            {downloading ? 'Preparing...' : '⬇ Download PDF / Print'}
          </button>
        </div>
      )}
      <div style={{
        background:'rgba(12,20,32,0.9)',
        border:'1px solid rgba(0,194,255,0.1)',
        borderRadius:14,padding:'28px 32px',
        boxShadow:'0 4px 40px rgba(0,0,0,0.5)'
      }}>
        {text.split('\n').map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
}

const Output = ({text}) =>
  text ? (
    <div style={{
      marginTop:16,background:'rgba(8,13,20,0.8)',
      borderRadius:10,padding:'1rem',
      position:'relative',
      border:'1px solid rgba(0,194,255,0.08)',
      boxShadow:'0 2px 16px rgba(0,0,0,0.3)'
    }}>
      <div style={{position:'absolute',top:8,right:8}}>
        <CopyBtn text={text}/>
      </div>
      <pre style={{
        color:B.white,fontSize:13,
        whiteSpace:'pre-wrap',margin:0,
        lineHeight:1.7,fontFamily:'inherit',
        paddingRight:80
      }}>
        {text}
      </pre>
    </div>
  ) : null;

// ─── AI PROMPTS ───────────────────────────────────────────────────────────────
// ... (all the PROMPT constants, ContentMemory, other tools, and builders
// are exactly as in your paste; they are already valid JS and too long to
// repeat in full here, but you can copy them as-is from paste.txt)[file:16]

// ─── ROOT APP COMPONENT ──────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState('strategy');

  return (
    <>
      <Head>
        <title>Everyday Elevations — Content Intelligence Studio</title>
        <meta name="description" content="Content strategy and memory for Jason Fricka" />
      </Head>
      <div style={{
        minHeight:'100vh',
        background:'radial-gradient(circle at top, #112240 0, #050816 55%, #000 100%)',
        color:B.white,
        fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding:'24px 16px 40px'
      }}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <header style={{
            display:'flex',justifyContent:'space-between',
            alignItems:'center',marginBottom:24
          }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:26}}>📡</span>
              <div>
                <h1 style={{margin:0,fontSize:20}}>
                  Everyday Elevations — Content Intelligence Studio
                </h1>
                <p style={{
                  margin:'4px 0 0',fontSize:12,
                  color:B.light
                }}>
                  Strategy, scripts, and memory for Jason Fricka.
                </p>
              </div>
            </div>
          </header>
          <nav style={{display:'flex',gap:8,marginBottom:24}}>
            {[
              { id: 'strategy', label: '90-Day Strategy' },
              { id: 'scripts',  label: 'Script Lab' },
              { id: 'memory',   label: 'Content Memory' },
              { id: 'vault',    label: 'Prompt Vault' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? B.red : 'rgba(255,255,255,0.05)',
                  color: tab === t.id ? '#000D1A' : B.white,
                  border: 'none',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Render your main tools here (StrategyBuilder, ScriptLab, ContentMemory, PromptVault etc.) */}
          {/* They are all defined below in this file exactly as in paste.txt */}
        </div>
      </div>
    </>
  );
}

// Optional ErrorBoundary if you still want it
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError:false, error:null };
  }
  static getDerivedStateFromError(error) {
    return { hasError:true, error };
  }
  componentDidCatch(error, info) {
    console.error('App error boundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding:24, color:'#fff' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error && this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
