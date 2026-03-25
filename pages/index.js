import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Head from 'next/head';
import EighthAscentLogo from '../components/EighthAscentLogo';

// ─── BRAND ────────────────────────────────────────────────────────────────
const B = {
  navy:   '#080D14',   // obsidian deepest background
  navy2:  '#0C1420',   // surface cards and panels
  navy3:  '#111B2B',   // elevated inputs, hover
  red:    '#00C2FF',   // signal cyan primary accent (replaces red throughout)
  white:  '#F1F5F9',   // off-white cooler, more premium than pure white
  gray:   '#5A6A82',   // muted secondary text
  light:  '#8B9AB4',   // light gray tertiary text
  gold:   '#C9A84C',   // gold premium badges only, use sparingly
};

// ─CONTENT ANGLES ──────────────────────────────────────────────────────────
// Content angles mapped to Dr. Peggy Swarbrick's 8 Dimensions of Wellness
const ANGLES = [
  { id:'emotional', label:'Emotional',      dimension:'Emotional',      desc:'Self-awareness, stress, identity, how you talk to yourself' },
  { id:'physical', label:'Physical',       dimension:'Physical',       desc:'Training, sleep, recovery, nutrition, daily movement' },
  { id:'social', label:'Social',         dimension:'Social',         desc:'Relationships, community, parenting, connection, belonging' },
  { id:'intellectual', label:'Intellectual',   dimension:'Intellectual',   desc:'Learning, problem-solving, curiosity, skills, sharp thinking' },
  { id:'occupational', label:'Occupational',   dimension:'Occupational',   desc:'Work ethic, career, HR, real estate, purpose in what you do' },
  { id:'financial', label:'Financial',      dimension:'Financial',      desc:'Real estate, money habits, building wealth, smart decisions' },
  { id:'environmental', label:'Environmental',  dimension:'Environmental',  desc:'Colorado, outdoor life, your physical space, the world around you' },
  { id:'spiritual', label:'Spiritual',      dimension:'Spiritual',      desc:'Purpose, values, what drives you, the reason behind the work' },
];

// ═════════════════════════════════════════════════════════════════════════════
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

const VOICE = `Write in Jason Fricka's voice.

WHO HE IS:
Jason is an HR Manager at a cabinet manufacturing company in Colorado — this is his primary career and where he spends most of his working hours. He deals with real HR every day: benefits, compliance, employee issues, hiring, difficult conversations, management problems. He knows what it's like to be the person everyone comes to when something goes wrong at work.

He's also a licensed real estate agent serving veterans and families in the South Denver Metro area. He's a dad, a veteran, an endurance athlete training toward bigger challenges, and he hosts a podcast called Everyday Elevations. He manages multiple responsibilities simultaneously and knows what that pressure actually feels like.

HOW HE TALKS:
Direct. No fluff. Short sentences. Real stories. He sits across the table from you and tells you what he actually thinks. He doesn't hype things up. He doesn't use words like "transform" or "journey" or "find your potential." He says what he means. He talks about hard days, early mornings, the work nobody sees, and why showing up matters even when it doesn't feel like it.

His community is everyday people who carry a lot — jobs, families, financial pressure, physical goals — and refuse to stay where they are. He roots for them out loud.

Today is \${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}.

Write like him, not like a marketer writing about him. Never use em dashes. Never use AI buzzwords like "delve", "tapestry", "comprehensive", "leverage", "utilize", "paradigm", "synergy", "robust", "holistic", "facilitate", "foster", "streamline", or "cutting-edge". No hype. No filler. Jason does not talk like a LinkedIn consultant.`;

// ═════════════════════════════════════════════════════════════════════════════
const PLATFORMS = ['Instagram','YouTube','Facebook','LinkedIn','X','TikTok'];

// ═════════════════════════════════════════════════════════════════════════════
const TIER_PROMPTS = [
  { label:'Quick Pulse', desc:'Top 3 viral angles right now', depth:'surface' },
  { label:'Deep Dive', desc:'Trend analysis + audience psychology', depth:'medium' },
  { label:'Competitor Intel', desc:'What competitors are missing', depth:'deep' },
  { label:'Full Intel', desc:'Everything: trends, gaps, scripts, angles', depth:'full' },
];

// ═════════════════════════════════════════════════════════════════════════════
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
    'Write a viral X thread on [topic] hook tweet + 8 supporting tweets + CTA',
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

// ═════════════════════════════════════════════════════════════════════════════
async function ai(message, system='You are a helpful content strategist.') {
  const res = await fetch('/api/claude', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ system, message })
  });
  const d = await res.json();
  const result = d.text || d.result || d.error || 'No response';
  if (result && result !== 'No response' && !result.startsWith('Error')) {
    try {
      await saveToSupabase({
        type: 'content',
        title: message.slice(0, 80),
        preview: result.slice(0, 500),
        full: result,
        notes: 'auto-saved',
      });
    } catch(e) { /* silent */ }
  }
  return result;
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

// ═════════════════════════════════════════════════════════════════════════════
const Spin = () => (
  <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}>
    <div style={{width:32,height:32,border:'2px solid rgba(0,194,255,0.15)',borderTopColor:'#00C2FF',
      borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
  </div>
);

const RedBtn = ({onClick,disabled,children,style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? '#9CA3AF' : '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '11px 22px',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    width: '100%',
    ...style
  }}>
    {children}
  </button>
);
const Card = ({children,style={}}) => (
  <div className="signal-card" style={{
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    ...style
  }}>
    {children}
  </div>
);

const SecLabel = ({children, style={}}) => (
  <div style={{fontSize:9,fontWeight:700,letterSpacing:2.5,color:'#2563EB',
    textTransform:'uppercase',marginBottom:8,...style}}>
    {children}
  </div>
);

const SOPBadge = () => (
  <span style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',fontSize:9,
    fontWeight:700,padding:'2px 8px',borderRadius:20,letterSpacing:1.5,border:'1px solid rgba(0,194,255,0.2)'}}>
    SIGNAL
  </span>
);

const AngleGrid = ({selected, onSelect, angles}) => {
  const displayAngles = angles || ANGLES;
  return (
    <div className="signal-grid-auto" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
      {displayAngles.map(a => (
        <button key={a.id} onClick={() => onSelect(a.id)}
          style={{background:selected===a.id?'#2563EB':'#F9FAFB',
            border:`1px solid ${selected===a.id?'#2563EB':(a.custom?'#F59E0B':'#E5E7EB')}`,
            borderRadius:8,padding:'10px 6px',cursor:'pointer',color:'#111827',
            textAlign:'left',transition:'all 0.2s',position:'relative'}}>
          {a.custom && <span style={{position:'absolute',top:4,right:4,fontSize:8,color:'#f5a623',fontWeight:700}}>CUSTOM</span>}
          <div style={{fontSize:11,fontWeight:selected===a.id?700:600,lineHeight:1.3,marginBottom:3,color:selected===a.id?'#FFFFFF':'#111827'}}>{a.label}</div>
          <div style={{fontSize:9,color:selected===a.id?'#FFFFFF':'#9CA3AF',lineHeight:1.4,fontWeight:400}}>
            {a.desc || a.label}
          </div>
        </button>
      ))}
    </div>
  );
};

const SaveButton = ({entry, style={}}) => {
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const handle = async () => {
    if (saved || saving) return;
    setSaving(true);
    await saveToSupabase({...entry, full: entry.full || entry.preview || ''});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  return (
    <button onClick={handle} disabled={saving || saved} style={{
      background: saved ? 'rgba(39,174,96,0.15)' : 'rgba(0,194,255,0.08)',
      color: saved ? '#27ae60' : '#00C2FF',
      border: `1px solid ${saved ? 'rgba(39,174,96,0.3)' : 'rgba(0,194,255,0.2)'}`,
      borderRadius: 7,
      padding: '6px 14px',
      fontSize: 12,
      fontWeight: 700,
      cursor: saving || saved ? 'default' : 'pointer',
      transition: 'all 0.2s',
      ...style,
    }}>
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
    </button>
  );
};

const CopyBtn = ({text}) => {
  const [copied,setCopied] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
      style={{background:copied?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.05)',color:copied?'#00C2FF':'#374151',border:`1px solid ${copied?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.08)'}`,
        borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600,transition:'all 0.15s'}}>
      {copied?'Copied':'Copy'}
    </button>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const StrategyOutput = ({text, onCopy, onDownload, downloading}) => {
  if (!text) return null;

  // Parse markdown into structured sections
  let sectionCounter = 0;
  const renderLine = (line, idx) => {
    if (line.startsWith('# ')) return (
      <div key={idx} style={{fontSize:22,fontWeight:900,color:'#111827',marginBottom:8,marginTop:24,paddingBottom:10,borderBottom:`2px solid ${'#2563EB'}`}}>
        {line.replace('# ','')}
      </div>
    );
    if (line.startsWith('## ')) return (
      <div key={idx} style={{fontSize:15,fontWeight:800,color:'#2563EB',letterSpacing:1.5,textTransform:'uppercase',marginTop:28,marginBottom:10}}>
        {line.replace('## ','')}
      </div>
    );
    if (line.startsWith('### ')) return (
      <div key={idx} style={{fontSize:13,fontWeight:700,color:'#00C2FF',marginTop:18,marginBottom:8,paddingLeft:12,borderLeft:'3px solid #00C2FF'}}>
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
        <span style={{color:'#2563EB',fontWeight:800,fontSize:13,minWidth:20,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span>
        <span style={{color:'rgba(255,255,255,0.88)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^\d+\.\s/,''))}</span>
      </div>
    );
    
    let items
    if (line.startsWith('- ') || line.startsWith('* ')) return (
      <div key={idx} style={{display:'flex',gap:10,marginBottom:6,paddingLeft:4}}>
        <span style={{color:'#2563EB',fontSize:12,marginTop:3,flexShrink:0}}>▸</span>
        <span style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^[-*]\s/,''))}</span>
      </div>
    );
    // Bold-only lines (labels)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) return (
      <div key={idx} style={{color:'#111827',fontWeight:700,fontSize:13,marginTop:12,marginBottom:4}}>
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
        ? <strong key={i} style={{color:'#111827',fontWeight:700}}>{p.replace(/\*\*/g,'')}</strong>
        : p
    );
  };

  const lines = text.split('\n');

  return (
    <div style={{marginTop:20}}>
      {/* Header bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div style={{color:'#111827',fontWeight:700,fontSize:15}}>Your 90-Day Strategy</div>
        <div style={{display:'flex',gap:8}}>
          <CopyBtn text={text}/>
          <button onClick={onDownload} disabled={downloading}
            style={{background:downloading?'#6B7280':'#2563EB',color:'#fff',border:'none',
              borderRadius:8,padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',
              fontSize:13,display:'flex',alignItems:'center',gap:6}}>
            {downloading ? 'Preparing...' : 'Download Doc'}
          </button>
        </div>
      </div>

      {/* Rendered strategy */}
      <div style={{background:'rgba(12,20,32,0.9)',border:'1px solid #E5E7EB',borderRadius:14,padding:'28px 32px',boxShadow:'0 4px 40px rgba(0,0,0,0.5)'}}>
        {lines.map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};

// Universal Doc Output: renders markdown + print/PDF download
function DocOutput({text, title='Document', showDownload=true}) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      // Convert markdown to clean printable HTML
      const htmlBody = text
        .split('\n')
        .map(line => {
          if (line.startsWith('# '))  return `<h1>${line.slice(2)}</h1>`;
          if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
          if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
          if (line.startsWith('#### ')) return `<h4>${line.slice(5)}</h4>`;
          if (line.startsWith('- ') || line.startsWith('* ')) return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</li>`;
          if (/^\d+\.\s/.test(line)) return `<li>${line.replace(/^\d+\.\s/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</li>`;
          if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.replace(/\*\*/g,'')}</strong>`;
          if (!line.trim()) return '<br>';
          return `<p>${line.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`;
        })
        .join('\n');

      // Build agency-grade PDF document using string concat (no nested template literals)
      const agencyName = (() => { try { const wl = JSON.parse(localStorage.getItem('encis_whitelabel')||'null'); return (wl && wl.agencyName) ? wl.agencyName : 'SIGNAL by Everyday Elevations'; } catch(e) { return 'SIGNAL by Everyday Elevations'; } })();
      const accentColor = (() => { try { const wl = JSON.parse(localStorage.getItem('encis_whitelabel')||'null'); return (wl && wl.primaryColor) ? wl.primaryColor : '#00C2FF'; } catch(e) { return '#00C2FF'; } })();
      const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});

      // Convert markdown lines to styled HTML
      let sectionNum = 0;
      const escHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const boldify = (s) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

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

      // CSS (no template expressions accent color injected via style attribute workaround)
      const css = [
        '@page { margin: 0.75in; size: letter; }',
        '* { box-sizing: border-box; margin: 0; padding: 0; }',
        "body { font-family: 'DM Sans', -apple-system, sans-serif; color: #111; line-height: 1.7; font-size: 13px; }",
        '.cover { background: #F7F9FC; color: #fff; padding: 48px 40px 40px; }',
        '.cover-agency { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: ' + accentColor + '; margin-bottom: 32px; }',
        '.cover-title { font-size: 36px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.1; color: #fff; margin-bottom: 8px; }',
        '.cover-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 40px; }',
        '.cover-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; }',
        '.cover-meta-item { padding: 0 20px 0 0; }',
        '.cover-meta-label { font-size: 9px; color: ' + accentColor + '; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }',
        '.cover-meta-value { font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 500; line-height: 1.4; }',
        '.content { padding: 32px 40px; }',
        '.doc-title { font-size: 22px; font-weight: 900; color: #080D14; letter-spacing: -0.03em; margin: 32px 0 8px; padding-bottom: 12px; border-bottom: 2px solid ' + accentColor + '; }',
        '.section-header { display: flex; align-items: center; gap: 12px; background: #F7F9FC; color: #fff; padding: 10px 16px; margin: 28px 0 14px; border-radius: 4px; page-break-inside: avoid; }',
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

      const coverHtml = '<div class="cover">'
        + '<div class="cover-agency">' + agencyName + '</div>'
        + '<div class="cover-title">' + escHtml(title.split(' \u2014 ')[0] || title) + '</div>'
        + '<div class="cover-subtitle">Social Media Strategy Document</div>'
        + '<div class="cover-meta">'
        + '<div class="cover-meta-item"><div class="cover-meta-label">Prepared By</div><div class="cover-meta-value">' + agencyName + '</div></div>'
        + '<div class="cover-meta-item"><div class="cover-meta-label">Document Date</div><div class="cover-meta-value">' + today + '</div></div>'
        + '<div class="cover-meta-item"><div class="cover-meta-label">Document Type</div><div class="cover-meta-value">90-Day Content Strategy</div></div>'
        + '</div></div>';

      const footerHtml = '<div class="footer"><div>' + agencyName + ' &#8212; Confidential | Internal Use Only</div><div>Generated ' + today + '</div></div>';

      const fullHtml = '<!DOCTYPE html><html><head><meta charset="utf-8">'
        + '<title>' + escHtml(title) + '</title>'
        + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">'
        + '<style>' + css + '</style>'
        + '</head><body>'
        + coverHtml
        + '<div class="content">' + styledBody + footerHtml + '</div>'
        + '</body></html>';

      const blob = new Blob([fullHtml], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const printWin = window.open(url, '_blank');
      if (printWin) { printWin.onload = () => printWin.print(); }
      else { const a = document.createElement('a'); a.href=url; a.download=title.replace(/\s+/g,'-')+'.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
      URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  if (!text) return null;

  let sectionCounter = 0;
  const renderLine = (line, idx) => {
    if (line.startsWith('# ')) return <div key={idx} style={{fontSize:22,fontWeight:900,color:'#111827',marginBottom:8,marginTop:28,paddingBottom:10,borderBottom:`2px solid ${'#2563EB'}`}}>{line.slice(2)}</div>;
    if (line.startsWith('## ')) {
      sectionCounter++;
      return (
        <div key={idx} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(8,13,20,0.9)',borderRadius:6,padding:'9px 14px',marginTop:24,marginBottom:12}}>
          <div style={{background:'#2563EB',color:'#000D1A',fontSize:9,fontWeight:900,width:20,height:20,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{sectionCounter}</div>
          <div style={{fontSize:11,fontWeight:800,color:'#111827',letterSpacing:2,textTransform:'uppercase'}}>{line.slice(3)}</div>
        </div>
      );
    }
    if (line.startsWith('### ')) return <div key={idx} style={{fontSize:13,fontWeight:700,color:'#00C2FF',marginTop:18,marginBottom:8,paddingLeft:12,borderLeft:'3px solid #00C2FF'}}>{line.slice(4)}</div>;
    if (line.startsWith('#### ')) return <div key={idx} style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.7)',marginTop:12,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>{line.slice(5)}</div>;
    if (/^\d+\.\s/.test(line)) return <div key={idx} style={{display:'flex',gap:10,marginBottom:7,paddingLeft:4}}><span style={{color:'#2563EB',fontWeight:800,fontSize:13,minWidth:20,flexShrink:0}}>{line.match(/^\d+/)[0]}.</span><span style={{color:'rgba(255,255,255,0.88)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^\d+\.\s/,''))}</span></div>;
    if (line.startsWith('- ') || line.startsWith('* ')) return <div key={idx} style={{display:'flex',gap:10,marginBottom:6,paddingLeft:4}}><span style={{color:'#2563EB',fontSize:12,marginTop:3,flexShrink:0}}>▸</span><span style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.65}}>{renderInline(line.replace(/^[-*]\s/,''))}</span></div>;
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) return <div key={idx} style={{color:'#111827',fontWeight:700,fontSize:13,marginTop:12,marginBottom:4}}>{line.replace(/\*\*/g,'')}</div>;
    if (line === '---') return <div key={idx} style={{borderTop:'1px solid rgba(255,255,255,0.1)',margin:'20px 0'}}/>;
    if (!line.trim()) return <div key={idx} style={{height:8}}/>;
    return <div key={idx} style={{color:'rgba(255,255,255,0.82)',fontSize:13,lineHeight:1.75,marginBottom:6}}>{renderInline(line)}</div>;
  };

  const renderInline = (txt) => {
    const parts = txt.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p,i) => p.startsWith('**') && p.endsWith('**') ? <strong key={i} style={{color:'#111827',fontWeight:700}}>{p.replace(/\*\*/g,'')}</strong> : p);
  };

  return (
    <div style={{marginTop:20}}>
      {showDownload && (
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:12}}>
          <SaveButton entry={{type:'content', title:title, preview:text.slice(0,400), full:text}}/>
          <CopyBtn text={text}/>
          <button onClick={download} disabled={downloading}
            style={{background:downloading?'#6B7280':'#2563EB',color:'#fff',border:'none',
              borderRadius:8,padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',
              fontSize:13,display:'flex',alignItems:'center',gap:6}}>
            {downloading ? 'Preparing...' : 'Download PDF / Print'}
          </button>
        </div>
      )}
      <div style={{background:'rgba(12,20,32,0.9)',border:'1px solid #E5E7EB',borderRadius:14,padding:'28px 32px',boxShadow:'0 4px 40px rgba(0,0,0,0.5)'}}>
        {text.split('\n').map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
}

const Output = ({text}) => text ? (
  <div style={{marginTop:16,background:'rgba(8,13,20,0.8)',borderRadius:10,padding:'1rem',
    position:'relative',border:'1px solid #E5E7EB',boxShadow:'0 2px 16px rgba(0,0,0,0.3)'}}>
    <div style={{position:'absolute',top:8,right:8}}><CopyBtn text={text}/></div>
    <pre style={{color:'#111827',fontSize:13,whiteSpace:'pre-wrap',margin:0,lineHeight:1.7,
      fontFamily:'inherit',paddingRight:80}}>{text}</pre>
  </div>
) : null;

// ═════════════════════════════════════════════════════════════════════════════
const SCRIPT_PROMPT = (topic, angle, platform, scriptMode, voiceContext) => `
${VOICE}
${voiceContext ? voiceContext : ''}
${CONTENT_SOP}
${SWARBRICK}

Topic: "${topic}"
Angle: ${angle}
Platform: ${platform}
Length: ${scriptMode || 'short'}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

━━━ GREENSPAN CONTENT CREATION SOP ━━━

STORY + NARRATIVE REQUIREMENTS (every script must have all four):
- Clear character setup: Who is the protagonist, what's their situation
- Relatable traits: Elements a large audience recognizes from their own life
- Conflict or tension: What's at stake, what's the problem
- Resolution or insight: The payoff — what the viewer gets for watching

HOOK RULES (Greenspan standard — non-negotiable):
First 3 seconds must hit hard. No intros. No "hey guys." No "in this video."
Value or conflict from frame 1. Use one of these hook types:
- PATTERN INTERRUPT: Challenges an assumption the audience holds right now
- CURIOSITY QUESTION: Creates a gap they must fill by watching
- BOLD STATEMENT: Counterintuitive or surprising claim — make them stop
- STORY MOMENT: Specific scene — "The day I..." or "I was sitting in my truck when..."
- DATA POINT: A number or outcome that stops them cold

TECHNICAL REQUIREMENTS (Greenspan checklist):
- Multiple transition opportunities in first 5 seconds (note them in direction)
- Additional transitions in first 15 seconds
- Visual hook: A strong opening image or action the editor can use
- Contrarian perspective: A POV that stands out from what everyone else is saying
- Authentic voice: Not corporate, not over-produced — real and direct

VIRAL STRUCTURE:
1. Hook (pattern interrupt — first 2-3 words carry everything)
2. Tension or problem (why this matters right now)
3. Story or breakdown (the real thing that happened, not theory)
4. Insight (the thing they didn't see coming)
5. Actionable takeaway (one thing they can do or think differently today)
6. CTA (60% comment-based / 20% DM / 20% link)

ORIGINALITY RULE: If this script could be filmed by 1,000 other creators unchanged, rewrite it.
Pull from lived experience. Real estate, money stress, training, relationships, turning points.

━━━ SCRIPTS ━━━

Write 3 complete camera-ready ${platform} script variations. Each must differ in hook type, energy, and structure.

---
**VARIATION 1: Educational (optimizes for saves)**
Hook Type: [pick one of the 5 — write the actual hook]
Hook: [word-for-word — first 2-3 words must land hard]

Body:
Point 1: [specific insight, no filler]
Point 2: [builds on point 1]
Point 3: [the payoff — something they didn't expect]

On-Screen Text: [keywords to overlay at each beat]
Visual Direction: [what the editor does in the first 5 seconds + transitions]
CTA: [exact words — 60% comment / 20% DM / 20% link]
Caption: [3-4 sentences, saves-first, includes the hook]
Hashtags: [5 niche / 5 mid / 5 broad]

---
**VARIATION 2: Personal Story (optimizes for follows)**
Hook Type: [Story or Pattern Interrupt]
Hook: [specific scene, not generic — a real moment from Jason's life]

Setup: [the before — where you were, what you were doing]
Conflict: [the turn — what happened or what you realized]
Resolution: [the result — specific, not vague]

On-Screen Text:
Visual Direction: [opening frame + key transition moments]
CTA: [exact words]
Caption:
Hashtags:

---
**VARIATION 3: Bold Take (optimizes for shares)**
Hook Type: [Bold Statement or Data Point]
Hook: [the take that makes people stop and argue or agree hard]

Body: [3 punchy lines that back up the claim — no hedging, no qualifying]

On-Screen Text:
Visual Direction:
CTA: [drives comments — end with a question that splits the room]
Caption:
Hashtags:

Runtime: ${scriptMode==='short'?'20-45 seconds spoken':scriptMode==='medium'?'60-90 seconds':scriptMode==='long'?'2-4 minutes':'thread format'}. No intros. No "like and subscribe." Hook first, always.

${platform === 'TikTok' ? `
TIKTOK-SPECIFIC RULES:
- First 2 words carry everything. Scroll decision is made before the third word.
- "POV:", "The thing about", "Nobody talks about", "Day X of" — these formats work.
- Shorter almost always wins. 15-30 seconds outperforms 60+ unless the hook is elite.
- Note whether this works better with trending audio or talking head.` : ''}

${platform === 'X' ? `
X / TWITTER THREAD FORMAT:
- Tweet 1 (Hook): Under 280 chars. Bold claim or counterintuitive statement. Must work standalone.
- Tweets 2-7 (Body): Each tweet one idea. Short. Numbered 2/ 3/ 4/...
- Tweet 8 (CTA): Follow, reply with your take, or link.
Total: 8-10 tweets. Every tweet worth reading alone.` : ''}
`;

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

Focus on: mindset/discipline/real estate/personal growth/outdoor lifestyle spaces.`;

const PIPELINE_EXTRACT = (rawResearch, angle) => `
${VOICE}
Today is ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}. Only reference 2026 trends and data.

Extract intelligence from this research for a ${angle} content angle. Be specific and fast. No padding.

RESEARCH:
${rawResearch}

# Intelligence Brief

## Top 3 Viral Angles Right Now
For each: angle name, the psychological trigger, why it works today, and cite the specific source or data point that confirms it (journal, publication, platform, or credible account).

## Credible Sources
List every source referenced in the research. For each: full name, URL if available, publication date, and why it is credible. Flag anything that appears to be pre-2026 or unverified.

## Audience Pain Points
What they are actively searching for and not finding. Include specific search data or platform signals where available.

## Content Gaps
What nobody credible is saying that Jason can own. Be specific.

## 5 Specific Hooks
One per type: Pattern Interrupt / Question / Bold Statement / Story / Data Point. Each grounded in the research.

## Best Format + Why

## Jason's Unique Authority
What in his background (HR, real estate, Colorado, endurance athlete, mindset coach) gives specific credibility here with reference to the research.
`;


const PIPELINE_SCRIPT = (intel, platform) => `${VOICE}
${CONTENT_SOP}

You are turning research intelligence into a camera-ready script. Be fast. No padding. Write the actual script.

PLATFORM: ${platform}
INTELLIGENCE:
${intel}

Write ONE complete, platform-optimized script based on the strongest angle from this intelligence.

Use this structure:

# Script: [Compelling Title]

## Hook (first 3 seconds)
[Word-for-word. Must stop the scroll. Platform: ${platform}]

## Opening (5-10 seconds)
[Establish context and credibility immediately]

## Core Content (main body)
[3-5 punchy beats. Each beat is 1-3 sentences. Real, specific, earned.]

## Anchor Line
[One memorable line that could stand alone]

## Close
[Bring it back to the opening promise]

## CTA
[One clear action. Platform-native for ${platform}.]

## Caption
[Platform-optimized caption with hook line, 3-sentence body, CTA]

## Tags
[10-15 relevant hashtags for ${platform}]
`;


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
- Specific topic/title (not generic : real hook)
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
**LINKEDIN** (professional, authority content, no hashtag spam)

Each version should feel native : not copy-pasted. Adjust tone, length, and CTA for each platform's culture.`;

const HOOK_PROMPT = (topic, quantity) => `
${VOICE}

Write ${quantity} hooks for the topic: "${topic}"

Deliver in 5 categories (${Math.ceil(quantity/5)} each):

PATTERN INTERRUPT (challenges assumptions, surprises)
QUESTION (creates irresistible curiosity)
BOLD STATEMENT (controversial or counterintuitive)
PERSONAL STORY (specific moment, "The day I...")
DATA & STATS (surprising number or fact)

Rules:
- First 2-3 words must grab : think thumb-stop
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

Build a complete, finished lead magnet : not a plan for one, an actual deliverable. Every section below must be fully written out, ready to use.

# LEAD MAGNET: [Title : make it specific, sounds like Jason said it]

## The Promise
One sentence: what the reader will have or be able to do after using this that they couldn't before.

## THE FULL CONTENT (write every word of the actual magnet)

### Section 1: [Name]
[Write the actual content : not a description of it. If it's a checklist, write the checklist. If it's a guide, write the guide. Real sentences, real advice, Jason's voice throughout.]

### Section 2: [Name]
[Full content]

### Section 3: [Name]
[Full content]

### Section 4: [Name]
[Full content]

### Section 5: [Name]
[Full content : minimum 5 sections, each substantive enough to be useful]

---

## DELIVERY INFRASTRUCTURE

### Instagram Reel Script (to promote it)
Hook: [word-for-word, one of the 5 hook types]
[Full 45-60 second script : drives people to comment the keyword]
CTA: "Comment [KEYWORD] and I'll send this to you right now"

### 3-Email Welcome Sequence

**Email 1 : Delivery + Quick Win**
Subject: [specific, curiosity-driven]
Body: [Full email : deliver the magnet, give one quick win they can use today, set up email 2]

**Email 2 : Personal Story + Deeper Value**
Subject: [specific]
Body: [Full email : Jason's personal story connected to the problem, deeper insight, warm into email 3]

**Email 3 : Soft CTA**
Subject: [specific]
Body: [Full email : soft pitch to next step: coaching inquiry, real estate consult, community join]

### 5-Slide Instagram Story Sequence
Slide 1: [exact text + visual direction]
Slide 2: [exact text + visual direction]
Slide 3: [exact text + visual direction]
Slide 4: [exact text + visual direction]
Slide 5: [exact text + CTA : keyword comment trigger]

### Keyword Trigger: [the word they comment to get the magnet]
### Where to send it: [DM automation or email link]`;

const COMMUNITY_PROMPT = (focus, currentEngagement, whereTheyAre, whatTheyAsk) => `
${VOICE}
${SWARBRICK}

Community focus / theme: ${focus}
What Jason's current engagement looks like: ${currentEngagement || 'Not provided'}
Where his audience currently lives (comments, DMs, Facebook, etc.): ${whereTheyAre || 'Not provided'}
What people ask Jason most or respond to most: ${whatTheyAsk || 'Not provided'}

Build an the community community system built around what is actually happening in Jason's audience right now. Not a theoretical framework. One that works with the people already showing up.

1. **Community Identity Statement**
   (why people belong here : specific to the community, in Jason's voice)

2. **The Core Ritual**
   (one recurring weekly or monthly thing members do together : simple enough to actually happen)

3. **Engagement Architecture**
   - Daily: [specific prompt or question in Jason's voice]
   - Weekly: [challenge or event tied to his content angles]
   - Monthly: [milestone or celebration that recognizes members]

4. **New Member Onboarding**
   (exactly what they see and receive when they join : what to say, what to send)

5. **5 Recurring Content Series**
   (series name + what it is + why people keep coming back for it)

6. **Growth Loop**
   (how members naturally bring other people in without being asked to)`;

const REVIEW_PROMPT = (metrics, wins, struggles, topContent, testsRan, competitorNotes, revenueData) => `
You are an elite growth operator running a lean, execution-first content business system.

Your job: turn this week's raw data into a complete 6-module review that drives clear decisions, connects actions to revenue, and improves execution speed.

No fluff. No duplicate tracking. Everything minimal and high-signal.

OPERATING RULES:
- Weekly Review is the central hub. All modules feed into it.
- Every module must produce a clear, actionable output.
- Limit weekly focus to 3 priorities, 2 tests, 1 main direction.
- If something does not improve revenue, execution, or decisions: remove it.

INPUT DATA:
METRICS THIS WEEK: ${metrics}
WINS: ${wins || 'Not provided'}
STRUGGLES: ${struggles || 'Not provided'}
TOP PERFORMING CONTENT: ${topContent || 'Not tracked yet'}
TESTS RAN: ${testsRan || 'No tests ran this week'}
COMPETITOR NOTES: ${competitorNotes || 'No competitor activity tracked'}
REVENUE / LEADS DATA: ${revenueData || 'No revenue data logged'}

---

Write the complete 6-module weekly review. Every section fully written. No placeholders.

# Weekly Review Command Center
## Week of ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

---

## Module 1: Weekly Review (Command Center)

This is the hub. Everything else feeds here. Be direct.

**3 Key Insights from this week:**
(What did the data actually show? Not observations insights. Things that change how you operate.)

**3 Priorities for next week:**
(Specific. Actionable. Connected to revenue or growth.)

**2 Things to double down on:**
(What worked? Why? What happens if you do more of it?)

**2 Things to cut:**
(What drained time or energy with no return? Be ruthless.)

**2 Tests to run next week:**
(Specific hypothesis + what you are measuring)

**1 Main direction:**
(The single thread that connects everything next week)

---

## Module 2: ROI Dashboard

Track only what moves the business. No vanity metrics.

**Top performing content this week:**
Name it. What format. What angle. What result.

**Leads generated:**
How many. From where. Quality assessment (warm / cold / wrong fit).

**Conversion rate:**
If trackable what percentage of engaged followers became DMs or leads.

**Revenue impact:**
Direct or indirect. What content led to a conversation, booking, or closed deal this week.

**Pattern:** What does this week's ROI data say about what to create more of?

---

## Module 3: Schedule (Execution Engine)

Review this week's execution against the plan.

**What got done:** List what actually published.

**What got skipped:** Name it without judgment. Identify the real reason.

**Execution rate:** Rough percentage of planned content that went out.

**For next week 5 specific scheduled pieces:**
For each:
- Content title or angle
- Platform
- Goal (reach / leads / conversion / authority)
- Test angle embedded (hook / format / CTA variation)

---

## Module 4: A/B Testing Lab

**Tests ran this week:**
What was tested. Variations. Which won. What the insight actually means for future content.

**Running hypotheses to carry forward:**
What questions are still open from prior tests.

**2 tests to run next week:**
Specific. What variable, what two variations, what metric determines the winner.

---

## Module 5: Revenue Attribution

**Lead source this week:**
Where did new DMs, inquiries, or warm conversations come from? (Instagram / YouTube / LinkedIn / referral / etc.)

**Conversion source:**
What content or touchpoint directly preceded a conversion conversation?

**Revenue by source:**
If trackable what dollar amount or pipeline value traces to which platform or content type.

**Attribution insight:**
What does this week tell you about where to focus to drive the next dollar?

---

## Module 6: Competitor Intel

**What worked for competitors this week:**
Specific content types, formats, or angles that performed well in the space.

**Why it worked:**
The psychological or algorithmic reason. Not surface-level observation.

**What to test based on competitor data:**
One specific thing to test, adapted to your voice and audience. Never copy. Extract the principle.

**What to watch next week:**
2-3 signals or accounts to monitor.

---

## Weekly Verdict

One paragraph. Plain language. What actually happened this week, what it means, and what the single most important move is going into next week.

---

## Daily Operating Rhythm (Run Every Day)

**Morning (10 min):**
- Check yesterday's top metric
- Confirm today's content is scheduled or being filmed
- One targeted DM or engagement action

**Evening (5 min):**
- Log one win from the day
- Note one friction point
- Adjust tomorrow's plan if needed

**Weekly reset (Friday or Sunday, 30 min):**
Run this full review. Input data. Read the output. Execute the plan.
`

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

2. **Stitch/Collab Targets** (5 creators to stitch with : explain the angle)

3. **Community Partnerships** (3 organizations/communities to partner with)

4. **Pitch Template**
   [Subject line]
   [Opening that shows you know their work]
   [The ask : specific and easy to say yes to]
   [The mutual value]
   [CTA]`;

const ONBOARD_PROMPT = (fields, uploadedDoc='') => {
  const sopSection = uploadedDoc
    ? `=== UPLOADED STRATEGY DOCUMENT (use as the style and depth benchmark) ===
${uploadedDoc}
=== END UPLOADED DOCUMENT ===
This document shows the standard you must match or exceed. Mirror its depth, specificity, and professional tone throughout.`
    : `${VOICE}
${CONTENT_SOP}
${SWARBRICK}`;

  return `${sopSection}

=== CLIENT BRIEF ===
Business Name: ${fields.businessName}
Goals: ${fields.goals}
Current State: ${fields.current}
Weekly Time Available: ${fields.hours} hours/week
Brand Personality: ${fields.brandPersonality}
Affiliate / Brand Deals: ${fields.affiliateDeals}
Filming Schedule: ${fields.filmingSchedule}
Inspiration Accounts (structure only, not style): ${fields.inspirationAccounts}
Off-Limit Topics: ${fields.offLimitTopics}
Content to Repurpose: ${fields.repurposeLinks}
Ideal Audience: ${fields.idealAudience}
Desired Transformation: ${fields.desiredTransformation}
Emotional Journey: ${fields.emotionalJourney}
Additional Context: ${fields.additionalContext}

=== YOUR TASK ===
You are a senior social media strategist at a premium agency. Write a complete, finished 90-day content strategy document for this client. This goes directly to the client tomorrow. Every section must be fully written not described, not outlined, not templated. Actual content. Real specifics. Named pillars, written hooks, actual hashtags, specific day-by-day plans with real tasks and time estimates.

Do not write instructions. Do not write placeholders. Do not write [brackets]. Do not describe what you will write. Write it.

Mandatory frameworks woven throughout (never name them explicitly):
- Swarbrick 8 Dimensions: each content pillar serves specific life dimensions
- 4-Layer Viewer Journey: See It (pattern interrupt, first 3 seconds) Click It (avatar callout + credibility marker) Watch It (value, no filler) Go Deeper (action-driving CTA)
- CTA split: 60% comment-based, 20% DM-trigger, 20% link-in-bio
- Primary success signal: saves and shares, not likes

Format rules:
- # for document title only
- ## for major sections (rendered as numbered dark header blocks)
- ### for subsections (rendered in accent color)
- **Label:** for field labels
- - for list items
- Write everything in the client's voice, not agency voice

=== DOCUMENT TO WRITE ===

# ${fields.businessName}: 90-Day Content Strategy

## Executive Summary

Write 4 sharp sentences: (1) Who this client is and what they stand for. (2) What these 90 days will accomplish with specific numbers. (3) The single strategic bet the one thing that makes this plan work. (4) Why this approach over every other approach.

## Brand Positioning

### Social Identity

Write one sharp paragraph that defines exactly who this person is in the online space. Name the specific category they own. Describe what makes them impossible to confuse with anyone else in their niche. This should read like the opening of their brand manifesto, not a bio.

### Voice and Tone Guardrails

**DO:**
Write 8 specific, actionable voice rules with real examples drawn from this client's life and work. Not generic rules rules specific to this person, their industry, their audience, their story.

**NEVER:**
Write 8 specific things this person must never say, post, or imply. Again, specific to this client not generic creator advice.

### Ideal Client Profile

**Attract:**
Write 5 specific audience types with a full sentence on why each belongs in this community and what they get from it.

**Repel:**
Write 5 specific audience types with a full sentence on why each is wrong for this brand and what signal they send.

### Competitive Edge

Write a specific paragraph naming the actual gap in this market who the competitors are (by type if not name), what they all do wrong, and exactly how this client fills that gap in a way nobody else currently does.

### The Transformation Promise

**Before:** Write exactly how the audience feels, thinks, and operates before they find this creator. Be specific name the frustrations, the stuck points, the daily reality.
**After:** Write exactly how they feel, think, and operate after engaging with this content consistently for 90 days.
**One sentence:** Compress the entire transformation into one powerful sentence.

## Unique Positioning Statement

Write the category-defining statement for this brand. The version of "Most physicians treat disease. Most biohackers chase trends. Dr. O'Neil restores physiology." specific to this client. Then write two sentences explaining why this is a category, not just a niche.

## Ideal Client Breakdown

Build a 3-tier client breakdown:

### Tier 1 Primary (Build authority here. Monetize here.)
Write the full profile: age range, income/professional level, geography, mindset, what they value, what they fear, how they find this creator.

### Tier 2 Growth Audience (Ecosystem builders. Referral drivers.)
Write the full profile: age range, what they want, how they engage, why they matter to the funnel.

### Tier 3 Top of Funnel (Capture. Nurture. Convert.)
Write the full profile: what brings them in, how to capture them, what moves them toward Tier 1.

## Industry and Competitive Landscape

Write an honest analysis of this market right now. Name the categories of competitors that exist (not individual people), what each category does wrong, and the specific gap this client exploits. End with a statement about what combination of attributes no one in this space is currently doing.

## Content Pillars

Build 4 complete content pillars. For each one, write everything not describe it, write it.

### Pillar 1: [Write the actual pillar name]

**Core Idea:** Write the one-sentence angle this pillar owns specific enough to reject content that doesn't belong.

**Why It Works:** Write the psychological reason this resonates. Name the specific emotion, fear, desire, or belief it activates in the target audience.

**Swarbrick Dimensions:** Name which of the 8 wellness dimensions this serves and how.

**5 Specific Filmable Ideas:**
Write 5 actual content titles/hooks specific enough to film tomorrow. Not topic areas actual hooks with specific details from this client's life.
1.
2.
3.
4.
5.

**Best Format:** Name the exact format and write the specific reason why this pillar works best in that format for this audience.

**Ideal Length:** State the exact duration and why.

**CTA:** Write the exact CTA language to use actual words, not a description of the CTA type.

**Hashtag Strategy:**
Niche (under 100K): List 5 specific hashtags
Mid (100K-1M): List 5 specific hashtags
Broad (1M+): List 5 specific hashtags

### Pillar 2: [Write the actual pillar name]
[Same complete structure as Pillar 1]

### Pillar 3: [Write the actual pillar name]
[Same complete structure as Pillar 1]

### Pillar 4: [Write the actual pillar name]
[Same complete structure as Pillar 1]

## Platform Strategy

### Instagram

**Role in Ecosystem:** One sentence what Instagram does for this business that no other platform does.

**Posting Frequency:** State exact days and times (timezone included).

**Content Mix:** State exact percentages by format with the strategic reason for each ratio.

**4-Layer Journey on Instagram:**
- See It: Write the specific pattern interrupt strategy for this client on Instagram
- Click It: Write the specific avatar callout and credibility marker approach
- Watch It: Write the specific value-delivery rules for this client's content
- Go Deeper: Write the specific CTA strategy and what action it drives

**Algorithm Priority:** Write what Instagram's algorithm rewards right now and the 3 specific things this client does to exploit it.

**Week 1 Actions:**
1. [Specific action with time estimate]
2. [Specific action with time estimate]
3. [Specific action with time estimate]

**Never Post Here:** Write 3 specific content types that will kill this account's reach and why.

### [Second active platform repeat full structure]

### [Third active platform if applicable repeat full structure]

## Previous Content Analysis

**Current State:** List what exists right now what is working, what is missing, what is inconsistent.

**What Is Working:** Name the specific elements that have traction and why.

**Opportunities:** List 6-8 specific untapped opportunities in order of impact.

## 90-Day Goals

Write specific, measurable targets for each active platform:

**Instagram:** Follower growth target, engagement rate target, non-follower reach %, short-form retention target

**Email:** Lead magnet launch dates, subscriber targets by week 4, week 8, week 12, comment conversion rate target

**YouTube (if applicable):** Episode count, CTR target, average view duration target

## 90-Day Execution Plan

### Phase 1: Foundation (Days 1-30)

**Goal:** Write the specific, measurable goal for this phase.
**Theme:** Write the one idea that every piece of content in this phase ladders up to.

**Week 1 Day by Day:**
Day 1 (write the day): [Specific task] — [time required] — [platform] — [expected output or result]
Day 2: [Same structure]
Day 3: [Same structure]
Day 4: [Same structure]
Day 5: [Same structure]
Day 6: [Same structure]
Day 7: [Same structure]

**Week 2:**
Write 4 specific focus areas with the exact actions required for each.

**Week 3:**
Write 4 specific focus areas with the exact actions required for each.

**Week 4:**
Write 4 specific focus areas with the exact actions required for each.

**Content to Batch Phase 1:**
List 15 specific content pieces with: title/hook, format, platform, and the pillar it belongs to.

**Phase 1 Complete When:**
Write 3 specific, measurable conditions that confirm Phase 1 succeeded.

### Phase 2: Momentum (Days 31-60)

**Goal:** Write the specific, measurable goal.
**Theme:** Write the one idea this phase is built on.

**Lead Magnet Launch:**
- Title: Write the actual title
- Core Promise: Write exactly what the audience gets
- Format: Specify exactly what it is
- Trigger Word: Write the exact comment keyword that triggers delivery
- Welcome Email Subject: Write the actual subject line
- Welcome Email First Line: Write the actual opening sentence

**Community Building Moves:**
Write 5 specific actions with exact timelines and expected outcomes.

**Collaboration Targets:**
Write 3 specific creator types with why each matters, how to pitch them, and what the collaboration looks like.

**Content Evolution:**
Write specifically what changes from Phase 1, what stays the same, and what gets added.

**Phase 2 Complete When:**
Write 3 specific, measurable conditions.

### Phase 3: Scale (Days 61-90)

**Goal:** Write the specific, measurable goal.
**Theme:** Write the one idea this phase drives toward.

**Repurposing Workflow:**
Step 1: [Source what gets created and where]
Step 2: [First derivative what it becomes]
Step 3: [Second derivative]
Step 4: [Third derivative]
Step 5: [Distribution where everything lands]

**Revenue Pathway:**
Write the exact funnel: content action conversion revenue. Name each step, the mechanism, and the expected conversion at each stage.

**Analytics Review Process:**
Write exactly what to check, when to check it, and what decision each data point drives.

**Phase 3 Complete When:**
Write 3 specific, measurable conditions.

## Themed Campaigns

### Campaign 1 (Days 1-30)
Write the campaign name, goal with specific numbers, daily and weekly content cadence, and the hook series that runs through it.

### Campaign 2 (Days 31-90)
Write the campaign name, goal with specific numbers, the lead magnet launch sequence, and the conversion content strategy.

## Content Production Standards

### Opening Rules
Write 5 specific rules for the first 3 seconds of every piece of content with examples drawn from this client's actual life and topics.

### Editing Standards
Write the specific editing rules: cut timing, caption style, pacing, overlays, visual variation frequency.

### Retention Rules
Write how the 4-layer journey applies to editing specific instructions for keeping people watching through to the CTA.

### Content Production Pipeline

**Filming Sessions:**
Write how often, what to capture per session, how to batch, what a full session produces.

**Topic Ideation:**
Write the specific process for generating monthly topics aligned to pillars and trends.

**Short-Form Extraction:**
Write how many clips to extract from each long-form piece, what to look for, how to re-edit for each platform.

### What Kills This Content
Write 8 specific things that will tank performance on this account specific to this client, not generic creator advice.

## Posting and Engagement SOP

**Pre-Post Window (5-10 minutes before):**
Write the exact actions to prime the algorithm for this specific account.

**Post-Post Window (first 60 minutes after):**
Write the exact actions to maximize early engagement signal.

**Daily Engagement Targets:**
- Meaningful comments on aligned accounts: [specific number] write exactly what "meaningful" means for this niche
- DM conversations: [specific number] with specific targeting criteria
- Story engagement: [specific daily actions]
- Comment response time: [specific hours]
- DM response time: [specific hours]

**Comment Response Framework:**
Write how to respond to: enthusiastic comments, questions about services, negative or skeptical comments, competitor comments, spam.

## Weekly Schedule Template

Based on ${fields.hours} hours/week. Write a realistic, specific weekly schedule.

For each active day, write: the specific time block, the task, the duration, the platform, and the specific output expected.

## Email Collection Strategy

**Lead Magnets:**
Write the full titles, core promises, and format for each lead magnet.

**CTA Distribution:**
Write the exact percentages and the specific language used for each CTA type.

**Keyword Triggers:**
Write the exact trigger words used in comments to trigger lead magnet delivery.

**Target Conversion Rate:**
Write the specific comment-to-DM conversion target.

## Communication Rhythm

Write the specific check-in and reporting cadence: weekly touchpoints, monthly calls, quarterly reviews, what each covers, who owns each.

## Monthly Reporting Structure

Write what gets measured, how it gets reported, and what decisions each metric drives. The question is never how much was posted it is what did it produce.

## Success Metrics

### Primary KPIs
For each primary metric, write: current baseline, 30-day target, 60-day target, 90-day target.

### Secondary KPIs
Write 6 secondary metrics with specific targets.

### What to Ignore
Write the vanity metrics this client must stop tracking and the specific reason each is misleading.

## Implementation Timeline

**Week 1 Foundation:**
Write 5-6 specific setup actions with owners and time estimates.

**Week 2 Launch:**
Write 4-5 specific launch actions.

**Month 2 Scale:**
Write 4-5 specific growth actions.

**Month 3 Convert:**
Write 4-5 specific conversion actions.

## Brand Positioning on Social

### Inspiration Accounts Structure, Not Style
We study how category leaders signal authority, maintain consistency, and convert attention. We are not replicating tone. The voice belongs to this client.
Write 4 inspiration accounts from ${fields.inspirationAccounts || 'the relevant space'}. For each: account name, what structural element to study (NOT their style), and the specific signal they send that works.

### Social Identity
Write the complete social identity table for this client:
- Primary positioning label and what it means
- What makes them categorically different from every other voice in this space
- The unique lens they bring that nobody else has
- The credibility signals that make the positioning believable

### Messaging on Social The Transformation We Deliver
Write a clear before/after transformation table:

**Where the audience starts:** List 5-6 specific states (feelings, situations, frustrations) the audience is in before finding this content.

**Where they end up:** List the corresponding transformed states after engaging consistently.

One-sentence transformation promise: Compress the entire journey into one precise sentence.

## Unique Positioning

Write the category-defining statement. Not a niche. A category.
Follow this structure: "Most [category A] do X. Most [category B] do Y. [Client name] does Z."
Then two sentences explaining why this is a category, not just a niche.
Then the unique competitive moat the specific combination of credentials, experience, and perspective that cannot be replicated.

## Ideal Client Breakdown Three Tiers

### Tier 1 Primary (Build authority here. Monetize here.)
Full profile: age range, income/professional level, geography, mindset, what they value, what they fear, what drives them to seek out this type of content, how they find this creator.

### Tier 2 Performance Audience (Ecosystem builders. Referral drivers.)
Full profile: age range, what they want from the content, how they engage, why they matter to the overall funnel, how they become referral sources.

### Tier 3 Top of Funnel (Capture. Nurture. Convert.)
Full profile: what brings them in, what keeps them, what moves them toward Tier 1 over time.

## Industry and Competitive Landscape

Write an honest, specific market analysis. Name the categories of competitors that exist (not individual people unless public knowledge). For each category: what they do, what they do wrong, and the specific gap they leave open. End with a callout box: "The gap we exploit: [specific combination of attributes no competitor is doing]."

## Previous Content Analysis

Based on what you know about ${fields.businessName} and ${fields.current}:

**Current State:** What exists right now what platforms, what cadence, what format, what is inconsistent.

**What Is Working:** Specific elements that have traction and why.

**What Is Missing:** The 6-8 highest-impact gaps in the current content approach.

## 90-Day Goals

Write specific, measurable targets broken down by platform and by phase:

**Instagram:** Follower growth target, engagement rate target, non-follower reach %, short-form retention target, saves/week target.

**Email:** Lead magnet launch timeline, subscriber target at week 4 / week 8 / week 12, comment-to-DM conversion rate target.

**YouTube (if applicable):** Episode count, CTR target, average view duration target.

**Other platforms:** Specific targets for each active platform.

## Tests and Experiments First 90 Days

Build a structured testing table. For each test:

| Test Type | Variant A | Variant B | Metric | Adjust |

Include these 5 tests minimum:
1. Content length test (short vs medium form)
2. CTA type test (comment-based vs DM-trigger)
3. Authority placement test (first 5 seconds vs mid-content)
4. Topic angle test (specific to this client's two strongest pillars)
5. Posting time test (morning vs evening for primary platform)

All variables tested weekly. Adjust based on retention curves, save rate, and non-follower reach. Default to what the data says, not what feels right.

## Content Distribution Mix

Build a complete monthly distribution table:

**Primary platform (${fields.idealAudience ? 'Instagram' : 'Instagram'}):**
- Short-form count per month
- Long-form count per month
- Stories strategy (daily/weekly, minimum 1 opt-in story per day)
- Engagement protocol (pre-post window, post-post window, daily comment targets)

**Secondary platforms:**
For each active platform: post count, format mix, cross-post vs original, note on what this platform does that primary cannot.

## Lead Magnets

### Lead Magnet 1 (Launch in Phase 1)
- Title: Write the actual title
- Core promise: Exactly what the audience gets
- Format: Specify the exact deliverable
- Keyword trigger: The exact word people comment to receive it
- Target conversion: % of qualifying post viewers who comment
- Welcome sequence: First email subject line + opening sentence

### Lead Magnet 2 (Launch in Phase 2)
- Title, core promise, format, trigger word, welcome sequence.

## Ideal Client Filtering

**Attract write 5 specific audience types with why each belongs:**
Language matters. Every word either attracts or repels. There is no neutral content.

**Repel write 5 specific audience types with why each is wrong:**
Being clear about who this content is NOT for sharpens the signal for who it IS for.

## Content Production Pipeline

| Field | Details |
|-------|---------|
| Filming Frequency | Sessions per month |
| Primary Location | Specific place |
| Secondary Location | Backup or travel locations |
| Session Goal | Minimum pieces captured per session |
| Travel Expenses | Policy on travel costs |
| Logistics Owner | Who coordinates scheduling |

**Topic Ideation Process:** How monthly topics get proposed, reviewed, approved.
**Script/Outline Delivery:** Timeline from brief to camera-ready.
**Short-Form Extraction:** Clips per long-form piece, turnaround time, approval process.

## Themed Campaigns

### Campaign 1 (Days 1-30)
Name, theme, goal with specific numbers, daily content cadence, hook series, and the one metric that determines success.

### Campaign 2 (Days 31-90)
Name, theme, goal with specific numbers, lead magnet launch sequence, conversion content strategy, and success metric.

## Communication Rhythm

Build the operating cadence for this content system:

| Touchpoint | Frequency | Owner | What It Covers |
|------------|-----------|-------|----------------|
| Weekly check-in | Tuesday | [Role] | Relationship, upcoming content, performance |
| Performance report | Friday | [Role] | Top posts, growth data, next week plan |
| Monthly strategy call | Week 1 | Full team | 30-min review, pivots, forward plan |
| Recording coordination | Mid-month | Director | Session scheduling, topic approval |
| Quarterly review | Every 90 days | Full team | Full audit, next 90-day plan |

All calls: recorded, recap sent same day.

## Monthly Reporting Structure

Every report answers one question: What did it produce?

| Metric | What It Measures | How It's Reported |
|--------|-----------------|------------------|
| Follower Growth | Net new by platform, growth rate vs prior month | Week-over-week chart |
| Email Growth | New subscribers, lead magnet conversion, list health | Running total |
| Engagement Rate | Saves, shares, comments (weighted toward saves and shares) | % with trend |
| Non-Follower Reach | % of reach from non-followers primary discovery signal | % with benchmark |
| Heat Map | Best and worst performing content by pillar and format | Top 5 + bottom 3 |
| Revenue Impact | Leads generated, conversations opened, deals attributed | Pipeline value |
| Next Month Pivots | Data-driven changes to strategy, pillars, or format mix | Action items |

## Success Metrics

### Primary KPIs
For each metric: current baseline, 30-day target, 60-day target, 90-day target.

### Secondary KPIs
List 6 secondary signals with specific targets.

### What to Ignore
Write the vanity metrics this client must stop tracking and the exact reason each one is misleading for their specific goals.

## Implementation Timeline

**Week 1 Foundation:**
List 5-6 specific setup actions with owners and time estimates. Bio optimization, lead magnet build, first filming session, comment-to-DM setup, pinned opt-in post.

**Week 2 Launch:**
Daily posting begins, engagement baseline tracking, A/B tests start, first YouTube/long-form episode.

**Month 2 Scale:**
Campaign 2 launch, second lead magnet, double down on Month 1 top performer, scale posting if production supports.

**Month 3 Convert:**
Conversion content at 25% of mix, soft-pitch to email list, 90-day full audit, plan next 90 days based on data.

---

## The Non-Negotiables

Write 5 rules that cannot be broken regardless of what is happening these are the foundation. Make them specific to this client, not generic creator advice. Frame them as commitments, not suggestions.

${uploadedDoc ? 'Match the depth, specificity, and professional tone of the uploaded document. Every section fully written. No placeholders.' : 'Write everything in this client voice. Direct. Specific. No corporate speak. Every recommendation feels like it came from someone who knows this person and their business deeply.'}
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
// TIER 1 : CONTENT MEMORY
// ═════════════════════════════════════════════════════════════════════════════
const MEMORY_KEY = 'encis_content_log';
const CLIENTS_KEY = 'encis_clients';
const ACTIVE_CLIENT_KEY = 'encis_active_client';
const CUSTOM_ANGLES_KEY = 'encis_custom_angles';
const ONBOARDING_DONE_KEY = 'encis_onboarding_done';

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

// Global memory instance: shared across all tools
let _memorySave = null;
function registerMemorySave(fn) { _memorySave = fn; }
async function saveToSupabase(entry) {
  try {
    const clientId = (() => { try { const c = JSON.parse(localStorage.getItem('encis_active_client') || 'null'); return c?.id || 'jason'; } catch { return 'jason'; } })();
    await supabase.from('saved_content').insert([{
      type: entry.type || 'content',
      title: (entry.title || entry.topic || 'Untitled').slice(0, 200),
      platform: entry.platform || null,
      angle: entry.angle || null,
      content_preview: (entry.preview || '').slice(0, 500),
      full_content: entry.full || entry.preview || '',
      perf_rating: entry.perf || null,
      client_name: entry.client || clientId,
      notes: entry.notes || null,
      client_id: clientId,
    }]);
  } catch(e) { console.error('Supabase save error:', e); }
}

function logToMemory(entry) {
  if (_memorySave) _memorySave(entry);
  saveToSupabase(entry);
}

function ContentMemory() {
  const { log, save, update, remove, clear } = useContentMemory();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const perfColors = { '':'#FFFFFF', '⭐':'#FEF9C3', '🔥':'#DCFCE7', '💀':'#FEE2E2' };
  const perfLabels = { '':'No rating', '⭐':'Good', '':'Viral', '💀':'Flopped' };
  const typeColors = { script:'#1B4F72', calendar:'#145A32', onboard:'#6E2F8E', batch:'#7E5109', profile:'#0A66C2', magnet:'#C0392B', community:'#1A5276', instagram:'#C13584', facebook:'#1877F2', tiktok:'#010101', x:'#1DA1F2', youtube:'#FF0000', linkedin:'#0A66C2', default:'#2C3E50' };

  // CSV Parser
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

  // Auto-rate by engagement
  const autoRate = (saves, shares, reach) => {
    const s = parseInt(saves)||0, sh = parseInt(shares)||0, r = parseInt(reach)||1;
    const engRate = (s + sh*2) / r;
    if (engRate > 0.05 || s > 50 || sh > 20) return '';
    if (engRate > 0.01 || s > 10) return '⭐';
    if (r > 100 && s === 0 && sh === 0) return '💀';
    return '';
  };

  // Import Handler
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true); setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let imported = 0; let skipped = 0;

        // Detect format
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
          // CSV format: Meta Business Suite / Creator Studio export
          const rows = parseCSV(text);
          if (!rows.length) throw new Error('No rows found in CSV');

          // Detect platform by sniffing headers
          const firstRow = rows[0];
          const keys = Object.keys(firstRow).join(' ');
          const isIG = keys.includes('description') || keys.includes('permalink') || keys.includes('saves');
          const isFB = keys.includes('post_message') || keys.includes('lifetime_post_total_reach');

          rows.forEach(row => {
            // Instagram CSV mapping
            if (isIG) {
              let caption = row.description || row.post_caption || '';
              let postType = row.post_type || row.type || 'Post';
              let reach = row.reach || row.impressions || '0';
              let saves = row.saves || '0';
              let shares = row.shares || '0';
              let likes = row.likes || '0';
              let comments = row.comments || '0';
              let published = row.published || row.date_published || '';
              let dateStr = published ? new Date(published).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Unknown';

              save({
                type: 'instagram',
                platform: 'Instagram',
                title: caption ? caption.slice(0,80) : `Instagram ${postType}`,
                preview: caption.slice(0,200),
                format: postType,
                date: dateStr,
                timestamp: published ? new Date(published).getTime() : Date.now(),
                perf: autoRate(saves, shares, reach),
                notes: `Reach: ${reach} Likes: ${likes} Comments: ${comments} Saves: ${saves} Shares: ${shares}`,
                stats: { reach, saves, shares, likes, comments },
                permalink: row.permalink || '',
                source: 'instagram-csv',
              });
              imported++;

            // Facebook CSV mapping ───────────────────────────────────────
            } else if (isFB) {
              let caption = row.post_message || row.description || '';
              let reach = row.lifetime_post_total_reach || row.reach || '0';
              let shares = row.share_count || '0';
              let reactions = row.lifetime_post_reactions_by_type_total || row.likes || '0';
              let comments = row.comment_count || '0';
              let published = row.post_published || row.published_date || '';
              let dateStr = published ? new Date(published).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Unknown';

              save({
                type: 'facebook',
                platform: 'Facebook',
                title: caption ? caption.slice(0,80) : 'Facebook Post',
                preview: caption.slice(0,200),
                date: dateStr,
                timestamp: published ? new Date(published).getTime() : Date.now(),
                perf: autoRate('0', shares, reach),
                notes: `Reach: ${reach} Reactions: ${reactions} Comments: ${comments} Shares: ${shares}`,
                stats: { reach, shares, reactions, comments },
                source: 'facebook-csv',
              });
              imported++;

            } else {
              // Generic CSV: best-effort mapping
              let caption = row.description || row.caption || row.message || row.title || row.text || '';
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
    '1. Open Instagram app Profile → Menu',
    '2. Settings Account Download Your Information',
    '3. Select "Posts" and format: JSON',
    '4. Download and upload the posts_1.json file here',
    'OR for stats (requires Business/Creator account) ──',
    '5. Go to Meta Business Suite Insights Export',
    '6. Choose date range Export as CSV',
    '7. Upload that CSV here instead',
  ];

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Memory</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>
              {log.length > 0 ? `${log.length} pieces saved: rate, note, and track what works` : 'Auto-saves every generated piece. Import your social posts below.'}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={() => setShowImport(p=>!p)}
            style={{background:showImport?'#EEF2FF':'#F9FAFB',color:'#111827',border:`1px solid ${showImport?'#2563EB':'rgba(255,255,255,0.15)'}`,borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            Import Social Posts
          </button>
          {log.length > 0 && (
            <button onClick={() => { if(window.confirm('Clear all content history?')) clear(); }}
              style={{background:'rgba(233,69,96,0.1)',color:'#2563EB',border:'1px solid rgba(233,69,96,0.2)',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Import Panel */}
      {showImport && (
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:14,padding:'20px',marginBottom:20}}>
          <div style={{fontWeight:700,color:'#111827',fontSize:15,marginBottom:4}}>Import Instagram / Facebook Posts</div>
          <div style={{color:'#6B7280',fontSize:12,lineHeight:1.8,marginBottom:16}}>
            Upload your Instagram export (JSON) or Meta Business Suite insights export (CSV).<br/>
            Posts auto-import with engagement stats. Performance is rated automatically based on saves and shares.
          </div>

          {/* How to export steps */}
          <div style={{background:'rgba(0,0,0,0.25)',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'#2563EB',letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>How to Export</div>
            {igSteps.map((step, i) => (
              <div key={i} style={{fontSize:12,color:step.startsWith('──')?'#2563EB':'rgba(255,255,255,0.7)',lineHeight:1.9,fontStyle:step.startsWith('──')?'italic':'normal'}}>
                {step}
              </div>
            ))}
          </div>

          {/* Upload zone */}
          <label style={{cursor:'pointer',display:'block'}}>
            <div style={{border:'2px dashed rgba(233,69,96,0.35)',borderRadius:10,padding:'24px',textAlign:'center',
              background:'#FFFFFF',transition:'all 0.2s'}}>
              {importing ? (
                <><div style={{fontSize:28,marginBottom:8}}>⏳</div>
                  <div style={{color:'#111827',fontWeight:600,fontSize:14}}>Importing...</div></>
              ) : (
                <>
                  <div style={{color:'#111827',fontWeight:600,fontSize:14}}>Click to upload Instagram JSON or Meta CSV</div>
                  <div style={{color:'#6B7280',fontSize:12,marginTop:4}}>.json or .csv files accepted</div></>
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
                  Imported {importResult.imported} post{importResult.imported!==1?'s':''} successfully
                  {importResult.skipped > 0 && <span style={{color:'#6B7280',fontWeight:400}}> · {importResult.skipped} skipped (no caption)</span>}
                  <div style={{color:'#6B7280',fontWeight:400,fontSize:12,marginTop:4}}>
                    Posts with high saves/shares were auto-rated . Scroll down to review and adjust.
                  </div>
                </div>
              ) : (
                <div style={{color:'#2563EB',fontWeight:700,fontSize:13}}>
                  Import failed: {importResult.error}
                  <div style={{color:'#6B7280',fontWeight:400,fontSize:12,marginTop:4}}>
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
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          
          <div style={{color:'#111827',fontWeight:700,fontSize:18,marginBottom:8}}>Nothing here yet</div>
          <div style={{color:'#6B7280',fontSize:14,lineHeight:1.7,marginBottom:20}}>
            Content you generate auto-saves here. Or import your existing posts above.
          </div>
          <button onClick={() => setShowImport(true)}
            style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Import Instagram / Facebook Posts
          </button>
        </div>
      )}

      {/* Main content when log has entries */}
      {log.length > 0 && (
        <>
          {/* Search + Filter */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content..."
              style={{flex:1,minWidth:200,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'8px 12px',color:'#111827',fontSize:13}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  style={{background:filter===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
              ['Viral','',log.filter(e=>e.perf==='').length,'rgba(233,69,96,0.15)'],
              ['Good','⭐',log.filter(e=>e.perf==='⭐').length,'rgba(245,166,35,0.1)'],
              ['Flopped','💀',log.filter(e=>e.perf==='💀').length,'rgba(100,100,100,0.1)'],
            ].map(([label,icon,count,bg]) => (
              <div key={label} style={{background:bg|| 'rgba(255,255,255,0.04)',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px',textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:'#111827'}}>{count}</div>
                <div style={{fontSize:11,color:'#6B7280',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>

          {/* Content Log */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map(entry => (
              <div key={entry.id} style={{background:perfColors[entry.perf]||perfColors[''],border:'1px solid #E5E7EB',borderLeft:`3px solid ${typeColors[entry.type]||typeColors.default}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                      <span style={{background:typeColors[entry.type]||typeColors.default,color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{entry.type}</span>
                      <span style={{color:'#6B7280',fontSize:11}}>{entry.date}</span>
                      {entry.client && <span style={{background:'#F9FAFB',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10}}>👤 {entry.client}</span>}
                      {entry.platform && <span style={{background:'#FFFFFF',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10}}>{entry.platform}</span>}
                      {entry.permalink && <a href={entry.permalink} target="_blank" rel="noopener noreferrer" style={{color:'#2563EB',fontSize:10,textDecoration:'none'}}>View</a>}
                    </div>
                    <div style={{color:'#111827',fontWeight:600,fontSize:13,marginBottom:4,wordBreak:'break-word'}}>{entry.title || entry.topic || 'Untitled'}</div>
                    {entry.notes && editingId !== entry.id && <div style={{color:'#6B7280',fontSize:12,lineHeight:1.6,marginTop:4}}>{entry.notes}</div>}
                    {editingId === entry.id && (
                      <div style={{marginTop:8}}>
                        <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={2}
                          placeholder="Add performance notes, what you learned, what to replicate..."
                          style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:6,padding:'8px',color:'#111827',fontSize:12,resize:'vertical',boxSizing:'border-box'}}/>
                        <div style={{display:'flex',gap:8,marginTop:6}}>
                          <button onClick={() => { update(entry.id, {notes:editNotes}); setEditingId(null); }}
                            style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Save</button>
                          <button onClick={() => setEditingId(null)}
                            style={{background:'#F9FAFB',color:'#6B7280',border:'none',borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer'}}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                    {['⭐','','💀'].map(p => (
                      <button key={p} onClick={() => update(entry.id, {perf: entry.perf===p?'':p})}
                        title={perfLabels[p]}
                        style={{background:entry.perf===p?'rgba(255,255,255,0.15)':'transparent',border:`1px solid ${entry.perf===p?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:6,padding:'4px 7px',fontSize:14,cursor:'pointer',opacity:entry.perf&&entry.perf!==p?0.4:1}}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => { setEditingId(entry.id); setEditNotes(entry.notes|| ''); }}
                      style={{background:'#FFFFFF',color:'#6B7280',border:'1px solid #E5E7EB',borderRadius:6,padding:'4px 9px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                      {entry.notes ? 'Edit' : '+ Note'}
                    </button>
                    <button onClick={() => remove(entry.id)}
                      style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:6,padding:'4px 7px',fontSize:14,cursor:'pointer'}}>×</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && log.length > 0 && (
              <div style={{textAlign:'center',padding:'3rem',color:'#6B7280',fontSize:13}}>No results match your filter.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1: BULK CONTENT BATCHING
// ═════════════════════════════════════════════════════════════════════════════
const BULK_PROMPT = (angle, platform, topic, client) => `
${client ? `CLIENT: ${client.name}. Voice and brand: ${client.voice}` : VOICE}
${CONTENT_SOP}
${SWARBRICK}

Platform: ${platform}
Content Angle: ${angle}
Topic/Theme: ${topic}

Generate a complete content batch for this angle and topic. This is bulk production : make every piece distinct, not variations of the same thing.

**POST 1 : Educational (optimizes for saves)**
Hook:
Body (3 points, punchy):
CTA:
Caption (3-4 sentences):
Hashtags (15):

**POST 2 : Personal Story (optimizes for follows)**
Hook:
Body (story arc : real moment, shift, result):
CTA:
Caption:
Hashtags (15):

**POST 3 : Pattern Interrupt / Controversial (optimizes for shares)**
Hook:
Body:
CTA:
Caption:
Hashtags (15):

**POST 4 : Quick Win / Tactical (optimizes for saves + DMs)**
Hook:
Body (actionable, specific steps):
CTA:
Caption:
Hashtags (15):

**POST 5 : Community / Engagement (optimizes for comments)**
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
  const [angle, setAngle] = useState('occupational');
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Bulk Content Batch</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>One topic 5 posts + carousel + story sequence. Full week of content in one shot.</p></div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}
      <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        Pick an angle, pick a platform, give it one topic or theme : get back 5 platform-native posts, a carousel outline, and a story sequence. One generation. Ready to schedule.
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'#2563EB',textTransform:'uppercase',marginBottom:8}}>Platform</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={()=>setPlatform(p)}
                style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                  borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'#2563EB',textTransform:'uppercase',marginBottom:8}}>Content Angle</div>
          <AngleGrid selected={angle} onSelect={setAngle}/>
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'#2563EB',textTransform:'uppercase',marginBottom:8}}>Topic or Theme for This Batch</div>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. 'Morning discipline', 'What the Army taught me about rest', 'Why most people quit week 3'..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
      </div>
      <RedBtn onClick={run} disabled={loading||!topic}>
        {loading ? 'Generating full batch...' : 'Generate Full Content Batch'}
      </RedBtn>
      {loading && <Spin/>}
      <DocOutput text={out} title={`${topic || angle || "Content"} : SIGNAL`}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER 1 : CLIENT MODE
// ═════════════════════════════════════════════════════════════════════════════
const DEFAULT_CLIENT = {
  id: 'jason',
  name: 'Jason Fricka',
  handle: '@everydayelevations',
  platforms: 'Instagram, YouTube, Facebook, LinkedIn, X, TikTok',
  voice: `Direct, real, no corporate speak. High accountability energy. Short sentences. the community community: everyday people who refuse to stay where they are.`,
  angles: 'Resilience, Mindset, Everyday Wins, Outdoor/Colorado, Finance/Real Estate, Podcast/Growth, Family, Health/Fitness',
  colors: '#0A1628, #E94560, #FFFFFF',
  notes: 'HR Manager at Highland Cabinetry. Podcast host. Real estate agent. Colorado father. Endurance athlete.',
  isDefault: true,
};

// Returns the angle set for the active client: custom angles if defined, Swarbrick if not
function useClientAngles(activeClient) {
  const getAngles = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_ANGLES_KEY) || '{}');
      const clientData = activeClient ? stored[activeClient.id] : null;
      if (clientData && clientData.mode === 'custom' && clientData.angles?.length > 0) {
        return clientData.angles;
      }
      if (clientData && clientData.mode === 'both' && clientData.angles?.length > 0) {
        return [...ANGLES, ...clientData.angles];
      }
    } catch {}
    return ANGLES;
  };
  return getAngles();
}

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
    <div style={{background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:8,padding:'8px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
      
      <span style={{color:'#C9A84C',fontSize:12,fontWeight:700}}>CLIENT MODE — {client.name}</span>
      <span style={{color:'#6B7280',fontSize:12}}>{client.handle} · {client.platforms}</span>
    </div>
  );
}

function ClientMode({ setActiveClientExternal }) {
  const [clients, saveClients] = useClients();
  const [activeClient, setActiveClient] = useActiveClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [managingAngles, setManagingAngles] = useState(null);
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
      {managingAngles && <CustomAnglesManager client={managingAngles} onClose={() => setManagingAngles(null)}/>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Client Mode</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Switch clients and every tool rewires to their voice, angles, and brand.</p></div>
        </div>
        <button onClick={() => { setForm(blank); setEditing(null); setShowForm(true); }}
          style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Add Client
        </button>
      </div>

      {/* Active client indicator */}
      <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:12,padding:'16px',marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'#2563EB',textTransform:'uppercase',marginBottom:8}}>Currently Active</div>
        <div style={{color:'#111827',fontWeight:700,fontSize:16}}>{activeClient?.name || 'Jason Fricka'}</div>
        <div style={{color:'#6B7280',fontSize:13,marginTop:2}}>{activeClient?.handle} · {activeClient?.platforms}</div>
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
                <div style={{color:'#111827',fontWeight:700,fontSize:14}}>{client.name}</div>
                <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>{client.handle}</div>
              </div>
              {client.isDefault && <span style={{background:'rgba(233,69,96,0.15)',color:'#2563EB',borderRadius:4,padding:'2px 7px',fontSize:10,fontWeight:700}}>YOU</span>}
            </div>
            <div style={{color:'#6B7280',fontSize:11,lineHeight:1.6,marginBottom:12,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
              {client.voice || client.notes || 'No description'}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => activate(client)}
                style={{flex:1,background:activeClient?.id===client.id?'#2563EB':'rgba(255,255,255,0.08)',color:'#fff',border:'none',
                  borderRadius:7,padding:'7px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                {activeClient?.id===client.id ? 'Active' : 'Activate'}
              </button>
              <button onClick={() => setManagingAngles(client)}
                style={{background:'rgba(0,212,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,212,255,0.2)',borderRadius:7,padding:'7px 10px',fontSize:11,cursor:'pointer',fontWeight:700}}>
                {(() => { try { const s = JSON.parse(localStorage.getItem(CUSTOM_ANGLES_KEY)|| '{}'); return s[client.id]?.mode && s[client.id].mode !== 'swarbrick' ? 'Angles*' : 'Angles'; } catch { return 'Angles'; } })()}
              </button>
              {!client.isDefault && (
                <>
                  <button onClick={() => { setForm({...client}); setEditing(client.id); setShowForm(true); }}
                    style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:7,padding:'7px 10px',fontSize:12,cursor:'pointer'}}>Edit</button>
                  <button onClick={() => deleteClient(client.id)}
                    style={{background:'rgba(233,69,96,0.08)',color:'#2563EB',border:'none',borderRadius:7,padding:'7px 10px',fontSize:12,cursor:'pointer'}}>×</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:14,padding:'24px',marginBottom:20}}>
          <div style={{color:'#111827',fontWeight:700,fontSize:16,marginBottom:20}}>{editing ? 'Edit Client' : 'New Client'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {fields.map(f => (
              <div key={f.k} style={{gridColumn:['voice','angles','notes'].includes(f.k)?'1/-1':'auto'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:'#2563EB',textTransform:'uppercase',marginBottom:6}}>{f.l}</div>
                {['voice','angles','notes'].includes(f.k) ? (
                  <textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                    style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                ) : (
                  <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                    style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
                )}
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:18}}>
            <RedBtn onClick={saveClient} disabled={!form.name}>{editing ? 'Save Changes' : 'Add Client'}</RedBtn>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(blank); }}
              style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{background:'#FFFFFF',borderRadius:10,padding:'16px',border:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{color:'#6B7280',fontSize:12,lineHeight:1.8}}>
          <strong style={{color:'#111827'}}>How Client Mode works:</strong> When a client is active, every tool scripts, calendars, profiles, lead magnets automatically uses their voice, angles, and brand context. Switch back to Jason anytime. Client data stays on your device.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
function Home({setNav,setSub}) {
  // Check if onboarding done
  const [onboardingDone] = useState(() => {
    try { return !!localStorage.getItem(ONBOARDING_DONE_KEY); } catch { return true; }
  });
  if (!onboardingDone) return null; // Handled by App
  return <IntelligenceDashboard setNav={setNav} setSub={setSub}/>;
}

function _OldHome({setNav,setSub}) {
  const tools = [
    // STRATEGY
    {nav:'strategy',sub:'onboard', label:'STRATEGY', title:'90-Day Strategy Builder',     desc:'Generates a complete 90-day content strategy document. Brand positioning, content pillars, platform plan, phase-by-phase execution, engagement SOP, and success metrics. Download as PDF.'},
    {nav:'strategy',sub:'calendar', label:'STRATEGY', title:'Content Calendar',            desc:'Builds a 30, 60, 90, or 180-day posting calendar with specific filmable topics, formats, and CTAs for each day. Structured around your content pillars.'},
    {nav:'strategy',sub:'profile', label:'STRATEGY', title:'Profile Audit',               desc:'Pulls your live profile from Perplexity, then audits bio, name field, link strategy, highlights, and pinned posts. Rewrites everything ready to copy-paste.'},
    {nav:'strategy',sub:'magnet', label:'STRATEGY', title:'Lead Magnet Builder',         desc:'Writes the actual finished lead magnet. Every section, the delivery reel script, all 3 nurture emails, and a 5-slide story sequence. Not a plan. The real thing.'},
    {nav:'strategy',sub:'community', label:'STRATEGY', title:'Community Builder',           desc:'Builds a community system around your actual audience. Identity statement, core ritual, engagement architecture, onboarding flow, and 5 recurring content series.'},
    {nav:'strategy',sub:'email', label:'STRATEGY', title:'Email Sequence Builder',      desc:'Writes complete 5-email nurture sequences. Welcome, value, story, soft pitch, and conversion. Written in your voice, matched to your specific lead magnet.'},
    {nav:'strategy',sub:'challenge', label:'STRATEGY', title:'30-Day Challenge Builder',    desc:'Plans a full 30-day challenge with daily prompts, accountability hooks, and the content series that runs alongside it. High-retention format that builds email lists fast.'},
    // RESEARCH
    {nav:'research',sub:'pipeline', label:'RESEARCH',  title:'Research Pipeline',           desc:'3-step system: Perplexity pulls live 2026 data, Claude extracts intelligence and content gaps, then writes a camera-ready script. Includes source links.'},
    {nav:'strategy',sub:'campaign', label:'STRATEGY', title:'Campaign Builder',          desc:'Multi-week coordinated campaigns with pre-launch, launch, sustain, and convert phases. Every post connected to the arc. Includes email sequence and story plan.'},
    {nav:'research',sub:'spy', label:'RESEARCH',  title:'Competitor Intelligence',     desc:'Add up to 10 competitors. Pulls live data on what they post, what performs, what they miss, and gives you 5 specific moves to take their audience.'},
    {nav:'research',sub:'vault', label:'RESEARCH',  title:'Prompt Vault',                desc:'30+ battle-tested prompts organized by platform. Covers Instagram, YouTube, Facebook, LinkedIn, X/Twitter threads, and TikTok. Copy and run in any AI tool.'},
    {nav:'research',sub:'collab', label:'RESEARCH',  title:'Collab Finder',               desc:'Researches guest and collaboration targets in your niche. Returns 5 podcast targets, 5 stitch targets, 3 community partners, and a ready-to-send pitch template.'},
    {nav:'research',sub:'extract', label:'RESEARCH',  title:'Insight Extractor',           desc:'Paste any content: article, interview, book excerpt. Returns core insight, supporting evidence, contrarian take, actionable takeaway, and 5 content angles.'},
    // CREATE
    {nav:'create',sub:'script', label:'CREATE',   title:'Script Engine',               desc:'Writes 3 camera-ready script variations using the Hook SOP: Educational (saves), Personal Story (follows), and Bold Take (shares). Includes captions and hashtags.'},
    {nav:'create',sub:'caption', label:'CREATE',   title:'Caption Writer',               desc:'3 caption variations for any post: short and punchy, story-driven, and educational. Platform-native formatting, tiered hashtags, and CTA matched to the platform.'},
    {nav:'create',sub:'videodirector', label:'CREATE',   title:'Video Script Director',       desc:'Full production brief: numbered shot list, word-for-word script, 10 b-roll shots, on-screen text, music direction, thumbnail shot, editing notes, and equipment checklist.'},
    {nav:'create',sub:'batch', label:'CREATE',   title:'Bulk Content Batch',          desc:'One topic generates a full week: 5 platform-native posts, a carousel outline, and a 5-slide story sequence. Each post optimized for a different engagement goal.'},
    {nav:'create',sub:'episode', label:'CREATE',   title:'Episode to Clips',            desc:'Break a podcast episode into 5-7 platform clips, a carousel, a LinkedIn post, 5 quote graphics, and an email newsletter teaser. All from one episode.'},
    {nav:'create',sub:'repurpose', label:'CREATE',   title:'Repurpose Engine',            desc:'Paste one script. Get 6 platform-native versions: Instagram Reel, TikTok, X/Twitter Thread, YouTube Short, Facebook, and LinkedIn. Each one feels native to the platform.'},
    {nav:'create',sub:'hooks', label:'CREATE',   title:'Hook Library',                desc:'Generates 10-40 hooks across 5 types: Pattern Interrupt, Question, Bold Statement, Personal Story, and Data Point. First 2-3 words engineered to stop the scroll.'},
    {nav:'create',sub:'design', label:'CREATE',   title:'Design Studio',               desc:'Carousel and static post concepts with slide-by-slide copy, visual direction, typography notes, captions, and a 15-tag hashtag strategy by tier.'},
    {nav:'create',sub:'comment', label:'CREATE',   title:'Comment Responder',           desc:'Paste one comment or up to 10 at once. Get 3 reply options per comment: warm, direct, and community-building. Keeps your voice, never sounds like a bot.'},
    {nav:'create',sub:'podcast', label:'CREATE',   title:'Podcast Pre-Production',      desc:'Full episode prep kit: guest research brief, episode outline, intro and outro scripts, 10 questions, show notes, and all repurposed clips planned before you record.'},
    {nav:'create',sub:'dmscripts', label:'CREATE',   title:'DM Script Library',           desc:'Builds a library of DM templates by trigger: lead magnet delivery, podcast pitch response, real estate inquiry, coaching interest. Copy, paste, and close.'},
    // OPTIMIZE
    {nav:'optimize',sub:'review', label:'OPTIMIZE', title:'Weekly Review',               desc:'Scores your week across reach, engagement, saves, shares, and leads. Runs a Swarbrick gap analysis on which life dimensions are missing from your content.'},
    {nav:'optimize',sub:'roi', label:'OPTIMIZE', title:'ROI Dashboard',               desc:'Weekly metrics tracker with sparkline charts, week-over-week growth percentages, top content log, and a data table. Feeds the Schedule Optimizer and Monthly Report.'},
    {nav:'optimize',sub:'memory', label:'OPTIMIZE', title:'Content Memory',              desc:'Auto-saves every generated piece. Import Instagram or Facebook exports. Rate content with star, fire, or skull. Search, filter, and find patterns in what works.'},
    {nav:'optimize',sub:'schedule', label:'OPTIMIZE', title:'Schedule Optimizer',         desc:'Reads your ROI data and content history. Tells you specifically when to post, what content mix to use, and what to stop doing. Gets smarter as you log more data.'},
    {nav:'optimize',sub:'predictor', label:'OPTIMIZE', title:'Performance Predictor',      desc:'Paste any hook, caption, or script before posting. Scores hook strength, save potential, share potential, and retention. Rewrites the weakest version. Uses your historical data.'},
    {nav:'optimize',sub:'gaps', label:'OPTIMIZE', title:'Content Gap Analyzer',        desc:'Visual bar chart of all 8 Swarbrick dimensions showing what you over-post and ignore. Flags dead angles and outputs 10 specific filmable pieces to create this week.'},
    {nav:'optimize',sub:'hooktester', label:'OPTIMIZE', title:'Hook Tester',                 desc:'Write 3 to 5 hook variations. Each gets scored on scroll-stop probability, curiosity gap strength, and specificity. The weakest ones get rewritten.'},
    // AGENCY
    {nav:'agency',sub:'portal', label:'AGENCY',   title:'Client Portal',               desc:'Full dashboard per client. Deliverable pipeline with status tracking, timestamped notes, voice fingerprint status, and performance at a glance. Manage 10 clients from one screen.'},
    {nav:'agency',sub:'deliverable', label:'AGENCY',   title:'Deliverable Builder',         desc:'Choose a client and deliverable type. Generates polished, client-ready output using their voice fingerprint automatically. Downloads as a formatted PDF.'},
    {nav:'optimize',sub:'stratreview', label:'OPTIMIZE', title:'AI Strategy Review',          desc:'Monthly strategic review generated automatically from ROI data, content ratings, and calendar execution. Replaces the monthly strategy call. Stored per client.'},
    {nav:'agency',sub:'analytics', label:'AGENCY',   title:'Analytics Import Hub',        desc:'Export CSV from Instagram, YouTube, Facebook, or LinkedIn for free. Import here. SIGNAL parses the data and generates platform-specific insights. No API subscription needed.'},
    {nav:'agency',sub:'onboardauto', label:'AGENCY',   title:'Onboarding Automation',       desc:'Add a new client and run this. Generates a full onboarding package before the first call: platform assessment, content angles, 30-day plan, first 10 posts, and key discovery questions.'},
    {nav:'strategy',sub:'visualcal', label:'STRATEGY', title:'Visual Content Calendar',      desc:'Click-to-assign content calendar. Plan posts by date, platform, and format. Track approval status. Export as CSV for Meta Business Suite or any free scheduler.'},
    {nav:'agency',sub:'report', label:'AGENCY',   title:'Monthly Reporting Suite',     desc:'One-click monthly client reports. Pulls ROI data and top content automatically. Add wins and challenges. Outputs a professional PDF report ready to send.'},
    {nav:'agency',sub:'voice', label:'AGENCY',   title:'Voice Fingerprinting',        desc:'Paste 2 to 5 real content samples. Extracts tone, vocabulary, sentence patterns, writing rules, and themes. Stored per client and injected into every deliverable automatically.'},
    {nav:'agency',sub:'clients', label:'AGENCY',   title:'Client Profiles',             desc:'Create and manage client accounts. Each client has their own voice, angles, platforms, and brand colors. Activating a client rewires every tool to their context.'},
    {nav:'agency',sub:'whitelabel', label:'AGENCY',   title:'White Label Mode',           desc:'Rebrand the app with your agency name, logo, and colors. Every document, report, and header shows your brand. Clients see your agency, not SIGNAL.'},
    {nav:'agency',sub:'transcript', label:'AGENCY',   title:'Call Transcript Intel',      desc:'Upload or paste any call transcript. Extracts 10 content ideas, key quotes, action items, client language patterns, and voice intel. No Fireflies or Otter subscription needed.'},
    {nav:'agency',sub:'persona', label:'AGENCY',   title:'Custom AI Persona',          desc:'Builds a trained AI persona per client from voice fingerprint, content history, and performance ratings. Gets smarter as you rate more content. Injected into all tools.'},
    {nav:'strategy',sub:'biolink', label:'STRATEGY', title:'Bio Link Page Builder',    desc:'Generates a complete link-in-bio landing page with profile section, platform buttons, email capture, and lead magnet CTA. Download HTML and host free on GitHub Pages, Netlify, or Carrd.'},
    {nav:'strategy',sub:'biooptimizer', label:'STRATEGY', title:'Bio Optimizer',            desc:'3 bio variations per platform: authority-first, outcome-first, and personality-first. Covers all 6 platforms. Name field SEO, link strategy, and A/B test recommendation included.'},
    {nav:'strategy',sub:'series', label:'STRATEGY', title:'Content Series Planner',    desc:'Plan a named recurring series like a show. Every episode mapped with title, hook, key point, and CTA. Includes series branding, growth arc, and repurposing plan.'},
    {nav:'strategy',sub:'storyarc', label:'STRATEGY', title:'Story Arc Planner',         desc:'Day-by-day story plan for campaigns. Each slide mapped with purpose, CTA, and emotional target. Runs alongside any campaign to move the funnel through Stories.'},
    {nav:'research',sub:'hashtags',     emoji:'##', label:'RESEARCH',  title:'Hashtag Research',          desc:'Live Perplexity pull of active hashtags. Tiered strategy: niche, mid-range, and broad. Copy-paste ready stack, rotation plan, and list of hashtags to avoid.'},
    {nav:'research',sub:'viral', label:'RESEARCH',  title:'Viral Format Library',      desc:'18 proven content formats with the psychology behind why they work. Pick a format, enter your topic, get a complete camera-ready script with caption and variations.'},
    {nav:'create',sub:'contentbrief', label:'CREATE',   title:'Content Brief Generator',   desc:'Pre-filming brief for the client. What to wear, where to film, talking points, stories to tell, hooks to open with, and a post-session checklist. Read the night before and execute.'},
    {nav:'create',sub:'guestprep', label:'CREATE',   title:'Guest Prep Kit',             desc:'Complete host and guest prep. 10 ordered interview questions, guest intel, topics to avoid, welcome email, tech requirements, and a 3-part post-episode follow-up sequence.'},
    {nav:'create',sub:'objections', label:'CREATE',   title:'Objection Handler',          desc:'Scripts for every objection in real estate, coaching, podcast pitching, brand deals, and agency sales. DM, email, and in-person versions for each. Includes what not to say.'},
    {nav:'optimize',sub:'abtests', label:'OPTIMIZE', title:'A/B Test Tracker',           desc:'Log content variations, mark winners, and let SIGNAL find the patterns. After 3+ tests it analyzes what is consistently winning across platforms and formats.'},
    {nav:'optimize',sub:'revenue', label:'OPTIMIZE', title:'Revenue Attribution',        desc:'Tag content to real outcomes: inquiries, booked calls, closed deals, email signups. Tracks attributed revenue by platform and format. Proves content ROI with real numbers.'},
    {nav:'optimize',sub:'pricing', label:'OPTIMIZE', title:'Pricing Calculator',         desc:'Real 2026 market rates for brand deals, UGC, coaching, consulting, and agency retainers. Based on your follower count, engagement rate, and niche. Includes negotiation guide.'},
    {nav:'agency',sub:'clientcomms', label:'AGENCY',   title:'Client Communication Templates', desc:'12 agency email templates: onboarding welcome, weekly check-in, report delivery, scope expansion, missed deadline, rate increase, renewal, and offboarding. Written in your voice.'},
    {nav:'agency',sub:'tracker', label:'AGENCY',   title:'Collab Tracker',              desc:'CRM for outreach. Track every podcast guest, brand partner, and collab target through Not Contacted, Pitched, In Conversation, Confirmed, and Passed.'},
    // YOUTUBE
    {nav:'youtube',sub:'yttoolkit', label:'YOUTUBE',  title:'YouTube Script Writer',       desc:'VIDIQ-optimized scripts with upload timing, outlier score targets, 3 title options for A/B testing, full word-for-word script, chapter markers, SEO package, and performance forecast.'},
  ];
  return (
    <div>
      <div style={{textAlign:'center',padding:'3rem 0 3rem'}}>
        <div style={{position:'relative',display:'inline-block',marginBottom:20}}>
          <div style={{position:'absolute',inset:-8,borderRadius:'50%',background:'radial-gradient(circle, rgba(0,194,255,0.15) 0%, transparent 70%)',animation:'pulse 3s ease-in-out infinite'}}/>
          <EighthAscentLogo size={72} style={{position:'relative'}} />
        </div>
        <h1 style={{color:'#111827',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,margin:'0 0 6px',letterSpacing:'-0.03em'}}>
          {(() => { try { const wl = JSON.parse(localStorage.getItem('encis_whitelabel')|| 'null'); return wl?.agencyName ? <span style={{color:wl.primaryColor||'#2563EB'}}>{wl.agencyName}</span> : <><span>SIGNAL</span> <span style={{color:'#2563EB'}}>by Everyday Elevations</span></>; } catch { return <><span>EN-CIS</span> <span style={{color:'#2563EB'}}>Command Center</span></>; } })()}
        </h1>
        <p style={{color:'#6B7280',fontSize:14,margin:0}}>Social Media OS</p>
      </div>
      {/* Group tools by label */}
      {['STRATEGY','RESEARCH','CREATE','OPTIMIZE','AGENCY','YOUTUBE'].map(group => {
        const groupTools = tools.filter(t => t.label === group);
        const groupColors = { STRATEGY:'#00C2FF', RESEARCH:'#00C2FF', CREATE:'#f5a623', OPTIMIZE:'#27ae60', AGENCY:'#9b59b6', YOUTUBE:'#ff4444' };
        const groupDescs = {
          STRATEGY: 'Plan, position, and build your content foundation',
          RESEARCH: 'Find what works before you create it',
          CREATE: 'Generate content ready to film, post, or send',
          OPTIMIZE: 'Measure, improve, and learn from what you publish',
          AGENCY: 'Manage clients, deliverables, and reports',
          YOUTUBE: 'Scripts, SEO, and channel growth built around the VIDIQ framework',
        };
        return (
          <div key={group} style={{marginBottom:32}}>
            <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(0,194,255,0.08)'}}>
              <div style={{fontSize:13,fontWeight:800,color:groupColors[group],letterSpacing:2,textTransform:'uppercase'}}>{group}</div>
              <div style={{fontSize:12,color:'#6B7280'}}>{groupDescs[group]}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
              {groupTools.map(t => (
                <button key={t.sub} onClick={()=>{setNav(t.nav);setSub(t.sub);}}
                  style={{
                    background: 'rgba(18,28,42,0.9)',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    color: '#111827',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    backdropFilter: 'blur(8px)',
                  }}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#111827',lineHeight:1.3}}>{t.title}</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,lineHeight:1.6,paddingLeft:32}}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Onboarding() {
  const [mode,        setMode]       = useState('form');
  const [goals,       setGoals]      = useState(
    `Grow @everydayelevations from ~2,400 Instagram followers to 10,000 by end of 2026. Post consistently 5x/week on Instagram. Launch the community as a recognizable community identity. Start building an email list from zero: target 500 subscribers in 90 days. Book 3 meaningful podcast guests. Generate at least 1 real estate lead per month through content. Keep it real: no fake hype, no gimmicks.`
  );
  const [current,     setCurrent]    = useState(
    `Instagram: ~2,400 followers, posting 2-3x/week inconsistently, no clear content schedule. YouTube: @everydayelevations exists but underused. Facebook: facebook.com/jason.fricka active but no strategy. LinkedIn: linkedin.com/in/jason-fricka: HR Manager at Highland Cabinetry + podcast host, dual-lane not used. No email list. No lead magnet. Everyday Elevations podcast running. Colorado-based. Full-time HR job + real estate license + family.`
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
    `Everyday people who refuse to stay where they are: working parents, professionals who feel stuck, athletes, people grinding toward something better, anyone building a life they're proud of. Ages 28-50, Colorado-based but broader online. They believe in doing the work nobody sees.`
  );
  const [desiredTransformation, setDesiredTransformation] = useState(
    `From stuck, inconsistent, and invisible: to showing up daily, building a real community, and turning content into real estate leads, coaching clients, and podcast listeners.`
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
    // Auto-save strategy so ContentCalendar can pick it up
    try {
      localStorage.setItem('encis_last_strategy', JSON.stringify({
        content: res,
        name: (fields.businessName || 'Strategy') + ' 90-Day Strategy',
        savedAt: new Date().toISOString(),
      }));
    } catch {}
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
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Everyday Elevations 90-Day Strategy</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#111;line-height:1.7}h1{color:#0A1628;border-bottom:3px solid #E94560;padding-bottom:8px}h2{color:#0A1628;margin-top:32px}h3{color:#E94560}strong{color:#0A1628}li{margin-bottom:6px}@media print{body{margin:24px}}</style></head><body><h1>Everyday Elevations 90-Day Content Strategy</h1>${html}</body></html>`;
      const blob = new Blob([fullHtml], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const printWin = window.open(url, '_blank');
      if (printWin) {
        printWin.onload = () => { printWin.print(); };
      } else {
        const a = document.createElement('a');
        a.href = url; a.download = 'EverydayElevations-90DayStrategy.html';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  const fldStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'};
  const taStyle = {...fldStyle,resize:'vertical',lineHeight:1.6};
  const sectionHead = (label) => (
    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:'#2563EB',textTransform:'uppercase',
      marginBottom:12,marginTop:20,paddingBottom:6,borderBottom:'1px solid rgba(233,69,96,0.25)'}}>
      {label}
    </div>
  );

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>90-Day Strategy Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Pre-filled with your numbers. Edit anything, then generate a complete strategy document.</p></div>
      </div>
      <Card>
        {sectionHead('Goals & Current State')}
        <SecLabel>Your Goals</SecLabel>
        <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={4} style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Current State</SecLabel>
        <textarea value={current} onChange={e=>setCurrent(e.target.value)} rows={4} style={taStyle}/>

        {sectionHead('Brand Identity')}
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

        {sectionHead('Content Details')}
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

        {sectionHead('Ideal Audience & Transformation')}
        <SecLabel>Ideal Audience Profile</SecLabel>
        <textarea value={idealAudience} onChange={e=>setIdealAudience(e.target.value)} rows={3}
          placeholder="Age, demographics, pain points, beliefs, lifestyle..." style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Desired Transformation</SecLabel>
        <textarea value={desiredTransformation} onChange={e=>setDesiredTransformation(e.target.value)} rows={2} style={taStyle}/>
        <SecLabel style={{marginTop:14}}>Emotional Journey (Before After)</SecLabel>
        <textarea value={emotionalJourney} onChange={e=>setEmotionalJourney(e.target.value)} rows={2}
          placeholder="How they feel before finding you, how they feel after, one-sentence summary..." style={taStyle}/>

        {sectionHead('Optional Upload & Additional Context')}
        <label style={{cursor:'pointer',display:'block',marginBottom:12}}>
          <div style={{border:`2px dashed ${uploadedDoc?'rgba(39,174,96,0.5)':'rgba(233,69,96,0.3)'}`,borderRadius:8,
            padding:'12px 16px',display:'flex',alignItems:'center',gap:12,
            background:uploadedDoc?'rgba(39,174,96,0.07)':'rgba(255,255,255,0.02)'}}>
            <span style={{fontSize:20}}>{uploadedDoc?'':''}</span>
            <div>
              {uploadedDoc
                ? <><div style={{color:'#111827',fontWeight:700,fontSize:13}}>{uploadFileName}</div>
                    <div style={{color:'rgba(39,174,96,0.9)',fontSize:11,marginTop:2}}>Doc loaded will be included in strategy</div></>
                : <><div style={{color:'#111827',fontWeight:600,fontSize:13}}>Upload existing doc or notes (optional)</div>
                    <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>.txt or .md</div></>}
            </div>
          </div>
          <input type="file" accept=".txt,.md,text/plain" onChange={handleFileUpload} style={{display:'none'}}/>
        </label>
        <textarea value={additionalContext} onChange={e=>setAdditionalContext(e.target.value)} rows={2}
          placeholder="Anything else: recent wins, struggles, offers launching, audience DM insights..."
          style={taStyle}/>

        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16,flexWrap:'wrap'}}>
          <SecLabel style={{margin:0}}>Hours/Week:</SecLabel>
          {['3','5','10','15','20+'].map(h => (
            <button key={h} onClick={()=>setHours(h)}
              style={{background:hours===h?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:hours===h?700:400}}>
              {h}
            </button>
          ))}
        </div>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading}>
          {loading?'Building Strategy...':'Build 90-Day Strategy'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <StrategyOutput text={out} onDownload={downloadDoc} downloading={downloading}/>
          <div style={{marginTop:12,background:'rgba(0,194,255,0.04)',border:'1px solid #D1D5DB',borderRadius:10,padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{color:'#00C2FF',fontWeight:700,fontSize:13,marginBottom:3}}>Strategy saved</div>
              <div style={{color:'#6B7280',fontSize:11}}>Generate your content calendar now strategy loads automatically.</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => {
                try { localStorage.setItem('encis_last_strategy', JSON.stringify({content:out,name:businessName+' 90-Day Strategy',savedAt:new Date().toISOString()})); } catch{}
                window.dispatchEvent(new CustomEvent('signal-nav', {detail:{nav:'strategy',sub:'calendar'}}));
              }} style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:700,cursor:'pointer',fontSize:12,letterSpacing:'0.02em'}}>
                Generate Calendar Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentCalendar() {
  const [pillars,        setPillars]        = useState('');
  const [platforms,      setPlatforms]      = useState(['Instagram']);
  const [duration,       setDuration]       = useState('30');
  const [strategyDoc,    setStrategyDoc]    = useState('');
  const [strategyFileName,setStrategyFileName] = useState('');
  const [out,            setOut]            = useState('');
  const [loading,        setLoading]        = useState(false);
  const [autoGenReady,   setAutoGenReady]   = useState(false);

  // Auto-load strategy document from localStorage if available
  useEffect(() => {
    try {
      const savedStrategy = localStorage.getItem('encis_last_strategy');
      if (savedStrategy) {
        const parsed = JSON.parse(savedStrategy);
        if (parsed.content && !strategyDoc) {
          setStrategyDoc(parsed.content);
          setStrategyFileName(parsed.name || 'Auto-loaded strategy');
          setAutoGenReady(true);
        }
      }
    } catch {}
  }, []);

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
    const selectedPlatforms = platforms.join(', ');
    const res = await ai(CALENDAR_PROMPT(pillars, selectedPlatforms, duration, strategyDoc));
    setOut(res); setLoading(false);
  };
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Calendar Engine</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>4-week content framework every topic filmable tomorrow <SOPBadge/></p></div>
      </div>
      <Card>
        {/* Strategy Doc Upload */}
        <div style={{marginBottom:16}}>
          <SecLabel>
            Upload Strategy Doc{' '}
            <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,fontSize:11,color:'#6B7280'}}>
              (optional: upload your 90-Day Strategy for calendar continuity)
            </span>
          </SecLabel>
          <label style={{cursor:'pointer',display:'block'}}>
            <div style={{border:`2px dashed ${strategyDoc?'rgba(39,174,96,0.5)':'rgba(233,69,96,0.3)'}`,borderRadius:8,
              padding:'12px 16px',display:'flex',alignItems:'center',gap:12,
              background:strategyDoc?'rgba(39,174,96,0.07)':'rgba(255,255,255,0.02)'}}>
              <span style={{fontSize:20}}>{strategyDoc?'':''}</span>
              <div style={{flex:1}}>
                {strategyDoc
                  ? <><div style={{color:'#111827',fontWeight:700,fontSize:13}}>{strategyFileName}</div>
                      <div style={{color:'rgba(39,174,96,0.9)',fontSize:11,marginTop:2}}>Strategy loaded calendar will align with your goals and brand voice</div></>
                  : <><div style={{color:'#111827',fontWeight:600,fontSize:13}}>Upload your 90-Day Strategy Doc</div>
                      <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>Download from Strategy Builder then upload here gives the calendar full context</div></>}
              </div>
              {strategyDoc && (
                <button onClick={e=>{e.preventDefault();setStrategyDoc('');setStrategyFileName('');}}
                  style={{background:'#F9FAFB',border:'none',color:'#6B7280',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>
                  Remove
                </button>
              )}
            </div>
            <input type="file" accept=".txt,.md,text/plain" onChange={handleStrategyUpload} style={{display:'none'}}/>
          </label>
        </div>

        <SecLabel>Content Pillars</SecLabel>
        <input value={pillars} onChange={e=>setPillars(e.target.value)}
          placeholder={strategyDoc ? 'Override pillars here, or leave blank to use pillars from strategy doc...' : 'e.g. Veteran mindset, Real estate tips, Family lessons, Fitness...'}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
        <div style={{display:'flex',gap:24,marginTop:16,flexWrap:'wrap'}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:8}}>
              {PLATFORMS.map(p => {
                const checked = platforms.includes(p);
                return (
                  <button key={p}
                    onClick={() => setPlatforms(prev => checked ? prev.filter(x=>x!==p) : [...prev,p])}
                    style={{background:checked?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.04)',
                      color:checked?'#00C2FF':'#6B7280',
                      border:'1px solid '+(checked?'rgba(0,194,255,0.25)':'rgba(255,255,255,0.06)'),
                      borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,fontWeight:checked?700:400,
                      display:'flex',alignItems:'center',gap:6,transition:'all 0.15s'}}>
                    <span style={{width:8,height:8,borderRadius:2,background:checked?'#00C2FF':'rgba(255,255,255,0.2)',flexShrink:0}}/>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <SecLabel>Duration</SecLabel>
            <div style={{display:'flex',gap:8}}>
              {['30','60','90','180'].map(d => (
                <button key={d} onClick={()=>setDuration(d)}
                  style={{background:duration===d?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                    borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:duration===d?700:400}}>
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||(!pillars&&!strategyDoc)}>
          {loading ? 'Building Calendar...' : 'Build Calendar'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="ContentCalendar SIGNAL"/>
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
    Instagram: '@everydayelevations on Instagram: instagram.com/everydayelevations',
    YouTube: 'youtube.com/@everydayelevations',
    Facebook: 'facebook.com/jason.fricka',
    LinkedIn: 'linkedin.com/in/jason-fricka: HR Manager + podcast host Jason Fricka',
    X: '@everydayelevations on X (Twitter): x.com/everydayelevations',
    TikTok: '@everydayelevations on TikTok: tiktok.com/@everydayelevations',
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Profile Audit</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Perplexity pulls your live profile first. Then Claude audits what's actually there.</p>
        </div>
      </div>

      <Card style={{marginBottom:16}}>
        <SecLabel>Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => { setPlatform(p); setLiveData(''); setOut(''); }}
              style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:platform===p?700:400}}>
              {p}{p==='LinkedIn'?' (Dual-Lane)':''}
            </button>
          ))}
        </div>

        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
          <strong style={{color:'#2563EB'}}>Step 1</strong> Perplexity looks up your live {platform} profile right now. Hit the button below.
        </div>
        <button onClick={fetchLive} disabled={fetching}
          style={{background:fetching?'#6B7280':'rgba(255,255,255,0.08)',color:'#111827',border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:8,padding:'9px 20px',fontWeight:700,cursor:fetching?'not-allowed':'pointer',fontSize:13,marginBottom:16}}>
          {fetching ? 'Pulling live profile...' : `Pull Live ${platform} Profile`}
        </button>

        {liveData && (
          <div style={{marginBottom:16}}>
            <SecLabel>What Perplexity Found</SecLabel>
            <div style={{background:'#F9FAFB',borderRadius:8,padding:'12px',fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.7,maxHeight:180,overflowY:'auto'}}>
              {liveData}
            </div>
          </div>
        )}

        <SecLabel>Anything Perplexity Can't See (optional)</SecLabel>
        <textarea value={extraContext} onChange={e=>setExtraContext(e.target.value)} rows={3}
          placeholder={`e.g. My current DM volume, what posts get the most saves, my email list size, what my audience asks most...`}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading || !liveData}>
            {loading ? 'Auditing...' : 'Run Full Audit'}
          </RedBtn>
          {!liveData && <span style={{color:'#6B7280',fontSize:12,marginLeft:12}}>Pull live profile first</span>}
        </div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="ProfileAudit SIGNAL"/>
    </div>
  );
}

function LeadMagnet() {
  const [audience, setAudience] = useState('Everyday people who want to build discipline, feel stuck in their career or mindset, working parents grinding toward something better, professionals who want to level up');
  const [problem, setProblem] = useState("They know they need to change but don't know where to start. They feel like everyone else has it figured out. They're showing up but not seeing results.");
  const [offer, setOffer] = useState('Mindset coaching, Everyday Elevations podcast, the community community, real estate (Fricka Sells Colorado)');
  const [currentContent, setCurrentContent] = useState('Reels on mindset, everyday wins, discipline, Colorado lifestyle, family lessons, real estate tips. Voice is direct, real, no hype.');
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Lead Magnet Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Pre-filled with your context. Add what's actually working, then generate.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Who You're Trying to Reach</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>The Core Problem You Solve</SecLabel>
        <textarea value={problem} onChange={e=>setProblem(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>Your Offers / Services</SecLabel>
        <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What You Currently Post / Your Content Style</SecLabel>
        <textarea value={currentContent} onChange={e=>setCurrentContent(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What's Resonated Most With Your Audience (comments, DMs, saves, shares)</SecLabel>
        <textarea value={whatWorks} onChange={e=>setWhatWorks(e.target.value)} rows={3}
          placeholder="e.g. My veteran transition story got 200 saves. Posts about early mornings get the most DMs. People always ask me about my morning routine..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading}>
            {loading ? 'Building...' : 'Build Lead Magnet System'}
          </RedBtn>
        </div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="LeadMagnet SIGNAL"/>
    </div>
  );
}

function CommunityBuilder() {
  const [focus, setFocus] = useState("Everyday people who refuse to stay where they are. Mindset, discipline, showing up when it's hard. Working parents, professionals, athletes, people grinding toward something better.");
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Community Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Built from what's actually happening in your audience not a template.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Who the community Is For</SecLabel>
        <textarea value={focus} onChange={e=>setFocus(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What Your Current Engagement Actually Looks Like</SecLabel>
        <textarea value={currentEngagement} onChange={e=>setCurrentEngagement(e.target.value)} rows={2}
          placeholder="e.g. I get 10-15 DMs a week. Most comments are people saying they needed this today. My veteran posts get the most replies..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>Where Your Audience Lives Right Now</SecLabel>
        <textarea value={whereTheyAre} onChange={e=>setWhereTheyAre(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box',marginBottom:12}}/>

        <SecLabel>What People Ask You or Tell You Most (comments, DMs, real life)</SecLabel>
        <textarea value={whatTheyAsk} onChange={e=>setWhatTheyAsk(e.target.value)} rows={3}
          placeholder="e.g. How do you stay consistent? How did you get through your transition? Can you do more content on morning routines?..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>

        <div style={{marginTop:16}}>
          <RedBtn onClick={run} disabled={loading}>
            {loading ? 'Building...' : 'Build the community System'}
          </RedBtn>
        </div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="CommunityBuilder SIGNAL"/>
    </div>
  );
}

function Pipeline() {
  const [query,setQuery] = useState('');
  const [angle,setAngle] = useState('occupational');
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
    return ANGLES.find(a => a.label === label)?.id || 'emotional';
  };

  const runResearch = async () => {
    if(!query) return;
    setStep('researching'); setResearch(''); setIntel(''); setScript('');
    const t = TIER_PROMPTS[tier];
    const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const res = await perp(`Today is ${today}. ${t.desc}: ${query} focus on ${ANGLES.find(a=>a.id===angle)?.label} angle. Only use sources from 2026. Include source URLs where possible.`);
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Research Pipeline</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Perplexity research Intelligence extraction Camera-ready script</p></div>
      </div>
      <Card style={{marginBottom:16}}>
        <SecLabel>Research Topic</SecLabel>

        {/* Trending topic chips: tap to auto-fill */}
        {trendingChips.length > 0 && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(0,212,255,0.7)',
              textTransform:'uppercase',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <span></span> Trending Right Now: tap to research
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {trendingChips.map((chip, i) => (
                <button key={i}
                  onClick={() => {
                    setQuery(chip.label);
                    if (chip.angle) setAngle(angleIdFromLabel(chip.angle));
                  }}
                  style={{
                    background: query === chip.label ?'#EEF2FF':'#F9FAFB',
                    border: `1px solid ${query === chip.label ? '#2563EB' : 'rgba(0,212,255,0.2)'}`,
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
                    <span style={{color:'#2563EB',fontSize:10,fontWeight:700,flexShrink:0}}>
                      {chip.views}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="e.g. Colorado real estate market, mindset for high performers, daily discipline..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Content Angle</SecLabel>
        <AngleGrid selected={angle} onSelect={setAngle}/>
        <SecLabel>Research Depth</SecLabel>
        <div className="signal-grid-auto" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
          {TIER_PROMPTS.map((t,i) => (
            <button key={i} onClick={()=>setTier(i)}
              style={{background:tier===i?'#2563EB':'#F3F4F6',color:tier===i?'#FFFFFF':'#374151',border:'1px solid '+(tier===i?'transparent':'#E5E7EB'),
                borderRadius:8,padding:'10px 8px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:13}}>{t.label}</div>
              <div style={{color:tier===i?'rgba(255,255,255,0.8)':'#6B7280',fontSize:11,marginTop:2}}>{t.desc}</div>
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
          <div style={{color:'#6B7280',fontSize:12,lineHeight:1.7,whiteSpace:'pre-wrap',padding:'4px 0'}}
            dangerouslySetInnerHTML={{__html:research.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" style="color:#00C2FF">$1</a>')}}>
          </div>
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
                      style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
          <pre style={{color:'#111827',fontSize:12,whiteSpace:'pre-wrap',margin:0,lineHeight:1.6,
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Prompt Vault</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>25+ battle-tested prompts copy and run anywhere</p></div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {VAULT_TABS.map(t => (
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{background:activeTab===t.id?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
              borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:activeTab===t.id?700:400}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{display:'grid',gap:10}}>
        {current.prompts.map((p,i) => (
          <Card key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px'}}>
            <span style={{color:'#111827',fontSize:13,flex:1}}>{p}</span>
            <button onClick={()=>copyPrompt(p,i)}
              style={{background:copied===i?'rgba(46,204,113,0.2)':'#2563EB',color:'#111827',border:'1px solid #E5E7EB',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700,
                marginLeft:12,whiteSpace:'nowrap'}}>
              {copied===i?'Copied':'Copy'}
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Collab Finder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Perplexity-powered guest targets + pitch templates</p></div>
      </div>
      <Card>
        <SecLabel>Niche / Space</SecLabel>
        <input value={niche} onChange={e=>setNiche(e.target.value)}
          placeholder="e.g. Veteran wellness, Colorado real estate, Personal development podcasts..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Collaboration Type</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['podcast guest','stitch/collab','community partner','brand deal'].map(g => (
            <button key={g} onClick={()=>setGoal(g)}
              style={{background:goal===g?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
      <DocOutput text={out} title="CollabFinder SIGNAL"/>
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Insight Extractor</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Pull gold from any content articles, interviews, books, transcripts</p></div>
      </div>
      <Card>
        <SecLabel>Content to Analyze</SecLabel>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6}
          placeholder="Paste any content: article, interview transcript, book excerpt, speech..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Specific Question / Focus (optional)</SecLabel>
        <input value={question} onChange={e=>setQuestion(e.target.value)}
          placeholder="e.g. How does this apply to veterans? What's the content angle for real estate?"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!content}>
          {loading?'Extracting Insights...':'Extract Insights'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="Extract SIGNAL"/>
    </div>
  );
}

function ScriptEngine() {
  const [mode,setMode] = useState('write'); // write | stitch
  const [topic,setTopic] = useState('');
  const [angle,setAngle] = useState('emotional');
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
      let angleLabel = ANGLES.find(a=>a.id===angle)?.label;
      res = await ai(STITCH_PROMPT(stitchContent, angleLabel));
      logToMemory({ type:'script', title:`Stitch: ${stitchContent.slice(0,60)}`, platform, angle:angleLabel, preview:res.slice(0,200) });
    }
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Script Engine</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>3 script variations Write original or Stitch response <SOPBadge/></p></div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'write',label:'Write Script'},{id:'stitch',label:'Stitch Response'}].map(m => (
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{background:mode===m.id?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
            <SecLabel>Content Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={()=>setPlatform(p)}
                  style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
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
            <span style={{color:'#111827',fontWeight:700,fontSize:14}}>Your Script</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={()=>setTeleprompter(true)}
                style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00C2FF',
                  border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'7px 16px',
                  fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                Teleprompter Mode
              </button>
            </div>
          </div>
          <DocOutput text={out} title={`${topic || angle || "Content"}: SIGNAL`}/>
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Episode to Clips</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>One podcast episode 5-7 clips + carousel + LinkedIn + quotes + email</p></div>
      </div>
      <Card>
        <SecLabel>Episode Title</SecLabel>
        <input value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="e.g. How I went from active duty to building 3 businesses..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Episode Notes / Key Points (optional)</SecLabel>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
          placeholder="Paste show notes, key timestamps, main topics covered..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!title}>
          {loading?'Extracting Clips...':'Extract All Clips & Assets'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="EpisodeClips SIGNAL"/>
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Repurpose Engine</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>One script 4 platform-native versions <SOPBadge/></p></div>
      </div>
      <Card>
        <SecLabel>Original Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={()=>setOriginalPlatform(p)}
              style={{background:originalPlatform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:originalPlatform===p?700:400}}>
              {p}
            </button>
          ))}
        </div>
        <SecLabel>Original Script</SecLabel>
        <textarea value={script} onChange={e=>setScript(e.target.value)} rows={6}
          placeholder="Paste your existing script or content to repurpose..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
        <div style={{marginTop:16}}><RedBtn onClick={run} disabled={loading||!script}>
          {loading?'Repurposing...':'Repurpose to All Platforms'}
        </RedBtn></div>
      </Card>
      {loading && <Spin/>}
      <DocOutput text={out} title="RepurposeEngine SIGNAL"/>
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Hook Library</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>5 hook types Pattern Interrupt, Question, Bold Statement, Story, Data</p></div>
      </div>
      <Card>
        <SecLabel>Topic</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. Veteran transition, Mindset shift, Real estate investing, Morning routines..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>How Many Hooks?</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[10,20,30,40].map(q => (
            <button key={q} onClick={()=>setQuantity(q)}
              style={{background:quantity===q?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
      <DocOutput text={out} title={`${topic || "Hooks"}: SIGNAL`}/>
    </div>
  );
}

function DesignStudio() {
  const [topic,setTopic] = useState('');
  const [format,setFormat] = useState('Carousel');
  const [angle,setAngle] = useState('emotional');
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div><h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Design Studio</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Carousel + static post concepts with visual direction + captions</p></div>
      </div>
      <Card>
        <SecLabel>Topic</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. 5 signs you're ready for a mindset shift..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Format</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          {['Carousel','Static Post','Story Sequence'].map(f => (
            <button key={f} onClick={()=>setFormat(f)}
              style={{background:format===f?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
      <DocOutput text={out} title={`${topic || angle || "Content"}: SIGNAL`}/>
    </div>
  );
}

function WeeklyReview() {
  const [metrics, setMetrics] = useState('');
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [topContent, setTopContent] = useState('');
  const [testsRan, setTestsRan] = useState('');
  const [competitorNotes, setCompetitorNotes] = useState('');
  const [revenueData, setRevenueData] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [autoFilled, setAutoFilled] = useState(false);

  // Auto-fill from stored data on mount
  useEffect(() => {
    if (autoFilled) return;
    try {
      const roiWeeks = JSON.parse(localStorage.getItem('encis_roi_weeks') || '[]');
      if (roiWeeks.length > 0) {
        const latest = roiWeeks[0];
        setMetrics(`Week: ${latest.week||'This week'} | Followers: ${latest.followers||'?'} | Reach: ${latest.reach||'?'} | Saves: ${latest.saves||'?'} | Shares: ${latest.shares||'?'} | Leads: ${latest.leads||'?'}${latest.notes?' | '+latest.notes:''}`);
      }
      const log = JSON.parse(localStorage.getItem('encis_content_log') || '[]');
      const topPosts = log.filter(e => e.perf).slice(0, 5);
      if (topPosts.length) setTopContent(topPosts.map(e => `[${e.perf}] ${e.title||e.topic||'Untitled'} (${e.platform||''})`).join('\n'));
      const tests = JSON.parse(localStorage.getItem('encis_ab_tests') || '[]');
      if (tests.length) setTestsRan(tests.slice(0,3).map(t => `${t.hypothesis}: Winner ${t.winner||'TBD'} — ${t.insight||''}`).join('\n'));
      const rev = JSON.parse(localStorage.getItem('encis_revenue') || '[]');
      if (rev.length) setRevenueData(rev.slice(0,3).map(r => `${r.source}: ${r.leads||'0'} leads, $${r.revenue||'0'}`).join('\n'));
      const spy = JSON.parse(localStorage.getItem('encis_spy_history') || '[]');
      if (spy.length) setCompetitorNotes(spy.slice(0,2).map(s => `${s.handle}: ${s.summary||''}`).join('\n'));
      if (roiWeeks.length || log.length) setAutoFilled(true);
    } catch {}
  }, []);


  const run = async () => {
    if (!metrics) return;
    setLoading(true); setOut('');
    const res = await ai(REVIEW_PROMPT(metrics, wins, struggles, topContent, testsRan, competitorNotes, revenueData));
    setOut(res); setLoading(false);
    try { localStorage.setItem('encis_last_review', JSON.stringify({content:res,date:new Date().toISOString(),week:metrics.slice(0,50)})); } catch {}
  };

  const modules = [
    { id: 0, label: 'Core Metrics' },
    { id: 1, label: 'Content & Tests' },
    { id: 2, label: 'Revenue & Intel' },
  ];

  const taStyle = { width:'100%', background:'#F9FAFB', border:'1px solid #D1D5DB', borderRadius:8, padding:'10px 12px', color:'#111827', fontSize:13, resize:'vertical', marginBottom:14, boxSizing:'border-box', fontFamily:'inherit' };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Weekly Review Command Center</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>6-module growth system. Input your week. Get a complete execution plan.</p>
          {autoFilled && <div style={{color:'rgba(0,194,255,0.7)',fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginTop:4}}>Auto-filled from your logged data</div>}
        </div>
      </div>

      <Card>
        {/* Module tabs */}
        <div style={{display:'flex',gap:6,marginBottom:20}}>
          {modules.map(m => (
            <button key={m.id} onClick={() => setActiveModule(m.id)}
              style={{background: activeModule===m.id ? 'rgba(0,194,255,0.1)' : 'rgba(255,255,255,0.04)', color: activeModule===m.id ? '#00C2FF' : '#6B7280', border: '1px solid ' + (activeModule===m.id ? 'rgba(0,194,255,0.2)' : 'rgba(255,255,255,0.06)'), borderRadius:7, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6}}>
              {m.label}
            </button>
          ))}
        </div>

        {activeModule === 0 && (
          <div>
            <SecLabel>This Week's Metrics</SecLabel>
            <textarea value={metrics} onChange={e=>setMetrics(e.target.value)} rows={3}
              placeholder="e.g. Instagram: 3 Reels posted, 18K reach, 420 new followers, 5 DMs, 112 saves. Best post: morning routine reel 8K views. LinkedIn: 2 posts, 3K impressions."
              style={taStyle}/>
            <SecLabel>Wins This Week</SecLabel>
            <textarea value={wins} onChange={e=>setWins(e.target.value)} rows={2}
              placeholder="e.g. First reel broke 10K views. Closed one real estate inquiry from Instagram DM. Podcast episode released."
              style={taStyle}/>
            <SecLabel>Struggles / What Didn't Work</SecLabel>
            <textarea value={struggles} onChange={e=>setStruggles(e.target.value)} rows={2}
              placeholder="e.g. LinkedIn engagement dropped 40%. Missed 2 scheduled posts. Financial content got zero saves."
              style={taStyle}/>
          </div>
        )}

        {activeModule === 1 && (
          <div>
            <SecLabel>Top Performing Content</SecLabel>
            <textarea value={topContent} onChange={e=>setTopContent(e.target.value)} rows={3}
              placeholder="e.g. Best piece: 'Nobody tells you this about waking up at 4:30 AM' Reel, 8.2K views, 89 saves, 14 shares. Second: real estate tip carousel 3.1K reach, 34 saves."
              style={taStyle}/>
            <SecLabel>Tests Ran This Week</SecLabel>
            <textarea value={testsRan} onChange={e=>setTestsRan(e.target.value)} rows={2}
              placeholder="e.g. Tested hook style question vs bold statement. Bold statement won (3x more saves). Tested posting at 6AM vs 7AM 6AM outperformed by 18%."
              style={taStyle}/>
          </div>
        )}

        {activeModule === 2 && (
          <div>
            <SecLabel>Revenue / Leads Data</SecLabel>
            <textarea value={revenueData} onChange={e=>setRevenueData(e.target.value)} rows={2}
              placeholder="e.g. 2 real estate inquiries from Instagram. 1 coaching DM that went cold. $0 direct revenue but 1 showing booked."
              style={taStyle}/>
            <SecLabel>Competitor Notes</SecLabel>
            <textarea value={competitorNotes} onChange={e=>setCompetitorNotes(e.target.value)} rows={2}
              placeholder="e.g. Competitor X is posting daily 'day in my life as a realtor' content performing well. Another creator shifted to YouTube Shorts and gained 2K followers this week."
              style={taStyle}/>
          </div>
        )}

        <div style={{marginTop:8}}>
          <button onClick={run} disabled={loading||!metrics}
            style={{background: !metrics ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#00C2FF,#0096CC)', color: !metrics ? '#6B7280' : '#000D1A', border:'none', borderRadius:8, padding:'11px 24px', fontWeight:800, cursor: !metrics?'not-allowed':'pointer', fontSize:14, boxShadow: !metrics ? 'none' : '0 0 20px rgba(0,194,255,0.25)'}}>
            {loading ? 'Running review...' : 'Run Full 6-Module Review'}
          </button>
          {!metrics && <span style={{color:'#6B7280',fontSize:11,marginLeft:12}}>Add metrics in Module 1 first</span>}
        </div>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title="Weekly Review Command Center"/>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// TELEPROMPTER
// ═════════════════════════════════════════════════════════════════════════════
function Teleprompter({ text, onClose }) {
  const [speed, setSpeed] = useState(30);       // px per second
  const [running, setRunning] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [mirror, setMirror] = useState(false);
  const scrollRef = useRef(null);
  const rafRef   = useRef(null);
  const lastRef  = useRef(null);

  // Clean script text: strip markdown bold/italic, keep structure
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
      if (e.key === 'ArrowUp')   setSpeed(s => Math.min(s + 5, 150));
      if (e.key === 'ArrowDown') setSpeed(s => Math.max(s - 5, 5));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column'}}>
      {/* Controls bar */}
      <div style={{background:'#FFFFFF',borderBottom:'1px solid rgba(255,255,255,0.1)',
        padding:'10px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',flexShrink:0}}>
        <button onClick={() => setRunning(r => !r)}
          style={{background:running?'#EEF2FF':'#F9FAFB',color:'#000',border:'none',borderRadius:8,
            padding:'8px 22px',fontWeight:900,fontSize:14,cursor:'pointer',minWidth:90}}>
          {running ? 'Pause' : 'Start'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#6B7280',fontSize:12}}>Speed</span>
          <button onClick={()=>setSpeed(s=>Math.max(s-5,5))}
            style={{background:'rgba(255,255,255,0.1)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:16}}>−</button>
          <span style={{color:'#111827',fontWeight:700,fontSize:13,minWidth:24,textAlign:'center'}}>{speed}</span>
          <button onClick={()=>setSpeed(s=>Math.min(s+5,150))}
            style={{background:'rgba(255,255,255,0.1)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:16}}>+</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#6B7280',fontSize:12}}>Size</span>
          <button onClick={()=>setFontSize(s=>Math.max(s-4,24))}
            style={{background:'rgba(255,255,255,0.1)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:14}}>A-</button>
          <button onClick={()=>setFontSize(s=>Math.min(s+4,80))}
            style={{background:'rgba(255,255,255,0.1)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,width:28,height:28,cursor:'pointer',fontSize:14}}>A+</button>
        </div>
        <button onClick={()=>setMirror(m=>!m)}
          style={{background:mirror?'rgba(0,212,255,0.15)':'rgba(255,255,255,0.07)',
            color:mirror?'#00C2FF':'#6B7280',border:`1px solid ${mirror?'rgba(0,212,255,0.4)':'transparent'}`,
            borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>
          Mirror
        </button>
        <div style={{marginLeft:'auto',color:'#6B7280',fontSize:11,lineHeight:1.6,textAlign:'right'}}>
          Space/Enter: play/pause<br/>↑↓: speed &nbsp;·&nbsp; Esc: exit
        </div>
        <button onClick={onClose}
          style={{background:'rgba(233,69,96,0.15)',color:'#2563EB',border:'1px solid rgba(233,69,96,0.3)',
            borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:700}}>
          Exit
        </button>
      </div>

      {/* Focus line */}
      <div style={{position:'absolute',top:'42%',left:0,right:0,height:4,
        background:'rgba(0,212,255,0.25)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:'42%',left:0,right:0,height:'18%',
        background:'linear-gradient(transparent,rgba(0,212,255,0.04),transparent)',
        pointerEvents:'none',zIndex:1}}/>

      {/* Script text */}
      <div ref={scrollRef} style={{flex:1,overflowY:'scroll',padding:'0 10vw',
        scrollbarWidth:'none',msOverflowStyle:'none',
        transform:mirror?'scaleX(-1)':'none'}}>
        <div style={{paddingTop:'44vh',paddingBottom:'60vh'}}>
          {cleanText.split('\n').filter(l=>l.trim()).map((line, i) => {
            const isHook = i === 0;
            const isCTA  = line.toLowerCase().includes('cta') || line.toLowerCase().startsWith('comment') || line.toLowerCase().startsWith('follow');
            return (
              <p key={i} style={{
                fontSize: isHook ? fontSize * 1.15 : fontSize,
                fontWeight: isHook ? 900 : (line.startsWith('**')||line.startsWith('VARIATION')||line.startsWith('Hook')||line.startsWith('Body')||line.startsWith('CTA') ? 700 : 400),
                color: isCTA ? '#00C2FF' : isHook ? '#111827' : 'rgba(255,255,255,0.88)',
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
// ═════════════════════════════════════════════════════════════════════════════
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
  const [apiError, setApiError] = useState(null);

  // Load cached alerts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREND_ALERTS_KEY);
      const date   = localStorage.getItem(TREND_ALERTS_DATE);
      if (stored) setAlerts(JSON.parse(stored));
      if (date) {
        // Format ms timestamp → readable string
        const ts = /^\d+$/.test(date) ? parseInt(date) : null;
        if (ts) {
          const d = new Date(ts);
          setLastRun(d.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' at ' + d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}));
        } else {
          setLastRun(date);
        }
      }
    } catch {}
  }, []);

  const checkTrends = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const todayStr = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});

      // Use only 3 queries (not 8) to avoid rate limits — pick highest-value angles
      const angleQueries = [
        { angle: 'Occupational', q: `What career, business, real estate, or professional growth content went viral on Instagram, YouTube, or TikTok this week? Name a specific creator and post. Today is ${todayStr}.` },
        { angle: 'Physical',     q: `What fitness, health, or wellness content went viral on social media this week? Name a specific creator and post with why it performed well. Today is ${todayStr}.` },
        { angle: 'Mindset',      q: `What mindset, discipline, motivation, or personal development content went viral on social media this week? Name a specific creator and post. Today is ${todayStr}.` },
      ];

      const newAlerts = [];

      // Run SEQUENTIALLY to avoid rate limits — not Promise.all
      for (let i = 0; i < angleQueries.length; i++) {
        const { angle, q } = angleQueries[i];
        try {
          const res = await fetch('/api/perplexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q })
          });

          if (!res.ok) {
            setApiError(`API error ${res.status} — check that PERPLEXITY_API_KEY is set in Vercel`);
            break; // stop if API is broken
          }

          const d = await res.json();
          const raw = (d.result || d.text || d.content || d.answer || '').trim();

          // Check for API key error in the response body
          if (raw.toLowerCase().includes('api key') || raw.toLowerCase().includes('unauthorized') || raw.toLowerCase().includes('invalid key')) {
            setApiError('Perplexity API key missing or invalid — add PERPLEXITY_API_KEY to Vercel environment variables');
            break;
          }

          if (!raw || raw.length < 15) continue;

          // Extract handle if present
          const handleMatch = raw.match(/@([\w.]+)/);
          const account = handleMatch ? '@' + handleMatch[1] : null;
          const platMatch = raw.match(/\b(instagram|youtube|tiktok|linkedin|facebook)\b/i);
          const platform = platMatch ? platMatch[1].charAt(0).toUpperCase() + platMatch[1].slice(1) : 'Social';
          const handle = account ? account.replace('@','') : null;
          const profileUrl = handle
            ? (platform.toLowerCase() === 'youtube'
                ? 'https://youtube.com/@' + handle
                : 'https://instagram.com/' + handle)
            : null;
          const searchUrl = 'https://www.perplexity.ai/search?q=' + encodeURIComponent(angle + ' viral content social media ' + todayStr);

          newAlerts.push({
            id: Date.now() + i,
            angle,
            account: account || platform + ' trend',
            platform,
            text: raw.length > 350 ? raw.slice(0, 350) + '...' : raw,
            raw,
            profileUrl,
            searchUrl,
            ts: Date.now(),
            seen: false,
          });

          // Small delay between calls to respect rate limits
          if (i < angleQueries.length - 1) {
            await new Promise(r => setTimeout(r, 800));
          }
        } catch(e) {
          console.error('Trend fetch error for', angle, e);
        }
      }

      if (newAlerts.length > 0 || !apiError) {
        try { localStorage.setItem(TREND_ALERTS_KEY, JSON.stringify(newAlerts)); } catch {}
        try { localStorage.setItem(TREND_ALERTS_DATE, Date.now().toString()); } catch {}
        setAlerts(newAlerts);
      }

      const timeStr = new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
      const dateStr = new Date().toLocaleDateString('en-US', {month:'short', day:'numeric'});
      setLastRun(`${dateStr} at ${timeStr}`);

    } catch(e) {
      console.error('Trend check error:', e);
      setApiError('Network error — ' + e.message);
    }
    setLoading(false);
  };

  // Auto-check on mount if not checked in last 6 hours
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREND_ALERTS_DATE) || '0';
      const lastTs = /^\d+$/.test(stored) ? parseInt(stored) : 0;
      const hoursSinceLast = (Date.now() - lastTs) / (1000 * 60 * 60);
      if (hoursSinceLast > 6) checkTrends();
    } catch {}
  }, []);

  const markSeen = () => {
    const updated = alerts.map(a => ({...a, seen:true}));
    setAlerts(updated);
    try { localStorage.setItem(TREND_ALERTS_KEY, JSON.stringify(updated)); } catch {}
  };

  const unseen = alerts.filter(a => !a.seen).length;
  return { alerts, loading, lastRun, checkTrends, markSeen, unseen, apiError };
}


function TrendAlertBanner() {
  const { alerts, loading, lastRun, checkTrends, markSeen, unseen, apiError } = useTrendAlerts();
  const [expanded, setExpanded] = useState(false);

  // Always render even with no alerts, show the bar so user can refresh
  const hasAlerts = alerts.length > 0;
  const preview = (alerts.find(a => a.text?.length > 10)?.text || '').replace(/\*\*/g,'').slice(0, 80);

  return (
    <div style={{
      background: '#0F1923',
      borderBottom: '1px solid rgba(0,194,255,0.08)',
    }}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',minHeight:38}}>
          {/* Label */}
          <span style={{color:'rgba(0,194,255,0.5)',fontWeight:700,fontSize:10,letterSpacing:2,
            textTransform:'uppercase',whiteSpace:'nowrap',flexShrink:0}}>
            TREND INTEL
          </span>
          {unseen > 0 && !expanded && (
            <span style={{background:'#00C2FF',color:'#000D1A',borderRadius:3,padding:'1px 6px',
              fontSize:9,fontWeight:800,letterSpacing:1}}>
              {unseen} NEW
            </span>
          )}
          {/* Preview text */}
          <span className="signal-trend-preview" style={{color:'rgba(255,255,255,0.45)',fontSize:11,flex:1,overflow:'hidden',
            textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            <span style={{color: apiError ? '#ef4444' : 'rgba(255,255,255,0.45)'}}>
            {loading ? 'Scanning trends...' :
             apiError ? apiError :
             hasAlerts ? (preview || `${alerts.length} trend${alerts.length!==1?'s':''} found`) :
             'No trends yet — click Refresh'}
          </span>
          </span>
          {/* Actions */}
          <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
            <button onClick={checkTrends} disabled={loading}
              style={{background:loading?'transparent':'rgba(0,194,255,0.12)',
                color:loading?'#6B7280':'#00C2FF',
                border:'1px solid rgba(0,194,255,0.2)',
                borderRadius:6,padding:'4px 12px',fontSize:11,
                cursor:loading?'default':'pointer',fontWeight:700,
                letterSpacing:0.5,whiteSpace:'nowrap'}}>
              {loading ? 'Scanning...' : 'Refresh'}
            </button>
            {hasAlerts && (
              <button onClick={()=>{ setExpanded(e=>!e); if(unseen>0) markSeen(); }}
                style={{background:'none',color:'rgba(255,255,255,0.35)',border:'none',
                  padding:'4px 8px',fontSize:11,cursor:'pointer',fontWeight:600,letterSpacing:0.5}}>
                {expanded ? 'Collapse' : 'Expand'}
              </button>
            )}
          </div>
        </div>

        {/* Expanded grid */}
        {expanded && hasAlerts && (
          <div style={{paddingBottom:16}}>
            {lastRun && (
              <div style={{color:'#6B7280',fontSize:10,marginBottom:10,letterSpacing:0.5}}>
                Last checked: {lastRun} · {alerts.length} trend{alerts.length!==1?'s':''} found
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8}}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  background:'#FFFFFF',
                  border:`1px solid ${alert.seen?'#E5E7EB':'#C7D2FE'}`,
                  borderRadius:8,padding:'12px 14px',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{color:'#2563EB',fontSize:9,fontWeight:700,
                      letterSpacing:2,textTransform:'uppercase'}}>
                      {alert.angle}
                    </span>
                    {!alert.seen && (
                      <span style={{background:'#00C2FF',color:'#000D1A',borderRadius:2,
                        padding:'1px 5px',fontSize:8,fontWeight:800,letterSpacing:0.5}}>NEW</span>
                    )}
                  </div>
                  {alert.account && (
                    <div style={{color:'#111827',fontWeight:700,fontSize:12,marginBottom:3}}>
                      {alert.account}
                    </div>
                  )}
                  {alert.title && (
                    <div style={{color:'#6B7280',fontSize:11,marginBottom:6,lineHeight:1.5}}>
                      {alert.title}
                    </div>
                  )}
                  {alert.views && (
                    <div style={{color:'rgba(0,194,255,0.7)',fontSize:10,fontWeight:700,marginBottom:4}}>
                      {alert.views}
                    </div>
                  )}
                  {alert.text && (
                    <div style={{color:'#6B7280',fontSize:10,lineHeight:1.5,marginBottom:6}}>
                      {alert.text.replace(/\*\*/g,'').slice(0,160)}{alert.text.replace(/\*\*/g,'').length>160?'...':''}
                    </div>
                  )}
                  {alert.profileUrl && (
                    <a href={alert.profileUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{color:'rgba(0,194,255,0.6)',fontSize:10,textDecoration:'none',
                        fontWeight:600,letterSpacing:0.3}}>
                      View account
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


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
  const Sparkline = ({ data, color='#00C2FF', height=40 }) => {
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
    { k:'followers', label:'Followers',  color:'#00C2FF' },
    { k:'reach',     label:'Weekly Reach', color:'#00C2FF' },
    { k:'saves',     label:'Saves',       color:'#f5a623' },
    { k:'shares',    label:'Shares',      color:'#27ae60' },
    { k:'leads',     label:'Leads/DMs',   color:'#9b59b6' },
  ];

  const formFields = [
    { k:'week',       label:'Week (date)',       ph:'e.g. Mar 18, 2026',            full:false },
    { k:'followers',  label:'Total Followers',   ph:'e.g. 2847',                    full:false },
    { k:'reach',      label:'Total Reach',       ph:'e.g. 18400',                   full:false },
    { k:'saves',      label:'Total Saves',       ph:'e.g. 234',                     full:false },
    { k:'shares',     label:'Total Shares',      ph:'e.g. 67',                      full:false },
    { k:'leads',      label:'Leads / DMs',       ph:'e.g. 8',                       full:false },
    { k:'topContent', label:'Top Performing Post',ph:'e.g. Veteran morning routine got 900 saves', full:true },
    { k:'notes',      label:'Notes',             ph:'e.g. Tried shorter captions: engagement up 40%', full:true },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>ROI Dashboard</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Weekly scorecard track growth, identify what drives real results</p>
          </div>
        </div>
        <button onClick={()=>{ setForm({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', topContent:'', notes:'' }); setEditIdx(null); setShowForm(true); }}
          style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Log This Week
        </button>
      </div>

      {/* Empty state */}
      {weeks.length === 0 && !showForm && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          
          <div style={{color:'#111827',fontWeight:700,fontSize:18,marginBottom:8}}>No data yet</div>
          <div style={{color:'#6B7280',fontSize:14,lineHeight:1.7,marginBottom:20}}>Log your first week of metrics and the dashboard builds automatically.<br/>Takes 60 seconds. Pays off every week after.</div>
          <button onClick={()=>setShowForm(true)}
            style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
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
                <div key={f.k} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:12,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:'#6B7280',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>{f.label}</div>
                  <div style={{fontSize:26,fontWeight:800,color:'#111827',marginBottom:4}}>{latest?.[f.k] || '—'}</div>
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
            <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:12,padding:'16px',marginBottom:20}}>
              <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>Top Content Log</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[...weeks].reverse().filter(w=>w.topContent).slice(0,6).map((w,i) => (
                  <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                    <span style={{color:'#6B7280',fontSize:11,whiteSpace:'nowrap',paddingTop:2}}>{w.week}</span>
                    <span style={{color:'#111827',fontSize:13,lineHeight:1.5}}>{w.topContent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Week log table */}
          <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:12,overflow:'hidden',marginBottom:20}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    {['Week','Followers','Reach','Saves','Shares','Leads','Notes',''].map(h => (
                      <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'#6B7280',fontWeight:700,letterSpacing:1,fontSize:10,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...weeks].reverse().map((w,i) => (
                    <tr key={w.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'10px 12px',color:'#111827',fontWeight:600,whiteSpace:'nowrap'}}>{w.week}</td>
                      {['followers','reach','saves','shares','leads'].map(f => (
                        <td key={f} style={{padding:'10px 12px',color:'rgba(255,255,255,0.75)'}}>{w[f]|| '—'}</td>
                      ))}
                      <td style={{padding:'10px 12px',color:'#6B7280',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.notes|| '—'}</td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={()=>{ setForm({...w}); setEditIdx(weeks.length-1-i); setShowForm(true); }}
                            style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:5,padding:'3px 8px',fontSize:11,cursor:'pointer'}}>Edit</button>
                          <button onClick={()=>deleteWeek(weeks.length-1-i)}
                            style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:5,padding:'3px 6px',fontSize:12,cursor:'pointer'}}>×</button>
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
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:14,padding:'22px',marginBottom:20}}>
          <div style={{color:'#111827',fontWeight:700,fontSize:15,marginBottom:18}}>{editIdx!==null?'Edit Week':'Log This Week'}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {formFields.map(f => (
              <div key={f.k} style={{gridColumn:f.full?'1/-1':'auto'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,color:'#2563EB',textTransform:'uppercase',marginBottom:5}}>{f.label}</div>
                {f.full
                  ? <textarea value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                      style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                  : <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                      style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
                }
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:10,marginTop:18}}>
            <RedBtn onClick={submit} disabled={!form.week}>{editIdx!==null?'Save Changes':'Log Week'}</RedBtn>
            <button onClick={()=>{ setShowForm(false); setEditIdx(null); }}
              style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════════
const TOP_NAV = [
  { id:'home', label:'Dashboard' },
  { id:'strategy', label:'Strategy' },
  { id:'research', label:'Research' },
  { id:'create', label:'Create' },
  { id:'optimize', label:'Optimize' },
  { id:'agency', label:'Agency' },
  { id:'youtube', label:'YouTube' },
];

const SUB_NAV = {
  strategy: [
    { id:'onboard', label:'Onboarding' },
    { id:'calendar', label:'Calendar' },
    { id:'profile', label:'Profile Audit' },
    { id:'magnet', label:'Lead Magnet' },
    { id:'community', label:'Community' },
    { id:'email', label:'Email Sequences' },
    { id:'challenge', label:'Challenge Builder' },
    { id:'campaign', label:'Campaign Builder' },
    { id:'visualcal', label:'Visual Calendar' },
    { id:'series', label:'Series Planner' },
    { id:'storyarc', label:'Story Arc' },
    { id:'bio', label:'Bio Suite' },
  ],
  research: [
    { id:'research', label:'Research Hub' },
    { id:'vault', label:'Prompt Vault' },
    { id:'collab', label:'Collab Finder' },
  ],
  create: [
    { id:'create', label:'Create Hub' },
    { id:'hooks', label:'Hook Workshop' },
    { id:'design', label:'Design Studio' },
    { id:'comment', label:'Comment Responder' },
    { id:'abhook', label:'A/B Hook Tester' },
    { id:'repurpose', label:'Repurpose Agent' },

    { id:'podcast', label:'Podcast Prep' },
    { id:'dmscripts', label:'DM Scripts' },
    { id:'videodirector', label:'Video Director' },
    { id:'objections', label:'Objection Handler' },
    { id:'guestprep', label:'Guest Prep Kit' },
    { id:'contentbrief', label:'Content Brief' },
  ],
  optimize: [
    { id:'review', label:'Weekly Review' },
    { id:'growth', label:'Growth Dashboard' },
    { id:'memory', label:'Content Memory' },
    { id:'schedule', label:'Schedule' },
    { id:'gaps', label:'Gap Analyzer' },
    { id:'predictor', label:'Predictor' },
    { id:'stratreview', label:'Strategy Review' },
    { id:'library', label:'Content Library' },
    { id:'weeklybrief', label:'Weekly Brief Agent' },
    { id:'trendmonitor', label:'Trend Monitor' },
    { id:'approvalqueue', label:'Approval Queue' },
    { id:'perfagent', label:'Performance Agent' },
    { id:'abtests', label:'A/B Tests' },
    { id:'revenue', label:'Revenue Attribution' },
    { id:'pricing', label:'Pricing Calculator' },
  ],
  agency: [
    { id:'portal', label:'Client Portal' },
    { id:'deliverable', label:'Deliverables' },
    { id:'report', label:'Monthly Report' },
    { id:'voice', label:'Voice Fingerprint' },
    { id:'clients', label:'Client Profiles' },
    { id:'tracker', label:'Collab Tracker' },
    { id:'whitelabel', label:'White Label' },
    { id:'persona', label:'AI Persona' },
    { id:'transcript', label:'Transcripts' },
    { id:'analytics', label:'Analytics Import' },
    { id:'onboardauto', label:'Auto Onboarding' },
    { id:'clientcomms', label:'Client Comms' },
  ],
  youtube: [
    { id:'yttoolkit', label:'YouTube Toolkit' },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 1: CAPTION WRITER
// ═════════════════════════════════════════════════════════════════════════════
const CAPTION_PROMPT = (topic, platform, angle, hook, cta) => `
${VOICE}
${CONTENT_SOP}

Topic: ${topic}
Platform: ${platform}
Angle: ${angle}
Hook to open with: ${hook || 'Write your own strong hook'}
CTA style: ${cta}

Write 3 caption variations for this ${platform} post. Each must feel completely different : different energy, different structure, different length.

**CAPTION 1 : SHORT & PUNCHY** (under 100 words)
[Hook line]
[2-3 lines of value]
[CTA]
[10 hashtags]

**CAPTION 2 : STORY-DRIVEN** (150-250 words)
[Personal moment or scene-setter]
[The lesson or shift]
[Connect to audience]
[CTA]
[15 hashtags]

**CAPTION 3 : EDUCATE & CONVERT** (100-150 words)
[Bold statement hook]
[3 punchy insight lines]
[CTA with keyword trigger]
[15 hashtags]

Rules: No "Hey guys." No emojis unless they add something. Hashtags tiered : 5 niche, 5 mid, 5 broad. CTA matches the platform's culture.`;

function CaptionWriter() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [angle, setAngle] = useState('emotional');
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Caption Writer</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>3 caption variations : short, story, and educational. Platform-native, saves-first.</p>
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
                  style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
                  style={{background:cta===c.id?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>

        <SecLabel>Opening Hook (optional : paste from Script Engine or write your own)</SecLabel>
        <input value={hook} onChange={e=>setHook(e.target.value)}
          placeholder="e.g. Nobody talks about what happens the week after you get out..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>

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
            <span style={{color:'#111827',fontWeight:700,fontSize:14}}>Your Captions</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={() => setTeleprompter(true)}
                style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00C2FF',
                  border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'7px 16px',
                  fontSize:12,fontWeight:700,cursor:'pointer'}}>
                Teleprompter
              </button>
            </div>
          </div>
          <DocOutput text={out} title={`${topic || angle || "Content"} : SIGNAL`}/>
        </div>
      )}
      {teleprompter && <Teleprompter text={out} onClose={() => setTeleprompter(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 2 : SCHEDULE OPTIMIZER
// ═════════════════════════════════════════════════════════════════════════════
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
      ? log.slice(0, 30).map(e => `${e.date} : ${e.type} : ${e.title} : Rating: ${e.perf || 'unrated'}`).join('\n')
      : 'No content memory logged yet.';

    const prompt = `${VOICE}

You are analyzing Jason Fricka's actual content performance data to build a specific posting schedule.

ROI DATA (last 8 weeks):
${roiSummary}

CONTENT MEMORY (recent 30 pieces):
${memorySummary}

Available hours per week: ${hours}

Based on this actual data, build a specific weekly posting schedule. Do not give generic advice : base every recommendation on what the data shows.

# Optimal Posting Schedule for @everydayelevations

## What the Data Shows
[Specific patterns from the ROI and content memory data above : what's working, what's not, best performing content types]

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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Schedule Optimizer</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Reads your ROI data and Content Memory : tells you exactly when and what to post.</p>
        </div>
      </div>

      {weeks.length === 0 && log.length === 0 && (
        <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
          No performance data yet. Log a few weeks in the ROI Dashboard and generate some content first : then come back for a data-driven schedule.
        </div>
      )}

      <Card>
        <SecLabel>Hours Available Per Week</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {['3','5','10','15','20+'].map(h => (
            <button key={h} onClick={() => setHours(h)}
              style={{background:hours===h?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:hours===h?700:400}}>
              {h}h
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
          <div style={{background:'#FFFFFF',borderRadius:10,padding:'14px'}}>
            <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>ROI Data</div>
            <div style={{fontSize:22,fontWeight:800,color:'#111827'}}>{weeks.length}</div>
            <div style={{fontSize:12,color:'#6B7280'}}>weeks logged</div>
          </div>
          <div style={{background:'#FFFFFF',borderRadius:10,padding:'14px'}}>
            <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Content Memory</div>
            <div style={{fontSize:22,fontWeight:800,color:'#111827'}}>{log.length}</div>
            <div style={{fontSize:12,color:'#6B7280'}}>pieces tracked</div>
          </div>
        </div>

        <RedBtn onClick={run} disabled={loading}>
          {loading ? 'Analyzing your data...' : 'Build My Optimal Schedule'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title="SIGNAL Strategy Document"/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 3 : CONTENT GAP ANALYZER
// ═════════════════════════════════════════════════════════════════════════════
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
      if (e.perf === '') rated.viral.push(e.title || e.topic);
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

# Content Gap Analysis : @everydayelevations

## What You're Over-Posting
[Angles and formats appearing too frequently : risk of audience fatigue]

## What You're Under-Posting
[Angles with zero or low coverage : specific missed opportunities for each]

## Dead Angles (Not Touched in 30+ Days)
[List each untouched angle with ONE specific content idea for each]

## Your Viral Pattern
[What the rated content has in common : format, angle, topic type]

## What's Flopping and Why
[Pattern in the content : what to stop or change]

## 10 Specific Pieces to Create This Week
[Based on the gaps : specific filmable titles, not generic topics]

## 30-Day Content Rebalancing Plan
[How to fix the distribution over the next month]`;

    const res = await ai(prompt);
    setOut(res);
    setLoading(false);
  };

  const angleCountDisplay = {};
  log.slice(0, 50).forEach(e => {
    if (e.angle) angleCountDisplay[e.angle] = (angleCount[e.angle] || 0) + 1;
  });
  const allAngles = ANGLES.map(a => a.label);
  const missingAngles = allAngles.filter(a => !angleCountDisplay[a]);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Gap Analyzer</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Scans your content library : finds what you're over-posting, under-posting, and missing entirely.</p>
        </div>
      </div>

      {log.length === 0 && (
        <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
          No content in memory yet. Generate content using any tool : it auto-saves here : then run the analyzer.
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
                <div key={a.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px'}}>
                  <div style={{fontSize:12,color:'#111827',fontWeight:600,marginBottom:6}}>{a.label}</div>
                  <div style={{height:4,background:'#F9FAFB',borderRadius:2,marginBottom:4}}>
                    <div style={{height:'100%',width:`${pct}%`,background:count===0?'rgba(233,69,96,0.3)':count===max?'#2563EB':'#00C2FF',borderRadius:2,transition:'width 0.3s'}}/>
                  </div>
                  <div style={{fontSize:11,color:count===0?'#2563EB':'#6B7280'}}>{count===0?'Gap':count + ' pieces'}</div>
                </div>
              );
            })}
          </div>

          {missingAngles.length > 0 && (
            <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.8)'}}>
              <strong style={{color:'#2563EB'}}>Untouched angles:</strong> {missingAngles.join(', ')}
            </div>
          )}
        </>
      )}

      <Card>
        <div style={{color:'#6B7280',fontSize:13,lineHeight:1.7,marginBottom:16}}>
          Analyzing <strong style={{color:'#111827'}}>{log.length} pieces</strong> across your content library.
          {log.filter(e=>e.perf==='').length > 0 && <span> Found <strong style={{color:'#2563EB'}}>{log.filter(e=>e.perf==='').length} viral hits</strong> to pattern-match.</span>}
        </div>
        <RedBtn onClick={run} disabled={loading||log.length===0}>
          {loading ? 'Analyzing library...' : 'Run Gap Analysis'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title="SIGNAL Strategy Document"/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 4 : TELEPROMPTER BUTTON ON ALL OUTPUTS
// (injected via enhanced Output component)
// ═════════════════════════════════════════════════════════════════════════════
function OutputWithTeleprompter({text}) {
  const [teleprompter, setTeleprompter] = useState(false);
  if (!text) return null;
  return (
    <div style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:8}}>
        <CopyBtn text={text}/>
        <button onClick={() => setTeleprompter(true)}
          style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)',color:'#00C2FF',
            border:'1px solid rgba(0,212,255,0.4)',borderRadius:8,padding:'6px 14px',
            fontSize:12,fontWeight:700,cursor:'pointer'}}>
          Teleprompter
        </button>
      </div>
      <div style={{background:'#F9FAFB',borderRadius:8,padding:'1rem',
        border:'1px solid #E5E7EB'}}>
        <pre style={{color:'#111827',fontSize:13,whiteSpace:'pre-wrap',margin:0,lineHeight:1.7,
          fontFamily:'inherit'}}>{text}</pre>
      </div>
      {teleprompter && <Teleprompter text={text} onClose={() => setTeleprompter(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 5 : COLLAB OUTREACH TRACKER
// ═════════════════════════════════════════════════════════════════════════════
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
    'not contacted': '#6B7280',
    'pitched': '#f5a623',
    'in conversation': '#00C2FF',
    'confirmed': '#27ae60',
    'passed': '#2563EB',
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
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Collab Outreach Tracker</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Track every pitch, conversation, and confirmed collab in one place.</p>
          </div>
        </div>
        <button onClick={() => { setForm(blank); setEditId(null); setShowForm(true); }}
          style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          + Add Contact
        </button>
      </div>

      {/* Stats row */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {stats.map(s => (
          <div key={s.status} style={{background:'#FFFFFF',border:`1px solid ${statusColors[s.status]}`,
            borderRadius:8,padding:'10px 16px',textAlign:'center',minWidth:100}}>
            <div style={{fontSize:20,fontWeight:800,color:statusText[s.status]}}>{s.count}</div>
            <div style={{fontSize:10,color:'#6B7280',textTransform:'capitalize',marginTop:2}}>{s.status}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {['all', ...statuses].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{background:filter===s?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
              borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:filter===s?700:400,textTransform:'capitalize'}}>
            {s} {s!=='all'?`(${contacts.filter(c=>c.status===s).length})`:`(${contacts.length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB',marginBottom:20}}>
          
          <div style={{color:'#111827',fontWeight:700,fontSize:16,marginBottom:8}}>No contacts yet</div>
          <div style={{color:'#6B7280',fontSize:13,marginBottom:20}}>Add podcast guests, collab targets, and brand partners. Track every conversation.</div>
          <button onClick={() => setShowForm(true)}
            style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            + Add First Contact
          </button>
        </div>
      )}

      {/* Contact cards */}
      {filtered.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {filtered.map(contact => (
            <div key={contact.id} style={{background:'#FFFFFF',
              border:`1px solid ${statusColors[contact.status] || 'rgba(255,255,255,0.07)'}`,
              borderRadius:12,padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{color:'#111827',fontWeight:700,fontSize:14}}>{contact.name}</span>
                    <span style={{color:'#6B7280',fontSize:12}}>{contact.handle}</span>
                    <span style={{background:'#FFFFFF',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10}}>{contact.platform}</span>
                    <span style={{background:'#FFFFFF',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10,textTransform:'capitalize'}}>{contact.type}</span>
                  </div>
                  {contact.notes && (
                    <div style={{color:'rgba(255,255,255,0.65)',fontSize:12,lineHeight:1.6,marginBottom:6}}>{contact.notes}</div>
                  )}
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    {contact.pitchSent && <span style={{color:'#6B7280',fontSize:11}}>Pitched: {contact.pitchSent}</span>}
                    {contact.lastContact && <span style={{color:'#6B7280',fontSize:11}}>Last contact: {contact.lastContact}</span>}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                  {/* Status selector */}
                  <select value={contact.status}
                    onChange={e => save(contacts.map(c => c.id===contact.id ? {...c,status:e.target.value,updatedAt:Date.now()} : c))}
                    style={{background:'rgba(0,0,0,0.4)',color:statusText[contact.status],border:`1px solid ${statusColors[contact.status]}`,
                      borderRadius:6,padding:'4px 8px',fontSize:11,fontWeight:700,cursor:'pointer',textTransform:'capitalize'}}>
                    {statuses.map(s => <option key={s} value={s} style={{color:'#F1F5F9',background:'#080D14'}}>{s}</option>)}
                  </select>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={() => { setForm({...contact}); setEditId(contact.id); setShowForm(true); }}
                      style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer'}}>
                      Edit
                    </button>
                    <button onClick={() => remove(contact.id)}
                      style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',borderRadius:6,padding:'4px 8px',fontSize:12,cursor:'pointer'}}>×</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Platform + Type selector in form */}
      {showForm && (
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:14,padding:'22px',marginBottom:20}}>
          <div style={{color:'#111827',fontWeight:700,fontSize:15,marginBottom:16}}>{editId ? 'Edit Contact' : 'Add Contact'}</div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {platforms.map(p => (
                  <button key={p} onClick={() => setForm(f => ({...f, platform:p}))}
                    style={{background:form.platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
                    style={{background:form.type===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
                  ? <textarea value={form[f.k]|| ''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} rows={2} placeholder={f.ph}
                      style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
                  : <input value={form[f.k]|| ''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                      style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
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
                    color:form.status===s?statusText[s]:'#6B7280',
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
              style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMENT RESPONDER
// ═════════════════════════════════════════════════════════════════════════════
const COMMENT_REPLY_PROMPT = (comments, mode, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}

${mode === 'bulk'
  ? `Write a reply to EACH of these comments. Number your replies to match. Each reply should feel personal and human: not copy-pasted. Build community, acknowledge what they said, and where natural, invite more conversation.`
  : `Write 3 different reply options for this comment. Each option should have a different energy one warm/personal, one direct/punchy, one community-building. All in Jason's voice.`
}

${mode === 'bulk' ? 'COMMENTS:\n' + comments : 'COMMENT:\n' + comments}

Rules:
- Sound like a real person talking, not a brand
- No "Great comment!" or "Thanks for sharing!" openers: they're dead
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Comment Responder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Reply in your voice single comment with 3 options, or bulk paste up to 20 at once.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        The first-hour engagement window is everything. Respond fast, respond real, and the algorithm rewards you. Use bulk mode after a post drops to clear your comment queue in one shot.
      </div>

      <Card>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[{id:'single',label:'Single Comment',desc:'3 reply options'},
            {id:'bulk',label:'Bulk Mode',desc:'Up to 20 comments at once'}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setOut(''); }}
              style={{flex:1,background:mode===m.id?'#EEF2FF':'#F9FAFB',color:'#111827',
                border:`1px solid ${mode===m.id?'#2563EB':'rgba(255,255,255,0.1)'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:13}}>{m.label}</div>
              <div style={{color:mode===m.id?'rgba(255,255,255,0.8)':'#6B7280',fontSize:11,marginTop:2}}>{m.desc}</div>
            </button>
          ))}
        </div>

        <SecLabel>{mode === 'single' ? 'The Comment' : 'Comments (paste all at once)'}</SecLabel>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          rows={mode === 'bulk' ? 8 : 4}
          placeholder={placeholder}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box',lineHeight:1.6}}/>

        <RedBtn onClick={run} disabled={loading||!input.trim()}>
          {loading ? 'Writing replies...' : mode === 'single' ? 'Write 3 Reply Options' : 'Reply to All Comments'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <span style={{color:'#111827',fontWeight:700,fontSize:14}}>
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
// ═════════════════════════════════════════════════════════════════════════════
const HOOK_TEST_PROMPT = (hooks, topic) => `
${VOICE}

Topic: ${topic}

You are a viral content strategist who has analyzed thousands of hooks. Score and improve each of these hook variations.

HOOKS TO TEST:
${hooks.map((h,i) => `${i+1}. ${h}`).join('\n')}

For EACH hook, provide:

**HOOK [N]: [quote the hook]**
Score: [X/10]
Scroll-Stop Power: [1-10] : does the first word make them stop?
Curiosity Gap: [1-10] : does it create an itch they need to scratch?
Specificity: [1-10] : is it concrete or vague?
Weakness: [one sentence : the exact problem]
Rewrite: [improved version that fixes the weakness]

---

After scoring all hooks:

**WINNER:** Hook [N] : [one sentence why it wins]

**THE OPTIMAL HOOK:**
[Best possible version combining the strongest elements from all of them]

**Why This Wins:**
[3 specific reasons : psychology, format, first word]`;

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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Hook Tester</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Write 2-6 hook variations : AI scores each one and builds the best version.</p>
        </div>
      </div>

      <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        Your hook is 80% of the result. Same video, different hook = 10x difference in views. Test before you post.
      </div>

      <Card>
        <SecLabel>What's the video about?</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. Why most people quit before they see results"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            marginBottom:20,boxSizing:'border-box'}}/>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <SecLabel style={{margin:0}}>Your Hook Variations ({filledCount} entered, 2 minimum)</SecLabel>
          {hooks.length < 6 && (
            <button onClick={addHook}
              style={{background:'#FFFFFF',color:'#6B7280',border:'none',
                borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:12}}>
              + Add Hook
            </button>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
          {hooks.map((hook, i) => (
            <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{color:'#2563EB',fontWeight:800,fontSize:13,minWidth:20}}>{i+1}.</span>
              <input value={hook} onChange={e=>updateHook(i,e.target.value)}
                placeholder={i === 0 ? 'e.g. Nobody told me this about getting out...' :
                             i === 1 ? 'e.g. I spent 3 years doing it wrong. Here\'s the truth.' :
                             'Another hook variation...'}
                style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',
                  borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
              {hooks.length > 2 && (
                <button onClick={() => removeHook(i)}
                  style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',
                    borderRadius:6,padding:'4px 8px',fontSize:16,cursor:'pointer',flexShrink:0}}>×</button>
              )}
            </div>
          ))}
        </div>

        <RedBtn onClick={run} disabled={loading || !topic || filledCount < 2}>
          {loading ? 'Testing hooks...' : `Test ${filledCount} Hook${filledCount!==1?'s':''}`}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{color:'#111827',fontWeight:700,fontSize:14}}>Hook Analysis</span>
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
// ═════════════════════════════════════════════════════════════════════════════
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
**EMAIL 1: DELIVER + QUICK WIN**
Subject: [subject line]
Preview text: [50 chars]
Body: Deliver the magnet. Give one immediate action they can take today. Make them glad they signed up.
[Full email body]

**EMAIL 2: PERSONAL STORY**
Subject: [subject line]
Preview text: [50 chars]
Body: The real story behind why this matters. A specific moment from Jason's life. No pitch. Just connection.
[Full email body]

**EMAIL 3: PURE VALUE**
Subject: [subject line]
Preview text: [50 chars]
Body: Teach something they didn't get in the lead magnet. Make it so good they forward it.
[Full email body]` : ''}

${length >= 5 ? `
**EMAIL 4: SOCIAL PROOF + SHIFT**
Subject: [subject line]
Preview text: [50 chars]
Body: A win from the community. Something that happened when someone applied the method. Transition toward the offer.
[Full email body]

**EMAIL 5: SOFT PITCH**
Subject: [subject line]
Preview text: [50 chars]
Body: The invitation. What the next step is, why now, what it costs to stay stuck. No pressure: real talk.
[Full email body]` : ''}

${length >= 7 ? `
**EMAIL 6: OBJECTION HANDLER**
Subject: [subject line]
Preview text: [50 chars]
Body: Address the real reasons people haven't taken the next step yet. Be honest about what this is and isn't.
[Full email body]

**EMAIL 7: LAST CALL**
Subject: [subject line]
Preview text: [50 chars]
Body: Final email in the sequence. Clear, direct, no drama. Either they're in or they're not: respect both.
[Full email body]` : ''}

Rules: No corporate speak. No "I hope this email finds you well." No numbered lists in the body: write like a person. Short paragraphs. Real subject lines people actually open.`;

function EmailSequenceBuilder() {
  const [magnet, setMagnet] = useState('');
  const [audience, setAudience] = useState('People working on their emotional and physical health, professionals building better careers, parents trying to show up well, anyone who wants their daily choices to actually mean something');
  const [offer, setOffer] = useState('Mindset coaching, Everyday Elevations podcast, the community community, real estate');
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
          message: `Convert this email sequence into clean HTML. Each email should be in its own section with a clear header. Use proper formatting: subject lines bold, body text readable, preview text in italics. Return only the HTML body content:\n\n${out}`,
          system: 'You convert email sequences into clean HTML. Return only inner HTML content.'
        })
      });
      const d = await res.json();
      const html = d.text || d.result || '';
      const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Email Sequence</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 24px;color:#111;line-height:1.8}h1{color:#0A1628;border-bottom:3px solid #E94560;padding-bottom:8px}h2{color:#E94560;margin-top:48px;border-top:1px solid #eee;padding-top:24px}strong{color:#0A1628}.subject{font-size:18px;font-weight:bold;margin-bottom:4px}.preview{color:#666;font-style:italic;font-size:13px;margin-bottom:20px}@media print{body{margin:24px}}</style></head><body><h1>${magnet} Email Sequence</h1>${html}</body></html>`;
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Email Sequence Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Full nurture sequences deliver, connect, convert. Written in your voice, not a template.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <Card>
        <SecLabel>Lead Magnet / Opt-in Trigger</SecLabel>
        <input value={magnet} onChange={e=>setMagnet(e.target.value)}
          placeholder="e.g. 5 AM Success Protocol PDF, Performance Longevity Blueprint, Free Mindset Audit"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Who Opted In</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Your Offer / Next Step You Want Them to Take</SecLabel>
        <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Sequence Length</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {[
            {v:'3', label:'3 emails', desc:'Quick intro'},
            {v:'5', label:'5 emails', desc:'Standard nurture'},
            {v:'7', label:'7 emails', desc:'Full funnel'},
          ].map(opt => (
            <button key={opt.v} onClick={() => setLength(opt.v)}
              style={{flex:1,background:length===opt.v?'#EEF2FF':'#F9FAFB',
                color:'#111827',border:`1px solid ${length===opt.v?'#2563EB':'rgba(255,255,255,0.1)'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'center'}}>
              <div style={{fontWeight:700,fontSize:14}}>{opt.label}</div>
              <div style={{color:length===opt.v?'rgba(255,255,255,0.8)':'#6B7280',fontSize:11,marginTop:2}}>{opt.desc}</div>
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
            <span style={{color:'#111827',fontWeight:700,fontSize:15}}>Your Email Sequence</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={downloadEmails} disabled={downloading}
                style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,
                  padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',fontSize:13}}>
                {downloading ? 'Preparing...' : 'Download Emails'}
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
// ═════════════════════════════════════════════════════════════════════════════
const PODCAST_PREPROD_PROMPT = (guestName, guestBio, episode_angle, showContext) => `
${VOICE}

Show: Everyday Elevations Podcast (Host: Jason Fricka: veteran, HR manager, mindset coach, Colorado)
Guest: ${guestName}
Guest Background: ${guestBio}
Episode Angle / Theme: ${episode_angle}
Additional Context: ${showContext || 'None'}

Build the complete pre-production package for this episode.

# ${guestName}: Episode Pre-Production

## Guest Intelligence Brief
- Who they are in 3 sentences (what Jason needs to know before the call)
- Their core message / what they stand for
- What their audience cares about
- One potential point of disagreement or productive tension
- The thing they probably never get asked

## Episode Positioning
- Episode title (3 options: specific, not generic)
- The one thing this episode must deliver
- Why the community specifically needs to hear this

## Opening (First 3 Minutes)
[Full scripted intro Jason reads: sets the guest up without overselling, teases the transformation]

## Interview Outline (12 questions)
Grouped in 3 acts:
Act 1: Who They Are (3 questions): Background, journey, the turn
Act 2: The Method (5 questions): What they know, how they know it, the counterintuitive stuff
Act 3: The Application (4 questions): What listeners do Monday morning, the hard truth, the invitation

For each question: the question + why it matters + the follow-up if they give a surface answer

## Closing Script
[Full word-for-word outro: thanks guest, tells audience what to do next, teases next episode]

## Show Notes (SEO-optimized)
[Full show notes: 200 words, guest bio, key topics, timestamps placeholder, links section]

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
[Full scripted cold open: drop them into a moment or a question, no intro yet]

## Why This Episode, Why Now
[2-3 sentences Jason says before diving in: context without fluff]

## Episode Outline
For a ${duration}-minute episode, structured in acts:

Opening Hook (60 sec)
Act 1: The Problem / Setup (${Math.round(parseInt(duration)*0.2)} min)
Act 2: The Turn / Insight (${Math.round(parseInt(duration)*0.4)} min)
Act 3: The Method / Application (${Math.round(parseInt(duration)*0.3)} min)
Close + CTA (${Math.round(parseInt(duration)*0.1)} min)

For each section: talking points, transitions, stories to pull from Jason's life

## Retention Hooks (3 mid-episode teases)
[Specific lines to say mid-episode to keep people listening]

## Show Notes
[150-word SEO-optimized description]

## 5 Short-Form Clips to Pull
[Specific moments from the outline that will work as Reels/Shorts: with hooks]`;

function PodcastPreProd() {
  const [mode, setMode] = useState('guest');
  const [guestName, setGuestName] = useState('');
  const [guestBio, setGuestBio] = useState('');
  const [angle, setAngle] = useState('');
  const [showContext, setShowContext] = useState('');
  const [soloTopic, setSoloTopic] = useState('');
  const [soloAngle, setSoloAngle] = useState('occupational');
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Podcast Pre-Production</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Guest research brief, full interview outline, show notes, and clip plan before you hit record.</p>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'guest',label:'Guest Episode',desc:'Interview prep + research'},
          {id:'solo',label:'Solo Episode',desc:'Outline + structure'}].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setOut(''); }}
            style={{flex:1,background:mode===m.id?'#EEF2FF':'#F9FAFB',color:'#111827',
              border:`1px solid ${mode===m.id?'#2563EB':'rgba(255,255,255,0.1)'}`,
              borderRadius:10,padding:'14px',cursor:'pointer',textAlign:'left'}}>
            <div style={{fontWeight:700,fontSize:14}}>{m.label}</div>
            <div style={{color:mode===m.id?'rgba(255,255,255,0.8)':'#6B7280',fontSize:11,marginTop:3}}>{m.desc}</div>
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
                style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',
                  borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
              <button onClick={fetchGuestIntel} disabled={fetching||!guestName}
                style={{background:'rgba(0,212,255,0.1)',color:'#00C2FF',border:'1px solid rgba(0,212,255,0.3)',
                  borderRadius:8,padding:'10px 16px',fontWeight:700,cursor:(!guestName||fetching)?'not-allowed':'pointer',
                  fontSize:12,whiteSpace:'nowrap'}}>
                {fetching ? 'Researching...' : 'Research Guest'}
              </button>
            </div>

            <SecLabel>Guest Bio / Background</SecLabel>
            <textarea value={guestBio} onChange={e=>setGuestBio(e.target.value)} rows={4}
              placeholder="Paste their bio, or hit Research Guest above to pull it automatically..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

            <SecLabel>Episode Angle / What This Episode Is Really About</SecLabel>
            <input value={angle} onChange={e=>setAngle(e.target.value)}
              placeholder="e.g. How high performers recover from identity loss, The truth about discipline nobody talks about"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>

            <SecLabel>Additional Context (optional)</SecLabel>
            <textarea value={showContext} onChange={e=>setShowContext(e.target.value)} rows={2}
              placeholder="e.g. We connected at a veteran event, he's been on Rogan twice, my audience loved my last episode on recovery..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                resize:'vertical',boxSizing:'border-box'}}/>
          </>
        ) : (
          <>
            <SecLabel>Episode Topic</SecLabel>
            <input value={soloTopic} onChange={e=>setSoloTopic(e.target.value)}
              placeholder="e.g. Why I almost quit at month 4, What the Army taught me about consistency, The real cost of staying comfortable"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
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
                      style={{background:duration===d?'#EEF2FF':'#F9FAFB',color:'#111827',
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
            {loading ? 'Building pre-production package...' : mode==='guest' ? 'Build Full Episode Package' : 'Build Solo Episode Framework'}
          </RedBtn>
          {mode === 'guest' && !guestBio && guestName && (
            <span style={{color:'#6B7280',fontSize:12,marginLeft:12}}>Research guest first for best results</span>
          )}
        </div>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title="SIGNAL Strategy Document"/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUTUBE TOOLKIT
// ═══════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
const VIDIQ_SOP = `
VIDIQ OUTLIER SCORE FRAMEWORK (follow this to the letter):
- Outlier Score > 1.0 = video outperforms channel average study and replicate these elements
- Outlier Score 1.0 = performing average analyze for engagement improvements
- Outlier Score < 1.0 = underperforming diagnose: was it topic, title, thumbnail, or timing?
- Score 2.0+ = 2x-10x+ above norm break down thumbnail, topic, title, length, and style and repeat exactly
- High outlier videos ARE the content blueprint : never guess when you have outlier data

UPLOAD TIMING SOP (non-negotiable):
- Best days: Tuesday through Friday : avoid Saturday
- Best times: 1 PM, 2 PM, 5 PM, or 9 PM Eastern Time
- Upload 1-2 hours BEFORE peak activity : gives YouTube time to index before audience goes active
- Strong early engagement in first 24-48 hours = algorithm signals = more recommendations
- Consistency > perfection : uploading regularly gives more outlier data to learn from

CONTENT STRATEGY FROM OUTLIER DATA:
- After every upload, check outlier score vs channel average
- Top outliers extract: topic angle, title format, thumbnail style, video length, opening hook
- Replicate those exact elements in next 3 uploads
- Low outliers do NOT delete : compare to high outliers and identify the specific difference
- More variety early = more data = faster discovery of channel superpowers

PERFORMANCE SIGNALS THAT MATTER MOST (in order):
1. Click-through rate (CTR) : title + thumbnail combo
2. Average view duration : hook and content quality
3. Subscriber conversion rate : are viewers becoming fans
4. Early engagement velocity : first 24-48 hours determines algorithm push
`;

const YT_SCRIPT_PROMPT = (topic, angle, duration, style) => `
${VOICE}
${CONTENT_SOP}
${SWARBRICK}
${VIDIQ_SOP}

Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
Topic: "${topic}"
Angle: ${angle}
Duration: ${duration}
Style: ${style}

Write a complete, camera-ready YouTube video script using the VIDIQ outlier framework. Format it clean and structured : every section clearly labeled, ready to hand to a director or read straight into camera.

---

# ${topic}

## PRE-PRODUCTION
**Upload Window:** Tuesday-Friday, 12-2 PM ET (indexed before 1-5 PM peak)
**Outlier Target:** 2.0+ : this script is built to beat your channel average
**Optimize For:** High CTR title + first 30 seconds for average view duration

---

## TITLE OPTIONS (A/B test these)
**Option A:** [Curiosity gap : makes them need to know the answer]
**Option B:** [Personal story : specific moment or result]
**Option C:** [Bold claim : counterintuitive or surprising]
**Recommended test:** Option A vs Option B

**Thumbnail text (5 words max):** [exact words]
**Thumbnail visual:** [what Jason is doing or showing : specific]
**Emotion to convey:** [the feeling that drives clicks]

---

## FULL SCRIPT

### HOOK (first 30 seconds : this is where outlier videos are won or lost)
*Hook type: [Pattern Interrupt / Question / Bold Statement / Story / Data Point]*

[Word-for-word hook : no intro, no "hey guys", value or conflict hits immediately]

---

### SECTION 1: [Title] (~${duration === '15-20 min' ? '3-4' : duration === '8-10 min' ? '2-3' : '1-2'} minutes)

[Full word-for-word script for this section]

*[Retention note: what keeps viewers watching through this section]*

---

### SECTION 2: [Title] (~${duration === '15-20 min' ? '3-4' : duration === '8-10 min' ? '2-3' : '1-2'} minutes)

[Full word-for-word script]

*[Retention note]*

---

### SECTION 3: [Title] (~${duration === '15-20 min' ? '3-4' : duration === '8-10 min' ? '2-3' : '1-2'} minutes)

[Full word-for-word script]

*[Retention note]*

${duration !== '3-5 min' ? `---

### SECTION 4: [Title] (~${duration === '15-20 min' ? '3-4' : '2-3'} minutes)

[Full word-for-word script]

*[Retention note]*` : ''}

${duration === '15-20 min' ? `---

### SECTION 5: [Title] (~3-4 minutes)

[Full word-for-word script]

*[Retention note]*` : ''}

---

### PATTERN INTERRUPT (mid-video re-engagement)

[A line that snaps back viewers who are drifting : creates urgency to keep watching]

---

### END SCREEN (~last 30 seconds)

[Natural lead-in to end screen : tease next video, reason to subscribe, mention email list]
[Word-for-word : sounds like a conversation, not a script]

---

## CHAPTER MARKERS
0:00 Hook
[Time]: [Section 1 title]
[Time]: [Section 2 title]
[Time]: [Section 3 title]
${duration !== '3-5 min' ? '[Time]: [Section 4 title]' : ''}
${duration === '15-20 min' ? '[Time]: [Section 5 title]' : ''}

---

## SEO PACKAGE

**Primary keyword:** [exact phrase : what viewers type to find this]
**Secondary keywords:** [3 supporting terms]

**Description (first 2 lines : shown before "Show More"):**
[Line 1: hook with primary keyword]
[Line 2: channel identity + secondary keyword]

**Full description (150-200 words):**
[Natural, keyword-rich, written as if talking to the viewer]

**Tags (20):**
[comma-separated : exact match, broad match, topic variations, creator name]

**Pinned comment (post within 5 min of going live):**
[Drives early engagement : question, resource link, or value add]

---

## VIDIQ PERFORMANCE FORECAST
**Outlier score prediction:** [estimate vs channel average]
**Biggest CTR risk:** [specific : what might hurt click-through rate]
**Biggest AVD risk:** [where viewers are most likely to drop off and why]
**Check at 48 hours:** [specific metrics : what numbers tell you it's working or not]
**If it underperforms:** [specific one change to test first]
`;


const YT_TITLE_PROMPT = (topic, angle) => `
${VOICE}

Topic: ${topic}
Angle: ${angle}

Write 7 YouTube title variations for this topic. Each must be distinct : different psychological trigger, different format.

For each title:
**TITLE [N]:** [The title]
CTR Trigger: [curiosity / controversy / how-to / personal story / data / listicle / fear of missing out]
Thumbnail Direction: [what image/text overlay makes this title pop]
Why It Works: [one sentence]

After all 7:
**WINNER:** Title [N]
**Best Thumbnail Text:** [3-5 words that go on the thumbnail]
**A/B Test:** Title [X] vs Title [Y] : test these two first`;

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

${auditExtra ? `Additional Context from Jason (treat this as ground truth : he knows his channel better than any search):
${auditExtra}` : ''}

You are auditing Jason Fricka's YouTube channel @everydayelevations using the VIDIQ outlier framework. Be direct. No softening. Use the additional context above to make every recommendation specific.

# YouTube Channel Audit : @everydayelevations

## Channel Health Score: [X/10]

## What the Data Shows
[Specific observations from the channel data above]

## 3 Biggest Problems Right Now
[Specific, actionable : not generic YouTube advice]

## What's Actually Working
[Double down on these immediately]

## Title & Thumbnail Audit
[Score the approach, specific fixes]

## The Content Gap
[What your audience is searching for that you're not making]

## 30-Day YouTube Sprint
[Specific week-by-week plan to grow the channel]

## The One Change That Moves the Needle Most
[Single highest-use action]

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

**VERSION 1 : SUBSCRIBE FOCUS**
[Word-for-word script, 15-20 seconds when spoken]
Visual direction: [what should be on screen]

**VERSION 2 : NEXT VIDEO FOCUS**
[Word-for-word script]
Visual direction: [what video to suggest and why]

**VERSION 3 : EMAIL LIST FOCUS**
[Word-for-word script]
Visual direction: [how to point to link in description]

Make them feel like Jason is talking to a friend, not reading a script.`;

function YouTubeToolkit() {
  const [tool, setTool] = useState('script');
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('emotional');
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
    { id:'script', label:'Script Writer',      desc:'Full VIDIQ-optimized script + SEO package' },
    { id:'titles', label:'Title Optimizer',    desc:'7 title variations + CTR analysis' },
    { id:'seo', label:'SEO + Chapters',     desc:'Description, tags, chapters, pinned comment' },
    { id:'audit', label:'Channel Audit',      desc:'Perplexity pulls your channel, Claude audits it' },
    { id:'endscreen', label:'End Screen Scripts', desc:'3 CTA variations for last 20 seconds' },
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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>YouTube Toolkit</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Title optimizer, SEO engine, channel audit, and end screen scripts : built for YouTube's algorithm.</p>
        </div>
      </div>

      {/* Tool selector */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {tools.map(t => (
          <button key={t.id} onClick={() => { setTool(t.id); setOut(''); }}
            style={{background:tool===t.id?'#EEF2FF':'#F9FAFB',color:'#111827',
              border:`1px solid ${tool===t.id?'#2563EB':'rgba(255,255,255,0.08)'}`,
              borderRadius:10,padding:'14px',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
            <div style={{fontWeight:700,fontSize:13}}>{t.label}</div>
            <div style={{color:tool===t.id?'rgba(255,255,255,0.75)':'#6B7280',fontSize:11,marginTop:2}}>{t.desc}</div>
          </button>
        ))}
      </div>

      <Card>
        {tool === 'script' && (
          <>
            <div style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(0,212,255,0.85)',lineHeight:1.7}}>
              <strong>VIDIQ-Optimized:</strong> Every script is built to maximize outlier score : upload timing, hook structure, chapter markers, SEO package, and CTR analysis included.
            </div>
            <SecLabel>Video Topic</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why I stopped chasing motivation and what I do instead..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                marginBottom:12,boxSizing:'border-box'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <SecLabel>Target Duration</SecLabel>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['3-5 min','8-10 min','15-20 min'].map(d => (
                    <button key={d} onClick={() => setYtDuration(d)}
                      style={{background:ytDuration===d?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
                      style={{background:ytStyle===s?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
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
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                resize:'vertical',boxSizing:'border-box'}}/>
          </>
        )}

        {tool === 'audit' && (
          <>
            <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
              <strong style={{color:'#2563EB'}}>Step 1</strong> : Pull your live channel data from Perplexity, then add any additional context the audit should know, then run.
            </div>
            <button onClick={fetchChannel} disabled={fetching}
              style={{background:'#F9FAFB',color:'#111827',border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:8,padding:'10px 20px',fontWeight:700,cursor:fetching?'not-allowed':'pointer',
                fontSize:13,marginBottom:16}}>
              {fetching ? 'Pulling channel data...' : 'Pull @everydayelevations Data'}
            </button>
            {channelData && (
              <div style={{background:'#F9FAFB',borderRadius:8,padding:'12px',marginBottom:16,
                fontSize:12,color:'rgba(255,255,255,0.7)',maxHeight:160,overflowY:'auto',lineHeight:1.7}}>
                {channelData}
              </div>
            )}
            <SecLabel>Additional Channel Context</SecLabel>
            <textarea value={auditExtra} onChange={e=>setAuditExtra(e.target.value)} rows={4}
              placeholder="Add anything Perplexity can't see: your VIDIQ outlier scores, which videos performed best, current upload frequency, subscriber growth rate, what you've already tried, content goals, target audience details, monetization status, recent changes..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                resize:'vertical',marginBottom:4,boxSizing:'border-box'}}/>
            <div style={{color:'#6B7280',fontSize:11,marginBottom:12}}>This context gets sent directly to the audit : the more specific, the better the recommendations.</div>
          </>
        )}

        {tool === 'endscreen' && (
          <>
            <SecLabel>Video Topic</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Why discipline beats motivation every time"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
                marginBottom:16,boxSizing:'border-box'}}/>
            <SecLabel>Primary Channel Goal Right Now</SecLabel>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
              {['grow subscribers','build email list','drive real estate leads','promote podcast'].map(g => (
                <button key={g} onClick={() => setChannelGoal(g)}
                  style={{background:channelGoal===g?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
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
            <span style={{color:'#111827',fontWeight:700,fontSize:14}}>{tools.find(t=>t.id===tool)?.label} Results</span>
            <CopyBtn text={out}/>
          </div>
          <DocOutput text={out} title={tool === 'script' ? `YouTube Script : ${topic}` : tool === 'audit' ? 'Channel Audit : @everydayelevations' : `YouTube ${tool} : ${topic || 'Content'}`}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DM SCRIPT LIBRARY
// ═════════════════════════════════════════════════════════════════════════════
const DM_SCRIPTS_KEY = 'encis_dm_scripts';

const DM_GEN_PROMPT = (trigger, context, goal, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}

Someone just triggered a DM conversation. Write the scripts for handling this.

Trigger: ${trigger}
Context: ${context || 'Standard inbound DM'}
Goal: ${goal}

Write a complete DM conversation flow: not just one message. The full sequence from first reply to close.

**OPENING MESSAGE** (the first reply you send)
[Write it: under 3 sentences, warm, human, direct]

**IF THEY RESPOND POSITIVELY** (they're interested)
[Next message: move toward the goal without being pushy]

**IF THEY GIVE A SHORT REPLY** (one word, emoji, low engagement)
[Re-engage message: ask one good question]

**IF THEY ASK FOR PRICE/MORE INFO**
[How to handle this: deliver value before the ask]

**THE CLOSE MESSAGE** (when the time is right)
[Clear ask: specific, easy to say yes to]

**IF THEY GO COLD** (no reply in 48+ hours)
[Follow-up message: no desperation, just a genuine check-in]

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
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>DM Script Library</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Build and save full conversation flows from first reply to close.</p>
          </div>
        </div>
        <button onClick={() => { setShowGen(g => !g); setOut(''); }}
          style={{background:showGen?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
            borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {showGen ? 'Close' : '+ Generate New Script'}
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
                style={{background:trigger===qt.trigger?'#EEF2FF':'#F9FAFB',
                  color:trigger===qt.trigger?'#fff':'rgba(255,255,255,0.75)',
                  border:`1px solid ${trigger===qt.trigger?'#2563EB':'rgba(255,255,255,0.1)'}`,
                  borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:500}}>
                {qt.label}
              </button>
            ))}
          </div>

          <SecLabel>What Triggered This DM?</SecLabel>
          <textarea value={trigger} onChange={e=>setTrigger(e.target.value)} rows={2}
            placeholder="e.g. They commented PERFORMANCE on my reel about morning routines..."
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
              borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
              resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>

          <SecLabel>Goal of This Conversation</SecLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
            {goals.map(g => (
              <button key={g} onClick={() => setGoal(g)}
                style={{background:goal===g?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                  borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,
                  fontWeight:goal===g?700:400,textTransform:'capitalize'}}>
                {g}
              </button>
            ))}
          </div>

          <SecLabel>Extra Context (optional)</SecLabel>
          <input value={context} onChange={e=>setContext(e.target.value)}
            placeholder="e.g. They have 5K followers, run a fitness account, mentioned they're a veteran..."
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
              borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
              marginBottom:16,boxSizing:'border-box'}}/>

          <RedBtn onClick={run} disabled={loading||!trigger}>
            {loading ? 'Writing scripts...' : 'Build Full DM Flow'}
          </RedBtn>

          {loading && <Spin/>}

          {out && (
            <div style={{marginTop:16}}>
              <div style={{background:'#F9FAFB',borderRadius:8,padding:'1rem',
                border:'1px solid #E5E7EB',marginBottom:12}}>
                <pre style={{color:'#111827',fontSize:13,whiteSpace:'pre-wrap',margin:0,
                  lineHeight:1.7,fontFamily:'inherit'}}>{out}</pre>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <CopyBtn text={out}/>
                {!saving ? (
                  <button onClick={() => setSaving(true)}
                    style={{background:'rgba(39,174,96,0.15)',color:'#27ae60',
                      border:'1px solid rgba(39,174,96,0.3)',borderRadius:8,
                      padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    Save to Library
                  </button>
                ) : (
                  <div style={{display:'flex',gap:8,flex:1}}>
                    <input value={scriptName} onChange={e=>setScriptName(e.target.value)}
                      placeholder="Name this script (e.g. Lead Magnet Delivery)..."
                      style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',
                        borderRadius:8,padding:'7px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
                    <button onClick={saveToLibrary} disabled={!scriptName}
                      style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,
                        padding:'7px 14px',fontSize:12,fontWeight:700,cursor:scriptName?'pointer':'not-allowed'}}>
                      Save
                    </button>
                    <button onClick={() => setSaving(false)}
                      style={{background:'#FFFFFF',color:'#6B7280',border:'none',
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
        <div style={{color:'#111827',fontWeight:700,fontSize:14}}>
          Saved Scripts <span style={{color:'#6B7280',fontWeight:400,fontSize:12}}>({saved.length})</span>
        </div>
        {saved.length > 0 && (
          <button onClick={() => setShowSaved(s => !s)}
            style={{background:'none',border:'none',color:'#6B7280',cursor:'pointer',fontSize:12}}>
            {showSaved ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {saved.length === 0 && !showGen && (
        <div style={{textAlign:'center',padding:'3rem 2rem',background:'#FFFFFF',
          borderRadius:16,border:'1px solid #E5E7EB'}}>
          
          <div style={{color:'#111827',fontWeight:700,fontSize:15,marginBottom:8}}>No saved scripts yet</div>
          <div style={{color:'#6B7280',fontSize:13,marginBottom:20}}>Generate a DM flow and save it build your library over time.</div>
          <button onClick={() => setShowGen(true)}
            style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,
              padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            + Generate First Script
          </button>
        </div>
      )}

      {showSaved && saved.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {saved.map(s => (
            <div key={s.id} style={{background:'#FFFFFF',
              border:'1px solid #E5E7EB',borderRadius:12,overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <div>
                  <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{s.name}</div>
                  <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>
                    Goal: {s.goal} Saved {s.createdAt}
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <CopyBtn text={s.script}/>
                  <button onClick={() => removeScript(s.id)}
                    style={{background:'transparent',color:'rgba(255,255,255,0.2)',
                      border:'none',fontSize:16,cursor:'pointer',padding:'4px 8px'}}>×</button>
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
// ═════════════════════════════════════════════════════════════════════════════
const CHALLENGE_PROMPT = (name, transformation, audience, platform, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}
${SWARBRICK}
${CONTENT_SOP}

Challenge Name: ${name}
Transformation Promise: ${transformation}
Target Audience: ${audience}
Primary Platform: ${platform}

Build a complete 30-day challenge system. This is not a generic template: it needs to feel like Jason built it specifically for the community.

# ${name}: Complete Challenge System

## The Concept
- Core promise in one sentence (what they have at day 30 that they didn't at day 1)
- Why 30 days (the psychology of this timeframe)
- The one rule that makes this work

## Lead Magnet Integration
- Challenge landing page headline
- Email opt-in hook (what they get when they sign up)
- Welcome email subject line + first paragraph

## Week-by-Week Architecture
**Week 1: Foundation (Days 1-7)**
Theme: [what this week is about]
Daily prompt format: [how each day works]
Days 1-7: [specific daily challenge for each day]
Week 1 win: [what they achieve by Sunday]

**Week 2: Resistance (Days 8-14)**
Theme: [this is where people quit: what you do about it]
Days 8-14: [specific daily challenges]
Mid-challenge check-in: [what you post on day 14]

**Week 3: Momentum (Days 15-21)**
Theme: [the turn: things start clicking]
Days 15-21: [specific daily challenges]
Community spotlight: [how you feature participants]

**Week 4: Identity (Days 22-30)**
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
Day 1, Day 7, Day 14, Day 21, Day 30: subject line + 2-sentence summary of each

## Post-Challenge Offer
- What you invite them into at day 30
- The transition message (how you move from challenge to offer without it feeling like a pitch)`;

function ChallengeBuilder() {
  const [name, setName] = useState('');
  const [transformation, setTransformation] = useState('');
  const [audience, setAudience] = useState('Everyday people who want to build a daily discipline practice: veterans, parents, professionals who feel stuck');
  const [platforms, setPlatforms] = useState(['Instagram']);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeClient] = useActiveClient();

  const quickChallenges = [
    { name: '30-Day 5AM Club', transformation: 'Wake up at 5AM every day for 30 days and build the morning routine that changes everything' },
    { name: '30-Day No Excuse Challenge', transformation: 'Show up every single day regardless of how you feel: build the identity of someone who does not quit' },
    { name: '30-Day Elevation Challenge', transformation: 'One small elevation action per day: in mindset, fitness, relationships, or finances' },
    { name: '30-Day Real Talk Challenge', transformation: 'Say the hard thing, do the hard thing, face the hard thing: daily prompts for radical honesty' },
  ];

  const run = async () => {
    if (!name || !transformation) return;
    setLoading(true); setOut('');
    const res = await ai(CHALLENGE_PROMPT(name, transformation, audience, platforms.join(", "), activeClient));
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
      const printWin = window.open(url, '_blank');
      if (printWin) { printWin.onload = () => printWin.print(); }
      else { const a = document.createElement('a'); a.href=url; a.download=(name|| 'document').replace(/\s+/g,'-')+'.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
      URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>30-Day Challenge Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Full challenge system 30 daily prompts, content series, email sequence, and post-challenge offer.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}

      <Card>
        <SecLabel>Quick Start Templates</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:8,marginBottom:20}}>
          {quickChallenges.map((qc, i) => (
            <button key={i} onClick={() => { setName(qc.name); setTransformation(qc.transformation); }}
              style={{background:name===qc.name?'#EEF2FF':'#F9FAFB',
                border:`1px solid ${name===qc.name?'#C7D2FE':'#E5E7EB'}`,
                borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'left'}}>
              <div style={{color:'#111827',fontWeight:700,fontSize:12,marginBottom:4}}>{qc.name}</div>
              <div style={{color:'#6B7280',fontSize:11,lineHeight:1.5}}>{qc.transformation.slice(0,70)}...</div>
            </button>
          ))}
        </div>

        <SecLabel>Challenge Name</SecLabel>
        <input value={name} onChange={e=>setName(e.target.value)}
          placeholder="e.g. 30-Day Elevation Challenge, 30-Day 5AM Club..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>The Transformation Promise</SecLabel>
        <textarea value={transformation} onChange={e=>setTransformation(e.target.value)} rows={2}
          placeholder="What does someone have at day 30 that they didn't at day 1? Be specific."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Target Audience</SecLabel>
        <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <SecLabel>Primary Platform</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatforms(prev => Array.isArray(prev) ? (prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]) : [p])}
              style={{background:Array.isArray(platforms)&&platforms.includes(p)?'#EEF2FF':'#F9FAFB',
                color:Array.isArray(platforms)&&platforms.includes(p)?'#2563EB':'#374151',
                border:`1px solid ${Array.isArray(platforms)&&platforms.includes(p)?'#C7D2FE':'#E5E7EB'}`,
                borderRadius:6,padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:Array.isArray(platforms)&&platforms.includes(p)?700:400}}>
              {p}
            </button>
          ))}
        </div>

        <RedBtn onClick={run} disabled={loading||!name||!transformation}>
          {loading ? 'Building challenge system...' : 'Build Full 30-Day Challenge'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:10}}>
            <span style={{color:'#111827',fontWeight:700,fontSize:15}}>{name}</span>
            <div style={{display:'flex',gap:8}}>
              <CopyBtn text={out}/>
              <button onClick={downloadChallenge} disabled={downloading}
                style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,
                  padding:'7px 16px',fontWeight:700,cursor:downloading?'not-allowed':'pointer',fontSize:13}}>
                {downloading ? 'Preparing...' : 'Download Plan'}
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
// ═════════════════════════════════════════════════════════════════════════════
const SPY_PROMPT = (handle, platform, rawData, angle) => `
${VOICE}

You are analyzing a competitor's content strategy to find gaps Jason Fricka can own.

Creator: ${handle}
Platform: ${platform}
Live data pulled: ${rawData}
Jason's angle to compete from: ${angle || 'mindset/real estate/Colorado/occupational purpose/financial independence'}

This is intelligence work: not copying. Find what they are missing so Jason can own it.

# Competitor Intel: ${handle}

## Who They Are (Quick Brief)
[3 sentences: what they do, who their audience is, what they're known for]

## What's Working for Them
[Top 3-5 content formats/topics that are clearly resonating: with specific examples from the data]

## Their Posting Pattern
[Frequency, timing, content mix: what's consistent]

## Audience They're Attracting
[Who comments, what they ask, what the community looks like]

## THE GAPS: What They're NOT Doing
[This is the most important section. Be specific. What angles, formats, or topics are they avoiding or doing poorly?]

## What Jason Can Own That They Can't
[Based on Jason's unique background : HR manager, real estate agent, endurance athlete, Colorado: what can he cover authentically that this creator cannot?]

## 5 Specific Content Ideas to Beat Them
[Specific filmable concepts: not generic topics. Each one directly counters a gap you identified above]

## The One Thing That Would Make Jason Stand Out in This Space
[Single highest-use differentiator]`;

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
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Competitor Content Spy</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Pull any creator's content strategy find the gaps Jason can own.</p>
        </div>
      </div>

      <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'rgba(255,255,255,0.8)',lineHeight:1.7}}>
        This is intelligence, not imitation. The goal is to find what they are NOT doing so you can own it. Every gap they leave is an opening.
      </div>

      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:16,alignItems:'end'}}>
          <div>
            <SecLabel>Creator Handle or Channel</SecLabel>
            <input value={handle} onChange={e=>setHandle(e.target.value)}
              placeholder="e.g. @hubermanlab, @davidgoggins, ThinkMedia..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
                borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',
                    borderRadius:6,padding:'8px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={fetchProfile} disabled={fetching||!handle}
          style={{background:fetching?'#6B7280':'rgba(0,212,255,0.1)',color:'#00C2FF',
            border:'1px solid rgba(0,212,255,0.3)',borderRadius:8,padding:'10px 20px',
            fontWeight:700,cursor:(!handle||fetching)?'not-allowed':'pointer',
            fontSize:13,marginBottom:16,display:'block'}}>
          {fetching ? 'Pulling profile data...' : `Pull ${platform} Data for ${handle|| 'this creator'}`}
        </button>

        {rawData && (
          <div style={{background:'rgba(0,0,0,0.25)',borderRadius:8,padding:'12px',marginBottom:16,
            maxHeight:140,overflowY:'auto',border:'1px solid #E5E7EB'}}>
            <div style={{fontSize:10,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Live Data Pulled</div>
            <div style={{color:'rgba(255,255,255,0.65)',fontSize:12,lineHeight:1.7}}>{rawData}</div>
          </div>
        )}

        <SecLabel>Jason's Angle (optional: helps focus the gap analysis)</SecLabel>
        <input value={angle} onChange={e=>setAngle(e.target.value)}
          placeholder="e.g. Veteran mindset, Colorado real estate, endurance athlete over 40..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',
            borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,
            marginBottom:16,boxSizing:'border-box'}}/>

        <RedBtn onClick={run} disabled={loading||!rawData}>
          {loading ? 'Running intel analysis...' : 'Run Competitor Intel'}
        </RedBtn>
      </Card>

      {loading && <Spin/>}
      {out && <DocOutput text={out} title="SIGNAL Strategy Document"/>}

      {/* Recent spy history */}
      {history.length > 0 && (
        <div style={{marginTop:24}}>
          <div style={{fontSize:11,color:'#6B7280',fontWeight:700,letterSpacing:1.5,
            textTransform:'uppercase',marginBottom:10}}>Recent Profiles Analyzed</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {history.map(h => (
              <button key={h.id}
                onClick={() => { setHandle(h.handle); setPlatform(h.platform); }}
                style={{background:'#FFFFFF',border:'1px solid #E5E7EB',
                  borderRadius:8,padding:'6px 12px',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:12}}>
                {h.handle} <span style={{color:'#6B7280'}}>· {h.platform} · {h.date}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND VOICE FINGERPRINTING
// ═════════════════════════════════════════════════════════════════════════════
const VOICE_KEY = 'encis_voice_fingerprints';

const VOICE_FINGERPRINT_PROMPT = (samples, clientName) => `
You are a voice analyst. Analyze these ${samples.length} content samples from ${clientName} and extract a precise voice fingerprint.

SAMPLES:
${samples.map((s, i) => `--- Sample ${i+1} ---\n${s}`).join('\n\n')}

Return a detailed voice fingerprint as a JSON object with exactly these fields:
{
  "tone": "2-3 word tone description",
  "pace": "short/medium/long sentence preference",
  "vocabulary": ["10 words or phrases this person uses naturally"],
  "avoids": ["8 words or phrases this person never uses"],
  "structures": ["3 common sentence patterns they use"],
  "themes": ["5 recurring themes or subjects"],
  "openings": ["4 typical ways they start content"],
  "ctas": ["3 natural call-to-action styles"],
  "personality": "2-3 sentence description of the personality behind the writing",
  "dos": ["6 specific writing rules to follow for this voice"],
  "donts": ["6 specific writing rules to never break for this voice"],
  "sample_hook": "Write one example hook in this exact voice on the topic of discipline"
}

Return ONLY valid JSON. No explanation, no markdown, no backticks.`;

function BrandVoiceFingerprint() {
  const [clients, saveClients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [samples, setSamples] = useState(['', '', '', '', '']);
  const [fingerprints, setFingerprints] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('build');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VOICE_KEY);
      if (stored) setFingerprints(JSON.parse(stored));
    } catch {}
    setSelectedClient(activeClient);
  }, []);

  const saveFingerprint = (clientId, fp) => {
    const updated = { ...fingerprints, [clientId]: { ...fp, updatedAt: Date.now() } };
    setFingerprints(updated);
    try { localStorage.setItem(VOICE_KEY, JSON.stringify(updated)); } catch {}
  };

  const run = async () => {
    if (!selectedClient) return;
    const filled = samples.filter(s => s.trim().length > 20);
    if (filled.length < 2) return;
    setLoading(true);
    try {
      const res = await ai(VOICE_FINGERPRINT_PROMPT(filled, selectedClient.name), 'You are a voice analyst. Return only valid JSON.');
      const clean = res.replace(/```json|```/g, '').trim();
      const fp = JSON.parse(clean);
      saveFingerprint(selectedClient.id, { ...fp, clientName: selectedClient.name, sampleCount: filled.length });
      setActiveTab('view');
    } catch(e) { console.error('Voice fingerprint error:', e); }
    setLoading(false);
  };

  const fp = selectedClient ? fingerprints[selectedClient.id] : null;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Brand Voice Fingerprinting</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Paste real content samples. The system extracts the exact voice DNA and applies it to every tool automatically.</p>
        </div>
      </div>

      {/* Client selector */}
      <div style={{marginBottom:20}}>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {clients.map(c => (
            <button key={c.id} onClick={() => { setSelectedClient(c); setActiveTab(fingerprints[c.id] ? 'view' : 'build'); }}
              style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:'#111827',border:`1px solid ${selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:12,fontWeight:selectedClient?.id===c.id?700:400}}>
              {c.name} {fingerprints[c.id] ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['build','view'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{background:activeTab===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:8,padding:'8px 20px',cursor:'pointer',fontSize:13,fontWeight:activeTab===t?700:400,textTransform:'capitalize'}}>
            {t === 'build' ? '+ Build Fingerprint' : 'View Fingerprint'}
          </button>
        ))}
      </div>

      {activeTab === 'build' && (
        <Card>
          <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(0,212,255,0.85)',lineHeight:1.7}}>
            Paste 2 to 5 real content samples: captions, scripts, emails, anything the client actually wrote or approved. The more samples, the more accurate the fingerprint.
          </div>
          {samples.map((s, i) => (
            <div key={i} style={{marginBottom:12}}>
              <SecLabel>Sample {i+1} {i < 2 ? '(required)' : '(optional)'}</SecLabel>
              <textarea value={s} onChange={e => setSamples(prev => { const n=[...prev]; n[i]=e.target.value; return n; })}
                rows={4} placeholder={`Paste real content from ${selectedClient?.name || 'this client'}...`}
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
            </div>
          ))}
          <RedBtn onClick={run} disabled={loading || !selectedClient || samples.filter(s=>s.trim().length>20).length < 2}>
            {loading ? 'Analyzing voice...' : 'Generate Voice Fingerprint'}
          </RedBtn>
          {loading && <Spin/>}
        </Card>
      )}

      {activeTab === 'view' && fp && (
        <div>
          <div style={{background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:12,padding:'20px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:10}}>
              <div>
                <div style={{color:'#00C2FF',fontWeight:800,fontSize:16}}>{fp.clientName} Voice Fingerprint</div>
                <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>Based on {fp.sampleCount} samples. Updated {fp.updatedAt ? new Date(fp.updatedAt).toLocaleDateString() : 'recently'}.</div>
              </div>
              <button onClick={() => setActiveTab('build')} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer'}}>Rebuild</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Tone and Pace</div>
                <div style={{color:'#111827',fontSize:13,marginBottom:4}}>{fp.tone}</div>
                <div style={{color:'#6B7280',fontSize:12}}>Sentence style: {fp.pace}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Personality</div>
                <div style={{color:'#111827',fontSize:12,lineHeight:1.6}}>{fp.personality}</div>
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            {[
              { label:'Natural Vocabulary', items: fp.vocabulary, color:'#00C2FF' },
              { label:'Never Uses', items: fp.avoids, color:'#2563EB' },
              { label:'Themes', items: fp.themes, color:'#f5a623' },
              { label:'How They Open', items: fp.openings, color:'#27ae60' },
            ].map(section => (
              <div key={section.label} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px'}}>
                <div style={{fontSize:11,color:section.color,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>{section.label}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {(section.items||[]).map((item,i) => (
                    <span key={i} style={{background:'#FFFFFF',color:'rgba(255,255,255,0.8)',borderRadius:4,padding:'3px 8px',fontSize:11}}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div style={{background:'rgba(39,174,96,0.08)',border:'1px solid rgba(39,174,96,0.2)',borderRadius:10,padding:'14px'}}>
              <div style={{fontSize:11,color:'#27ae60',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Writing Rules: Do</div>
              {(fp.dos||[]).map((rule,i) => <div key={i} style={{color:'rgba(255,255,255,0.8)',fontSize:12,marginBottom:5,display:'flex',gap:8}}><span style={{color:'#27ae60',flexShrink:0}}>+</span>{rule}</div>)}
            </div>
            <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'14px'}}>
              <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Writing Rules: Never</div>
              {(fp.donts||[]).map((rule,i) => <div key={i} style={{color:'rgba(255,255,255,0.8)',fontSize:12,marginBottom:5,display:'flex',gap:8}}><span style={{color:'#2563EB',flexShrink:0}}>x</span>{rule}</div>)}
            </div>
          </div>

          {fp.sample_hook && (
            <div style={{background:'rgba(233,69,96,0.08)',border:'1px solid rgba(233,69,96,0.2)',borderRadius:10,padding:'16px'}}>
              <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Sample Hook in This Voice</div>
              <div style={{color:'#111827',fontSize:14,fontStyle:'italic',lineHeight:1.7}}>"{fp.sample_hook}"</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'view' && !fp && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          
          <div style={{color:'#111827',fontWeight:700,fontSize:16,marginBottom:8}}>No fingerprint yet for {selectedClient?.name}</div>
          <div style={{color:'#6B7280',fontSize:13,marginBottom:20}}>Paste content samples to generate the voice fingerprint.</div>
          <button onClick={() => setActiveTab('build')} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Build Fingerprint</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT PORTAL / DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const CLIENT_NOTES_KEY = 'encis_client_notes';
const CLIENT_DELIVERABLES_KEY = 'encis_deliverables';

function ClientPortal() {
  const [clients, saveClients] = useClients();
  const [activeClient, setActiveClient] = useActiveClient();
  const [view, setView] = useState('list'); // list | dashboard
  const [focusClient, setFocusClient] = useState(null);
  const [notes, setNotes] = useState({});
  const [deliverables, setDeliverables] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newDeliverable, setNewDeliverable] = useState({ title:'', type:'strategy', status:'pending', dueDate:'' });
  const [showDelForm, setShowDelForm] = useState(false);

  useEffect(() => {
    try {
      const n = localStorage.getItem(CLIENT_NOTES_KEY); if (n) setNotes(JSON.parse(n));
      const d = localStorage.getItem(CLIENT_DELIVERABLES_KEY); if (d) setDeliverables(JSON.parse(d));
    } catch {}
  }, []);

  const saveNotes = (updated) => { setNotes(updated); try { localStorage.setItem(CLIENT_NOTES_KEY, JSON.stringify(updated)); } catch {} };
  const saveDeliverables = (updated) => { setDeliverables(updated); try { localStorage.setItem(CLIENT_DELIVERABLES_KEY, JSON.stringify(updated)); } catch {} };

  const addNote = () => {
    if (!newNote.trim() || !focusClient) return;
    const updated = { ...notes, [focusClient.id]: [...(notes[focusClient.id]||[]), { id:Date.now(), text:newNote, date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }] };
    saveNotes(updated); setNewNote('');
  };

  const addDeliverable = () => {
    if (!newDeliverable.title || !focusClient) return;
    saveDeliverables([...deliverables, { ...newDeliverable, id:Date.now(), clientId:focusClient.id, createdAt:Date.now() }]);
    setNewDeliverable({ title:'', type:'strategy', status:'pending', dueDate:'' }); setShowDelForm(false);
  };

  const updateDeliverableStatus = (id, status) => saveDeliverables(deliverables.map(d => d.id===id ? {...d,status} : d));
  const removeDeliverable = (id) => saveDeliverables(deliverables.filter(d => d.id!==id));
  const removeNote = (clientId, noteId) => { const updated = {...notes,[clientId]:(notes[clientId]||[]).filter(n=>n.id!==noteId)}; saveNotes(updated); };

  const clientDeliverables = focusClient ? deliverables.filter(d => d.clientId===focusClient.id) : [];
  const clientNotes = focusClient ? (notes[focusClient.id]||[]) : [];

  const statusColors = { pending:'rgba(245,166,35,0.3)', 'in-progress':'rgba(0,212,255,0.3)', review:'rgba(155,89,182,0.3)', approved:'rgba(39,174,96,0.3)', delivered:'rgba(255,255,255,0.15)' };
  const statusText = { pending:'#f5a623', 'in-progress':'#00C2FF', review:'#9b59b6', approved:'#27ae60', delivered:'#6B7280' };
  const deliverableTypes = ['strategy','content-calendar','script-pack','audit','report','lead-magnet','email-sequence','other'];
  const statuses = ['pending','in-progress','review','approved','delivered'];

  if (view === 'dashboard' && focusClient) {
    const totalDels = clientDeliverables.length;
    const pending = clientDeliverables.filter(d=>d.status==='pending').length;
    const approved = clientDeliverables.filter(d=>d.status==='approved'||d.status==='delivered').length;

    return (
      <div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap',flexWrap:'wrap'}}>
          <button onClick={() => setView('list')} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:6,padding:'6px 12px',fontSize:12,cursor:'pointer'}}>
            All Clients
          </button>
          <div style={{flex:1}}>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>{focusClient.name}</h2>
            <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>{focusClient.handle} · {focusClient.platforms}</div>
          </div>
          <button onClick={() => { setActiveClient(focusClient); }}
            style={{background:activeClient?.id===focusClient.id?'rgba(39,174,96,0.2)':'#2563EB',color:activeClient?.id===focusClient.id?'#27ae60':'#fff',border:`1px solid ${activeClient?.id===focusClient.id?'rgba(39,174,96,0.4)':'#2563EB'}`,borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {activeClient?.id===focusClient.id ? 'Active Client' : 'Set Active'}
          </button>
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:24}}>
          {[
            { label:'Deliverables', val:totalDels, color:'#2563EB' },
            { label:'Pending', val:pending, color:'#f5a623' },
            { label:'Approved', val:approved, color:'#27ae60' },
            { label:'Notes', val:clientNotes.length, color:'#00C2FF' },
          ].map(s => (
            <div key={s.label} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:'#6B7280',marginTop:2,textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Voice fingerprint status */}
        {(() => {
          try {
            const fps = JSON.parse(localStorage.getItem(VOICE_KEY)|| '{}');
            const fp = fps[focusClient.id];
            return fp ? (
              <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
                <span style={{color:"#00C2FF",fontWeight:800,fontSize:11,letterSpacing:1}}>DNA</span>
                <div style={{flex:1}}><span style={{color:'#00C2FF',fontWeight:700,fontSize:13}}>Voice Fingerprint Active</span><span style={{color:'#6B7280',fontSize:12,marginLeft:8}}>{fp.tone} · {fp.pace} sentences · {fp.sampleCount} samples</span></div>
              </div>
            ) : (
              <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
                
                <div style={{color:'rgba(255,255,255,0.7)',fontSize:13}}>No voice fingerprint yet. Go to Agency Voice Fingerprint to build one.</div>
              </div>
            );
          } catch { return null; }
        })()}

        {/* Deliverables */}
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>Deliverables</div>
            <button onClick={() => setShowDelForm(p=>!p)} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>+ Add</button>
          </div>
          {showDelForm && (
            <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'16px',marginBottom:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <SecLabel>Title</SecLabel>
                  <input value={newDeliverable.title} onChange={e=>setNewDeliverable(p=>({...p,title:e.target.value}))} placeholder="e.g. April Content Calendar"
                    style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:6,padding:'8px 10px',color:'#111827',fontSize:12,boxSizing:'border-box'}}/>
                </div>
                <div>
                  <SecLabel>Due Date</SecLabel>
                  <input value={newDeliverable.dueDate} onChange={e=>setNewDeliverable(p=>({...p,dueDate:e.target.value}))} placeholder="e.g. Apr 1, 2026"
                    style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:6,padding:'8px 10px',color:'#111827',fontSize:12,boxSizing:'border-box'}}/>
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                {deliverableTypes.map(t => <button key={t} onClick={()=>setNewDeliverable(p=>({...p,type:t}))} style={{background:newDeliverable.type===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'4px 10px',fontSize:11,cursor:'pointer',textTransform:'capitalize'}}>{t.replace('-',' ')}</button>)}
              </div>
              <div style={{display:'flex',gap:8}}>
                <RedBtn onClick={addDeliverable} disabled={!newDeliverable.title}>Add Deliverable</RedBtn>
                <button onClick={()=>setShowDelForm(false)} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:6,padding:'8px 14px',fontSize:12,cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {clientDeliverables.length === 0 && <div style={{color:'#6B7280',fontSize:13,padding:'20px 0',textAlign:'center'}}>No deliverables yet. Add the first one.</div>}
            {clientDeliverables.map(d => (
              <div key={d.id} style={{background:'#FFFFFF',border:`1px solid ${statusColors[d.status]|| 'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{color:'#111827',fontWeight:600,fontSize:13}}>{d.title}</div>
                  <div style={{color:'#6B7280',fontSize:11,marginTop:2,textTransform:'capitalize'}}>{d.type.replace('-',' ')} {d.dueDate ? `Due ${d.dueDate}` : ''}</div>
                </div>
                <select value={d.status} onChange={e=>updateDeliverableStatus(d.id,e.target.value)}
                  style={{background:'rgba(0,0,0,0.4)',color:statusText[d.status]||'#111827',border:`1px solid ${statusColors[d.status]}`,borderRadius:5,padding:'4px 8px',fontSize:11,fontWeight:700,cursor:'pointer',textTransform:'capitalize'}}>
                  {statuses.map(s=><option key={s} value={s} style={{color:'#fff',background:'#080D14',textTransform:'capitalize'}}>{s.replace('-',' ')}</option>)}
                </select>
                <button onClick={()=>removeDeliverable(d.id)} style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',cursor:'pointer',fontSize:14}}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#111827',marginBottom:12}}>Client Notes</div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <input value={newNote} onChange={e=>setNewNote(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addNote()} placeholder="Add a note..."
              style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13}}/>
            <RedBtn onClick={addNote} disabled={!newNote.trim()} style={{padding:'9px 16px'}}>Add</RedBtn>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {clientNotes.length===0 && <div style={{color:'#6B7280',fontSize:13,padding:'16px 0',textAlign:'center'}}>No notes yet.</div>}
            {[...clientNotes].reverse().map(n => (
              <div key={n.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'10px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{color:'rgba(255,255,255,0.85)',fontSize:13,lineHeight:1.5}}>{n.text}</div>
                  <div style={{color:'#6B7280',fontSize:11,marginTop:4}}>{n.date}</div>
                </div>
                <button onClick={()=>removeNote(focusClient.id,n.id)} style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',cursor:'pointer',fontSize:12}}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Client Portal</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Full dashboard per client. Deliverables, notes, voice fingerprint, performance at a glance.</p>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {clients.map(c => {
          const cDels = deliverables.filter(d=>d.clientId===c.id);
          const pending = cDels.filter(d=>d.status==='pending'||d.status==='in-progress').length;
          const fps = (() => { try { return JSON.parse(localStorage.getItem(VOICE_KEY)|| '{}'); } catch { return {}; } })();
          const hasFp = !!fps[c.id];
          return (
            <div key={c.id} onClick={() => { setFocusClient(c); setView('dashboard'); }}
              style={{background:'#FFFFFF',border:`1px solid ${activeClient?.id===c.id?'rgba(233,69,96,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'20px',cursor:'pointer',transition:'all 0.15s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{color:'#111827',fontWeight:700,fontSize:15}}>{c.name}</div>
                  <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>{c.handle}</div>
                </div>
                {c.isDefault && <span style={{background:'rgba(233,69,96,0.15)',color:'#2563EB',borderRadius:4,padding:'2px 7px',fontSize:10,fontWeight:700}}>YOU</span>}
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                <span style={{background:'#FFFFFF',color:'#6B7280',borderRadius:4,padding:'2px 8px',fontSize:10}}>{c.platforms}</span>
                {hasFp && <span style={{background:'rgba(0,212,255,0.1)',color:'#00C2FF',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700}}>Voice</span>}
                {pending > 0 && <span style={{background:'rgba(245,166,35,0.15)',color:'#f5a623',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700}}>{pending} pending</span>}
              </div>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:12}}>{cDels.length} deliverables · {(notes[c.id]||[]).length} notes</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY REPORTING SUITE
// ═════════════════════════════════════════════════════════════════════════════
const MONTHLY_REPORT_PROMPT = (client, roiData, contentData, month, goals, wins, challenges) => `
${VOICE}

You are writing a professional monthly performance report for a social media agency client.

CLIENT: ${client.name} (${client.handle})
PLATFORMS: ${client.platforms}
REPORT PERIOD: ${month}

ROI DATA:
${roiData}

TOP PERFORMING CONTENT:
${contentData}

CLIENT GOALS THIS MONTH: ${goals}
WINS: ${wins}
CHALLENGES: ${challenges}

Write a complete, professional monthly report. This goes directly to the client. Make it feel premium.

# ${client.name}: Monthly Performance Report
## ${month}
Prepared by SIGNAL Social Media OS

---

## Executive Summary
3-4 sentences. What happened this month, the single biggest win, and the one thing to focus on next month.

## Performance Scorecard
For each metric with data: current value, change from last month (number and %), trend direction.
Include: Followers, Reach, Saves, Shares, Leads/DMs, Engagement Rate.

## Content Performance
What worked: top 3 pieces with specific reasons why.
What did not work: bottom performers with honest diagnosis.
Format insights: which formats are winning (Reels vs Carousels vs Stories).

## Audience Insights
What the data tells us about who is engaging, when, and why.

## Goal Progress
For each client goal: progress update, on track / at risk / achieved.

## What We Are Doing Next Month
3 specific strategic shifts based on this month's data. Each with a reason grounded in the numbers.

## Recommendations
2-3 clear, specific recommendations the client can act on immediately.

---
This report was generated on ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}.`;

function MonthlyReportSuite() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [month, setMonth] = useState(new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'}));
  const [goals, setGoals] = useState('');
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const roiData = (() => {
    try {
      const stored = localStorage.getItem('encis_roi_data');
      if (!stored) return 'No ROI data logged yet.';
      const weeks = JSON.parse(stored).slice(-4);
      return weeks.map(w => `Week of ${w.week}: Followers ${w.followers|| 'N/A'}, Reach ${w.reach||'N/A'}, Saves ${w.saves|| 'N/A'}, Shares ${w.shares||'N/A'}, Leads ${w.leads|| 'N/A'}. Top content: ${w.topContent||'none'}. Notes: ${w.notes|| 'none'}`).join('\n');
    } catch { return 'No data available.'; }
  })();

  const contentData = (() => {
    try {
      const stored = localStorage.getItem('encis_content_log');
      if (!stored) return 'No content logged yet.';
      return JSON.parse(stored).filter(e => e.perf === '' || e.perf === '⭐').slice(0,8)
        .map(e => `${e.perf} ${e.title||e.topic|| 'Untitled'} (${e.type}, ${e.date})`).join('\n') || 'No rated content yet.';
    } catch { return 'No data available.'; }
  })();

  const run = async () => {
    if (!selectedClient) return;
    setLoading(true); setOut('');
    const res = await ai(MONTHLY_REPORT_PROMPT(selectedClient, roiData, contentData, month, goals, wins, challenges));
    setOut(res);
    setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Monthly Reporting Suite</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>One-click monthly reports. Pulls your ROI data and content performance. Exports as PDF.</p>
        </div>
      </div>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Client</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {clients.map(c => <button key={c.id} onClick={()=>setSelectedClient(c)}
                style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.07)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:selectedClient?.id===c.id?700:400}}>{c.name}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Report Period</SecLabel>
            <input value={month} onChange={e=>setMonth(e.target.value)}
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'12px'}}>
            <div style={{fontSize:11,color:'#27ae60',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>ROI Data Found</div>
            <div style={{color:'#6B7280',fontSize:12,lineHeight:1.6}}>{roiData.slice(0,120)}{roiData.length>120?'...':''}</div>
          </div>
          <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'12px'}}>
            <div style={{fontSize:11,color:'#f5a623',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Top Content Found</div>
            <div style={{color:'#6B7280',fontSize:12,lineHeight:1.6}}>{contentData.slice(0,120)}{contentData.length>120?'...':''}</div>
          </div>
        </div>

        <SecLabel>Goals This Month</SecLabel>
        <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={2}
          placeholder="e.g. Reach 5K followers, launch lead magnet, generate 3 real estate inquiries"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Wins</SecLabel>
            <textarea value={wins} onChange={e=>setWins(e.target.value)} rows={2}
              placeholder="e.g. First viral Reel at 45K reach, booked 2 podcast guests"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Challenges</SecLabel>
            <textarea value={challenges} onChange={e=>setChallenges(e.target.value)} rows={2}
              placeholder="e.g. Missed 3 posting days, LinkedIn engagement dropped"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
          </div>
        </div>
        <RedBtn onClick={run} disabled={loading||!selectedClient}>{loading ? 'Generating report...' : 'Generate Monthly Report'}</RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <DocOutput text={out} title={`${selectedClient?.name} - ${month} Report`}/>
          <ReportEmailButton
            reportText={out}
            clientName={selectedClient?.name}
            clientEmail={selectedClient?.email || ''}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT DELIVERABLE BUILDER
// ═════════════════════════════════════════════════════════════════════════════
const DELIVERABLE_PROMPT = (client, type, brief, voiceFingerprint) => `
${VOICE}

You are creating a professional client deliverable for a social media agency.

CLIENT: ${client.name} (${client.handle})
PLATFORMS: ${client.platforms}
CLIENT VOICE: ${client.voice || 'Direct and authentic.'}
DELIVERABLE TYPE: ${type}
BRIEF: ${brief}

${voiceFingerprint ? `VOICE FINGERPRINT FOR THIS CLIENT:
Tone: ${voiceFingerprint.tone}
Natural vocabulary: ${(voiceFingerprint.vocabulary||[]).join(', ')}
Never uses: ${(voiceFingerprint.avoids||[]).join(', ')}
Personality: ${voiceFingerprint.personality}
Writing rules: ${(voiceFingerprint.dos||[]).join('. ')}` : ''}

Create a complete, polished, client-ready deliverable. This goes directly to the client. Format it professionally. Make every section fully written, not templated.

Write the complete deliverable now. No placeholders. Actual content the client can use today.`;

function DeliverableBuilder() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [delivType, setDelivType] = useState('content-calendar');
  const [brief, setBrief] = useState(() => {
    try {
      const s = localStorage.getItem('encis_last_strategy');
      if (s) { const p = JSON.parse(s); return p.name ? `Context from: ${p.name}` : ''; }
    } catch {}
    return '';
  });
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const getFingerprint = (clientId) => {
    try { const fps = JSON.parse(localStorage.getItem(VOICE_KEY)|| '{}'); return fps[clientId] || null; } catch { return null; }
  };

  const delivTypes = [
    { id:'content-calendar', label:'Content Calendar', desc:'30/60-day calendar with specific topics' },
    { id:'strategy-brief', label:'Strategy Brief', desc:'Condensed strategy document for client review' },
    { id:'script-pack', label:'Script Pack', desc:'5 camera-ready scripts on a theme' },
    { id:'audit-report', label:'Platform Audit', desc:'Profile audit with specific rewrites' },
    { id:'lead-magnet', label:'Lead Magnet', desc:'Complete finished lead magnet' },
    { id:'hook-pack', label:'Hook Pack', desc:'20 hooks across the 5 types for one topic' },
    { id:'caption-pack', label:'Caption Pack', desc:'10 platform-native captions ready to post' },
    { id:'email-sequence', label:'Email Sequence', desc:'5-email nurture sequence' },
  ];

  const run = async () => {
    if (!selectedClient || !brief) return;
    setLoading(true); setOut('');
    const fp = getFingerprint(selectedClient.id);
    const res = await ai(DELIVERABLE_PROMPT(selectedClient, delivTypes.find(d=>d.id===delivType)?.label || delivType, brief, fp));
    setOut(res);
    logToMemory({ type:'deliverable', title:`Deliverable: ${delivType} for ${selectedClient.name}`, client:selectedClient.name, preview:res.slice(0,200) });
    setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Client Deliverable Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Generate polished, client-ready deliverables. Uses voice fingerprint automatically if built.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
          {clients.map(c => {
            const hasFp = !!getFingerprint(c.id);
            return (
              <button key={c.id} onClick={()=>setSelectedClient(c)}
                style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.07)',color:'#111827',border:`1px solid ${selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:selectedClient?.id===c.id?700:400,display:'flex',alignItems:'center',gap:5}}>
                {c.name} {hasFp && <span style={{fontSize:10,color:selectedClient?.id===c.id?'rgba(255,255,255,0.8)':'rgba(0,212,255,0.7)'}}>🧬</span>}
              </button>
            );
          })}
        </div>

        <SecLabel>Deliverable Type</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8,marginBottom:16}}>
          {delivTypes.map(d => (
            <button key={d.id} onClick={()=>setDelivType(d.id)}
              style={{background:delivType===d.id?'#EEF2FF':'#F9FAFB',border:`1px solid ${delivType===d.id?'#2563EB':'rgba(255,255,255,0.08)'}`,borderRadius:8,padding:'12px',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
              <div style={{color:'#111827',fontWeight:700,fontSize:12,marginBottom:3}}>{d.label}</div>
              <div style={{color:delivType===d.id?'rgba(255,255,255,0.75)':'#6B7280',fontSize:11}}>{d.desc}</div>
            </button>
          ))}
        </div>

        <SecLabel>Brief</SecLabel>
        <textarea value={brief} onChange={e=>setBrief(e.target.value)} rows={3}
          placeholder="What specifically do you need? Include topic, time period, goals, any special requirements..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        {selectedClient && getFingerprint(selectedClient.id) && (
          <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'8px 12px',marginBottom:16,fontSize:12,color:'rgba(0,212,255,0.85)'}}>
            Voice fingerprint active for {selectedClient.name}. Output will match their exact voice.
          </div>
        )}
        <RedBtn onClick={run} disabled={loading||!selectedClient||!brief}>{loading ? 'Building deliverable...' : 'Generate Deliverable'}</RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div>
          <DocOutput text={out} title={`${selectedClient?.name} - ${delivTypes.find(d=>d.id===delivType)?.label}`}/>
          <ApprovalLinkGenerator
            content={out}
            title={`${delivTypes.find(d=>d.id===delivType)?.label || delivType} — ${selectedClient?.name}`}
            clientName={selectedClient?.name}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPETITOR INTELLIGENCE DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const COMP_INTEL_KEY = 'encis_competitor_intel';

const COMP_ANALYSIS_PROMPT = (competitor, rawData, clientContext) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

COMPETITOR: ${competitor}
CLIENT CONTEXT: ${clientContext}

RAW DATA ON COMPETITOR:
${rawData}

You are running competitive intelligence for a social media agency. Be direct and specific. Every observation needs to point to a specific action.

# Competitor Intelligence: ${competitor}

## What They Are Doing Right Now
Specific content types, posting frequency, formats working for them. Only what the data shows.

## What Is Working for Them
Top performing content patterns. What their audience responds to. Why it works psychologically.

## The Gaps (What They Are Not Covering)
Specific angles, topics, and formats they are missing or doing poorly. These are opportunities.

## Their Weaknesses
Where they are overexposed, repetitive, inauthentic, or predictable.

## How to Beat Them
5 specific, actionable content moves that would take their audience. Not generic. Specific topics, angles, and formats with reasons.

## Hooks to Steal (and Improve)
3 of their best-performing hook patterns, rewritten for ${clientContext}.

## What to Watch
2-3 things to monitor about this competitor over the next 30 days.`;

function CompetitorIntel() {
  const [competitors, setCompetitors] = useState([]);
  const [newHandle, setNewHandle] = useState('');
  const [newPlatform, setNewPlatform] = useState('Instagram');
  const [selectedComp, setSelectedComp] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [clientContext, setClientContext] = useState('Jason Fricka @everydayelevations - mindset, real estate, Colorado lifestyle, discipline content');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMP_INTEL_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setCompetitors(data.competitors || []);
        setResults(data.results || {});
      }
    } catch {}
  }, []);

  const save = (comps, res) => {
    try { localStorage.setItem(COMP_INTEL_KEY, JSON.stringify({ competitors:comps, results:res })); } catch {}
  };

  const addCompetitor = () => {
    if (!newHandle.trim()) return;
    const comp = { id:Date.now().toString(), handle:newHandle.trim(), platform:newPlatform, addedAt:Date.now() };
    const updated = [...competitors, comp];
    setCompetitors(updated); save(updated, results); setNewHandle('');
  };

  const removeComp = (id) => {
    const updated = competitors.filter(c=>c.id!==id);
    const newResults = {...results}; delete newResults[id];
    setCompetitors(updated); setResults(newResults); save(updated, newResults);
    if (selectedComp?.id===id) setSelectedComp(null);
  };

  const runIntel = async (comp) => {
    setSelectedComp(comp); setFetching(true);
    const query = `Analyze the social media presence of ${comp.handle} on ${comp.platform} right now in 2026. Report: posting frequency, content types, estimated engagement rates, what topics they cover most, their best performing content types based on visible engagement, their bio and positioning, what their audience responds to, and any notable recent content or campaigns.`;
    const raw = await perp(query);
    setFetching(false); setLoading(true);
    const analysis = await ai(COMP_ANALYSIS_PROMPT(comp.handle, raw, clientContext));
    const newResults = { ...results, [comp.id]: { raw, analysis, updatedAt:Date.now() } };
    setResults(newResults); save(competitors, newResults); setLoading(false);
  };

  const result = selectedComp ? results[selectedComp.id] : null;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Competitor Intelligence</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Track up to 10 competitors. Perplexity pulls live data. Claude finds the gaps you can own.</p>
        </div>
      </div>

      {/* Add competitor */}
      <Card style={{marginBottom:16}}>
        <SecLabel>Add Competitor</SecLabel>
        <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          <input value={newHandle} onChange={e=>setNewHandle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCompetitor()}
            placeholder="@handle or channel name"
            style={{flex:1,minWidth:160,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13}}/>
          {['Instagram','YouTube','LinkedIn','TikTok'].map(p => (
            <button key={p} onClick={()=>setNewPlatform(p)}
              style={{background:newPlatform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:newPlatform===p?700:400}}>{p}</button>
          ))}
          <RedBtn onClick={addCompetitor} disabled={!newHandle.trim()}>Add</RedBtn>
        </div>
        <SecLabel>Your Context (used in gap analysis)</SecLabel>
        <input value={clientContext} onChange={e=>setClientContext(e.target.value)}
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:competitors.length>0?'280px 1fr':'1fr',gap:16,alignItems:'start'}}>
        {/* Competitor list */}
        {competitors.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {competitors.map(comp => {
              const hasResult = !!results[comp.id];
              const isSelected = selectedComp?.id===comp.id;
              return (
                <div key={comp.id} style={{background:isSelected?'rgba(233,69,96,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${isSelected?'rgba(233,69,96,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:10,padding:'14px',cursor:'pointer'}} onClick={()=>setSelectedComp(comp)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{comp.handle}</div>
                      <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{comp.platform}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();removeComp(comp.id);}} style={{background:'transparent',color:'rgba(255,255,255,0.2)',border:'none',cursor:'pointer',fontSize:12}}>×</button>
                  </div>
                  {hasResult && <div style={{color:'#6B7280',fontSize:10,marginBottom:8}}>Last run: {new Date(results[comp.id].updatedAt).toLocaleDateString()}</div>}
                  <button onClick={e=>{e.stopPropagation();runIntel(comp);}} disabled={fetching||loading}
                    style={{width:'100%',background:hasResult?'rgba(255,255,255,0.07)':'#2563EB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                    {fetching&&isSelected?'Pulling data...' : loading&&isSelected?'Analyzing...' : hasResult?'Refresh Intel':'Run Intel'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Result panel */}
        <div>
          {(fetching || loading) && <Spin/>}
          {result && !fetching && !loading && (
            <DocOutput text={result.analysis} title={`Competitor Intel: ${selectedComp?.handle}`}/>
          )}
          {!result && !fetching && !loading && (
            <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
              
              <div style={{color:'#111827',fontWeight:700,fontSize:16,marginBottom:8}}>{competitors.length===0?'No competitors added yet':'Select a competitor to run intel'}</div>
              <div style={{color:'#6B7280',fontSize:13}}>{competitors.length===0?'Add up to 10 competitor handles above.':'Click "Run Intel" to pull live data and analysis.'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI VIDEO SCRIPT DIRECTOR
// ═════════════════════════════════════════════════════════════════════════════
const VIDEO_DIRECTOR_PROMPT = (topic, angle, duration, location, equipment, style, shotStyle) => `
${VOICE}

Topic: "${topic}"
Content Angle: ${angle}
Video Duration: ${duration}
Primary Location: ${location || 'flexible'}
Available Equipment: ${equipment || 'phone, basic lighting'}
Video Style: ${style}
Shot Style: ${shotStyle}

Write a complete AI Video Script Director brief. This goes to the videographer, editor, and talent. Every section must be specific enough that someone can pick this up and film tomorrow without asking a single question.

# Video Production Brief: "${topic}"

## The Idea (One Sentence)
What this video is and why someone will watch all the way through.

## Hook (First 3 Seconds)
Exact words. Exact action. What is on screen the moment the video starts.

## Shot List
Number every shot. For each:
- Shot number and type (close-up, medium, wide, over-shoulder, POV, b-roll)
- Exact location or background
- What subject is doing
- Lighting direction (natural window left, ring light front, etc.)
- Duration on screen (seconds)
- Audio: talking to camera / voiceover / music only / ambient

## Script (Word for Word)
Every line of dialogue or voiceover. Mark clearly: [TALKING HEAD], [VOICEOVER], [TEXT ON SCREEN], [MUSIC ONLY]

## B-Roll List
10 specific b-roll shots that support the script. Each with: subject, location, movement (static/pan/handheld), and why it is needed.

## On-Screen Text
Every text overlay: exact words, when it appears (seconds), style direction (bold/subtle/color).

## Music Direction
Mood, energy level, when music enters and exits, any specific reference tracks or genres.

## Thumbnail Shot
Exact description of the frame that will become the thumbnail. Expression, framing, background, any text.

## Editing Notes
Pacing direction, transition style, color grade mood, any specific effects or cuts.

## Equipment Checklist
Based on ${equipment || 'phone + basic setup'}: exactly what to bring and how to set it up for this specific shoot.

## Common Mistakes to Avoid for This Video
3 specific things that would kill this video's performance.`;

function VideoScriptDirector() {
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('occupational');
  const [duration, setDuration] = useState('60-90 sec');
  const [location, setLocation] = useState('');
  const [equipment, setEquipment] = useState('');
  const [style, setStyle] = useState('Talking Head');
  const [shotStyle, setShotStyle] = useState('Cinematic');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeClient] = useActiveClient();

  const run = async () => {
    if (!topic) return;
    setLoading(true); setOut('');
    const res = await ai(VIDEO_DIRECTOR_PROMPT(topic, ANGLES.find(a=>a.id===angle)?.label||angle, duration, location, equipment, style, shotStyle));
    setOut(res);
    logToMemory({ type:'video-director', title:`Video Brief: ${topic}`, client:activeClient?.name, preview:res.slice(0,200) });
    setLoading(false);
  };

  const styles = ['Talking Head','Cinematic B-Roll','Day-in-Life','Tutorial/Demo','Story Narrative','Interview Style'];
  const shots = ['Cinematic','Documentary','Raw/Authentic','High Energy/Fast Cut','Minimal/Clean'];
  const durations = ['30-45 sec','60-90 sec','3-5 min','8-10 min','15-20 min'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>AI Video Script Director</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Full production brief. Shot list, script, b-roll, music direction, thumbnail shot, editing notes. Hand this to any videographer.</p>
        </div>
      </div>
      {activeClient && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Video Topic</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. My 5 AM routine and why I have not missed it in 3 years"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Primary Location</SecLabel>
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. home office, gym, truck, Colorado outdoors"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Equipment Available</SecLabel>
            <input value={equipment} onChange={e=>setEquipment(e.target.value)} placeholder="e.g. iPhone 15 Pro, ring light, tripod, lapel mic"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Duration</SecLabel>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {durations.map(d => <button key={d} onClick={()=>setDuration(d)} style={{background:duration===d?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:duration===d?700:400}}>{d}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Video Style</SecLabel>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {styles.map(s => <button key={s} onClick={()=>setStyle(s)} style={{background:style===s?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:style===s?700:400}}>{s}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Shot Energy</SecLabel>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {shots.map(s => <button key={s} onClick={()=>setShotStyle(s)} style={{background:shotStyle===s?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:shotStyle===s?700:400}}>{s}</button>)}
            </div>
          </div>
        </div>

        <SecLabel>Content Angle (Swarbrick Dimension)</SecLabel>
        <AngleGrid selected={angle} onSelect={setAngle}/>
        <RedBtn onClick={run} disabled={loading||!topic}>{loading ? 'Directing...' : 'Generate Production Brief'}</RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title={`Production Brief: ${topic}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAMPAIGN BUILDER
// ═════════════════════════════════════════════════════════════════════════════
const CAMPAIGNS_KEY = 'encis_campaigns';

const CAMPAIGN_PROMPT = (name, goal, audience, duration, platforms, launchDate, offer, client) => `
${client ? `CLIENT: ${client.name} (${client.handle}). Voice: ${client.voice}` : VOICE}
${CONTENT_SOP}
${SWARBRICK}

Campaign Name: "${name}"
Campaign Goal: ${goal}
Target Audience: ${audience}
Duration: ${duration} weeks
Platforms: ${platforms}
Launch Date: ${launchDate || 'To be determined'}
Offer or CTA: ${offer}

Build a complete, sequenced multi-week campaign. Every piece of content must serve the campaign arc. Nothing is one-off. Everything connects.

# Campaign: "${name}"

## Campaign Strategy
One paragraph. The arc of this campaign, why this sequence builds momentum, and what the audience experiences from first touch to conversion.

## Campaign Metrics
What success looks like. Specific numbers for each platform and each phase.

## Pre-Launch Phase (Days -7 to -1): Build Anticipation
What to post before the campaign officially starts. Tease without revealing. Create curiosity.

For each piece:
- Day: [which day before launch]
- Platform: [where]
- Format: [Reel / Story / Post / Email]
- Hook: [exact opening line]
- Purpose: [what this piece does for the campaign arc]
- CTA: [exact words]

## Launch Week (Days 1-7): Maximum Impact
The launch sequence. Coordinated across all platforms. First 24 hours are critical.

For each piece:
- Day and time: [specific Day 1 at 12pm, Day 2 at 6pm, etc.]
- Platform: [where]
- Format: [type]
- Hook: [exact opening]
- Key message: [the one thing this piece says]
- CTA: [exact words]

${parseInt(duration) >= 2 ? `## Week 2: Sustain and Deepen
Content that keeps momentum, introduces social proof, and handles objections.

For each piece: Day, Platform, Format, Hook, Purpose, CTA` : ''}

${parseInt(duration) >= 3 ? `## Week 3: Convert
Content shifts toward the offer. Urgency builds. Stories of transformation. Final push.

For each piece: Day, Platform, Format, Hook, Purpose, CTA` : ''}

${parseInt(duration) >= 4 ? `## Week 4: Close and Extend
Last call content. Wrap-up for those who took action. Re-engagement for those who did not.

For each piece: Day, Platform, Format, Hook, Purpose, CTA` : ''}

## Email Sequence for This Campaign
${parseInt(duration)} emails timed to the campaign phases. Subject line, preview text, and full email body for each.

## Story Arc (Instagram/Facebook Stories)
Daily story plan for the full campaign. Each day: story purpose, slide count, key visual, CTA.

## Campaign Hashtag Strategy
Primary campaign hashtag. Supporting hashtags by platform. How to seed the hashtag before launch.

## What Can Go Wrong
3 specific risks in this campaign and exactly what to do if they happen.
`;

function CampaignBuilder() {
  const [campaigns, setCampaigns] = useState([]);
  const [view, setView] = useState('list');
  const [name, setName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Instagram']);
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [duration, setDuration] = useState('2');
  const [platforms, setPlatforms] = useState(['Instagram']);
  const [launchDate, setLaunchDate] = useState('');
  const [offer, setOffer] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeClient] = useActiveClient();

  useEffect(() => {
    try {
      const s = localStorage.getItem(CAMPAIGNS_KEY);
      if (s) setCampaigns(JSON.parse(s));
    } catch {}
  }, []);

  const saveCampaigns = (list) => {
    setCampaigns(list);
    try { localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(list)); } catch {}
  };

  const run = async () => {
    if (!name || !goal) return;
    setLoading(true); setOut('');
    const res = await ai(CAMPAIGN_PROMPT(name, goal, audience, duration, platforms.join(', '), launchDate, offer, activeClient?.isDefault ? null : activeClient));
    setOut(res);
    const campaign = { id: Date.now(), name, goal, duration, platforms, launchDate, createdAt: Date.now(), preview: res.slice(0, 200) };
    saveCampaigns([campaign, ...campaigns]);
    setLoading(false);
  };

  const togglePlatform = (p) => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const goalPresets = [
    'Launch a lead magnet and build email list',
    'Promote a podcast episode or series',
    'Drive real estate inquiries',
    'Build awareness for a new offer',
    'Re-engage cold audience',
    'Launch a 30-day challenge',
    'Promote a speaking event or appearance',
    'Personal brand launch or rebrand',
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Campaign Builder</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Multi-week coordinated campaigns. Pre-launch, launch, sustain, convert. Every post connected to the arc.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}

      {campaigns.length > 0 && (
        <div style={{marginBottom:20}}>
          <SecLabel>Past Campaigns</SecLabel>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {campaigns.slice(0,5).map(c => (
              <div key={c.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'8px 14px',fontSize:12}}>
                <div style={{color:'#111827',fontWeight:700}}>{c.name}</div>
                <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{c.duration} weeks · {c.platforms?.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div>
            <SecLabel>Campaign Name</SecLabel>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Spring Lead Magnet Launch"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Launch Date (optional)</SecLabel>
            <input value={launchDate} onChange={e=>setLaunchDate(e.target.value)} placeholder="e.g. April 1, 2026"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>

        <SecLabel>Campaign Goal</SecLabel>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
          {goalPresets.map(g => (
            <button key={g} onClick={() => setGoal(g)}
              style={{background:goal===g?'#EEF2FF':'#F9FAFB',color:'#111827',border:`1px solid ${goal===g?'#2563EB':'rgba(255,255,255,0.1)'}`,borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:goal===g?700:400}}>
              {g}
            </button>
          ))}
        </div>
        <SecLabel>Target Platforms</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          {PLATFORMS.map(p => {
            const checked = selectedPlatforms.includes(p);
            return (
              <button key={p}
                onClick={() => setSelectedPlatforms(prev => checked ? prev.filter(x=>x!==p) : [...prev,p])}
                style={{background:checked?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.04)',
                  color:checked?'#00C2FF':'#6B7280',
                  border:'1px solid '+(checked?'rgba(0,194,255,0.25)':'rgba(255,255,255,0.06)'),
                  borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,fontWeight:checked?700:400,
                  display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:8,height:8,borderRadius:2,background:checked?'#00C2FF':'rgba(255,255,255,0.2)',flexShrink:0}}/>
                {p}
              </button>
            );
          })}
        </div>
        <input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Or type a custom goal..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:14,boxSizing:'border-box'}}/>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div>
            <SecLabel>Target Audience</SecLabel>
            <textarea value={audience} onChange={e=>setAudience(e.target.value)} rows={2}
              placeholder="Who is this campaign for specifically?"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Offer or CTA</SecLabel>
            <textarea value={offer} onChange={e=>setOffer(e.target.value)} rows={2}
              placeholder="What are you asking them to do or get?"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
          <div>
            <SecLabel>Duration</SecLabel>
            <div style={{display:'flex',gap:8}}>
              {['1','2','3','4','6','8'].map(d => (
                <button key={d} onClick={()=>setDuration(d)}
                  style={{background:duration===d?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:duration===d?700:400}}>
                  {d}w
                </button>
              ))}
            </div>
          </div>
          <div>
            <SecLabel>Platforms</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Instagram','YouTube','Facebook','LinkedIn','Email'].map(p => (
                <button key={p} onClick={()=>togglePlatform(p)}
                  style={{background:platforms.includes(p)?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:12,fontWeight:platforms.includes(p)?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <RedBtn onClick={run} disabled={loading||!name||!goal}>{loading ? 'Building campaign...' : 'Build Full Campaign'}</RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title={`Campaign: ${name}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT PERFORMANCE PREDICTOR
// ═════════════════════════════════════════════════════════════════════════════
const PREDICTOR_PROMPT = (content, platform, contentType, historicalData) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

You are a content performance analyst. Score this content before it is posted.

PLATFORM: ${platform}
CONTENT TYPE: ${contentType}
CONTENT TO EVALUATE:
${content}

${historicalData ? `HISTORICAL PERFORMANCE DATA FROM THIS ACCOUNT:
${historicalData}` : ''}

Score this content and give specific, actionable feedback. No vague advice.

# Performance Prediction: ${platform} ${contentType}

## Overall Score: [X/10]
One sentence on why this score.

## Score Breakdown

### Hook Strength: [X/10]
Does the first line stop the scroll? What psychological trigger does it use? What would make it stronger?
Rewritten hook: [write a stronger version]

### Save Potential: [X/10]
Will people bookmark this to reference later? What specific element drives saves? What is missing?

### Share Potential: [X/10]
Will people send this to someone? What would make them say "you need to see this"? What is missing?

### Comment Trigger: [X/10]
Does this naturally prompt a response? What question or reaction does it create?

### Retention Score: [X/10]
Will they watch or read to the end? Where do you lose them?

### CTA Effectiveness: [X/10]
Is the call to action clear and compelling? Does it match what this piece earned?

## Predicted Performance Range
Based on this content and platform norms:
- Estimated reach: [range]
- Expected saves: [range]
- Expected comments: [range]
- Outlier potential: [low/medium/high] because [specific reason]

## The Single Biggest Problem
One thing holding this back the most. Be direct.

## Rewritten Version
A full rewrite that fixes the identified problems. Keep the core idea. Improve everything else.

## A/B Test Suggestion
Two specific variations to test. What changes and what metric to watch.
`;

function ContentPredictor() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('Reel Script');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const historicalData = (() => {
    try {
      const roi = JSON.parse(localStorage.getItem('encis_roi_data') || '[]').slice(-4);
      const top = JSON.parse(localStorage.getItem('encis_content_log') || '[]').filter(e => e.perf === '').slice(0,5);
      if (!roi.length && !top.length) return '';
      return [
        roi.length ? `Recent avg reach: ${roi.map(w=>w.reach||0).filter(Boolean).join(', ')}` : '',
        top.length ? `Top performing content: ${top.map(e=>e.title||e.topic).join(' | ')}` : '',
      ].filter(Boolean).join('\n');
    } catch { return ''; }
  })();

  const contentTypes = ['Reel Script','Caption','Hook Only','Carousel Outline','LinkedIn Post','YouTube Title','Email Subject Line'];

  const scoreColor = (score) => {
    const n = parseInt(score);
    if (n >= 8) return '#27ae60';
    if (n >= 6) return '#f5a623';
    return '#2563EB';
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Performance Predictor</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Paste content before you post. Get scored on hook strength, save potential, share potential, and a full rewrite.</p>
        </div>
      </div>

      {historicalData && (
        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(0,212,255,0.8)'}}>
          Using your historical performance data for calibrated predictions.
        </div>
      )}

      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={()=>setPlatform(p)}
                  style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SecLabel>Content Type</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {contentTypes.map(t => (
                <button key={t} onClick={()=>setContentType(t)}
                  style={{background:contentType===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:contentType===t?700:400}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SecLabel>Paste Your Content</SecLabel>
        <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8}
          placeholder="Paste a hook, caption, script, or any piece of content you are about to post..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:14,boxSizing:'border-box'}}/>

        <RedBtn onClick={async()=>{if(!content)return;setLoading(true);setOut('');const r=await ai(PREDICTOR_PROMPT(content,platform,contentType,historicalData));setOut(r);setLoading(false);}} disabled={loading||!content}>
          {loading ? 'Analyzing...' : 'Predict Performance'}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title={`Performance Prediction: ${platform} ${contentType}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WHITE LABEL MODE
// ═════════════════════════════════════════════════════════════════════════════
const WL_KEY = 'encis_whitelabel';

function useWhiteLabel() {
  const [wl, setWlState] = useState(null);
  useEffect(() => {
    try { const s = localStorage.getItem(WL_KEY); if (s) setWlState(JSON.parse(s)); } catch {}
  }, []);
  const setWl = (data) => {
    setWlState(data);
    try { localStorage.setItem(WL_KEY, data ? JSON.stringify(data) : null); } catch {}
  };
  return [wl, setWl];
}

function WhiteLabelMode() {
  const [wl, setWl] = useWhiteLabel();
  const [form, setForm] = useState({
    agencyName: '', tagline: '', primaryColor: '#00C2FF', accentColor: '#C9A84C',
    logoUrl: '', footerText: '', hidePoweredBy: false,
  });
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => { if (wl) setForm({...form, ...wl}); }, []);

  const save = () => {
    setWl(form.agencyName ? form : null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => { setWl(null); setForm({agencyName:'',tagline:'',primaryColor:'#00C2FF',accentColor:'#00C2FF',logoUrl:'',footerText:'',hidePoweredBy:false}); };

  const fields = [
    { k:'agencyName', l:'Agency Name', ph:'e.g. Greenspan Consulting', type:'input' },
    { k:'tagline', l:'Tagline', ph:'e.g. Social Media Strategy for High-Impact Brands', type:'input' },
    { k:'logoUrl', l:'Logo URL (optional)', ph:'https://yoursite.com/logo.png', type:'input' },
    { k:'footerText', l:'Footer / Powered By Text', ph:'e.g. Powered by Greenspan Consulting', type:'input' },
  ];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>White Label Mode</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Rebrand the app with your agency name, colors, and logo. Your clients see your brand, not SIGNAL.</p>
        </div>
      </div>

      {wl && (
        <div style={{background:'rgba(39,174,96,0.08)',border:'1px solid rgba(39,174,96,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
          <span style={{color:"#27ae60",fontWeight:800,fontSize:14}}>✓</span>
          <div style={{flex:1}}>
            <div style={{color:'#27ae60',fontWeight:700,fontSize:13}}>White label active: {wl.agencyName}</div>
            <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>App header, titles, and documents are branded to your agency.</div>
          </div>
          <button onClick={reset} style={{background:'rgba(233,69,96,0.1)',color:'#2563EB',border:'1px solid rgba(233,69,96,0.2)',borderRadius:6,padding:'5px 12px',fontSize:12,cursor:'pointer',fontWeight:700}}>Reset</button>
        </div>
      )}

      <Card>
        {fields.map(f => (
          <div key={f.k} style={{marginBottom:14}}>
            <SecLabel>{f.l}</SecLabel>
            <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        ))}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div>
            <SecLabel>Primary Color</SecLabel>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="color" value={form.primaryColor} onChange={e=>setForm(p=>({...p,primaryColor:e.target.value}))}
                style={{width:48,height:40,border:'none',borderRadius:6,cursor:'pointer',background:'none'}}/>
              <input value={form.primaryColor} onChange={e=>setForm(p=>({...p,primaryColor:e.target.value}))}
                style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13}}/>
            </div>
          </div>
          <div>
            <SecLabel>Accent Color</SecLabel>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="color" value={form.accentColor} onChange={e=>setForm(p=>({...p,accentColor:e.target.value}))}
                style={{width:48,height:40,border:'none',borderRadius:6,cursor:'pointer',background:'none'}}/>
              <input value={form.accentColor} onChange={e=>setForm(p=>({...p,accentColor:e.target.value}))}
                style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13}}/>
            </div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,padding:'12px 14px',background:'#FFFFFF',borderRadius:8,cursor:'pointer'}} onClick={()=>setForm(p=>({...p,hidePoweredBy:!p.hidePoweredBy}))}>
          <div style={{width:20,height:20,borderRadius:4,background:form.hidePoweredBy?'#EEF2FF':'#F9FAFB',border:`2px solid ${form.hidePoweredBy?'#2563EB':'rgba(255,255,255,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {form.hidePoweredBy && <span style={{color:'#fff',fontSize:12}}>✓</span>}
          </div>
          <div>
            <div style={{color:'#111827',fontSize:13,fontWeight:600}}>Hide "Powered by SIGNAL"</div>
            <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>Remove all SIGNAL references. Show only your agency branding.</div>
          </div>
        </div>

        {/* Live preview */}
        {form.agencyName && (
          <div style={{background:'rgba(0,0,0,0.4)',border:'1px solid #E5E7EB',borderRadius:10,padding:'16px',marginBottom:20}}>
            <SecLabel>Preview</SecLabel>
            <div style={{background:'#FFFFFF',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
              {form.logoUrl && <img src={form.logoUrl} style={{width:32,height:32,borderRadius:6,objectFit:'contain'}} alt="logo"/>}
              <div>
                <div style={{color:form.primaryColor,fontWeight:900,fontSize:16}}>{form.agencyName}</div>
                {form.tagline && <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{form.tagline}</div>}
              </div>
            </div>
            {form.footerText && <div style={{color:'#6B7280',fontSize:11,marginTop:8,textAlign:'center'}}>{form.footerText}</div>}
          </div>
        )}

        <div style={{display:'flex',gap:10}}>
          <RedBtn onClick={save} disabled={!form.agencyName}>{saved ? 'Saved' : 'Save White Label Settings'}</RedBtn>
          {wl && <button onClick={reset} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,cursor:'pointer'}}>Reset to Default</button>}
        </div>
      </Card>

      <div style={{marginTop:20,background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:12,padding:'16px'}}>
        <div style={{color:'#111827',fontWeight:700,fontSize:13,marginBottom:8}}>What white label changes</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {['App title bar and browser tab','Document headers on all PDF exports','Report titles and footers','Client portal header','Email sequence branding','Strategy doc cover pages'].map(item => (
            <div key={item} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'rgba(255,255,255,0.65)'}}>
              <span style={{color:'#27ae60',fontSize:10}}>✓</span>{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM AI PERSONA PER CLIENT
// ═════════════════════════════════════════════════════════════════════════════
const PERSONA_KEY = 'encis_personas';
const PERSONA_RATINGS_KEY = 'encis_persona_ratings';

const PERSONA_BUILD_PROMPT = (client, voiceFingerprint, contentHistory, ratings) => `
You are building a custom AI persona for a social media content system.

CLIENT: ${client.name} (${client.handle})
PLATFORMS: ${client.platforms}
CLIENT BACKGROUND: ${client.notes || client.voice || 'Not provided'}

${voiceFingerprint ? `VOICE FINGERPRINT (from analyzed samples):
Tone: ${voiceFingerprint.tone}
Vocabulary: ${(voiceFingerprint.vocabulary||[]).join(', ')}
Avoids: ${(voiceFingerprint.avoids||[]).join(', ')}
Personality: ${voiceFingerprint.personality}
Writing rules: ${(voiceFingerprint.dos||[]).slice(0,4).join('. ')}` : ''}

${contentHistory ? `CONTENT HISTORY (what has actually been created):
${contentHistory}` : ''}

${ratings ? `PERFORMANCE RATINGS (what worked vs what did not):
Viral content: ${ratings.viral.join(' | ') || 'none yet'}
Good performers: ${ratings.good.join(' | ') || 'none yet'}
Flopped: ${ratings.flopped.join(' | ') || 'none yet'}` : ''}

Build a complete AI persona for ${client.name}. This persona will be injected into every content generation tool to produce output that sounds exactly like them. Make it specific enough that two different pieces of content generated with this persona would be unmistakably from the same person.

Return as JSON with exactly these fields:
{
  "personaName": "short name for this persona (e.g. 'Jason Direct')",
  "systemPrompt": "A 150-200 word system prompt that fully defines how to write as this person. Include voice, tone, vocabulary, sentence structure, what they never say, their perspective on their niche, and how they talk to their audience. This must be specific enough to use directly as an AI instruction.",
  "voiceRules": ["8 specific one-sentence rules for writing in this voice"],
  "exampleSentences": ["5 example sentences that sound exactly like this person"],
  "avoidPhrases": ["10 specific phrases this person would never say"],
  "signaturePhrases": ["5-8 phrases or expressions this person naturally uses"],
  "contentStrengths": ["3 content types this person naturally excels at"],
  "audienceRelationship": "How this person talks to their audience in one sentence",
  "confidence": "low/medium/high based on available data",
  "dataUsed": "brief description of what data was available to build this persona"
}

Return ONLY valid JSON. No markdown, no explanation.`;

const PERSONA_REFINE_PROMPT = (persona, feedback, newSamples) => `
You are refining an existing AI persona based on new feedback and content samples.

CURRENT PERSONA SYSTEM PROMPT:
${persona.systemPrompt}

CURRENT VOICE RULES:
${(persona.voiceRules||[]).join('\n')}

NEW FEEDBACK (what feels off or needs adjustment):
${feedback}

${newSamples ? `NEW CONTENT SAMPLES TO INCORPORATE:
${newSamples}` : ''}

Update the persona to incorporate this feedback. Keep what works. Fix what does not. Return the same JSON structure with improvements applied.

Return ONLY valid JSON. No markdown, no explanation.`;

function CustomPersona() {
  const [clients] = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [personas, setPersonas] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('build');
  const [feedback, setFeedback] = useState('');
  const [newSamples, setNewSamples] = useState('');
  const [refining, setRefining] = useState(false);
  const [activeClient] = useActiveClient();

  useEffect(() => {
    try { const s = localStorage.getItem(PERSONA_KEY); if (s) setPersonas(JSON.parse(s)); } catch {}
    setSelectedClient(activeClient);
  }, []);

  const savePersona = (clientId, p) => {
    const updated = { ...personas, [clientId]: { ...p, updatedAt: Date.now() } };
    setPersonas(updated);
    try { localStorage.setItem(PERSONA_KEY, JSON.stringify(updated)); } catch {}
  };

  const getContextData = (client) => {
    const fp = (() => { try { return JSON.parse(localStorage.getItem(VOICE_KEY)|| '{}')[client.id] || null; } catch { return null; } })();
    const log = (() => { try { return JSON.parse(localStorage.getItem('encis_content_log')|| '[]'); } catch { return []; } })();
    const clientLog = log.filter(e => !e.client || e.client === client.name).slice(0, 20);
    const history = clientLog.length ? clientLog.map(e => `${e.type}: ${e.title||e.topic||''}`).join('\n') : null;
    const ratings = {
      viral: clientLog.filter(e=>e.perf==='').map(e=>e.title||e.topic|| '').filter(Boolean).slice(0,5),
      good: clientLog.filter(e=>e.perf==='⭐').map(e=>e.title||e.topic|| '').filter(Boolean).slice(0,5),
      flopped: clientLog.filter(e=>e.perf==='💀').map(e=>e.title||e.topic|| '').filter(Boolean).slice(0,5),
    };
    return { fp, history, ratings };
  };

  const buildPersona = async () => {
    if (!selectedClient) return;
    setLoading(true);
    const { fp, history, ratings } = getContextData(selectedClient);
    const res = await ai(PERSONA_BUILD_PROMPT(selectedClient, fp, history, ratings), 'You build AI personas. Return only valid JSON.');
    try {
      const clean = res.replace(/```json|```/g, '').trim();
      const persona = JSON.parse(clean);
      savePersona(selectedClient.id, persona);
      setActiveTab('view');
    } catch(e) { console.error('Persona parse error:', e); }
    setLoading(false);
  };

  const refinePersona = async () => {
    if (!selectedClient || !personas[selectedClient.id] || !feedback) return;
    setRefining(true);
    const res = await ai(PERSONA_REFINE_PROMPT(personas[selectedClient.id], feedback, newSamples), 'You refine AI personas. Return only valid JSON.');
    try {
      const clean = res.replace(/```json|```/g, '').trim();
      const refined = JSON.parse(clean);
      savePersona(selectedClient.id, { ...refined, refinedAt: Date.now(), refinementCount: (personas[selectedClient.id]?.refinementCount || 0) + 1 });
      setFeedback(''); setNewSamples('');
    } catch(e) { console.error('Refinement parse error:', e); }
    setRefining(false);
  };

  const persona = selectedClient ? personas[selectedClient.id] : null;
  const { fp, history, ratings } = selectedClient ? getContextData(selectedClient) : { fp: null, history: null, ratings: null };
  const dataScore = [fp, history, ratings?.viral?.length > 0].filter(Boolean).length;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Custom AI Persona</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Builds a trained AI persona per client. Gets smarter as you rate content. Injected into every tool automatically.</p>
        </div>
      </div>

      {/* Client selector */}
      <div style={{marginBottom:20}}>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {clients.map(c => {
            const hasPersona = !!personas[c.id];
            const conf = personas[c.id]?.confidence;
            const confColor = { high:'#27ae60', medium:'#f5a623', low:'#2563EB' }[conf] || '#6B7280';
            return (
              <button key={c.id} onClick={() => { setSelectedClient(c); setActiveTab(hasPersona ? 'view' : 'build'); }}
                style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:'#111827',border:`1px solid ${selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:selectedClient?.id===c.id?700:400,display:'flex',alignItems:'center',gap:6}}>
                {c.name}
                {hasPersona && <span style={{fontSize:9,color:confColor,fontWeight:700}}>{conf?.toUpperCase()}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedClient && (
        <>
          {/* Data availability */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
            {[
              { label:'Voice Fingerprint', val:!!fp, desc: fp ? `${fp.sampleCount} samples` : 'Not built' },
              { label:'Content History', val:!!history, desc: history ? 'Content logged' : 'No content yet' },
              { label:'Performance Data', val:!!(ratings?.viral?.length || ratings?.good?.length), desc: ratings?.viral?.length ? `${ratings.viral.length} viral hits` : 'No ratings yet' },
            ].map(d => (
              <div key={d.label} style={{background:d.val?'rgba(39,174,96,0.08)':'rgba(255,255,255,0.03)',border:`1px solid ${d.val?'rgba(39,174,96,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:d.val?'#27ae60':'#6B7280',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{d.label}</div>
                <div style={{fontSize:12,color:d.val?'#111827':'rgba(255,255,255,0.4)'}}>{d.desc}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:6,marginBottom:20}}>
            {['build','view','refine'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{background:activeTab===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:8,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:activeTab===t?700:400,textTransform:'capitalize'}}>
                {t === 'build' ? (persona ? 'Rebuild' : '+ Build Persona') : t === 'view' ? 'View Persona' : 'Refine'}
              </button>
            ))}
          </div>

          {activeTab === 'build' && (
            <Card>
              <div style={{color:'#6B7280',fontSize:13,lineHeight:1.7,marginBottom:16}}>
                The persona is built from all available data: voice fingerprint ({fp ? 'found' : 'not built'}), content history ({history ? 'found' : 'none'}), and performance ratings ({ratings?.viral?.length ? ratings.viral.length + ' viral hits' : 'none yet'}). More data means a higher confidence persona.
              </div>
              {dataScore === 0 && (
                <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
                  No data yet for {selectedClient.name}. Build a voice fingerprint first for better results. The persona will still be created from their client profile.
                </div>
              )}
              <RedBtn onClick={buildPersona} disabled={loading}>
                {loading ? 'Building persona...' : `Build ${selectedClient.name} Persona`}
              </RedBtn>
              {loading && <Spin/>}
            </Card>
          )}

          {activeTab === 'view' && persona && (
            <div>
              <div style={{background:'rgba(233,69,96,0.06)',border:'1px solid rgba(233,69,96,0.15)',borderRadius:12,padding:'20px',marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:10}}>
                  <div>
                    <div style={{color:'#111827',fontWeight:800,fontSize:16}}>"{persona.personaName}"</div>
                    <div style={{color:'#6B7280',fontSize:12,marginTop:2}}>
                      Confidence: <span style={{color:{high:'#27ae60',medium:'#f5a623',low:'#2563EB'}[persona.confidence]||'#6B7280',fontWeight:700}}>{persona.confidence?.toUpperCase()}</span>
                      {persona.refinementCount > 0 && <span style={{color:'#6B7280'}}> Refined {persona.refinementCount}x</span>}
                    </div>
                    <div style={{color:'rgba(255,255,255,0.45)',fontSize:11,marginTop:4}}>{persona.dataUsed}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>Audience Relationship</div>
                <div style={{color:'rgba(255,255,255,0.8)',fontSize:13,fontStyle:'italic',marginBottom:16}}>"{persona.audienceRelationship}"</div>
                <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>System Prompt</div>
                <div style={{background:'#F9FAFB',borderRadius:8,padding:'12px',fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.7}}>{persona.systemPrompt}</div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px'}}>
                  <div style={{fontSize:11,color:'#27ae60',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Signature Phrases</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {(persona.signaturePhrases||[]).map((p,i) => <span key={i} style={{background:'rgba(39,174,96,0.1)',color:'rgba(255,255,255,0.8)',borderRadius:4,padding:'3px 8px',fontSize:11}}>"{p}"</span>)}
                  </div>
                </div>
                <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px'}}>
                  <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Never Says</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {(persona.avoidPhrases||[]).slice(0,8).map((p,i) => <span key={i} style={{background:'rgba(233,69,96,0.08)',color:'rgba(255,255,255,0.6)',borderRadius:4,padding:'3px 8px',fontSize:11}}>{p}</span>)}
                  </div>
                </div>
              </div>

              {persona.exampleSentences?.length > 0 && (
                <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:10,padding:'14px'}}>
                  <div style={{fontSize:11,color:'#00C2FF',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Example Sentences in This Voice</div>
                  {persona.exampleSentences.map((s,i) => <div key={i} style={{color:'rgba(255,255,255,0.8)',fontSize:13,lineHeight:1.6,marginBottom:6,paddingLeft:12,borderLeft:'2px solid rgba(0,212,255,0.3)'}}>{s}</div>)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'view' && !persona && (
            <div style={{textAlign:'center',padding:'3rem',background:'#FFFFFF',borderRadius:12,border:'1px solid #E5E7EB'}}>
              
              <div style={{color:'#111827',fontWeight:700,marginBottom:8}}>No persona built yet</div>
              <button onClick={()=>setActiveTab('build')} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Build Now</button>
            </div>
          )}

          {activeTab === 'refine' && (
            <Card>
              <div style={{color:'#6B7280',fontSize:13,lineHeight:1.7,marginBottom:16}}>
                Tell the system what feels off about the current persona. Add new content samples if you have them. The persona updates and gets smarter.
                {persona?.refinementCount > 0 && <span style={{color:'#27ae60'}}> Refined {persona.refinementCount} time{persona.refinementCount!==1?'s':''}.</span>}
              </div>
              <SecLabel>What Needs to Change</SecLabel>
              <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} rows={3}
                placeholder="e.g. The tone is too formal. They never use lists. They always start with a question. The vocabulary is too complex..."
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
              <SecLabel>New Content Samples (optional)</SecLabel>
              <textarea value={newSamples} onChange={e=>setNewSamples(e.target.value)} rows={4}
                placeholder="Paste new content that better represents the voice..."
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>
              <RedBtn onClick={refinePersona} disabled={refining||!feedback||!persona}>{refining ? 'Refining...' : 'Refine Persona'}</RedBtn>
              {refining && <Spin/>}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM ANGLES MANAGER
// ═════════════════════════════════════════════════════════════════════════════
function CustomAnglesManager({ client, onClose }) {
  const [data, setData] = useState({ mode: 'swarbrick', angles: [] });
  const [newAngle, setNewAngle] = useState({ label: '', emoji: '📌', desc: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_ANGLES_KEY) || '{}');
      if (stored[client.id]) setData(stored[client.id]);
    } catch {}
  }, [client.id]);

  const save = (updated) => {
    setData(updated);
    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_ANGLES_KEY) || '{}');
      stored[client.id] = updated;
      localStorage.setItem(CUSTOM_ANGLES_KEY, JSON.stringify(stored));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const addAngle = () => {
    if (!newAngle.label.trim()) return;
    const angle = { id: 'custom_' + Date.now(), label: newAngle.label.trim(), emoji: newAngle.emoji || '📌', desc: newAngle.desc.trim(), custom: true };
    save({ ...data, angles: [...data.angles, angle] });
    setNewAngle({ label: '', emoji: '📌', desc: '' });
  };

  const removeAngle = (id) => save({ ...data, angles: data.angles.filter(a => a.id !== id) });

  const modes = [
    { id: 'swarbrick', label: 'Swarbrick Only', desc: "Use Dr. Swarbrick's 8 dimensions. Best for holistic wellness-oriented content." },
    { id: 'custom', label: 'Custom Only', desc: 'Replace the 8 dimensions entirely with angles specific to this client.' },
    { id: 'both', label: 'Both', desc: 'Show Swarbrick dimensions plus custom angles. More options in every tool.' },
  ];

  const emojis = ['📌','🎯','💡','','⚡','🌟','💰','🏆','🎬','📱','🤝','🧩','🌿','🏠','🎤','📚','💪','🧠','❤️','🌐'];

  return (
    <div style={{background:'rgba(0,0,0,0.6)',position:'fixed',inset:0,zIndex:999,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:16,padding:28,width:'100%',maxWidth:600,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{color:'#111827',fontWeight:800,fontSize:18}}>Content Angles</div>
            <div style={{color:'#6B7280',fontSize:13,marginTop:2}}>{client.name}</div>
          </div>
          <button onClick={onClose} style={{background:'#FFFFFF',border:'none',color:'#6B7280',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:13}}>Done {saved && '✓'}</button>
        </div>

        {/* Mode selector */}
        <SecLabel>Angle Mode</SecLabel>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {modes.map(m => (
            <button key={m.id} onClick={() => save({ ...data, mode: m.id })}
              style={{background:data.mode===m.id?'rgba(233,69,96,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${data.mode===m.id?'#2563EB':'rgba(255,255,255,0.08)'}`,borderRadius:10,padding:'12px 14px',cursor:'pointer',textAlign:'left'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:data.mode===m.id?'#EEF2FF':'#F9FAFB',flexShrink:0}}/>
                <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{m.label}</div>
              </div>
              <div style={{color:'#6B7280',fontSize:12,marginTop:4,paddingLeft:22}}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Custom angles list */}
        {(data.mode === 'custom' || data.mode === 'both') && (
          <>
            <SecLabel>Custom Angles for {client.name}</SecLabel>
            {data.angles.length > 0 && (
              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
                {data.angles.map(a => (
                  <div key={a.id} style={{background:'rgba(245,166,35,0.06)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{a.label}</div>
                      {a.desc && <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{a.desc}</div>}
                    </div>
                    <button onClick={() => removeAngle(a.id)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.25)',cursor:'pointer',fontSize:14}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new angle */}
            <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:14}}>
              <SecLabel>Add Custom Angle</SecLabel>
              <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',flex:1}}>
                  {emojis.map(e => (
                    <button key={e} onClick={() => setNewAngle(p=>({...p,emoji:e}))}
                      style={{background:newAngle.emoji===e?'rgba(233,69,96,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${newAngle.emoji===e?'#2563EB':'transparent'}`,borderRadius:4,padding:'4px 6px',cursor:'pointer',fontSize:14}}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input value={newAngle.label} onChange={e=>setNewAngle(p=>({...p,label:e.target.value}))} placeholder="Angle name (e.g. Luxury Real Estate, Wellness Coaching)"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:8,boxSizing:'border-box'}}/>
              <input value={newAngle.desc} onChange={e=>setNewAngle(p=>({...p,desc:e.target.value}))} placeholder="Short description (e.g. High-end property tours, buyer psychology)"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:10,boxSizing:'border-box'}}/>
              <RedBtn onClick={addAngle} disabled={!newAngle.label.trim()} style={{padding:'8px 18px',fontSize:12}}>+ Add Angle</RedBtn>
            </div>
          </>
        )}

        {/* Preview */}
        {data.angles.length > 0 && (data.mode === 'custom' || data.mode === 'both') && (
          <div style={{marginTop:16}}>
            <SecLabel>Preview</SecLabel>
            <AngleGrid selected={null} onSelect={()=>{}} angles={data.mode === 'both' ? [...ANGLES, ...data.angles] : data.angles}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALL TRANSCRIPT INTEL
// ═════════════════════════════════════════════════════════════════════════════
const TRANSCRIPTS_KEY = 'encis_transcripts';

const TRANSCRIPT_ANALYSIS_PROMPT = (client, transcript, type) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

CLIENT: ${client.name} (${client.handle})
TRANSCRIPT TYPE: ${type}

TRANSCRIPT:
${transcript}

Analyze this ${type} transcript for content and client intelligence. Extract everything useful.

# ${type} Analysis: ${client.name}

## Key Themes
What topics came up most. What the client cares about most. What problems they mentioned.

## Exact Quotes to Use in Content
5-8 direct quotes from this transcript that would work as hooks or social proof. Mark the speaker.

## Content Ideas Extracted
10 specific content pieces directly inspired by what was discussed. Each with: topic, angle, format, and hook.

## Client Insights
What you learned about the client's audience, goals, challenges, or voice that was not captured before.

## Action Items
Specific next steps for content or strategy based on this conversation.

## Language Patterns
Specific words, phrases, or expressions the client used that should be added to their voice fingerprint.
`;

function TranscriptIntel() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [transcriptType, setTranscriptType] = useState('Strategy Call');
  const [transcriptDate, setTranscriptDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [out, setOut] = useState('');
  const [view, setView] = useState('upload');
  const fileRef = useRef(null);

  useEffect(() => {
    try { const s = localStorage.getItem(TRANSCRIPTS_KEY); if (s) setTranscripts(JSON.parse(s)); } catch {}
    setSelectedClient(activeClient);
  }, []);

  const saveTranscripts = (list) => { setTranscripts(list); try { localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(list)); } catch {} };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { setTranscript(ev.target.result); setUploading(false); };
    reader.readAsText(file);
    e.target.value = '';
  };

  const analyze = async () => {
    if (!transcript.trim() || !selectedClient) return;
    setAnalyzing(true); setOut('');
    const res = await ai(TRANSCRIPT_ANALYSIS_PROMPT(selectedClient, transcript.slice(0, 8000), transcriptType));
    setOut(res);
    const entry = {
      id: Date.now(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      type: transcriptType,
      date: transcriptDate || new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      preview: transcript.slice(0, 200),
      analysis: res,
    };
    saveTranscripts([entry, ...transcripts]);
    setView('results');
    setAnalyzing(false);
  };

  const clientTranscripts = selectedClient ? transcripts.filter(t => t.clientId === selectedClient.id) : [];
  const types = ['Strategy Call', 'Client Onboarding', 'Monthly Review', 'Podcast Interview', 'Sales Call', 'Brainstorm Session', 'Other'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Call Transcript Intel</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Upload or paste any call transcript. Extracts content ideas, client quotes, action items, and voice patterns. No Fireflies needed.</p>
        </div>
      </div>

      {/* Client selector */}
      <div style={{marginBottom:20}}>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {clients.map(c => (
            <button key={c.id} onClick={() => setSelectedClient(c)}
              style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:'#111827',border:`1px solid ${selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.1)'}`,borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:selectedClient?.id===c.id?700:400}}>
              {c.name} {transcripts.filter(t=>t.clientId===c.id).length > 0 && <span style={{color:'rgba(255,255,255,0.4)',fontSize:10}}>({transcripts.filter(t=>t.clientId===c.id).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['upload','history'].map(t => (
          <button key={t} onClick={() => setView(t)}
            style={{background:view===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:8,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:view===t?700:400,textTransform:'capitalize'}}>
            {t === 'upload' ? '+ New Transcript' : `History (${clientTranscripts.length})`}
          </button>
        ))}
      </div>

      {view === 'upload' && (
        <Card>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <SecLabel>Call Type</SecLabel>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {types.map(t => (
                  <button key={t} onClick={() => setTranscriptType(t)}
                    style={{background:transcriptType===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:transcriptType===t?700:400}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SecLabel>Call Date</SecLabel>
              <input value={transcriptDate} onChange={e=>setTranscriptDate(e.target.value)} placeholder="e.g. Mar 18, 2026"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
          </div>

          {/* File upload zone */}
          <div style={{marginBottom:12}}>
            <input ref={fileRef} type="file" accept=".txt,.md,.vtt,.srt,text/plain" onChange={handleFile} style={{display:'none'}}/>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{width:'100%',background:'#FFFFFF',border:'2px dashed rgba(255,255,255,0.12)',borderRadius:10,padding:'16px',cursor:'pointer',color:'#6B7280',fontSize:13}}>
              {uploading ? 'Reading file...' : 'Upload transcript file (.txt, .vtt, .srt, .md)'}
            </button>
          </div>

          <div style={{textAlign:'center',color:'#6B7280',fontSize:11,marginBottom:8}}>or paste directly below</div>

          <textarea value={transcript} onChange={e=>setTranscript(e.target.value)} rows={10}
            placeholder="Paste your call transcript here. Works with Zoom auto-transcripts, Otter.ai exports, manual notes, or any text format..."
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:14,boxSizing:'border-box'}}/>

          {transcript.length > 0 && (
            <div style={{color:'#6B7280',fontSize:11,marginBottom:12}}>{transcript.length.toLocaleString()} characters · ~{Math.round(transcript.length/5)} words</div>
          )}

          <RedBtn onClick={analyze} disabled={analyzing||!transcript.trim()||!selectedClient}>
            {analyzing ? 'Analyzing transcript...' : 'Extract Intel from Transcript'}
          </RedBtn>
          {analyzing && <Spin/>}
        </Card>
      )}

      {view === 'history' && (
        <div>
          {clientTranscripts.length === 0 ? (
            <div style={{textAlign:'center',padding:'3rem',background:'#FFFFFF',borderRadius:12,border:'1px solid #E5E7EB'}}>
              
              <div style={{color:'#111827',fontWeight:700,marginBottom:8}}>No transcripts yet for {selectedClient?.name}</div>
              <button onClick={()=>setView('upload')} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Upload First Transcript</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {clientTranscripts.map(t => (
                <div key={t.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'16px',cursor:'pointer'}}
                  onClick={() => { setOut(t.analysis); setView('results'); }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{t.type}</div>
                      <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{t.date}</div>
                    </div>
                    <span style={{background:'#FFFFFF',color:'#6B7280',borderRadius:4,padding:'2px 8px',fontSize:10}}>View Analysis</span>
                  </div>
                  <div style={{color:'rgba(255,255,255,0.45)',fontSize:12,lineHeight:1.5}}>{t.preview.slice(0,120)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'results' && out && (
        <div>
          <button onClick={() => setView('upload')} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',marginBottom:16}}>
            New Transcript
          </button>
          <DocOutput text={out} title={`${transcriptType} Analysis: ${selectedClient?.name}`}/>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS IMPORT HUB
// Parses CSV exports from Instagram, YouTube, Facebook, LinkedIn natively
// No API needed user exports from the platform, imports here
// ═════════════════════════════════════════════════════════════════════════════
const ANALYTICS_KEY = 'encis_analytics_data';

const ANALYTICS_INSIGHT_PROMPT = (client, platform, data, period) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

CLIENT: ${client.name}
PLATFORM: ${platform}
PERIOD: ${period}

IMPORTED ANALYTICS DATA:
${data}

Analyze this data and extract every useful insight. Be specific use the actual numbers.

# ${platform} Analytics Report: ${client.name}

## Performance Summary
What the numbers actually say. Top line metrics with context.

## What Is Working
Specific content types, posting times, or topics driving the best numbers. Use actual figures.

## What Is Not Working
Specific underperformers. What to cut or change.

## Audience Insights
When they are most active. What they engage with most. Any demographic signals in the data.

## 5 Specific Actions for Next 30 Days
Each action tied directly to a specific data point. Not generic advice.

## Benchmark Check
How does this performance compare to platform averages for an account this size?
`;

function AnalyticsHub() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [platform, setPlatform] = useState('Instagram');
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [rawData, setRawData] = useState('');
  const [period, setPeriod] = useState('');
  const [out, setOut] = useState('');
  const [imports, setImports] = useState([]);
  const [tab, setTab] = useState('import');
  const fileRef = useRef(null);

  useEffect(() => {
    try { const s = localStorage.getItem(ANALYTICS_KEY); if (s) setImports(JSON.parse(s)); } catch {}
    setSelectedClient(activeClient);
  }, []);

  const saveImports = (list) => { setImports(list); try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(list)); } catch {} };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return 'No data rows found.';
    const parseRow = (line) => {
      const cols = []; let cur = ''; let inQ = false;
      for (let c of line) {
        if (c === '"') inQ = !inQ;
        else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else cur += c;
      }
      cols.push(cur.trim());
      return cols;
    };
    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).filter(l => l.trim()).map(l => {
      const vals = parseRow(l);
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
    });
    // Summarize key metrics
    const summary = [`Platform export: ${platform}`, `Rows: ${rows.length}`, `Columns: ${headers.join(', ')}`, '', '--- Data Sample (first 5 rows) ---'];
    rows.slice(0, 5).forEach(r => {
      summary.push(Object.entries(r).filter(([k,v]) => v).slice(0,8).map(([k,v]) => `${k}: ${v}`).join(' | '));
    });
    if (rows.length > 5) {
      // Aggregate key numeric columns
      const numericCols = headers.filter(h => {
        const vals = rows.map(r => parseFloat(r[h])).filter(v => !isNaN(v));
        return vals.length > rows.length * 0.5;
      });
      if (numericCols.length) {
        summary.push('', '--- Totals / Averages ---');
        numericCols.slice(0, 8).forEach(col => {
          const vals = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
          const total = vals.reduce((a,b) => a+b, 0);
          const avg = (total / vals.length).toFixed(1);
          summary.push(`${col}: total ${total.toLocaleString()}, avg ${avg}`);
        });
      }
    }
    return summary.join('\n');
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const parsed = text.toLowerCase().includes('reach') || text.includes(',') ? parseCSV(text) : text;
      setRawData(parsed); setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const analyze = async () => {
    if (!rawData || !selectedClient) return;
    setAnalyzing(true); setOut('');
    const res = await ai(ANALYTICS_INSIGHT_PROMPT(selectedClient, platform, rawData, period));
    setOut(res);
    const entry = { id: Date.now(), clientId: selectedClient.id, clientName: selectedClient.name, platform, period, preview: rawData.slice(0, 200), analysis: res, importedAt: Date.now() };
    saveImports([entry, ...imports.slice(0, 49)]);
    setTab('insights');
    setAnalyzing(false);
  };

  const exportInstructions = {
    Instagram: ['Open Instagram app or Meta Business Suite', 'Go to Insights Overview', 'Tap "Export" or use Meta Business Suite Insights Export Data', 'Choose date range Export as CSV', 'Upload that file here'],
    YouTube: ['Go to YouTube Studio Analytics', 'Click "Advanced mode" top right', 'Set date range click "Export" (download icon)', 'Upload the CSV file here'],
    Facebook: ['Open Meta Business Suite Insights', 'Select date range Export Download as CSV', 'Upload here'],
    LinkedIn: ['Go to LinkedIn Analytics Content', 'Click "Export" button top right', 'Upload the CSV file here'],
    X: ['Go to analytics.twitter.com', 'Click "Export data" in the top right', 'Choose date range Export (Tweet activity)', 'Upload the CSV file here'],
    TikTok: ['Open TikTok app Profile Creator tools Analytics', 'Tap "Export data" at the bottom', 'Data is emailed to you as CSV', 'Upload that CSV here or paste your key metrics manually'],
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Analytics Import Hub</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Export from any platform for free. Import here. SIGNAL turns raw CSV data into actionable intelligence.</p>
        </div>
      </div>

      <div style={{background:'rgba(0,194,255,0.06)',border:'1px solid #D1D5DB',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:12,color:'rgba(0,194,255,0.85)',lineHeight:1.8}}>
        <strong>No API subscription needed.</strong> Every major platform lets you export analytics as CSV for free. Export from the platform, import here, get insights in seconds.
      </div>

      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['import','history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{background:tab===t?'#EEF2FF':'#F9FAFB',color:tab===t?'#000D1A':'#111827',border:'none',borderRadius:8,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:700}}>
            {t === 'import' ? '+ Import Analytics' : `History (${imports.length})`}
          </button>
        ))}
      </div>

      {tab === 'import' && (
        <Card>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div>
              <SecLabel>Client</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {clients.map(c => <button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
              </div>
            </div>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:6}}>
                {['Instagram','YouTube','Facebook','LinkedIn','X','TikTok'].map(p => <button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{p}</button>)}
              </div>
            </div>
          </div>

          <SecLabel>How to Export from {platform}</SecLabel>
          <div style={{background:'#F9FAFB',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
            {(exportInstructions[platform]||[]).map((step,i) => (
              <div key={i} style={{color:'rgba(255,255,255,0.7)',fontSize:12,lineHeight:1.8,display:'flex',gap:8}}>
                <span style={{color:'#2563EB',fontWeight:700,flexShrink:0}}>{i+1}.</span>{step}
              </div>
            ))}
          </div>

          <input value={period} onChange={e=>setPeriod(e.target.value)} placeholder="Period (e.g. Jan–Mar 2026)"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>

          <input ref={fileRef} type="file" accept=".csv,.xlsx,text/csv" onChange={handleFile} style={{display:'none'}}/>
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            style={{width:'100%',background:'#FFFFFF',border:'2px dashed rgba(0,194,255,0.2)',borderRadius:10,padding:'16px',cursor:'pointer',color:'#6B7280',fontSize:13,marginBottom:12}}>
            {importing ? 'Parsing data...' : `Upload ${platform} Analytics CSV`}
          </button>

          {rawData && (
            <>
              <div style={{background:'rgba(0,0,0,0.4)',borderRadius:8,padding:'10px 12px',marginBottom:12,fontSize:11,color:'rgba(255,255,255,0.5)',maxHeight:120,overflowY:'auto',fontFamily:'DM Mono, monospace'}}>
                {rawData.slice(0,500)}{rawData.length>500?'...\n[truncated]':''}
              </div>
              <RedBtn onClick={analyze} disabled={analyzing||!selectedClient}>{analyzing?'Analyzing...':'Generate Analytics Insights'}</RedBtn>
            </>
          )}
          {analyzing && <Spin/>}
        </Card>
      )}

      {tab === 'insights' && out && (
        <DocOutput text={out} title={`${platform} Analytics: ${selectedClient?.name} ${period}`}/>
      )}

      {tab === 'history' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {imports.length === 0 && <div style={{textAlign:'center',padding:'3rem',color:'#6B7280'}}>No imports yet.</div>}
          {imports.map(imp => (
            <div key={imp.id} onClick={() => { setOut(imp.analysis); setTab('insights'); }}
              style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px',cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{imp.platform} — {imp.clientName}</div>
                  <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{imp.period} · {new Date(imp.importedAt).toLocaleDateString()}</div>
                </div>
                <span style={{color:'rgba(0,194,255,0.6)',fontSize:11}}>View →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL CONTENT CALENDAR (planning + scheduling layer)
// Drag-free, click-to-assign content to dates
// Export to Meta Business Suite / Google Calendar
// ═════════════════════════════════════════════════════════════════════════════
const VISUAL_CAL_KEY = 'encis_visual_calendar';

function VisualCalendar() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({title:'',platform:'Instagram',format:'Reel',status:'planned',hook:'',cta:''});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(VISUAL_CAL_KEY); if (s) setCalendarData(JSON.parse(s)); } catch {}
    setSelectedClient(activeClient);
  }, []);

  const save = (data) => { setCalendarData(data); try { localStorage.setItem(VISUAL_CAL_KEY, JSON.stringify(data)); } catch {} };

  const clientKey = selectedClient?.id || 'default';
  const clientCal = calendarData[clientKey] || {};

  const addPost = () => {
    if (!form.title || !selectedDate) return;
    const key = selectedDate;
    const post = {...form, id: Date.now().toString(), date: key};
    const updated = {...calendarData, [clientKey]: {...clientCal, [key]: [...(clientCal[key]||[]), post]}};
    save(updated); setForm({title:'',platform:'Instagram',format:'Reel',status:'planned',hook:'',cta:''}); setShowForm(false);
  };

  const removePost = (date, postId) => {
    const updated = {...calendarData, [clientKey]: {...clientCal, [date]: (clientCal[date]||[]).filter(p=>p.id!==postId)}};
    save(updated);
  };

  const updateStatus = (date, postId, status) => {
    const updated = {...calendarData, [clientKey]: {...clientCal, [date]: (clientCal[date]||[]).map(p=>p.id===postId?{...p,status}:p)}};
    save(updated);
  };

  // Build calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const monthName = currentMonth.toLocaleDateString('en-US',{month:'long',year:'numeric'});

  const statusColors = {planned:'rgba(0,194,255,0.3)',approved:'rgba(39,174,96,0.4)',published:'rgba(255,255,255,0.2)',needs_edit:'rgba(233,69,96,0.4)'};
  const platformColors = {Instagram:'#C13584',YouTube:'#FF0000',Facebook:'#1877F2',LinkedIn:'#0A66C2',Email:'#00C2FF'};

  // Export to scheduling-friendly format
  const exportForMeta = () => {
    const allPosts = Object.entries(clientCal).flatMap(([date, posts]) => posts.map(p => ({...p, date})));
    const csv = ['Date,Platform,Format,Title,Hook,CTA,Status',
      ...allPosts.map(p => `${p.date},${p.platform},${p.format},"${p.title}","${p.hook|| ''}","${p.cta||''}",${p.status}`)
    ].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${selectedClient?.name|| 'Content'}-Calendar.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const totalPosts = Object.values(clientCal).flat().length;
  const planned = Object.values(clientCal).flat().filter(p=>p.status==='planned').length;
  const approved = Object.values(clientCal).flat().filter(p=>p.status==='approved').length;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Visual Content Calendar</h2>
            <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Plan, approve, and export. Download CSV for Meta Business Suite or any free scheduler.</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={exportForMeta} style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Client selector */}
      <div style={{marginBottom:16}}>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {clients.map(c => <button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {[['Total Posts',totalPosts,'#00C2FF'],['Planned',planned,'#f5a623'],['Approved',approved,'#27ae60']].map(([l,v,c])=>(
          <div key={l} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:10,color:'#6B7280',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Month navigation */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={()=>setCurrentMonth(new Date(year,month-1,1))} style={{background:'#FFFFFF',border:'none',color:'#111827',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:14}}>←</button>
        <div style={{color:'#111827',fontWeight:700,fontSize:15}}>{monthName}</div>
        <button onClick={()=>setCurrentMonth(new Date(year,month+1,1))} style={{background:'#FFFFFF',border:'none',color:'#111827',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:14}}>→</button>
      </div>

      {/* Day headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:4}}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
          <div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:'#6B7280',letterSpacing:1,textTransform:'uppercase',padding:'4px 0'}}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:16}}>
        {Array.from({length:firstDay}, (_,i) => <div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth}, (_,i) => {
          const d = i+1;
          const dateStr = formatDate(d);
          const posts = clientCal[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = selectedDate === dateStr;
          return (
            <div key={d} onClick={()=>{setSelectedDate(dateStr);setShowForm(true);}}
              style={{minHeight:70,background:isSelected?'rgba(0,194,255,0.1)':isToday?'rgba(0,194,255,0.05)':'rgba(255,255,255,0.02)',border:`1px solid ${isSelected?'rgba(0,194,255,0.4)':isToday?'rgba(0,194,255,0.2)':'rgba(255,255,255,0.06)'}`,borderRadius:8,padding:'6px',cursor:'pointer',transition:'all 0.1s'}}>
              <div style={{fontSize:11,fontWeight:isToday?800:500,color:isToday?'#00C2FF':'#6B7280',marginBottom:3}}>{d}</div>
              {posts.slice(0,3).map(p => (
                <div key={p.id} onClick={e=>{e.stopPropagation();}}
                  style={{background:statusColors[p.status]|| 'rgba(255,255,255,0.1)',borderRadius:3,padding:'2px 4px',marginBottom:2,display:'flex',alignItems:'center',gap:3}}>
                  <div style={{width:4,height:4,borderRadius:'50%',background:platformColors[p.platform]||'#2563EB',flexShrink:0}}/>
                  <span style={{fontSize:9,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{p.title}</span>
                  <button onClick={e=>{e.stopPropagation();removePost(dateStr,p.id);}} style={{background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:9,padding:0,lineHeight:1}}>×</button>
                </div>
              ))}
              {posts.length > 3 && <div style={{fontSize:9,color:'#6B7280'}}>+{posts.length-3} more</div>}
            </div>
          );
        })}
      </div>

      {/* Add post form */}
      {showForm && selectedDate && (
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{color:'#111827',fontWeight:700,fontSize:14}}>Add Post — {new Date(selectedDate+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
            <button onClick={()=>setShowForm(false)} style={{background:'#FFFFFF',border:'none',color:'#6B7280',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>Close</button>
          </div>

          {/* Show existing posts for this date */}
          {(clientCal[selectedDate]||[]).length > 0 && (
            <div style={{marginBottom:14}}>
              <SecLabel>Scheduled for this day</SecLabel>
              {(clientCal[selectedDate]||[]).map(p => (
                <div key={p.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'10px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:platformColors[p.platform],flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{color:'#111827',fontSize:12,fontWeight:600}}>{p.title}</div>
                    <div style={{color:'#6B7280',fontSize:10,marginTop:1}}>{p.platform} · {p.format}</div>
                  </div>
                  <select value={p.status} onChange={e=>updateStatus(selectedDate,p.id,e.target.value)} style={{background:'rgba(0,0,0,0.4)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:4,padding:'3px 6px',fontSize:10,cursor:'pointer'}}>
                    {['planned','approved','published','needs_edit'].map(s=><option key={s} value={s} style={{background:'#080D14'}}>{s.replace('_',' ')}</option>)}
                  </select>
                  <button onClick={()=>removePost(selectedDate,p.id)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:14}}>×</button>
                </div>
              ))}
            </div>
          )}

          <SecLabel>New Post</SecLabel>
          <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Post title or topic"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:10,boxSizing:'border-box'}}/>
          <input value={form.hook} onChange={e=>setForm(p=>({...p,hook:e.target.value}))} placeholder="Opening hook (optional)"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:10,boxSizing:'border-box'}}/>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
            {['Instagram','YouTube','Facebook','LinkedIn','Email'].map(p=><button key={p} onClick={()=>setForm(f=>({...f,platform:p}))} style={{background:form.platform===p?'#EEF2FF':'#F9FAFB',color:form.platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>)}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
            {['Reel','Carousel','Story','Post','Email','YouTube','Short'].map(f=><button key={f} onClick={()=>setForm(p=>({...p,format:f}))} style={{background:form.format===f?'#EEF2FF':'#F9FAFB',color:form.format===f?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{f}</button>)}
          </div>
          <RedBtn onClick={addPost} disabled={!form.title}>Add to Calendar</RedBtn>
        </Card>
      )}

      <div style={{marginTop:16,background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px 16px',fontSize:12,color:'#6B7280',lineHeight:1.8}}>
        <strong style={{color:'#374151'}}>Free scheduling workflow:</strong> Plan here Export CSV Upload to Meta Business Suite (free, schedules Instagram + Facebook) or copy content to YouTube Studio, LinkedIn, or any scheduler. SIGNAL handles the strategy and planning layer.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI STRATEGY REVIEW (auto-generated monthly, no API needed)
// ═════════════════════════════════════════════════════════════════════════════
const STRATEGY_REVIEW_KEY = 'encis_strategy_reviews';

const STRATEGY_REVIEW_PROMPT = (client, roiData, contentData, calendarData, period) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

CLIENT: ${client.name} (${client.handle})
REVIEW PERIOD: ${period}

ROI PERFORMANCE DATA:
${roiData}

CONTENT PERFORMANCE (rated posts):
${contentData}

CALENDAR EXECUTION (what was planned vs posted):
${calendarData}

You are running a monthly AI strategy review. This replaces the monthly strategy call. Be direct. Use the actual numbers. Every recommendation must be tied to specific data.

# Monthly Strategy Review: ${client.name}
## ${period}

## What the Numbers Say
Straight reading of the data. What went up, what went down, what stayed flat. No spin.

## The Strategic Verdict
Is this account moving in the right direction? What is the single most important thing happening right now?

## What Is Working (Double Down)
3 specific patterns from the data worth repeating. Each with exact numbers and why it worked.

## What Is Not Working (Cut or Change)
3 specific underperformers with diagnosis. What to do about each.

## Content Strategy Drift
Has the content drifted from the original strategy? What angles are being neglected? What is being over-used?

## The 30-Day Correction Plan
5 specific changes for next month. Each tied to a data point. Specific enough to execute without another meeting.

## Goals Check
Are we on track for the 90-day goals? If not, what adjusts?

## One Big Swing
The single highest-leverage move this account could make right now that it has not tried yet.
`;

function AIStrategyReview() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState('');
  const [tab, setTab] = useState('generate');

  useEffect(() => {
    try { const s = localStorage.getItem(STRATEGY_REVIEW_KEY); if (s) setReviews(JSON.parse(s)); } catch {}
    setSelectedClient(activeClient);
  }, []);

  const saveReviews = (list) => { setReviews(list); try { localStorage.setItem(STRATEGY_REVIEW_KEY, JSON.stringify(list)); } catch {} };

  const buildContext = () => {
    const roi = (() => { try { return JSON.parse(localStorage.getItem('encis_roi_data')|| '[]').slice(-8); } catch { return []; } })();
    const log = (() => { try { return JSON.parse(localStorage.getItem('encis_content_log')|| '[]').slice(0,40); } catch { return []; } })();
    const calData = (() => { try { const c = JSON.parse(localStorage.getItem(VISUAL_CAL_KEY)||'{}'); const k = selectedClient?.id|| 'default'; return Object.values(c[k]||{}).flat().slice(0,20); } catch { return []; } })();

    const roiStr = roi.length ? roi.map(w=>`Week ${w.week}: Followers ${w.followers||'?'}, Reach ${w.reach|| '?'}, Saves ${w.saves||'?'}, Shares ${w.shares|| '?'}, Leads ${w.leads||'?'}. Top: ${w.topContent|| 'none'}`).join('\n') : 'No ROI data yet.';
    const contentStr = log.length ? log.filter(e=>e.perf).slice(0,15).map(e=>`${e.perf} ${e.type}: "${e.title||e.topic|| 'untitled'}" (${e.date})`).join('\n') : 'No rated content yet.';
    const calStr = calData.length ? calData.map(p=>`${p.date}: ${p.platform} ${p.format} "${p.title}" [${p.status}]`).join('\n') : 'No calendar data.';

    return { roiStr, contentStr, calStr };
  };

  const generate = async () => {
    if (!selectedClient) return;
    setLoading(true); setOut('');
    const { roiStr, contentStr, calStr } = buildContext();
    const period = new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const res = await ai(STRATEGY_REVIEW_PROMPT(selectedClient, roiStr, contentStr, calStr, period));
    setOut(res);
    const review = { id: Date.now(), clientId: selectedClient.id, clientName: selectedClient.name, period, analysis: res, generatedAt: Date.now() };
    saveReviews([review, ...reviews.slice(0,11)]);
    setTab('view');
    setLoading(false);
  };

  const { roiStr, contentStr } = selectedClient ? buildContext() : { roiStr:'', contentStr:'' };
  const hasData = roiStr !== 'No ROI data yet.' || contentStr !== 'No rated content yet.';

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>AI Strategy Review</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Monthly strategic review generated automatically from your data. Replaces the $500/month strategy call.</p>
        </div>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {['generate','history'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?'#EEF2FF':'#F9FAFB',color:tab===t?'#000D1A':'#111827',border:'none',borderRadius:8,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:700,textTransform:'capitalize'}}>
            {t==='generate'?'Generate Review':`History (${reviews.length})`}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <Card>
          <SecLabel>Client</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {clients.map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
            {[
              {label:'ROI Data',val:roiStr!=='No ROI data yet.',desc:roiStr!=='No ROI data yet.'?'Weeks logged':'Log in ROI Dashboard'},
              {label:'Content Ratings',val:contentStr!=='No rated content yet.',desc:contentStr!=='No rated content yet.'?'Rated posts found':'Rate in Content Memory'},
              {label:'Calendar Data',val:false,desc:'Optional add in Visual Calendar'},
            ].map(d=>(
              <div key={d.label} style={{background:d.val?'rgba(39,174,96,0.06)':'rgba(255,255,255,0.03)',border:`1px solid ${d.val?'rgba(39,174,96,0.2)':'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:d.val?'#27ae60':'#6B7280',fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{d.label}</div>
                <div style={{fontSize:11,color:d.val?'#111827':'rgba(255,255,255,0.4)'}}>{d.desc}</div>
              </div>
            ))}
          </div>

          {!hasData && (
            <div style={{background:'rgba(0,194,255,0.06)',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'rgba(0,194,255,0.8)'}}>
              The review works best with ROI data and rated content. It will still generate from client profile and strategy context alone.
            </div>
          )}
          <RedBtn onClick={generate} disabled={loading||!selectedClient}>{loading?'Generating review...':'Generate Monthly Strategy Review'}</RedBtn>
          {loading&&<Spin/>}
        </Card>
      )}

      {tab==='view' && out && <DocOutput text={out} title={`Strategy Review: ${selectedClient?.name}`}/>}

      {tab==='history' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {reviews.length===0&&<div style={{textAlign:'center',padding:'3rem',color:'#6B7280'}}>No reviews yet.</div>}
          {reviews.map(r=>(
            <div key={r.id} onClick={()=>{setOut(r.analysis);setTab('view');}} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px',cursor:'pointer'}}>
              <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{r.clientName} — {r.period}</div>
              <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>Generated {new Date(r.generatedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT ONBOARDING AUTOMATION
// Runs all tools on new client add: audit, fingerprint, gaps, strategy draft
// ═════════════════════════════════════════════════════════════════════════════
const ONBOARDING_AUTO_PROMPT = (client) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

NEW CLIENT ONBOARDING PACKAGE

CLIENT PROFILE:
Name: ${client.name}
Handle: ${client.handle}
Platforms: ${client.platforms}
Voice: ${client.voice || 'Not provided'}
Content angles: ${client.angles || 'Not specified'}
Brand colors: ${client.colors || 'Not provided'}
Additional context: ${client.notes || 'None'}

Generate a complete client onboarding package. This replaces the discovery call and gives the agency everything needed to start executing on day one.

# New Client Onboarding: ${client.name}

## Client Snapshot
Who this client is, what they do, and what their social media presence needs to accomplish. 3-4 sentences max.

## Initial Platform Assessment
For each platform (${client.platforms}): current state assessment based on profile data, priority ranking, and Week 1 action items.

## Recommended Content Angles
Based on who they are and what they sell: 5-6 specific content angles that will work for this specific client. Not generic. Tied to their business and audience.

## Voice Profile (Initial)
How this client should sound before voice fingerprinting. Tone, what they should never say, how they talk to their audience.

## 30-Day Quick Start Plan
Specific week-by-week actions for the first 30 days. Concrete tasks, not strategy fluff.

## Content Ideas: First 10 Posts
Specific filmable/postable ideas ready to execute. Each with: topic, format, platform, hook, and CTA.

## Key Questions for First Call
5-7 questions that will unlock the information needed to build a full 90-day strategy.

## Red Flags to Watch
Any inconsistencies or gaps in the profile that need to be addressed early.
`;

function OnboardingAutomation() {
  const [clients] = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState('');
  const [packages, setPackages] = useState({});

  useEffect(() => {
    try { const s = localStorage.getItem('encis_onboarding_packages'); if (s) setPackages(JSON.parse(s)); } catch {}
  }, []);

  const generate = async () => {
    if (!selectedClient) return;
    setLoading(true); setOut('');
    const res = await ai(ONBOARDING_AUTO_PROMPT(selectedClient));
    setOut(res);
    const updated = {...packages, [selectedClient.id]: {analysis: res, generatedAt: Date.now()}};
    setPackages(updated);
    try { localStorage.setItem('encis_onboarding_packages', JSON.stringify(updated)); } catch {}
    setLoading(false);
  };

  const existing = selectedClient ? packages[selectedClient.id] : null;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Onboarding Automation</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Add a client, run this. Full onboarding package before the first call. Platform assessment, content angles, 30-day plan, first 10 posts.</p>
        </div>
      </div>

      <Card>
        <SecLabel>Select Client to Onboard</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8,marginBottom:16}}>
          {clients.map(c => {
            const done = !!packages[c.id];
            return (
              <button key={c.id} onClick={()=>setSelectedClient(c)}
                style={{background:selectedClient?.id===c.id?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${selectedClient?.id===c.id?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:10,padding:'14px',cursor:'pointer',textAlign:'left'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{c.name}</div>
                  {done && <span style={{background:'rgba(39,174,96,0.15)',color:'#27ae60',borderRadius:4,padding:'1px 6px',fontSize:9,fontWeight:700}}>DONE</span>}
                </div>
                <div style={{color:'#6B7280',fontSize:11}}>{c.handle}</div>
                {done && <div style={{color:'rgba(255,255,255,0.3)',fontSize:10,marginTop:4}}>Generated {new Date(packages[c.id].generatedAt).toLocaleDateString()}</div>}
              </button>
            );
          })}
        </div>

        {selectedClient && (
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <RedBtn onClick={generate} disabled={loading}>{loading?'Generating package...':'Generate Onboarding Package'}</RedBtn>
            {existing && <button onClick={()=>setOut(existing.analysis)} style={{background:'#FFFFFF',color:'#374151',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,cursor:'pointer'}}>View Existing</button>}
          </div>
        )}
        {loading && <Spin/>}
      </Card>
      {out && <DocOutput text={out} title={`Onboarding Package: ${selectedClient?.name}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIO LINK PAGE BUILDER
// ═════════════════════════════════════════════════════════════════════════════
const BIOLINK_PROMPT = (client, links, headline, subtext, style) => `
${VOICE}

CLIENT: ${client.name} (${client.handle})
PLATFORMS: ${client.platforms}
HEADLINE: ${headline}
SUBTEXT: ${subtext}
LINKS TO INCLUDE: ${links}
STYLE: ${style}

Generate a complete, self-contained HTML bio link page. This is the page behind their link-in-bio.
Requirements:
- Mobile-first, looks premium on phone
- Dark background matching SIGNAL aesthetic (#080D14 base)
- Profile section with name, handle, and one-line description
- Clean link buttons with icons for each platform/CTA
- Email capture section with lead magnet hook
- Footer with copyright

Return ONLY the complete HTML no explanation, no markdown, no backticks. Just the raw HTML starting with <!DOCTYPE html>.`;

function BioLinkBuilder() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [links, setLinks] = useState([
    { id:1, label:'Follow on Instagram', url:'https://instagram.com/everydayelevations', icon:'📸' },
    { id:2, label:'Listen to the Podcast', url:'https://everydayelevations.com/podcast', icon:'🎙️' },
    { id:3, label:'Colorado Real Estate', url:'https://frickasellscolorado.com', icon:'🏠' },
  ]);
  const [newLink, setNewLink] = useState({ label:'', url:'', icon:'🔗' });
  const [style, setStyle] = useState('Midnight Premium');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const addLink = () => {
    if (!newLink.label || !newLink.url) return;
    setLinks(prev => [...prev, { ...newLink, id: Date.now() }]);
    setNewLink({ label:'', url:'', icon:'🔗' });
  };

  const removeLink = (id) => setLinks(prev => prev.filter(l => l.id !== id));

  const run = async () => {
    if (!selectedClient) return;
    setLoading(true); setOut('');
    const linkList = links.map(l => `${l.icon} ${l.label}: ${l.url}`).join('\n');
    const res = await ai(BIOLINK_PROMPT(selectedClient, linkList, headline || `${selectedClient.name} — ${selectedClient.handle}`, subtext, style), 'You build bio link pages. Return only raw HTML starting with <!DOCTYPE html>.');
    const html = res.replace(/```html|```/g, '').trim();
    setOut(html);
    setLoading(false);
  };

  const download = () => {
    const blob = new Blob([out], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, '_blank');
    if (printWin) printWin.onload = () => printWin.print();
    else { const a = document.createElement('a'); a.href=url; a.download='biolink.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
    URL.revokeObjectURL(url);
  };

  const styles = ['Midnight Premium', 'Clean Minimal', 'Bold Dark', 'Warm Creator'];
  const iconOptions = ['🔗','📸','▶️','💼','🏠','🎙️','📧','🤝','🏆','📱','🌐','💰','','📚','🎯'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Bio Link Page Builder</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Builds a complete link-in-bio landing page. Download and host free on GitHub Pages, Netlify, or Carrd.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {clients.map(c => <button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Page Headline</SecLabel>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder={`${selectedClient?.name || 'Name'} — ${selectedClient?.handle || '@handle'}`}
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>One-Line Description</SecLabel>
            <input value={subtext} onChange={e=>setSubtext(e.target.value)} placeholder="HR Manager Mindset Coach Colorado Real Estate"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <SecLabel>Page Style</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {styles.map(s => <button key={s} onClick={()=>setStyle(s)} style={{background:style===s?'#EEF2FF':'#F9FAFB',color:style===s?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{s}</button>)}
        </div>
        <SecLabel>Links</SecLabel>
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
          {links.map((l,i) => (
            <div key={l.id} style={{display:'flex',alignItems:'center',gap:8,background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'8px 12px'}}>
              <span style={{fontSize:16,cursor:'pointer'}} onClick={()=>{const icons=iconOptions;const ci=icons.indexOf(l.icon);setLinks(prev=>prev.map(x=>x.id===l.id?{...x,icon:icons[(ci+1)%icons.length]}:x));}}>{l.icon}</span>
              <div style={{flex:1}}>
                <div style={{color:'#111827',fontSize:12,fontWeight:600}}>{l.label}</div>
                <div style={{color:'#6B7280',fontSize:11}}>{l.url}</div>
              </div>
              <button onClick={()=>removeLink(l.id)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:14}}>×</button>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr auto',gap:8,marginBottom:16,alignItems:'end'}}>
          <div>
            <SecLabel>Icon</SecLabel>
            <select value={newLink.icon} onChange={e=>setNewLink(p=>({...p,icon:e.target.value}))} style={{background:'rgba(0,0,0,0.4)',color:'#111827',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 8px',fontSize:16,cursor:'pointer'}}>
              {iconOptions.map(i=><option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <SecLabel>Label</SecLabel>
            <input value={newLink.label} onChange={e=>setNewLink(p=>({...p,label:e.target.value}))} placeholder="Button label"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>URL</SecLabel>
            <input value={newLink.url} onChange={e=>setNewLink(p=>({...p,url:e.target.value}))} placeholder="https://"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div style={{paddingTop:20}}>
            <button onClick={addLink} disabled={!newLink.label||!newLink.url} style={{background:'#2563EB',color:'#000D1A',border:'none',borderRadius:8,padding:'9px 16px',fontWeight:800,cursor:'pointer',fontSize:13,whiteSpace:'nowrap'}}>+ Add</button>
          </div>
        </div>
        <RedBtn onClick={run} disabled={loading||!selectedClient}>{loading?'Building page...':'Build Bio Link Page'}</RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && (
        <div style={{marginTop:20}}>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={()=>setPreview(p=>!p)} style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>{preview?'Hide Preview':'Preview'}</button>
            <button onClick={download} style={{background:'#2563EB',color:'#000D1A',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:800,cursor:'pointer'}}>Download HTML</button>
            <CopyBtn text={out}/>
          </div>
          {preview && <iframe srcDoc={out} style={{width:'100%',height:600,border:'1px solid #E5E7EB',borderRadius:12}} title="Bio Link Preview"/>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT COMMUNICATION TEMPLATES
// ═════════════════════════════════════════════════════════════════════════════
const COMM_TEMPLATES_PROMPT = (client, templateType, context, agencyName) => `
${VOICE}

AGENCY: ${agencyName || 'Everyday Elevations / SIGNAL'}
CLIENT: ${client.name} (${client.handle})
TEMPLATE TYPE: ${templateType}
ADDITIONAL CONTEXT: ${context || 'None'}

Write a complete, professional ${templateType} communication. This is sent from the agency to the client.
Tone: warm but professional. Direct. No filler sentences. Sounds like a real person wrote it, not a template.
Include subject line for emails.

Write the complete message now. No placeholders where real content should go.`;

function ClientCommsTemplates() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [templateType, setTemplateType] = useState('');
  const [context, setContext] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedClient(activeClient);
    try { const wl = JSON.parse(localStorage.getItem('encis_whitelabel')|| 'null'); if(wl?.agencyName) setAgencyName(wl.agencyName); } catch {}
  }, []);

  const templates = [
    { id:'welcome', label:'Onboarding Welcome', desc:'First email when client signs' },
    { id:'weekly', label:'Weekly Check-In', desc:'Tuesday touchpoint' },
    { id:'report_delivery', label:'Report Delivery', desc:'Monthly report send email' },
    { id:'scope_expansion', label:'Scope Expansion Pitch', desc:'Upsell additional services' },
    { id:'missed_deadline', label:'Missed Deadline', desc:'Honest delay acknowledgment' },
    { id:'renewal', label:'Contract Renewal', desc:'90-day renewal conversation' },
    { id:'pause_request', label:'Pause Response', desc:'Client wants to pause work' },
    { id:'rate_increase', label:'Rate Increase', desc:'Announcing price adjustment' },
    { id:'feedback_request', label:'Feedback Request', desc:'Asking for testimonial/review' },
    { id:'content_approval', label:'Content Approval Request', desc:'Sending work for sign-off' },
    { id:'strategy_pivot', label:'Strategy Pivot', desc:'Recommending a direction change' },
    { id:'offboarding', label:'Offboarding', desc:'Professional end-of-contract' },
  ];

  const run = async () => {
    if (!selectedClient || !templateType) return;
    setLoading(true); setOut('');
    const tLabel = templates.find(t=>t.id===templateType)?.label || templateType;
    const res = await ai(COMM_TEMPLATES_PROMPT(selectedClient, tLabel, context, agencyName));
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Client Communication Templates</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Every email agencies send. Written in your voice, personalized per client. Ready to copy and send.</p>
        </div>
      </div>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Client</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {clients.map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Agency Name</SecLabel>
            <input value={agencyName} onChange={e=>setAgencyName(e.target.value)} placeholder="Your agency name"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <SecLabel>Template Type</SecLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:6,marginBottom:16}}>
          {templates.map(t=>(
            <button key={t.id} onClick={()=>setTemplateType(t.id)}
              style={{background:templateType===t.id?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${templateType===t.id?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'10px 12px',cursor:'pointer',textAlign:'left'}}>
              <div style={{color:'#111827',fontWeight:700,fontSize:12}}>{t.label}</div>
              <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{t.desc}</div>
            </button>
          ))}
        </div>
        <SecLabel>Additional Context (optional)</SecLabel>
        <input value={context} onChange={e=>setContext(e.target.value)} placeholder="e.g. Report is 3 days late due to platform data delay, client is generally easy-going"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>
        <RedBtn onClick={run} disabled={loading||!selectedClient||!templateType}>{loading?'Writing...':'Write Communication'}</RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out && <DocOutput text={out} title={`${templates.find(t=>t.id===templateType)?.label} — ${selectedClient?.name}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT BRIEF GENERATOR (pre-filming session brief)
// ═════════════════════════════════════════════════════════════════════════════
const CONTENT_BRIEF_PROMPT = (client, sessionDate, location, topics, equipment, duration, intensity) => `
You are a world-class content strategist, creative director, and personal brand operator.

You think like someone who runs a content-driven business, understands audience psychology, knows how content turns into revenue, and values clarity over fluff.

This is a production blueprint. Not a content plan.

CLIENT: ${client.name} (${client.handle})
PLATFORMS: ${client.platforms}
BRAND VOICE: ${client.voice || 'Direct, real, no corporate speak.'}
SESSION DATE: ${sessionDate || 'Upcoming session'}
PRIMARY LOCATION: ${location || "Home or office"}
TOPICS TO COVER: ${topics}
EQUIPMENT AVAILABLE: ${equipment || 'Phone + basic setup'}
SESSION DURATION: ${duration || '2-3 hours'}
CONTENT INTENSITY: ${intensity || 'MEDIUM'} LOW: approachable, simple, soft edges. MEDIUM: balanced insight, clear structure. HIGH: direct, strong opinions, slightly confrontational.

STYLE RULES: No emojis. No hype language. No algorithm talk. No corporate tone. No long paragraphs. Everything must feel natural to say out loud.

---

Follow this exact structure. Write everything fully. No placeholders.

# Pre-Filming Brief: ${client.name}
## ${sessionDate || 'Upcoming Session'} | ${location || 'Home base'} | ${duration || '2-3 hours'}

## 1. What We Are Filming Today

List 4-6 content pieces. For each: Title, estimated filming time, format (walking/sit-down/quick hits/direct to camera), purpose (connect/teach/convert/build authority). Each piece serves a different role. No two with the same purpose.

## 2. Talking Points Per Piece

For EACH piece, write this exact structure:

### [Content Title]

**Role:** What this piece does

**Key message:** One clear idea. One sentence.

**Open with:** Strong first line. Interrupts attention. Feels real, not rehearsed.

**Build:**
- Beat 1: specific moment, observation, or real situation from their life
- Beat 2: the tension, friction, or problem underneath it
- Beat 3: the deeper insight, pattern, or realization

**Anchor line:** One sharp, memorable line that could stand alone as a quote.

**Close:** Back to the key message. Grounded. No dramatic wrap-up.

**CTA:** Simple and direct. No hype.

**Do not say:** 3-4 specific phrases or angles that weaken tone for ${client.name}

## 3. What This Content Should Feel Like

4-6 specific descriptors defining the emotional register of today's session. Make them specific to ${client.name} and their audience, not generic creator descriptors.

## 4. What to Wear

Break down by content type and location. Realistic. Aligned with environment. No over-styling. Specific direction for each setup.

## 5. Environment Setup

For each filming location or content type: exact location, lighting setup, camera angle, background details. Real environments beat fake sets.

## 6. Stories to Pull From

4-6 SPECIFIC stories from ${client.name}'s real life tied to today's topics. Each needs a 2-3 sentence setup so they remember the context. Must be real moments, not generic advice. Must be reusable across multiple pieces.

## 7. Hooks to Open With

One strong hook per piece. Short, direct, scroll-stopping, completely natural. No yes/no questions. No cliches.

## 8. Things to Avoid Today

5-7 specific things that will weaken this content. Specific to ${client.name}, not generic advice.

## 9. Post-Session Checklist

- Audio quality checked on playback before leaving
- Minimum 2 takes per piece
- B-roll and environment shots captured
- Standout moments flagged with timestamp
- Repurposing notes: which pieces become which platform versions

## 10. Content Breakdown by Platform

For each platform in ${client.platforms}: how each piece gets used, format, length, tone adjustment. One line per platform per piece. Same message, different delivery.

## 11. Monetization Angle

**What this content warms people up for:** The specific service, offer, or next step for ${client.name}

**Where soft conversion happens:** DMs / link in bio / comments / email specific per piece

**What type of lead this attracts:** Name the exact person and their specific situation. Not a broad demographic.

---

Write like a high-level creative director who planned this entire session. Remove hesitation. Make filming feel obvious and executable.
`

const HASHTAG_PROMPT = (niche, platform, angle, currentFollowers) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

NICHE: ${niche}
PLATFORM: ${platform}
CONTENT ANGLE: ${angle}
ACCOUNT SIZE: ${currentFollowers || 'Under 10K'} followers

Generate a complete, tiered hashtag strategy for this niche on ${platform} right now. Every hashtag must be real and currently active.

# Hashtag Strategy: ${niche} on ${platform}

## Tier 1 Niche (under 100K posts)
10 hashtags that are specific enough to reach a targeted, engaged audience.
For each: hashtag, approximate post count, why it works for this account.

## Tier 2 Mid-Range (100K–1M posts)
10 hashtags with real reach but not oversaturated.
For each: hashtag, approximate post count, content style that wins here.

## Tier 3 Broad (1M+ posts)
5 hashtags for discovery. Use sparingly these are competitive.
For each: hashtag, approximate post count, when to use it.

## Banned / Shadowbanned Risk
5 hashtags in this niche that are commonly used but hurt reach. Avoid these.

## Recommended Stack (copy-paste ready)
The exact 20-25 hashtag combination optimized for this account size and niche.
Put niche tags first, mid-range second, broad last.

## Rotation Strategy
How to rotate hashtags across posts to avoid the repetition penalty.
`;

function HashtagResearch() {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [angle, setAngle] = useState('emotional');
  const [followers, setFollowers] = useState('Under 10K');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [liveData, setLiveData] = useState('');

  const fetchLive = async () => {
    if (!niche) return;
    setFetching(true); setLiveData('');
    const res = await perp(`What are the most effective and currently active hashtags for ${niche} content on ${platform} in 2026? Include post counts and engagement levels. Which hashtags are oversaturated or shadowbanned?`);
    setLiveData(res); setFetching(false);
  };

  const run = async () => {
    if (!niche) return;
    setLoading(true); setOut('');
    const angleLabel = ANGLES.find(a=>a.id===angle)?.label || angle;
    const combined = HASHTAG_PROMPT(niche, platform, angleLabel, followers) + (liveData ? `\n\nLIVE RESEARCH DATA:\n${liveData}` : '');
    const res = await ai(combined);
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <span style={{fontSize:32}}>##</span>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Hashtag Research</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Perplexity pulls live hashtag data. SIGNAL builds a tiered strategy with a copy-paste ready stack and rotation plan.</p>
        </div>
      </div>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Niche / Topic</SecLabel>
            <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. Colorado real estate, mindset coaching, endurance athlete"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Account Size</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Under 1K','1K–10K','10K–50K','50K–100K','100K+'].map(f=>(
                <button key={f} onClick={()=>setFollowers(f)} style={{background:followers===f?'#EEF2FF':'#F9FAFB',color:followers===f?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Instagram','TikTok','X','LinkedIn','YouTube'].map(p=>(
                <button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <SecLabel>Content Angle</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {ANGLES.map(a=>(
                <button key={a.id} onClick={()=>setAngle(a.id)} style={{background:angle===a.id?'#EEF2FF':'#F9FAFB',color:angle===a.id?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontSize:10,fontWeight:700}}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button onClick={fetchLive} disabled={fetching||!niche} style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'9px 16px',cursor:'pointer',fontSize:12,fontWeight:700}}>{fetching?'Pulling live data...':'Pull Live Data First'}</button>
          <RedBtn onClick={run} disabled={loading||!niche}>{loading?'Researching...':'## Build Hashtag Strategy'}</RedBtn>
        </div>
        {liveData && <div style={{marginTop:12,background:'#F9FAFB',borderRadius:8,padding:'10px',fontSize:11,color:'rgba(255,255,255,0.5)',maxHeight:80,overflowY:'auto'}}>{liveData.slice(0,300)}...</div>}
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Hashtag Strategy: ${niche} on ${platform}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT SERIES PLANNER
// ═════════════════════════════════════════════════════════════════════════════
const SERIES_PROMPT = (seriesName, theme, platform, episodeCount, client, cadence) => `
${client ? `CLIENT: ${client.name} (${client.handle}). Voice: ${client.voice}` : VOICE}
${CONTENT_SOP}
${SWARBRICK}

Series Name: "${seriesName}"
Core Theme: ${theme}
Platform: ${platform}
Episodes: ${episodeCount}
Cadence: ${cadence}

Plan a complete content series that runs like a show, not random posts. Every episode connects to the arc.

# Content Series: "${seriesName}"

## Series Identity
The one-paragraph pitch: what this series is, who it's for, and why they come back every episode.

## Series Hook
The one line that makes someone subscribe specifically for this series.

## Recurring Format
The exact structure every episode follows. Predictable enough to build habit, flexible enough to stay fresh.

## Episode Plan (all ${episodeCount} episodes)
For each episode:
- Episode number and title
- Core topic or story
- Opening hook (first line)
- Key point or reveal
- Episode-specific CTA
- Connection to the series arc

## Series Branding
Hashtag for the series. How to visually identify it in the feed. Audio or music direction.

## Growth Arc
How the series builds: what makes episode 6 more compelling than episode 1. How the audience grows with it.

## Repurposing Plan
How each episode becomes additional content: clips, carousels, quotes, email newsletter sections.
`;

function ContentSeriesPlanner() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [seriesName, setSeriesName] = useState('');
  const [theme, setTheme] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [episodeCount, setEpisodeCount] = useState('12');
  const [cadence, setCadence] = useState('Weekly');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Series Planner</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Plan a named content series that runs like a show. Every episode mapped, connected, and optimized to build audience habit.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Series Name</SecLabel>
            <input value={seriesName} onChange={e=>setSeriesName(e.target.value)} placeholder="e.g. Monday Mindset, Colorado Real Talk, The 5 AM Files"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Core Theme</SecLabel>
            <input value={theme} onChange={e=>setTheme(e.target.value)} placeholder="e.g. Discipline over motivation, real estate truth, showing up daily"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['Instagram','YouTube','TikTok','LinkedIn','Podcast'].map(p=><button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Episodes</SecLabel>
            <div style={{display:'flex',gap:5}}>
              {['6','8','12','16','24','52'].map(n=><button key={n} onClick={()=>setEpisodeCount(n)} style={{background:episodeCount===n?'#EEF2FF':'#F9FAFB',color:episodeCount===n?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{n}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Cadence</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['Daily','3x/week','Weekly','Bi-weekly'].map(c=><button key={c} onClick={()=>setCadence(c)} style={{background:cadence===c?'#EEF2FF':'#F9FAFB',color:cadence===c?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{c}</button>)}
            </div>
          </div>
        </div>
        <SecLabel>Client (optional)</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          <button onClick={()=>setSelectedClient(null)} style={{background:!selectedClient?'#EEF2FF':'#F9FAFB',color:!selectedClient?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>My Voice</button>
          {clients.filter(c=>!c.isDefault).map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
        </div>
        <RedBtn onClick={async()=>{if(!seriesName||!theme)return;setLoading(true);setOut('');const r=await ai(SERIES_PROMPT(seriesName,theme,platform,episodeCount,selectedClient?.isDefault?null:selectedClient,cadence));setOut(r);setLoading(false);}} disabled={loading||!seriesName||!theme}>
          {loading?'Planning series...':'Plan Full Series'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Series Plan: "${seriesName}"`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIO OPTIMIZER (dedicated, more thorough than profile audit)
// ═════════════════════════════════════════════════════════════════════════════
const BIO_OPTIMIZER_PROMPT = (client, platform, currentBio, goals) => `
${VOICE}

CLIENT: ${client.name} (${client.handle})
PLATFORM: ${platform}
CURRENT BIO: ${currentBio || 'Not provided write from scratch based on client profile'}
GOALS: ${goals || 'Grow followers, drive leads, build authority'}
VOICE: ${client.voice || 'Direct, no fluff'}
OFFERS: ${client.notes || 'Not specified'}

Write 3 bio variations optimized for ${platform}. Each must be different enough to actually test.

# Bio Optimization: ${client.name} on ${platform}

## What the Current Bio Gets Wrong
Specific problems with the existing bio. Not generic look at what's there and diagnose it.

## The 3 Core Jobs a ${platform} Bio Must Do
For this specific account and goal.

## Variation 1 Authority First
Leads with credibility and expertise. Who you are and why you matter.
[Complete bio, ready to paste]
Character count: [X/${platform === 'Instagram' ? '150' : platform === 'X' ? '160' : platform === 'TikTok' ? '80' : '220'}]

## Variation 2 Outcome First
Leads with what the audience gets. What changes for them by following.
[Complete bio, ready to paste]
Character count: [X]

## Variation 3 Personality First
Leads with voice and identity. Makes them feel like they already know you.
[Complete bio, ready to paste]
Character count: [X]

## Recommended Variation
Which to use and why. What to A/B test.

## Name Field Optimization
What to put in the name field for maximum SEO on ${platform}.

## Link Strategy
What the link should go to and what the CTA above it should say.
`;

function BioOptimizer() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [platform, setPlatform] = useState('Instagram');
  const [currentBio, setCurrentBio] = useState('');
  const [goals, setGoals] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Bio Optimizer</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>3 bio variations per platform authority-first, outcome-first, personality-first. Name field SEO and link strategy included.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Client</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {clients.map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['Instagram','TikTok','X','LinkedIn','YouTube','Facebook'].map(p=><button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>)}
            </div>
          </div>
        </div>
        <SecLabel>Current Bio (paste to get a diagnosis)</SecLabel>
        <textarea value={currentBio} onChange={e=>setCurrentBio(e.target.value)} rows={3}
          placeholder="Paste current bio here, or leave blank to write from scratch"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'}}/>
        <SecLabel>Primary Goals for This Platform</SecLabel>
        <input value={goals} onChange={e=>setGoals(e.target.value)} placeholder="e.g. Drive real estate leads, grow email list, build podcast listeners"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>
        <RedBtn onClick={async()=>{if(!selectedClient)return;setLoading(true);setOut('');const r=await ai(BIO_OPTIMIZER_PROMPT(selectedClient,platform,currentBio,goals));setOut(r);setLoading(false);}} disabled={loading||!selectedClient}>
          {loading?'Optimizing...':'Optimize Bio'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Bio Optimization: ${selectedClient?.name} — ${platform}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING CALCULATOR
// ═════════════════════════════════════════════════════════════════════════════
const PRICING_PROMPT = (niche, platforms, followers, engagementRate, services, market) => `
${VOICE}
Today: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}

NICHE: ${niche}
PLATFORMS: ${platforms}
FOLLOWERS: ${followers}
ENGAGEMENT RATE: ${engagementRate}%
SERVICES TO PRICE: ${services}
MARKET: ${market || 'US'}

Generate a complete pricing guide. Be specific use real market rates for 2026. No vague ranges.

# Pricing Guide: ${niche} Creator

## Market Context
What creators at this level are actually charging right now. Where this account sits in the market.

## Service Pricing

### Brand Deals and Sponsored Content
- Instagram Reel (dedicated): $[range]
- Instagram Post (feed): $[range]
- Instagram Story sequence: $[range]
- TikTok dedicated: $[range]
- YouTube integration (mid-roll): $[range]
- YouTube dedicated: $[range]
- LinkedIn sponsored post: $[range]
Reasoning: why these rates for this account size and engagement.

### UGC (User Generated Content)
Rates for creating content the brand owns and posts themselves.
- 30-second video: $[amount]
- 60-second video: $[amount]
- Photo set (5 images): $[amount]
- Full package (video + photos + b-roll): $[amount]

### Coaching and Consulting
If applicable to this niche:
- 1:1 session (60 min): $[amount]
- Group program: $[amount]
- VIP day: $[amount]

### Real Estate (if applicable)
- Referral fee structure
- Content-to-lead conversion expectations

### Agency / Content Creation Services
- Monthly retainer: $[range]
- Per deliverable rates

## Negotiation Guide
How to respond when a brand lowballs. What to never accept. When to walk away.

## Rate Increase Strategy
When to raise rates, by how much, and how to tell current clients.

## Red Flags
Types of deals to avoid regardless of the money.
`;

function PricingCalculator() {
  const [niche, setNiche] = useState('Mindset coaching, real estate, Colorado lifestyle');
  const [platforms, setPlatforms] = useState(['Instagram','YouTube']);
  const [followers, setFollowers] = useState('2K–10K');
  const [engagementRate, setEngagementRate] = useState('4');
  const [services, setServices] = useState(['Brand Deals','UGC','Coaching','Real Estate']);
  const [market, setMarket] = useState('US');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeClient] = useActiveClient();

  const toggleItem = (arr, setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(x=>x!==val) : [...prev, val]);

  const followerRanges = ['Under 1K','1K–5K','2K–10K','10K–50K','50K–100K','100K–500K','500K+'];
  const serviceOptions = ['Brand Deals','UGC','Coaching','Consulting','Real Estate','Agency Retainer','Speaking','Digital Products'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Pricing Calculator</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Real 2026 market rates for brand deals, UGC, coaching, and agency services. Based on your follower count, engagement, and niche.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Niche Description</SecLabel>
        <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. Fitness coaching, Colorado real estate, mindset content"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:14,boxSizing:'border-box'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Follower Range</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {followerRanges.map(f=><button key={f} onClick={()=>setFollowers(f)} style={{background:followers===f?'#EEF2FF':'#F9FAFB',color:followers===f?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700}}>{f}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Engagement Rate (%)</SecLabel>
            <input value={engagementRate} onChange={e=>setEngagementRate(e.target.value)} placeholder="e.g. 4.2"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Active Platforms</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {PLATFORMS.map(p=><button key={p} onClick={()=>toggleItem(platforms,setPlatforms,p)} style={{background:platforms.includes(p)?'#EEF2FF':'#F9FAFB',color:platforms.includes(p)?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700}}>{p}</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Services to Price</SecLabel>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {serviceOptions.map(s=><button key={s} onClick={()=>toggleItem(services,setServices,s)} style={{background:services.includes(s)?'#EEF2FF':'#F9FAFB',color:services.includes(s)?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700}}>{s}</button>)}
            </div>
          </div>
        </div>
        <RedBtn onClick={async()=>{if(!niche)return;setLoading(true);setOut('');const r=await ai(PRICING_PROMPT(niche,platforms.join(', '),followers,engagementRate,services.join(', '),market));setOut(r);setLoading(false);}} disabled={loading||!niche}>
          {loading?'Calculating rates...':'Generate Pricing Guide'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Pricing Guide: ${niche}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORY ARC PLANNER
// ═════════════════════════════════════════════════════════════════════════════
const STORY_ARC_PROMPT = (client, campaign, duration, goal, platforms) => `
${client ? `CLIENT: ${client.name} (${client.handle}). Voice: ${client.voice}` : VOICE}
${CONTENT_SOP}

Campaign: "${campaign}"
Story Arc Duration: ${duration} days
Goal: ${goal}
Platforms: ${platforms}

Plan the complete story arc for the Instagram and Facebook Stories that runs alongside this campaign.
Stories move people emotionally. Each one serves a specific funnel purpose.

# Story Arc: "${campaign}"

## Arc Strategy
The emotional journey from Day 1 to Day ${duration}. What the audience feels at each phase.

## Daily Story Plan

For each day include:
- Day number and phase (Awareness / Connection / Trust / Proof / Urgency / Close)
- Story purpose: what this story accomplishes in the funnel
- Slide count: how many slides
- Slide breakdown: what each slide contains (visual + text/voice)
- CTA: exact swipe-up text or sticker prompt
- Emotional target: how they feel after watching

${Array.from({length: Math.min(parseInt(duration)||7, 30)}, (_,i) => `### Day ${i+1}`).join('\n')}

## Reusable Story Templates
3 story templates that work throughout the arc save, share, poll types.

## Story Highlights Plan
Which stories to save to Highlights and how to organize them.
`;

function StoryArcPlanner() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [campaign, setCampaign] = useState('');
  const [duration, setDuration] = useState('7');
  const [goal, setGoal] = useState('');
  const [platforms, setPlatforms] = useState(['Instagram']);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const goalPresets = ['Launch lead magnet','Drive podcast listeners','Book real estate calls','Build community','Promote challenge','Announce new offer'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Story Arc Planner</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Plan the complete Stories sequence for a campaign. Every slide mapped, every CTA purposeful, every day moves the funnel.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          <button onClick={()=>setSelectedClient(null)} style={{background:!selectedClient?'#EEF2FF':'#F9FAFB',color:!selectedClient?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>My Account</button>
          {clients.filter(c=>!c.isDefault).map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
        </div>
        <SecLabel>Campaign or Context</SecLabel>
        <input value={campaign} onChange={e=>setCampaign(e.target.value)} placeholder="e.g. Spring Lead Magnet Launch, New Podcast Series, Real Estate Market Update"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:14,boxSizing:'border-box'}}/>
        <SecLabel>Goal</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
          {goalPresets.map(g=><button key={g} onClick={()=>setGoal(g)} style={{background:goal===g?'#EEF2FF':'#F9FAFB',color:goal===g?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{g}</button>)}
        </div>
        <input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Or describe the specific goal..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:14,boxSizing:'border-box'}}/>
        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <div>
            <SecLabel>Duration</SecLabel>
            <div style={{display:'flex',gap:5}}>
              {['3','5','7','10','14','21','30'].map(d=><button key={d} onClick={()=>setDuration(d)} style={{background:duration===d?'#EEF2FF':'#F9FAFB',color:duration===d?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{d}d</button>)}
            </div>
          </div>
          <div>
            <SecLabel>Platforms</SecLabel>
            <div style={{display:'flex',gap:5}}>
              {['Instagram','Facebook','TikTok'].map(p=><button key={p} onClick={()=>setPlatforms(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{background:platforms.includes(p)?'#EEF2FF':'#F9FAFB',color:platforms.includes(p)?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>)}
            </div>
          </div>
        </div>
        <RedBtn onClick={async()=>{if(!campaign||!goal)return;setLoading(true);setOut('');const r=await ai(STORY_ARC_PROMPT(selectedClient?.isDefault?null:selectedClient,campaign,duration,goal,platforms.join(', ')));setOut(r);setLoading(false);}} disabled={loading||!campaign||!goal}>
          {loading?'Planning arc...':'Plan Story Arc'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Story Arc: ${campaign}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUEST PREP KIT
// ═════════════════════════════════════════════════════════════════════════════
const GUEST_PREP_PROMPT = (client, guestName, guestBio, guestHandle, episodeTopic, recordDate) => `
${client ? `HOST: ${client.name} (${client.handle})` : VOICE}

PODCAST: ${client?.name || 'Everyday Elevations'} Podcast
GUEST: ${guestName}
GUEST BIO: ${guestBio}
GUEST HANDLE: ${guestHandle || 'Not provided'}
EPISODE TOPIC: ${episodeTopic}
RECORD DATE: ${recordDate || 'TBD'}

Build a complete guest prep kit. Two documents in one:
1. What the host gets (prep intel, questions, topics to avoid)
2. What the guest gets (welcome email, tech instructions, what to expect)

# Guest Prep Kit: ${guestName}

## HOST PREP

### Guest Intelligence
Background on ${guestName}: their story, what they are known for, their best content, their audience, what they care about most.

### Episode Strategy
Why this guest now. What the audience will get. The specific angle to take.

### 10 Interview Questions
Ordered for narrative arc. Start with their story, build to insight, end with what the audience can do.
Each question: the question + why it is being asked + the likely direction it goes.

### Topics to Avoid
Anything sensitive, overdone, or off-brand based on their public profile.

### Soundbite Setup Questions
3 questions almost guaranteed to produce a shareable quote.

---

## GUEST WELCOME PACKAGE

### Welcome Email
Subject line + full email welcoming them to the show. Warm, professional, excited without being cringe.

### Tech Requirements
Exactly what they need: equipment, software, internet, environment. Specific enough that a non-technical person can get it right.

### What to Expect
Timeline for the call, how long it runs, what topics will be covered, how the episode will be promoted.

### Promotional Assets Checklist
What the host needs from the guest before and after the episode.

### Post-Episode Follow-Up Sequence
Day 1: Thank you. Day 7: Episode live. Day 30: Check-in. Each fully written.
`;

function GuestPrepKit() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestBio, setGuestBio] = useState('');
  const [guestHandle, setGuestHandle] = useState('');
  const [episodeTopic, setEpisodeTopic] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [fetching, setFetching] = useState(false);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const fetchGuestIntel = async () => {
    if (!guestName) return;
    setFetching(true);
    const res = await perp(`Research ${guestName} ${guestHandle ? '(' + guestHandle + ')' : ''}: their background, what they are known for, their best content, their audience, recent projects in 2026, and their social media presence.`);
    setGuestBio(res.slice(0, 1000));
    setFetching(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Guest Prep Kit</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Complete prep for host and guest. Intel, 10 questions, tech requirements, welcome email, and post-episode follow-up sequence.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Podcast Host</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          <button onClick={()=>setSelectedClient(null)} style={{background:!selectedClient?'#EEF2FF':'#F9FAFB',color:!selectedClient?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>Jason (Default)</button>
          {clients.filter(c=>!c.isDefault).map(c=><button key={c.id} onClick={()=>setSelectedClient(c)} style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:selectedClient?.id===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.name}</button>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <SecLabel>Guest Name</SecLabel>
            <input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Full name"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Guest Handle</SecLabel>
            <input value={guestHandle} onChange={e=>setGuestHandle(e.target.value)} placeholder="@handle or website"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <div style={{flex:1}}>
            <SecLabel>Guest Bio / Background</SecLabel>
            <textarea value={guestBio} onChange={e=>setGuestBio(e.target.value)} rows={3}
              placeholder="Paste bio or leave blank to auto-research with Perplexity"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
          </div>
        </div>
        <button onClick={fetchGuestIntel} disabled={fetching||!guestName}
          style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:700,marginBottom:12}}>
          {fetching?'Researching guest...':'Auto-Research Guest with Perplexity'}
        </button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <div>
            <SecLabel>Episode Topic</SecLabel>
            <input value={episodeTopic} onChange={e=>setEpisodeTopic(e.target.value)} placeholder="e.g. Building mental toughness through endurance sports"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Record Date</SecLabel>
            <input value={recordDate} onChange={e=>setRecordDate(e.target.value)} placeholder="e.g. April 12, 2026"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
        </div>
        <RedBtn onClick={async()=>{if(!guestName||!episodeTopic)return;setLoading(true);setOut('');const r=await ai(GUEST_PREP_PROMPT(selectedClient?.isDefault?null:selectedClient,guestName,guestBio,guestHandle,episodeTopic,recordDate));setOut(r);setLoading(false);}} disabled={loading||!guestName||!episodeTopic}>
          {loading?'Building kit...':'Generate Guest Prep Kit'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Guest Prep Kit: ${guestName}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECTION HANDLER
// ═════════════════════════════════════════════════════════════════════════════
const OBJECTION_PROMPT = (client, context, objections) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}

CONTEXT: ${context}
OBJECTIONS TO HANDLE: ${objections}

Write complete, ready-to-use scripts for handling these objections. Every response should sound like a real person talking, not a sales script.

# Objection Handler: ${context}

For each objection, provide:

## "[Objection]"

**Why they say it:** What is really behind this objection. What fear, doubt, or circumstance is driving it.

**DM / Text Response:**
[Complete response, 2-4 sentences, conversational, copy-paste ready]

**Email Response:**
Subject: [subject line]
[Full email, warm and direct]

**In-Person / Call Response:**
[Word-for-word script, natural pacing, includes pause points]

**What NOT to say:**
[2-3 things that will kill the conversation]

**Follow-up if no response after 48 hours:**
[Short, non-pushy follow-up message]
`;

function ObjectionHandler() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [context, setContext] = useState('');
  const [customObjections, setCustomObjections] = useState('');
  const [selectedObjections, setSelectedObjections] = useState([]);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const contextPresets = [
    { id:'realestate', label:'Real Estate', objections:["I'm not ready to buy yet","I want to wait for rates to drop","I'm just browsing","I already have an agent","Your commission is too high","I can sell it myself"] },
    { id:'coaching', label:'Coaching / Consulting', objections:["I can't afford it right now","I need to think about it","I'm not sure it will work for me","Let me talk to my partner","I've tried things like this before","What makes you different?"] },
    { id:'podcast', label:'Podcast Guest Pitch', objections:["I'm too busy","I don't do podcasts","I don't have enough experience","What's the audience size?","Can you send me more info?"] },
    { id:'brand', label:'Brand Deal / Sponsorship', objections:["Your audience is too small","We don't have budget right now","We work with bigger creators","We need guaranteed numbers","We'll reach out when you grow"] },
    { id:'agency', label:'Agency Pitch', objections:["We handle social in-house","We've been burned before","We need to see results first","The budget isn't there","We're not sure about ROI"] },
  ];

  const activeContext = contextPresets.find(c=>c.id===context);
  const toggleObjection = (obj) => setSelectedObjections(prev=>prev.includes(obj)?prev.filter(o=>o!==obj):[...prev,obj]);

  const run = async () => {
    if (!context && !customObjections) return;
    setLoading(true); setOut('');
    const objList = selectedObjections.length > 0 ? selectedObjections.join('\n') : customObjections;
    const contextLabel = activeContext?.label || context;
    const res = await ai(OBJECTION_PROMPT(selectedClient?.isDefault?null:selectedClient, contextLabel, objList));
    setOut(res); setLoading(false);
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Objection Handler</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Every objection in real estate, coaching, podcast pitching, and agency sales. DM, email, and in-person scripts ready to use.</p>
        </div>
      </div>
      <Card>
        <SecLabel>Context</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {contextPresets.map(c=><button key={c.id} onClick={()=>{setContext(c.id);setSelectedObjections([]);}} style={{background:context===c.id?'#EEF2FF':'#F9FAFB',color:context===c.id?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>{c.label}</button>)}
        </div>
        {activeContext && (
          <>
            <SecLabel>Select Objections</SecLabel>
            <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:14}}>
              {activeContext.objections.map(obj=>(
                <button key={obj} onClick={()=>toggleObjection(obj)}
                  style={{background:selectedObjections.includes(obj)?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${selectedObjections.includes(obj)?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:8,padding:'10px 14px',cursor:'pointer',textAlign:'left',color:selectedObjections.includes(obj)?'#00C2FF':'#111827',fontSize:13,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:16,height:16,borderRadius:4,background:selectedObjections.includes(obj)?'#EEF2FF':'#F9FAFB',border:`2px solid ${selectedObjections.includes(obj)?'#2563EB':'rgba(255,255,255,0.2)'}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {selectedObjections.includes(obj)&&<span style={{color:'#000D1A',fontSize:10,fontWeight:900}}>✓</span>}
                  </div>
                  "{obj}"
                </button>
              ))}
            </div>
          </>
        )}
        <SecLabel>Custom Objections (one per line)</SecLabel>
        <textarea value={customObjections} onChange={e=>setCustomObjections(e.target.value)} rows={3}
          placeholder="Add your own objections here, one per line..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>
        <RedBtn onClick={run} disabled={loading||(selectedObjections.length===0&&!customObjections)}>
          {loading?'Writing responses...':'Generate Objection Scripts'}
        </RedBtn>
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`Objection Scripts: ${contextPresets.find(c=>c.id===context)?.label||context}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// A/B TEST TRACKER
// ═════════════════════════════════════════════════════════════════════════════
const AB_KEY = 'encis_abtests';

function ABTestTracker() {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:'',platform:'Instagram',type:'Hook',variantA:'',variantB:'',metric:'Saves',startDate:'',notes:''});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysisOut, setAnalysisOut] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => { try { const s=localStorage.getItem(AB_KEY); if(s){const d=JSON.parse(s);setTests(d.tests||[]);setResults(d.results||{});} } catch {} }, []);

  const save = (t, r) => { setTests(t); setResults(r); try { localStorage.setItem(AB_KEY, JSON.stringify({tests:t,results:r})); } catch {} };

  const addTest = () => {
    if (!form.name||!form.variantA||!form.variantB) return;
    const test = {...form, id:Date.now().toString(), status:'running', createdAt:Date.now()};
    const newTests = [test,...tests]; save(newTests, results); setForm({name:'',platform:'Instagram',type:'Hook',variantA:'',variantB:'',metric:'Saves',startDate:'',notes:''}); setShowForm(false);
  };

  const logResult = (testId, winner, aScore, bScore) => {
    const newResults = {...results, [testId]:{winner, aScore, bScore, loggedAt:Date.now()}};
    const newTests = tests.map(t=>t.id===testId?{...t,status:'complete'}:t);
    save(newTests, newResults);
  };

  const analyzeAll = async () => {
    const complete = tests.filter(t=>t.status==='complete');
    if (!complete.length) return;
    setLoading(true); setAnalysisOut('');
    const summary = complete.map(t=>{
      const r = results[t.id];
      return `Test: "${t.name}" (${t.platform}, ${t.type})\nVariant A: ${t.variantA}\nVariant B: ${t.variantB}\nWinner: Variant ${r?.winner|| 'TBD'} | A score: ${r?.aScore||'?'} | B score: ${r?.bScore|| '?'}`;
    }).join('\n\n');
    const res = await ai(`${VOICE}\n\nAnalyze these completed A/B tests and extract the winning patterns:\n\n${summary}\n\nProvide:\n1. Overall patterns: what is consistently winning\n2. Platform-specific insights\n3. 5 specific recommendations for future content based on the data\n4. What to test next`);
    setAnalysisOut(res); setLoading(false);
  };

  const types = ['Hook','Caption','Thumbnail','CTA','Format','Length','Posting Time'];
  const metrics = ['Saves','Shares','Comments','Reach','Profile Visits','Link Clicks','Follows'];
  const running = tests.filter(t=>t.status==='running');
  const completedTests = tests.filter(t=>t.status==='complete');

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>A/B Test Tracker</h2>
            <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Log content variations, track winners, and let SIGNAL find the patterns in what works.</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {completedTests.length >= 3 && <button onClick={analyzeAll} disabled={loading} style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>{loading?'Analyzing...':'Analyze All Results'}</button>}
          <button onClick={()=>setShowForm(p=>!p)} style={{background:'#2563EB',color:'#000D1A',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:800}}>+ New Test</button>
        </div>
      </div>

      {showForm && (
        <Card style={{marginBottom:16}}>
          <SecLabel>Test Name</SecLabel>
          <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Hook Test Discipline Post April"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {['Instagram','TikTok','X','YouTube','LinkedIn'].map(p=><button key={p} onClick={()=>setForm(f=>({...f,platform:p}))} style={{background:form.platform===p?'#EEF2FF':'#F9FAFB',color:form.platform===p?'#000D1A':'#111827',border:'none',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:10,fontWeight:700}}>{p}</button>)}
              </div>
            </div>
            <div>
              <SecLabel>Test Type</SecLabel>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {types.map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} style={{background:form.type===t?'#EEF2FF':'#F9FAFB',color:form.type===t?'#000D1A':'#111827',border:'none',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:10,fontWeight:700}}>{t}</button>)}
              </div>
            </div>
            <div>
              <SecLabel>Success Metric</SecLabel>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {metrics.map(m=><button key={m} onClick={()=>setForm(f=>({...f,metric:m}))} style={{background:form.metric===m?'#EEF2FF':'#F9FAFB',color:form.metric===m?'#000D1A':'#111827',border:'none',borderRadius:4,padding:'4px 8px',cursor:'pointer',fontSize:10,fontWeight:700}}>{m}</button>)}
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <SecLabel>Variant A</SecLabel>
              <textarea value={form.variantA} onChange={e=>setForm(p=>({...p,variantA:e.target.value}))} rows={3} placeholder="First version..."
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <SecLabel>Variant B</SecLabel>
              <textarea value={form.variantB} onChange={e=>setForm(p=>({...p,variantB:e.target.value}))} rows={3} placeholder="Second version..."
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,resize:'none',boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <RedBtn onClick={addTest} disabled={!form.name||!form.variantA||!form.variantB}>Add Test</RedBtn>
            <button onClick={()=>setShowForm(false)} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'9px 14px',fontSize:12,cursor:'pointer'}}>Cancel</button>
          </div>
        </Card>
      )}

      {running.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:'#f5a623',fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Running ({running.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {running.map(t=>(
              <div key={t.id} style={{background:'rgba(245,166,35,0.06)',border:'1px solid rgba(245,166,35,0.15)',borderRadius:10,padding:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,flexWrap:'wrap',gap:8}}>
                  <div>
                    <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{t.name}</div>
                    <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{t.platform} · {t.type} Tracking: {t.metric}</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>logResult(t.id,'A','','')} style={{background:'rgba(0,194,255,0.1)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>A Won</button>
                    <button onClick={()=>logResult(t.id,'B','','')} style={{background:'rgba(0,194,255,0.1)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>B Won</button>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div style={{background:'#FFFFFF',borderRadius:6,padding:'8px 10px'}}><div style={{fontSize:9,color:'#6B7280',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:3}}>Variant A</div><div style={{color:'rgba(255,255,255,0.75)',fontSize:12}}>{t.variantA}</div></div>
                  <div style={{background:'#FFFFFF',borderRadius:6,padding:'8px 10px'}}><div style={{fontSize:9,color:'#6B7280',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:3}}>Variant B</div><div style={{color:'rgba(255,255,255,0.75)',fontSize:12}}>{t.variantB}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedTests.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:'#27ae60',fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Completed ({completedTests.length})</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {completedTests.map(t=>{
              const r=results[t.id];
              return (
                <div key={t.id} style={{background:'rgba(39,174,96,0.05)',border:'1px solid rgba(39,174,96,0.15)',borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                  <div style={{flex:1}}>
                    <div style={{color:'#111827',fontWeight:600,fontSize:12}}>{t.name}</div>
                    <div style={{color:'#6B7280',fontSize:11}}>{t.platform} · {t.type}</div>
                  </div>
                  {r?.winner && <span style={{background:'rgba(39,174,96,0.15)',color:'#27ae60',borderRadius:5,padding:'3px 10px',fontSize:11,fontWeight:700}}>Variant {r.winner} Won</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',background:'#FFFFFF',borderRadius:12,border:'1px solid #E5E7EB'}}>
          
          <div style={{color:'#111827',fontWeight:700,marginBottom:8}}>No tests yet</div>
          <div style={{color:'#6B7280',fontSize:13}}>Start your first A/B test to build a database of what works.</div>
        </div>
      )}

      {analysisOut && <DocOutput text={analysisOut} title="A/B Test Pattern Analysis"/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIRAL FORMAT LIBRARY
// ═════════════════════════════════════════════════════════════════════════════
const VIRAL_FORMAT_PROMPT = (format, topic, platform, client) => `
${client ? `CLIENT: ${client.name}. Voice: ${client.voice}` : VOICE}
${CONTENT_SOP}
${SWARBRICK}

Viral Format: "${format.name}"
Format Description: ${format.desc}
Topic: ${topic}
Platform: ${platform}

Execute this viral format completely. Write the full script, caption, and hook. Make it feel native to the format and the platform.

# ${format.name} — ${platform}

## Why This Format Works
The psychological mechanism behind why this format performs. What makes people watch, save, or share.

## Full Script / Post
[Complete, camera-ready execution of this format on the given topic. Word for word. No placeholders.]

## Platform-Specific Caption
[Native caption for ${platform}. With CTA and hashtag strategy.]

## Thumbnail / Cover Frame
[Exact description of the visual that should accompany this content.]

## Variations
3 quick ways to use this same format on a different topic from the Swarbrick dimensions.
`;

function ViralFormatLibrary() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const formats = [
    { id:'day-in-life', name:'Day in My Life', cat:'Lifestyle', desc:'Follow someone through a real day. Authenticity drives connection. Works across all niches.', platforms:['Instagram','TikTok','YouTube'] },
    { id:'nobody-talks', name:'Nobody Talks About This', cat:'Education', desc:'Contrarian insight that challenges a common assumption. Triggers saves and shares.', platforms:['Instagram','TikTok','X','LinkedIn'] },
    { id:'learned-after', name:'What I Learned After X Years', cat:'Authority', desc:'Position expertise through lived experience. Works better with specific numbers.', platforms:['Instagram','LinkedIn','YouTube'] },
    { id:'things-stopped', name:'Things I Stopped Doing', cat:'Pattern Interrupt', desc:'Negative list format. Counterintuitive angle. High engagement because it challenges behavior.', platforms:['Instagram','TikTok','X'] },
    { id:'told-myself', name:'Lies I Told Myself', cat:'Vulnerability', desc:'Honest self-reflection that creates parasocial connection. Trust builder.', platforms:['Instagram','TikTok','YouTube'] },
    { id:'hot-take', name:'Hot Take', cat:'Opinion', desc:'Bold, potentially controversial claim stated with confidence. Reply bait. Use carefully.', platforms:['X','TikTok','Instagram','LinkedIn'] },
    { id:'morning-routine', name:'Morning Routine', cat:'Lifestyle', desc:'People are obsessed with other people\'s routines. Specific details outperform aspirational.', platforms:['Instagram','TikTok','YouTube'] },
    { id:'honest-review', name:'Honest Review', cat:'Trust', desc:'Raw, unsponsored opinion. Builds credibility because it acknowledges flaws.', platforms:['TikTok','YouTube','X'] },
    { id:'before-after', name:'Before and After', cat:'Transformation', desc:'The clearest proof of concept. Physical, mental, financial, or skill transformation.', platforms:['Instagram','TikTok','YouTube'] },
    { id:'pov', name:'POV Format', cat:'Storytelling', desc:'Second person immersive storytelling. High completion rates when opening line is specific.', platforms:['TikTok','Instagram'] },
    { id:'questions-ask', name:'Questions to Ask Yourself', cat:'Reflection', desc:'Introspective prompt list. Saves well because people want to return to it.', platforms:['Instagram','LinkedIn','X'] },
    { id:'unpopular-opinion', name:'Unpopular Opinion', cat:'Engagement', desc:'Starts debate. Comments go up because people must respond. High algorithm signal.', platforms:['Instagram','X','TikTok'] },
    { id:'storytime', name:'Storytime', cat:'Narrative', desc:'Single specific story with a turning point. The more specific, the more universal.', platforms:['TikTok','Instagram','YouTube'] },
    { id:'grwm', name:'Get Ready With Me (GRWM)', cat:'Lifestyle', desc:'Parallel narrative doing something physical while delivering insight. Retention format.', platforms:['TikTok','Instagram','YouTube'] },
    { id:'reading-comments', name:'Reading Comments / Responding', cat:'Community', desc:'Turns audience into content. Signals engagement. Builds parasocial connection.', platforms:['TikTok','YouTube','Instagram'] },
    { id:'stitch-duet', name:'Stitch or Duet Response', cat:'Reach', desc:'Borrow someone else\'s momentum. Agree, disagree, or add to their take.', platforms:['TikTok'] },
    { id:'checklist', name:'The Checklist', cat:'Education', desc:'Actionable list format. Saves more than almost anything else because it is reference material.', platforms:['Instagram','LinkedIn','TikTok'] },
    { id:'what-no-one-tells', name:'What No One Tells You About', cat:'Education', desc:'Expectation vs reality. Creates urgency to watch because everyone fears being uninformed.', platforms:['TikTok','Instagram','YouTube','LinkedIn'] },
  ];

  const categories = ['All', ...new Set(formats.map(f=>f.cat))];
  const filtered = filter === 'All' ? formats : formats.filter(f=>f.cat===filter);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Viral Format Library</h2>
          <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>18 proven formats with the psychology behind why they work. Pick a format, enter a topic, get a complete camera-ready execution.</p>
        </div>
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {categories.map(c=><button key={c} onClick={()=>setFilter(c)} style={{background:filter===c?'#EEF2FF':'#F9FAFB',color:filter===c?'#000D1A':'#111827',border:'none',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>{c}</button>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8,marginBottom:20}}>
        {filtered.map(f=>(
          <button key={f.id} onClick={()=>setSelectedFormat(f)}
            style={{background:selectedFormat?.id===f.id?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${selectedFormat?.id===f.id?'rgba(0,194,255,0.3)':'rgba(255,255,255,0.07)'}`,borderRadius:10,padding:'12px',cursor:'pointer',textAlign:'left'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div style={{color:'#111827',fontWeight:700,fontSize:12}}>{f.name}</div>
              <span style={{fontSize:9,color:'#00C2FF',fontWeight:700,background:'rgba(0,194,255,0.1)',borderRadius:3,padding:'1px 5px'}}>{f.cat}</span>
            </div>
            <div style={{color:'#6B7280',fontSize:11,lineHeight:1.5,marginBottom:6}}>{f.desc}</div>
            <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
              {f.platforms.map(p=><span key={p} style={{fontSize:9,color:'rgba(255,255,255,0.4)',background:'#FFFFFF',borderRadius:3,padding:'1px 5px'}}>{p}</span>)}
            </div>
          </button>
        ))}
      </div>

      {selectedFormat && (
        <Card>
          <div style={{marginBottom:14}}>
            <div style={{color:'#00C2FF',fontWeight:800,fontSize:15,marginBottom:4}}>{selectedFormat.name}</div>
            <div style={{color:'#6B7280',fontSize:12,lineHeight:1.6}}>{selectedFormat.desc}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <SecLabel>Topic</SecLabel>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="What is this about?"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {(selectedFormat.platforms).map(p=><button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>{p}</button>)}
              </div>
            </div>
          </div>
          <RedBtn onClick={async()=>{if(!topic)return;setLoading(true);setOut('');const r=await ai(VIRAL_FORMAT_PROMPT(selectedFormat,topic,platform,selectedClient?.isDefault?null:selectedClient));setOut(r);setLoading(false);}} disabled={loading||!topic}>
            {loading?'Executing format...':'Execute This Format'}
          </RedBtn>
        </Card>
      )}
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title={`${selectedFormat?.name}: ${topic}`}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVENUE ATTRIBUTION TRACKER
// ═════════════════════════════════════════════════════════════════════════════
const REVENUE_KEY = 'encis_revenue';

function RevenueAttribution() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({contentTitle:'',platform:'Instagram',format:'Reel',outcome:'',outcomeType:'Inquiry',revenue:'',date:'',notes:''});
  const [analysisOut, setAnalysisOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { try { const s=localStorage.getItem(REVENUE_KEY); if(s) setEntries(JSON.parse(s)); } catch {} }, []);
  const save = (list) => { setEntries(list); try { localStorage.setItem(REVENUE_KEY, JSON.stringify(list)); } catch {} };

  const addEntry = () => {
    if (!form.contentTitle||!form.outcome) return;
    save([{...form,id:Date.now().toString(),createdAt:Date.now()},...entries]);
    setForm({contentTitle:'',platform:'Instagram',format:'Reel',outcome:'',outcomeType:'Inquiry',revenue:'',date:'',notes:''});
    setShowForm(false);
  };

  const analyze = async () => {
    if (entries.length < 3) return;
    setLoading(true); setAnalysisOut('');
    const summary = entries.slice(0,30).map(e=>`${e.platform} ${e.format}: "${e.contentTitle}" → ${e.outcomeType}: ${e.outcome}${e.revenue?` ($${e.revenue})`:''}. Date: ${e.date}. Notes: ${e.notes|| 'none'}`).join('\n');
    const res = await ai(`${VOICE}\n\nAnalyze this content-to-revenue attribution data:\n\n${summary}\n\nProvide:\n1. Which platforms and formats are generating the most revenue opportunities\n2. Which content topics correlate with high-value outcomes\n3. The typical path from content to conversion for this account\n4. What to create more of based on ROI\n5. Estimated content ROI if tracked fully`);
    setAnalysisOut(res); setLoading(false);
  };

  const outcomeTypes = ['Inquiry','Booked Call','Closed Deal','Email Signup','Product Sale','Coaching Client','Referral','Partnership'];
  const totalRevenue = entries.filter(e=>e.revenue).reduce((sum,e)=>sum+parseFloat(e.revenue||0),0);
  const byPlatform = PLATFORMS.map(p=>({platform:p,count:entries.filter(e=>e.platform===p).length,revenue:entries.filter(e=>e.platform===p&&e.revenue).reduce((s,e)=>s+parseFloat(e.revenue||0),0)})).filter(p=>p.count>0);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Revenue Attribution</h2>
            <p style={{color:'#374151',margin:'4px 0 0',fontSize:13}}>Tag content to real outcomes. Prove content creates revenue, not just followers.</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {entries.length >= 3 && <button onClick={analyze} disabled={loading} style={{background:'rgba(0,194,255,0.08)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.2)',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>{loading?'Analyzing...':'Analyze ROI'}</button>}
          <button onClick={()=>setShowForm(p=>!p)} style={{background:'#2563EB',color:'#000D1A',border:'none',borderRadius:8,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:800}}>+ Log Attribution</button>
        </div>
      </div>

      {entries.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8,marginBottom:20}}>
          <div style={{background:'rgba(39,174,96,0.08)',border:'1px solid rgba(39,174,96,0.2)',borderRadius:10,padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:'#27ae60'}}>${totalRevenue.toLocaleString()}</div>
            <div style={{fontSize:10,color:'#6B7280',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>Attributed Revenue</div>
          </div>
          <div style={{background:'rgba(0,194,255,0.06)',border:'1px solid #D1D5DB',borderRadius:10,padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:'#00C2FF'}}>{entries.length}</div>
            <div style={{fontSize:10,color:'#6B7280',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>Total Attributions</div>
          </div>
          {byPlatform.map(p=>(
            <div key={p.platform} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:800,color:'#111827'}}>{p.count}</div>
              <div style={{fontSize:10,color:'#6B7280',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{p.platform}</div>
              {p.revenue>0&&<div style={{fontSize:10,color:'#27ae60',marginTop:2}}>${p.revenue.toLocaleString()}</div>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Card style={{marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <SecLabel>Content Title</SecLabel>
              <input value={form.contentTitle} onChange={e=>setForm(p=>({...p,contentTitle:e.target.value}))} placeholder="What post drove this outcome?"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
            <div>
              <SecLabel>Date</SecLabel>
              <input value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} placeholder="When did this happen?"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
            {PLATFORMS.map(p=><button key={p} onClick={()=>setForm(f=>({...f,platform:p}))} style={{background:form.platform===p?'#EEF2FF':'#F9FAFB',color:form.platform===p?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700}}>{p}</button>)}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
            {outcomeTypes.map(o=><button key={o} onClick={()=>setForm(f=>({...f,outcomeType:o}))} style={{background:form.outcomeType===o?'#EEF2FF':'#F9FAFB',color:form.outcomeType===o?'#000D1A':'#111827',border:'none',borderRadius:5,padding:'5px 9px',cursor:'pointer',fontSize:10,fontWeight:700}}>{o}</button>)}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <SecLabel>Outcome Description</SecLabel>
              <input value={form.outcome} onChange={e=>setForm(p=>({...p,outcome:e.target.value}))} placeholder="e.g. Booked listing consultation, 3 DMs asking about coaching"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
            <div>
              <SecLabel>Revenue Value (optional, $)</SecLabel>
              <input value={form.revenue} onChange={e=>setForm(p=>({...p,revenue:e.target.value}))} placeholder="e.g. 8500"
                style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <RedBtn onClick={addEntry} disabled={!form.contentTitle||!form.outcome}>Log Attribution</RedBtn>
            <button onClick={()=>setShowForm(false)} style={{background:'#FFFFFF',color:'#6B7280',border:'none',borderRadius:8,padding:'9px 14px',fontSize:12,cursor:'pointer'}}>Cancel</button>
          </div>
        </Card>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {entries.length===0&&(
          <div style={{textAlign:'center',padding:'3rem',background:'#FFFFFF',borderRadius:12,border:'1px solid #E5E7EB'}}>
            
            <div style={{color:'#111827',fontWeight:700,marginBottom:8}}>No attributions yet</div>
            <div style={{color:'#6B7280',fontSize:13,maxWidth:300,margin:'0 auto'}}>Every time a post leads to an inquiry, booking, or sale log it here. Build proof that content drives revenue.</div>
          </div>
        )}
        {entries.map(e=>(
          <div key={e.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <div style={{flex:1}}>
              <div style={{color:'#111827',fontWeight:600,fontSize:12}}>{e.contentTitle}</div>
              <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{e.platform} · {e.format} → {e.outcomeType}</div>
              <div style={{color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:2}}>{e.outcome}</div>
            </div>
            {e.revenue&&<div style={{color:'#27ae60',fontWeight:800,fontSize:14}}>${parseFloat(e.revenue).toLocaleString()}</div>}
            <button onClick={()=>save(entries.filter(x=>x.id!==e.id))} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',cursor:'pointer',fontSize:14}}>×</button>
          </div>
        ))}
      </div>

      {loading&&<Spin/>}
      {analysisOut&&<DocOutput text={analysisOut} title="Revenue Attribution Analysis"/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 4: AUTO-LEARNING VOICE FINGERPRINT
// When content is rated in Content Memory, extract language patterns and
// offer to update the active client's voice fingerprint automatically
// ═════════════════════════════════════════════════════════════════════════════
const AUTO_VOICE_UPDATE_PROMPT = (clientName, currentFingerprint, viralSamples) => `
You are refining a brand voice fingerprint based on content that actually went viral.

CLIENT: ${clientName}

CURRENT FINGERPRINT SUMMARY:
Tone: ${currentFingerprint?.tone || 'Unknown'}
Vocabulary: ${(currentFingerprint?.vocabulary || []).join(', ')}
Personality: ${currentFingerprint?.personality || 'Unknown'}

CONTENT THAT PERFORMED AT VIRAL LEVEL (rated):
${viralSamples.map((s, i) => `${i + 1}. [${s.type}] "${s.title || s.topic || 'Untitled'}"\nPreview: ${s.preview || s.title || ''}`).join('\n\n')}

Analyze what these viral pieces have in common. What specific language patterns, structural choices, and voice elements made them work? Update the fingerprint to reflect what is actually proven to perform.

Return a JSON object with these exact fields update only what the viral data supports, preserve what is already working:
{
  "tone": "updated tone description",
  "pace": "sentence pace preference",
  "vocabulary": ["12 words or phrases from the viral content"],
  "avoids": ["8 phrases this voice never uses"],
  "structures": ["3 sentence patterns from the viral content"],
  "themes": ["5 recurring themes in high-performing content"],
  "openings": ["4 opening styles from viral pieces"],
  "ctas": ["3 CTA styles that performed well"],
  "personality": "updated personality description based on what actually worked",
  "dos": ["6 writing rules confirmed by viral performance"],
  "donts": ["6 rules confirmed by what did NOT perform"],
  "sample_hook": "A hook in this exact proven voice on the topic of discipline",
  "autoUpdatedAt": "${new Date().toISOString()}",
  "viralSampleCount": ${viralSamples.length}
}

Return ONLY valid JSON. No markdown, no explanation.`;

// Hook: watches content memory for viral ratings and triggers fingerprint update
function useAutoVoiceUpdate(activeClient) {
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState(0);

  useEffect(() => {
    if (!activeClient) return;
    const interval = setInterval(() => {
      try {
        const log = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
        const fps = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}');
        const fp = fps[activeClient.id];
        const lastUpdate = fp?.autoUpdatedAt ? new Date(fp.autoUpdatedAt).getTime() : 0;

        // Find viral content since last auto-update
        const viralSince = log.filter(e =>
          e.perf === '' &&
          e.timestamp > lastUpdate &&
          e.timestamp > lastChecked
        );

        if (viralSince.length >= 2 && !pendingUpdate) {
          setPendingUpdate(viralSince);
        }
      } catch {}
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [activeClient, lastChecked]);

  const runUpdate = async (samples) => {
    if (!activeClient || updating) return;
    setUpdating(true);
    try {
      const fps = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}');
      const currentFp = fps[activeClient.id];
      const res = await ai(
        AUTO_VOICE_UPDATE_PROMPT(activeClient.name, currentFp, samples),
        'You refine voice fingerprints. Return only valid JSON.'
      );
      const clean = res.replace(/```json|```/g, '').trim();
      const updated = JSON.parse(clean);
      fps[activeClient.id] = { ...currentFp, ...updated, refinementCount: (currentFp?.refinementCount || 0) + 1 };
      try { localStorage.setItem(VOICE_KEY, JSON.stringify(fps)); } catch {}
      setLastChecked(Date.now());
      setPendingUpdate(null);
    } catch (e) { console.error('Auto voice update failed:', e); }
    setUpdating(false);
  };

  const dismiss = () => { setLastChecked(Date.now()); setPendingUpdate(null); };

  return { pendingUpdate, updating, runUpdate, dismiss };
}

// Banner component that appears when viral content triggers an update
function AutoVoiceUpdateBanner({ activeClient }) {
  const { pendingUpdate, updating, runUpdate, dismiss } = useAutoVoiceUpdate(activeClient);

  if (!pendingUpdate || !activeClient) return null;

  return (
    <div style={{
      background: 'rgba(0,194,255,0.06)',
      border: '1px solid rgba(0,194,255,0.2)',
      borderRadius: 10,
      padding: '12px 16px',
      margin: '0 16px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <span style={{color:"#00C2FF",fontWeight:800,fontSize:11,letterSpacing:1}}>DNA</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#00C2FF', fontWeight: 700, fontSize: 13 }}>
          Voice fingerprint can be updated
        </div>
        <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>
          {pendingUpdate.length} viral pieces rated since last update for {activeClient.name}. SIGNAL can extract the patterns that made them work.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => runUpdate(pendingUpdate)} disabled={updating}
          style={{ background: '#2563EB', color: '#000D1A', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
          {updating ? 'Updating...' : 'Update Now'}
        </button>
        <button onClick={dismiss}
          style={{ background: '#FFFFFF', color: '#6B7280', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          Later
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 6: ONBOARDING FLOW
// First-time user setup shown once, stored in localStorage
// 4 steps: Welcome Brand Setup Voice First Strategy
// ═════════════════════════════════════════════════════════════════════════════
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: 'Jason Fricka',
    handle: '@everydayelevations',
    platforms: ['Instagram', 'YouTube'],
    niche: '',
    goals: '',
    voice: '',
  });
  const [animating, setAnimating] = useState(false);

  const next = () => {
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
  };

  const finish = () => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
      // Save form data into the default client profile
      if (form.name || form.niche || form.voice || form.goals) {
        const updatedClient = {
          id: 'jason',
          name: form.name || 'Jason Fricka',
          handle: form.handle || '@everydayelevations',
          platforms: Array.isArray(form.platforms) ? form.platforms.join(', ') : form.platforms,
          voice: form.voice || 'Direct, real, no corporate speak. High accountability energy.',
          niche: form.niche || '',
          goals: form.goals || '',
          angles: 'Resilience, Mindset, Everyday Wins, Outdoor/Colorado, Finance/Real Estate, Podcast/Personal Growth, Family/Life Lessons, Health/Physical Wellness',
          colors: '#0A1628, #00C2FF, #FFFFFF',
          notes: form.niche ? 'Set up via onboarding. Niche: ' + form.niche : 'HR Manager at Highland Cabinetry. Podcast host. Real estate agent. Colorado father.',
          isDefault: true,
          onboardedAt: new Date().toISOString(),
        };
        localStorage.setItem(ACTIVE_CLIENT_KEY, JSON.stringify(updatedClient));
        // Also save voice fingerprint seed if voice was entered
        if (form.voice) {
          const fps = JSON.parse(localStorage.getItem(VOICE_KEY) || '{}');
          fps['jason'] = {
            tone: form.voice,
            clientName: form.name || 'Jason Fricka',
            seedOnly: true,
            createdAt: new Date().toISOString(),
          };
          try { localStorage.setItem(VOICE_KEY, JSON.stringify(fps)); } catch {}
        }
      }
    } catch(e) { console.error('Onboarding save error:', e); }
    onComplete();
  };

  const togglePlatform = (p) => setForm(f => ({
    ...f,
    platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
  }));

  const steps = [
    {
      title: "Welcome to SIGNAL",
      sub: "The last social media tool you'll need. Let's get you set up in 2 minutes.",
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00C2FF, #0096CC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 36, boxShadow: '0 0 40px rgba(0,194,255,0.3)'
          }}>⚡</div>
          <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.8, maxWidth: 380, margin: '0 auto' }}>
            SIGNAL is pre-loaded with your brand identity, voice, and goals. Every tool knows who you are before you start.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 28 }}>
            {[['60', 'Tools'], ['0', 'Subscriptions\nNeeded'], ['AI', 'Powered']].map(([n, l]) => (
              <div key={l} style={{ background: 'rgba(0,194,255,0.06)', border: '1px solid #D1D5DB', borderRadius: 10, padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#00C2FF', letterSpacing: '-0.04em' }}>{n}</div>
                <div style={{ fontSize: 10, color: '#6B7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'pre-line' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Your Brand",
      sub: "Tell SIGNAL who you are. This gets injected into every tool automatically.",
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <SecLabel>Your Name</SecLabel>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#111827', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <SecLabel>Primary Handle</SecLabel>
              <input value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} placeholder="@handle"
                style={{ width: '100%', background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#111827', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>
          <SecLabel>Active Platforms</SecLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {PLATFORMS.map(p => (
              <button key={p} onClick={() => togglePlatform(p)}
                style={{ background: form.platforms.includes(p) ?'#EEF2FF':'#F9FAFB', color: form.platforms.includes(p) ? '#000D1A' : '#111827', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                {p}
              </button>
            ))}
          </div>
          <SecLabel>Your Niche</SecLabel>
          <input value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
            placeholder="e.g. Mindset coaching, Colorado real estate, endurance athlete"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#111827', fontSize: 13, marginBottom: 14, boxSizing: 'border-box' }} />
          <SecLabel>Primary Content Goal</SecLabel>
          <input value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
            placeholder="e.g. Grow to 10K Instagram followers, generate real estate leads"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#111827', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
      )
    },
    {
      title: "Your Voice",
      sub: "How do you actually talk? Three sentences is enough. This is what separates SIGNAL from every other AI tool.",
      content: (
        <div>
          <div style={{ background: 'rgba(0,194,255,0.06)', border: '1px solid #D1D5DB', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'rgba(0,194,255,0.8)', lineHeight: 1.7 }}>
            Don't describe your voice. Just write like you talk. "I keep it real. No hype. I'm talking to someone who actually wants to do the work." That's all it needs.
          </div>
          <SecLabel>Write 2-3 sentences in your actual voice</SecLabel>
          <textarea value={form.voice} onChange={e => setForm(f => ({ ...f, voice: e.target.value }))} rows={5}
            placeholder="Just write naturally. Like you're talking to a friend who follows you. Don't overthink it..."
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#111827', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['Direct, no fluff', 'Motivating but real', 'Storyteller', 'Data-driven', 'Conversational', 'Authority-first'].map(style => (
              <button key={style} onClick={() => setForm(f => ({ ...f, voice: f.voice ? f.voice + ' ' + style.toLowerCase() + '.' : style + '.' }))}
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', color: '#6B7280', fontSize: 11, textAlign: 'left' }}>
                + {style}
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "You're ready.",
      sub: "SIGNAL knows who you are. Every tool is pre-loaded with your context.",
      content: (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          
          <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
            Start with the <strong style={{ color: '#00C2FF' }}>90-Day Strategy Builder</strong> to generate your full content foundation, or jump straight to <strong style={{ color: '#00C2FF' }}>Script Engine</strong> to create your first piece.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, margin: '0 auto' }}>
            {[
              { label: 'Build 90-Day Strategy', sub: 'Recommended first step' },
              { label: 'Write a Script', sub: 'Start creating immediately' },
              { label: 'Run a Profile Audit', sub: 'See where you stand' },
            ].map(item => (
              <div key={item.label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', textAlign: 'left' }}>
                <div style={{ color: '#111827', fontWeight: 700, fontSize: 12 }}>{item.label}</div>
                <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
  ];

  const current = steps[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(8,13,20,0.96)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,194,255,0.15)',
        borderRadius: 20,
        width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(0,194,255,0.1)' }}>
          <div style={{ height: '100%', background: '#00C2FF', width: `${((step + 1) / steps.length) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ padding: '28px 32px 24px' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= step ? '#00C2FF' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
            ))}
          </div>

          <h2 style={{ color: '#111827', fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>
            {current.title}
          </h2>
          <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            {current.sub}
          </p>

          {current.content}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            <button onClick={() => step > 0 ? setStep(s => s - 1) : null}
              style={{ background: 'none', border: 'none', color: step > 0 ? '#6B7280' : 'transparent', cursor: step > 0 ? 'pointer' : 'default', fontSize: 13, padding: '8px 0' }}>
              Back
            </button>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {step < steps.length - 1 && (
                <button onClick={() => setStep(s => s + 1)}
                  style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12, padding: '8px 12px' }}>
                  Skip
                </button>
              )}
              <button onClick={step === steps.length - 1 ? finish : next}
                style={{ background: 'linear-gradient(135deg, #00C2FF, #0096CC)', color: '#000D1A', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 800, cursor: 'pointer', fontSize: 14, boxShadow: '0 0 20px rgba(0,194,255,0.3)' }}>
                {step === steps.length - 1 ? 'Start Using SIGNAL →' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 5: INTELLIGENCE DASHBOARD HOME
// Replaces the tool-grid home with a live data dashboard.
// Shows: key metrics, trend alerts, pending deliverables, recent content,
// content gap score, top performer, and quick-launch recent tools.
// ═════════════════════════════════════════════════════════════════════════════
function IntelligenceDashboard({ setNav, setSub }) {
  const [activeClient] = useActiveClient();
  const [clients] = useClients();
  const [metrics, setMetrics] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [trendCount, setTrendCount] = useState(0);
  const [pendingDeliverables, setPendingDeliverables] = useState(0);
  const [gapAngles, setGapAngles] = useState([]);
  const [weeklyGrowth, setWeeklyGrowth] = useState(null);
  const [topPerformer, setTopPerformer] = useState(null);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    try {
      const roi = JSON.parse(localStorage.getItem('encis_roi_weeks') || '[]');
      if (roi.length >= 2) {
        const latest = roi[0]; const prev = roi[1];
        const growth = prev.followers > 0 ? Math.round(((latest.followers - prev.followers) / prev.followers) * 100) : null;
        setMetrics(latest); setWeeklyGrowth(growth);
      } else if (roi.length === 1) setMetrics(roi[0]);
    } catch {}
    try {
      const log = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
      setRecentContent(log.slice(0, 6));
      const viral = log.filter(e => e.perf === String.fromCodePoint(0x1F525));
      if (viral.length > 0) setTopPerformer(viral[0]);
      const angleCounts = {};
      ANGLES.forEach(a => { angleCounts[a.id] = 0; });
      log.forEach(e => { if (e.angle && angleCounts[e.angle] !== undefined) angleCounts[e.angle]++; });
      setGapAngles([...ANGLES].sort((a, b) => (angleCounts[a.id]||0) - (angleCounts[b.id]||0)).slice(0, 3));
    } catch {}
    try { const alerts = JSON.parse(localStorage.getItem('encis_trend_alerts') || '[]'); setTrendCount(alerts.length); } catch {}
    try { const dels = JSON.parse(localStorage.getItem(CLIENT_DELIVERABLES_KEY) || '[]'); setPendingDeliverables(dels.filter(d => d.status === 'pending' || d.status === 'in-progress').length); } catch {}
  }, [activeClient]);

  const D = {
    bg: '#F7F9FC', card: '#FFFFFF', text: '#111827', muted: '#6B7280',
    accent: '#2563EB', border: '#E5E7EB',
    shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  };

  const wl = (() => { try { return JSON.parse(localStorage.getItem('encis_whitelabel') || 'null'); } catch { return null; } })();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = activeClient?.name?.split(' ')[0] || 'Jason';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const kpis = [
    { label: 'Followers', val: metrics?.followers ? Number(metrics.followers).toLocaleString() : null, growth: weeklyGrowth, nav: 'optimize', sub: 'roi' },
    { label: 'Reach',     val: metrics?.reach ? Number(metrics.reach).toLocaleString() : null, nav: 'optimize', sub: 'roi' },
    { label: 'Leads',     val: metrics?.leads || null, nav: 'optimize', sub: 'roi' },
    { label: 'Revenue',   val: metrics?.revenue ? '$'+metrics.revenue : null, nav: 'optimize', sub: 'revenue' },
    { label: 'Content',   val: recentContent.length || null, nav: 'optimize', sub: 'memory' },
  ];

  const cardStyle = { background: D.card, border: '1px solid '+D.border, borderRadius: 12, padding: '20px 24px', boxShadow: D.shadow };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: D.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 };

  return (
    <div style={{ background: D.bg, minHeight: '100vh', margin: '-1.5rem -16px', padding: '20px 16px', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* HEADER */}
        <div className="signal-tool-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: D.muted, marginBottom: 4 }}>{dateStr}</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: D.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>{greeting}, {firstName}.</h1>
            <p style={{ fontSize: 13, color: D.muted, margin: '4px 0 0' }}>
              {!metrics ? 'Log your first week of metrics to activate your dashboard.' : 'Last logged: '+(metrics.week||'this week')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setNav('strategy'); setSub('onboard'); }}
              style={{ background: D.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              + New Strategy
            </button>
            <button onClick={() => setShowTools(s => !s)}
              style={{ background: D.card, color: D.muted, border: '1px solid '+D.border, borderRadius: 8, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {showTools ? 'Hide Tools' : 'All Tools'}
            </button>
          </div>
        </div>

        {/* KPI ROW */}
        <div className="signal-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 18 }}>
          {kpis.map(k => {
            const empty = k.val === null || k.val === undefined;
            return (
              <div key={k.label} onClick={() => { setNav(k.nav); setSub(k.sub); }}
                style={{ ...cardStyle, padding: '16px 18px', cursor: 'pointer', opacity: empty ? 0.6 : 1 }}>
                <div style={labelStyle}>{k.label}</div>
                {empty
                  ? <div style={{ fontSize: 12, color: D.accent, fontWeight: 600 }}>+ Add data</div>
                  : <div style={{ fontSize: 24, fontWeight: 800, color: D.text, letterSpacing: '-0.04em', lineHeight: 1.1 }}>{k.val}</div>
                }
                {!empty && k.growth !== null && k.growth !== undefined && (
                  <div style={{ fontSize: 11, color: k.growth >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600, marginTop: 3 }}>
                    {k.growth >= 0 ? '+' : ''}{k.growth}% this week
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* EXECUTION HUB + OPPORTUNITIES */}
        <div className="signal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={cardStyle}>
            <div style={labelStyle}>Execution Hub</div>
            <div className="signal-exec-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Create Content', nav: 'create',   sub: 'create'   },
                { label: 'Write Caption',  nav: 'create',   sub: 'create'   },
                { label: 'Run Research',   nav: 'research', sub: 'research' },
                { label: 'Plan Week',      nav: 'optimize', sub: 'review'   },
                { label: 'Log Metrics',    nav: 'optimize', sub: 'growth'   },
                { label: 'Weekly Review',  nav: 'optimize', sub: 'review'   },
              ].map(a => (
                <button key={a.label} onClick={() => { setNav(a.nav); setSub(a.sub); }}
                  style={{ background: '#F3F4F6', border: '1px solid '+D.border, borderRadius: 8, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, color: D.text, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#EEF2FF'; e.currentTarget.style.color=D.accent; e.currentTarget.style.borderColor='#C7D2FE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#F3F4F6'; e.currentTarget.style.color=D.text; e.currentTarget.style.borderColor=D.border; }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={labelStyle}>Opportunities</div>
              <button onClick={() => { setNav('optimize'); setSub('gaps'); }}
                style={{ background: 'none', border: 'none', color: D.accent, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>View all</button>
            </div>
            {gapAngles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gapAngles.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8, border: '1px solid '+D.border }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: D.text }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: D.muted, marginTop: 1 }}>Under-used in your mix</div>
                    </div>
                    <button onClick={() => { setNav('create'); setSub('create'); }}
                      style={{ background: D.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      Create
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: D.muted, fontSize: 12, padding: '20px 0', textAlign: 'center' }}>Rate content in Content Memory to unlock opportunities.</div>
            )}
          </div>
        </div>

        {/* RECENT CONTENT + TOP PERFORMER */}
        <div className="signal-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={labelStyle}>Recent Content</div>
              <button onClick={() => { setNav('optimize'); setSub('memory'); }}
                style={{ background: 'none', border: 'none', color: D.accent, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>View all</button>
            </div>
            {recentContent.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentContent.slice(0,5).map((e,idx) => (
                  <div key={e.id||idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: idx < 4 ? '1px solid '+D.border : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.perf ? '#16a34a' : D.border, flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title||e.topic||'Untitled'}</div>
                      <div style={{ fontSize: 10, color: D.muted, marginTop: 1 }}>{e.type} · {e.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: D.muted, fontSize: 12, padding: '20px 0', textAlign: 'center' }}>Generate content to build your history.</div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Top Performer</div>
            {topPerformer ? (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Viral</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: D.text, lineHeight: 1.4, marginBottom: 4 }}>{topPerformer.title||topPerformer.topic||'Untitled'}</div>
                <div style={{ fontSize: 11, color: D.muted, marginBottom: 14 }}>{topPerformer.type} · {topPerformer.date}</div>
                <button onClick={() => { setNav('create'); setSub('create'); }}
                  style={{ background: D.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Repurpose This
                </button>
              </div>
            ) : (
              <div style={{ color: D.muted, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Rate a post in Content Memory.</div>
            )}
          </div>
        </div>

        {/* FIRST STEPS */}
        {!metrics && recentContent.length === 0 && (
          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={{ ...labelStyle, color: D.accent }}>Get Started — Your First 3 Moves</div>
            <div className="signal-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { num:'1', title:'Build your strategy', desc:'90-Day Strategy Builder generates your complete content foundation.', nav:'strategy', sub:'onboard', cta:'Build Strategy' },
                { num:'2', title:'Log your first metric', desc:'Add your current follower count so SIGNAL can track growth.', nav:'optimize', sub:'roi', cta:'Log Metrics' },
                { num:'3', title:'Write your first script', desc:'Script Engine generates a camera-ready script in under 60 seconds.', nav:'create', sub:'create', cta:'Write Script' },
              ].map(step => (
                <div key={step.num} onClick={() => { setNav(step.nav); setSub(step.sub); }}
                  style={{ background: '#F9FAFB', borderRadius: 8, padding: '16px', cursor: 'pointer', border: '1px solid '+D.border }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: D.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{step.num}</div>
                  <div style={{ color: D.text, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{step.title}</div>
                  <div style={{ color: D.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>{step.desc}</div>
                  <div style={{ color: D.accent, fontSize: 11, fontWeight: 700 }}>{step.cta} →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENT SWITCHER */}
        {clients.length > 1 && (
          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={labelStyle}>Clients</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {clients.map(c => {
                const isActive = activeClient?.id === c.id;
                const pending = (() => { try { return JSON.parse(localStorage.getItem(CLIENT_DELIVERABLES_KEY)||'[]').filter(d=>d.clientId===c.id&&(d.status==='pending'||d.status==='in-progress')).length; } catch { return 0; } })();
                return (
                  <button key={c.id} onClick={() => { setNav('agency'); setSub('portal'); }}
                    style={{ background: isActive?'#EEF2FF':'#F9FAFB', color: isActive?D.accent:D.text, border: '1px solid '+(isActive?'#C7D2FE':D.border), borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {c.name}
                    {pending > 0 && <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 9, fontWeight: 800 }}>{pending}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL TOOLS */}
        {showTools && (
          <div style={cardStyle}>
            <div style={labelStyle}>All Tools</div>
            {['strategy','research','create','optimize','agency','youtube'].map(group => {
              const groupColor = { strategy:'#2563EB', research:'#2563EB', create:'#7c3aed', optimize:'#16a34a', agency:'#0891b2', youtube:'#dc2626' }[group];
              const allTools = [
                {nav:'strategy',sub:'onboard',t:'90-Day Strategy'},{nav:'strategy',sub:'calendar',t:'Content Calendar'},{nav:'strategy',sub:'profile',t:'Profile Audit'},{nav:'strategy',sub:'magnet',t:'Lead Magnet'},{nav:'strategy',sub:'email',t:'Email Sequences'},{nav:'strategy',sub:'challenge',t:'Challenge Builder'},{nav:'strategy',sub:'campaign',t:'Campaign Builder'},{nav:'strategy',sub:'series',t:'Series Planner'},{nav:'strategy',sub:'bio',t:'Bio Suite'},
                {nav:'research',sub:'research',t:'Research Hub'},{nav:'research',sub:'vault',t:'Prompt Vault'},{nav:'research',sub:'collab',t:'Collab Finder'},
                {nav:'create',sub:'create',t:'Create Hub'},{nav:'create',sub:'hooks',t:'Hook Workshop'},{nav:'create',sub:'videodirector',t:'Video Director'},{nav:'create',sub:'objections',t:'Objection Handler'},{nav:'create',sub:'guestprep',t:'Guest Prep'},{nav:'create',sub:'dmscripts',t:'DM Scripts'},{nav:'create',sub:'comment',t:'Comment Responder'},{nav:'create',sub:'podcast',t:'Podcast Pre-Prod'},
                {nav:'optimize',sub:'review',t:'Weekly Review'},{nav:'optimize',sub:'growth',t:'Growth Dashboard'},{nav:'optimize',sub:'memory',t:'Content Memory'},{nav:'optimize',sub:'schedule',t:'Schedule Optimizer'},{nav:'optimize',sub:'predictor',t:'Predictor'},{nav:'optimize',sub:'stratreview',t:'AI Strategy Review'},
                {nav:'agency',sub:'portal',t:'Client Portal'},{nav:'agency',sub:'deliverable',t:'Deliverable Builder'},{nav:'agency',sub:'report',t:'Monthly Report'},{nav:'agency',sub:'voice',t:'Voice Fingerprint'},{nav:'agency',sub:'clients',t:'Client Profiles'},{nav:'agency',sub:'whitelabel',t:'White Label'},{nav:'agency',sub:'transcript',t:'Transcript Intel'},{nav:'agency',sub:'clientcomms',t:'Client Comms'},{nav:'agency',sub:'pricing',t:'Pricing Calc'},
                {nav:'youtube',sub:'yttoolkit',t:'YouTube Toolkit'},
              ].filter(t => t.nav === group);
              if (!allTools.length) return null;
              return (
                <div key={group} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: groupColor, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>{group.toUpperCase()}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allTools.map(tool => (
                      <button key={tool.sub} onClick={() => { setNav(tool.nav); setSub(tool.sub); setShowTools(false); }}
                        style={{ background: '#F3F4F6', border: '1px solid '+D.border, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: D.text }}
                        onMouseEnter={e => { e.currentTarget.style.background='#EEF2FF'; e.currentTarget.style.color=D.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#F3F4F6'; e.currentTarget.style.color=D.text; }}>
                        {tool.t}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 8: TREND ALERT NOTIFICATIONS (Web Push API free)
// ═════════════════════════════════════════════════════════════════════════════
function useTrendNotifications() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const sendNotification = (title, body, onClick) => {
    if (permission !== 'granted' || !('Notification' in window)) return;
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'signal-trend-alert',
      });
      if (onClick) notif.onclick = onClick;
    } catch {}
  };

  const notifyTrendAlerts = (alertCount, topAngle) => {
    sendNotification(
      ` ${alertCount} new trend alert${alertCount !== 1 ? 's' : ''} SIGNAL`,
      `${topAngle || 'Multiple angles'} trending right now. Check before it peaks.`
    );
  };

  return { permission, requestPermission, notifyTrendAlerts, sendNotification };
}

// Notification Permission Banner shows in header when not granted
function NotificationBanner() {
  const { permission, requestPermission } = useTrendNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('notif_dismissed')) setDismissed(true); } catch {}
  }, []);

  if (permission === 'granted' || permission === 'denied' || dismissed) return null;

  return (
    <div style={{ background: 'rgba(201,168,76,0.06)', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 14 }}>🔔</span>
      <div style={{ flex: 1, fontSize: 12, color: 'rgba(201,168,76,0.9)' }}>
        Enable notifications to get alerted when trends break in your niche before competitors see them.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={async () => { await requestPermission(); }}
          style={{ background: '#C9A84C', color: '#000', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
          Enable
        </button>
        <button onClick={() => { setDismissed(true); try { localStorage.setItem('notif_dismissed', '1'); } catch {} }}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 11 }}>
          Not now
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE 10: AUTOMATED MONTHLY REPORT EMAIL
// Generates report, formats it, opens mailto: deep link so user sends it
// from their own email. No SendGrid, no API key, no cost.
// ═════════════════════════════════════════════════════════════════════════════
function useMonthlyReportEmail() {
  const sendReportEmail = (clientEmail, clientName, reportMarkdown, agencyName) => {
    // Convert markdown to plain text for email
    const plain = reportMarkdown
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/---/g, '---')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const subject = encodeURIComponent(`${agencyName || 'SIGNAL'} Monthly Report for ${clientName} — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    const body = encodeURIComponent(`Hi ${clientName},\n\nYour monthly performance report is below.\n\n---\n\n${plain.slice(0, 2000)}\n\n[Full report attached as PDF]\n\n---\n\nBest,\n${agencyName || 'SIGNAL'}`);

    // Copy full report to clipboard
    try { navigator.clipboard.writeText(reportMarkdown); } catch {}

    // Open mailto
    window.open(`mailto:${clientEmail || ''}?subject=${subject}&body=${body}`);
  };

  return { sendReportEmail };
}

// Email send button added to Monthly Reporting Suite output
function ReportEmailButton({ reportText, clientName, clientEmail }) {
  const { sendReportEmail } = useMonthlyReportEmail();
  const [email, setEmail] = useState(clientEmail || '');
  const [showInput, setShowInput] = useState(false);
  const wl = (() => { try { return JSON.parse(localStorage.getItem('encis_whitelabel') || 'null'); } catch { return null; } })();

  if (!reportText) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {!showInput ? (
        <button onClick={() => setShowInput(true)}
          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          Email Report to Client
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com"
            style={{ background: '#F9FAFB', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#111827', fontSize: 13, width: 220 }} />
          <button onClick={() => { sendReportEmail(email, clientName, reportText, wl?.agencyName); }}
            style={{ background: '#C9A84C', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            Send via Email App
          </button>
          <div style={{ fontSize: 11, color: '#6B7280' }}>Full report copied to clipboard</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE: CLIENT APPROVAL LINKS
// Generates shareable URLs for client content review no server required.
// Content is base64-encoded in the URL hash. Client opens link, approves/rejects.
// ═════════════════════════════════════════════════════════════════════════════
function ApprovalLinkGenerator({ content: delivContent, title, clientName }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState(null);

  if (!delivContent) return null;

  const generateLink = () => {
    try {
      const payload = JSON.stringify({
        title: title || "Content for Review",
        client: clientName || "Client",
        content: delivContent,
        created: new Date().toISOString(),
        agency: (() => { try { const wl = JSON.parse(localStorage.getItem("encis_whitelabel")||"null"); return (wl && wl.agencyName) ? wl.agencyName : "SIGNAL"; } catch { return "SIGNAL"; } })(),
      });
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      return window.location.origin + window.location.pathname + "#approval=" + encoded;
    } catch(e) { return null; }
  };

  const link = generateLink();

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      // Save to localStorage so we can track it
      try {
        const approvals = JSON.parse(localStorage.getItem("encis_approval_links") || "[]");
        approvals.unshift({ title, client: clientName, link, created: new Date().toISOString(), status: "pending" });
        localStorage.setItem("encis_approval_links", JSON.stringify(approvals.slice(0, 50)));
      } catch {}
    }).catch(() => {
      // Fallback for non-HTTPS
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ marginTop: 14, background: "rgba(0,194,255,0.04)", border: "1px solid rgba(0,194,255,0.12)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ color: "#00C2FF", fontWeight: 700, fontSize: 13 }}>Client Approval Link</div>
        <button onClick={() => setShowPreview(s => !s)}
          style={{ background: "none", border: "none", color: '#6B7280', cursor: "pointer", fontSize: 11 }}>
          {showPreview ? "Hide preview" : "Preview page"}
        </button>
      </div>
      <div style={{ color: '#6B7280', fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>
        Send this link to {clientName || "your client"}. They can review the content and approve or request changes no login needed.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copyLink}
          style={{ background: copied ? "rgba(39,174,96,0.15)" : "rgba(0,194,255,0.1)", color: copied ? "#27ae60" : "#00C2FF", border: "1px solid " + (copied ? "rgba(39,174,96,0.3)" : "rgba(0,194,255,0.2)"), borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button onClick={() => link && window.open(link, "_blank")}
          style={{ background: "rgba(255,255,255,0.06)", color: '#374151', border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
          Preview →
        </button>
      </div>
      {showPreview && (
        <div style={{ marginTop: 14, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, fontSize: 11, color: '#6B7280', lineHeight: 1.8 }}>
          <div style={{ color: '#111827', fontWeight: 700, marginBottom: 6 }}>What the client sees:</div>
          <div>Your agency name and the document title at the top</div>
          <div>The full content formatted cleanly</div>
          <div>Two buttons: <strong style={{ color: "#27ae60" }}>Approve</strong> and <strong style={{ color: '#2563EB' }}>Request Changes</strong></div>
          <div>A comments box for feedback</div>
          <div>No login required, works on any device</div>
        </div>
      )}
    </div>
  );
}

// Standalone approval page renders when URL contains #approval=
function ApprovalPage({ encodedPayload, onBack }) {
  const [status, setStatus] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const payload = (() => {
    try { return JSON.parse(decodeURIComponent(escape(atob(encodedPayload)))); }
    catch { return null; }
  })();

  if (!payload) return (
    <div style={{ minHeight: "100vh", background: "#080D14", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ color: '#111827', textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Invalid approval link</div>
        <div style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>This link may have expired or been corrupted.</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#080D14", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0C1420", border: "1px solid rgba(0,194,255,0.15)", borderRadius: 16, padding: 40, maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{status === "approved" ? "" : "✏️"}</div>
        <h2 style={{ color: '#111827', fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em", marginBottom: 8 }}>
          {status === "approved" ? "Content Approved!" : "Changes Requested"}
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
          {status === "approved"
            ? `${payload.agency} has been notified. Your content is cleared for publishing.`
            : `Your feedback has been sent to ${payload.agency}. They will revise and resend.`}
        </p>
        {comment && (
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", marginTop: 16, fontSize: 12, color: '#374151', textAlign: "left", lineHeight: 1.6 }}>
            <div style={{ color: '#6B7280', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Your note</div>
            {comment}
          </div>
        )}
      </div>
    </div>
  );

  const handleSubmit = (s) => {
    setStatus(s);
    setSubmitted(true);
    // Save response to localStorage so agency can see it
    try {
      const approvals = JSON.parse(localStorage.getItem("encis_approval_links") || "[]");
      const updated = approvals.map(a => a.title === payload.title
        ? { ...a, status: s, comment, respondedAt: new Date().toISOString() }
        : a
      );
      localStorage.setItem("encis_approval_links", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080D14", fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0C1420", borderBottom: "1px solid rgba(0,194,255,0.1)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 52 52" fill="none">
            <rect width="52" height="52" rx="10" fill="#0C1420"/>
            <path d="M14 26C14 19.373 19.373 14 26 14" stroke="#00C2FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
            <path d="M38 26C38 32.627 32.627 38 26 38" stroke="#00C2FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
            <path d="M18 26C18 21.582 21.582 18 26 18" stroke="#00C2FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
            <path d="M34 26C34 30.418 30.418 34 26 34" stroke="#00C2FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
            <circle cx="26" cy="26" r="3.5" fill="#00C2FF"/>
            <path d="M28.5 14L22 26H27L24.5 38L31 26H26L28.5 14Z" fill="#00C2FF"/>
          </svg>
          <div>
            <div style={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>{payload.agency}</div>
            <div style={{ color: '#6B7280', fontSize: 11 }}>Content Review Portal</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          Prepared for {payload.client} · {new Date(payload.created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        {/* Document title */}
        <h1 style={{ color: '#111827', fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>{payload.title}</h1>
        <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 32 }}>Please review the content below and approve or request changes.</div>

        {/* Content */}
        <div style={{ background: "#0C1420", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "24px 28px", marginBottom: 28, lineHeight: 1.8, color: '#374151', fontSize: 14, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {payload.content}
        </div>

        {/* Comments */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", color: '#6B7280', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
            Comments or notes (optional)
          </label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
            placeholder="Any feedback, changes needed, or questions..."
            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", color: '#111827', fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }} />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => handleSubmit("approved")}
            style={{ flex: 1, background: "linear-gradient(135deg, #27ae60, #1e8449)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 24px", fontWeight: 800, cursor: "pointer", fontSize: 15, boxShadow: "0 4px 20px rgba(39,174,96,0.2)" }}>
            Approve Content
          </button>
          <button onClick={() => handleSubmit("changes_requested")}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: '#111827', border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 24px", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
            Request Changes
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: '#6B7280' }}>
          Powered by {payload.agency} This link is for review purposes only
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT BRIEF GENERATOR
// World-class pre-filming production blueprint
// ═════════════════════════════════════════════════════════════════════════════
function ContentBriefGenerator() {
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [location, setLocation] = useState('');
  const [topics, setTopics] = useState('');
  const [equipment, setEquipment] = useState('');
  const [duration, setDuration] = useState('2-3 hours');
  const [intensity, setIntensity] = useState('MEDIUM');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelectedClient(activeClient); }, []);

  const run = async () => {
    if (!selectedClient || !topics) return;
    setLoading(true); setOut('');
    const res = await ai(CONTENT_BRIEF_PROMPT(selectedClient, sessionDate, location, topics, equipment, duration, intensity));
    setOut(res);
    logToMemory({ type: 'contentbrief', title: 'Content Brief: ' + (sessionDate || 'Session'), topic: topics, platform: selectedClient.platforms });
    setLoading(false);
  };

  const intensityColors = { LOW: { bg: 'rgba(39,174,96,0.15)', text: '#27ae60', border: 'rgba(39,174,96,0.25)' }, MEDIUM: { bg: 'rgba(0,194,255,0.1)', text: '#00C2FF', border: 'rgba(0,194,255,0.2)' }, HIGH: { bg: 'rgba(233,69,96,0.15)', text: '#e94560', border: 'rgba(233,69,96,0.3)' } };
  const intensityDesc = { LOW: 'Approachable, relatable, soft edges', MEDIUM: 'Balanced insight + clear structure', HIGH: 'Direct, strong opinions, confrontational' };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:"#00C2FF",borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Brief Generator</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>A production blueprint. Not a content plan. Read it the night before. Walk in ready.</p>
        </div>
      </div>
      {activeClient && !activeClient.isDefault && <ClientBanner client={activeClient}/>}
      <Card>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {clients.map(c => (
            <button key={c.id} onClick={() => setSelectedClient(c)}
              style={{background: selectedClient?.id===c.id ? '#2563EB' : 'rgba(255,255,255,0.06)', color: selectedClient?.id===c.id ? '#000D1A' : '#111827', border:'none', borderRadius:7, padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700}}>
              {c.name}
            </button>
          ))}
        </div>

        <SecLabel>Content Intensity Level</SecLabel>
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          {['LOW','MEDIUM','HIGH'].map(lvl => {
            const ic = intensityColors[lvl];
            return (
              <button key={lvl} onClick={() => setIntensity(lvl)}
                style={{background: intensity===lvl ? ic.bg : 'rgba(255,255,255,0.04)', color: intensity===lvl ? ic.text : '#6B7280', border: '1px solid ' + (intensity===lvl ? ic.border : 'rgba(255,255,255,0.06)'), borderRadius:7, padding:'6px 18px', cursor:'pointer', fontSize:11, fontWeight:800, letterSpacing:1, transition:'all 0.15s'}}>
                {lvl}
              </button>
            );
          })}
          <span style={{color:'#6B7280',fontSize:11,alignSelf:'center',marginLeft:4}}>{intensityDesc[intensity]}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <SecLabel>Session Date</SecLabel>
            <input value={sessionDate} onChange={e=>setSessionDate(e.target.value)} placeholder="e.g. Saturday March 22"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Primary Location</SecLabel>
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Home office, outdoor trail, gym"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Equipment Available</SecLabel>
            <input value={equipment} onChange={e=>setEquipment(e.target.value)} placeholder="e.g. iPhone 15 Pro, ring light, tripod"
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
          </div>
          <div>
            <SecLabel>Session Duration</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {['1 hour','2-3 hours','4-5 hours','Full day'].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  style={{background: duration===d ?'#EEF2FF':'#F9FAFB', color: duration===d ? '#000D1A' : '#111827', border:'none', borderRadius:7, padding:'5px 10px', cursor:'pointer', fontSize:11, fontWeight:700}}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SecLabel>Topics / Content Ideas for This Session</SecLabel>
        <textarea value={topics} onChange={e=>setTopics(e.target.value)} rows={4}
          placeholder="List the pieces you want to film. e.g. Morning routine reel, real estate market update, mindset post about showing up when you don't feel like it, quick hit about what nobody tells you about building a side business..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box'}}/>

        <button onClick={run} disabled={loading||!selectedClient||!topics}
          style={{background: (!selectedClient||!topics) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#00C2FF,#0096CC)', color: (!selectedClient||!topics) ? '#6B7280' : '#000D1A', border:'none', borderRadius:8, padding:'11px 24px', fontWeight:800, cursor: (!selectedClient||!topics)?'not-allowed':'pointer', fontSize:14, boxShadow: (!selectedClient||!topics) ? 'none' : '0 0 20px rgba(0,194,255,0.25)'}}>
          {loading ? 'Building brief...' : 'Generate Production Brief'}
        </button>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title={"Filming Brief: " + (selectedClient?.name || 'Session') + " — " + (sessionDate || 'Upcoming')}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY REVIEW 6-MODULE GROWTH SYSTEM
// ═════════════════════════════════════════════════════════════════════════════
function ContentCreationHub() {
  const [mode, setMode] = useState('topics');
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  useEffect(() => { setSelectedClient(activeClient); }, []);

  // Auto-load context from strategy and research pipeline
  const [autoContext, setAutoContext] = useState(null);
  useEffect(() => {
    try {
      const strat = localStorage.getItem('encis_last_strategy');
      if (strat) {
        const parsed = JSON.parse(strat);
        if (parsed.content) setAutoContext({ source: 'strategy', name: parsed.name || '90-Day Strategy' });
      }
      const intel = localStorage.getItem('encis_pipeline_intel');
      if (intel) {
        const parsed = JSON.parse(intel);
        if (parsed.content && parsed.timestamp > Date.now() - 86400000)
          setAutoContext({ source: 'research', name: parsed.topic || 'Research Intel', content: parsed.content });
      }
    } catch {}
  }, []);

  // Shared state
  const [topic, setTopic] = useState('');
  const [angle, setAngle] = useState('occupational');
  const [platform, setPlatform] = useState('Instagram');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  // Topic Generator state
  const [topicSeed, setTopicSeed] = useState('');
  const [topicLength, setTopicLength] = useState('Medium');
  const [topicAngle, setTopicAngle] = useState('Occupational');
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);

  // Mode-specific state
  const [scriptMode, setScriptMode] = useState('short');
  const [captionHook, setCaptionHook] = useState('');
  const [batchCount, setBatchCount] = useState('5');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeNotes, setEpisodeNotes] = useState('');
  const [repurposeFrom, setRepurposeFrom] = useState('');
  const [repurposePlatform, setRepurposePlatform] = useState('YouTube');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [sessionEquip, setSessionEquip] = useState('');
  const [sessionDuration, setSessionDuration] = useState('2-3 hours');
  const [intensity, setIntensity] = useState('MEDIUM');

  // Generate topic ideas
  const generateTopics = async () => {
    setTopicLoading(true); setGeneratedIdeas([]); setSelectedIdea(null);
    const client = selectedClient || activeClient;
    const voiceFP = (() => { try { const fps = JSON.parse(localStorage.getItem('encis_voice_fingerprints')||'{}'); return fps[client?.id] || null; } catch { return null; } })();
    const voiceHint = voiceFP ? `Voice: ${voiceFP.tone || ''}. ` : '';
    const prompt = `You are a content strategist generating ideas for Jason Fricka.

CREATOR PROFILE:
${client?.voice || ''}
Platform: ${platform} | Format: ${topicLength} | Dimension: ${topicAngle}
${topicSeed ? 'Seed topic: "' + topicSeed + '"' : 'No seed — mix freely across all areas of Jason\'s life.'}

JASON'S LIFE TERRITORIES — pull ideas from ALL of these and mix them:

HR & WORKPLACE (primary career — use heavily):
HR Manager at a cabinet manufacturing company in Colorado. Daily: benefits, ADA compliance, terminations, hiring, policy enforcement, workers comp, manager training, difficult employee conversations. He's the person everyone goes to when work goes wrong. He sees human behavior under real pressure — people afraid of losing their jobs, managers who get it wrong, the gap between policy and human reality. Rich, underserved content territory.

REAL ESTATE:
Licensed agent, South Denver/Parker. Veterans, families, first-time buyers, VA loans. The real cost of homeownership vs expectations. One RE idea max per run unless seed topic says otherwise.

AI IMPLEMENTATION:
Actively building AI tools across his HR role, real estate business, and content creation. The unglamorous reality of learning AI as a non-developer — what works, what doesn't, what AI cannot replace in human judgment and relationships.

ENDURANCE & PHYSICAL DISCIPLINE:
Training toward RAGBRAI, 10Ks, bigger endurance goals. Not gym motivation — the raw reality of staying physically disciplined when exhausted from full-time career, side business, and fatherhood.

FATHERHOOD & FAMILY:
Dad to Jordan, partner to Lisa. Carrying responsibility for a family while building toward your own goals. The tension between being the person others depend on and still growing yourself.

VETERAN IDENTITY:
What military service built that still runs in the background. The civilian transition, identity shift, what veterans carry that most people don't see.

PODCAST & PERSONAL GROWTH (Everyday Elevations):
Practical growth — not aspirational. Small daily choices that compound. The gap between what self-help promises and what actually moves the needle in a real, complicated life.

DIMENSION FOCUS: ${topicAngle}
${topicAngle==='Emotional'?'Stress, self-talk, identity, managing pressure across HR/real estate/family simultaneously, what Jason feels vs projects':topicAngle==='Physical'?'Training at 5am with a full life, recovery, the relationship between physical discipline and mental state, what consistency actually costs':topicAngle==='Social'?'Being a dad, a partner, an HR manager who sees people at their most raw — how you show up for others when you have little left':topicAngle==='Intellectual'?'AI tools being built right now, what HR teaches about human nature, problem-solving under pressure, what experience reveals that no course teaches':topicAngle==='Occupational'?'The daily HR reality, building a real estate side business, implementing AI at work, what multiple demanding roles cost day-to-day':topicAngle==='Financial'?'Real estate as a long-game vehicle, what HR salary negotiations reveal, building across multiple income streams, real math not hype':topicAngle==='Environmental'?'Colorado life, training outdoors, the environment you create at home and work and how it shapes who you become':topicAngle==='Spiritual'?'Purpose and values — the deeper reason behind the discipline, what Jason is building, for whom, why it demands this level of consistency':'The deeper reason behind the discipline — what he is actually building, for whom, why it requires this level of consistency'}

IDEA REQUIREMENTS:
Grounded in specific real moments, not concepts or general wisdom.
  Good: "I had to terminate someone last week who cried in my office — and I still think it was right"
  Bad: "Why HR managers are underrated"
Relatable over provocative. Goal: viewer says "I've felt that" or "I didn't know that."
Integrated when powerful: HR + fatherhood, AI + real estate, endurance + work ethic, veteran + discipline.
Varied formats: story/confession, lesson/breakdown, hard truth, day-in-my-life, before/after.
No generic wellness content. No manufactured drama. No "secrets they don't want you to know."

OUTPUT: Numbered list 1-5 only. One per line.
Format: [First words spoken on camera — the hook] — [What the video covers and why it resonates]
Vary territories across the 5 ideas. No more than one real estate idea. Ground every idea in lived reality.`;

    const res = await ai(prompt);
    const ideas = res.split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(l => l.length > 10)
      .slice(0, 5);
    setGeneratedIdeas(ideas);
    setTopicLoading(false);
  };

  // When user picks an idea — auto-populate topic and switch to Script
  const selectIdea = (idea) => {
    setSelectedIdea(idea);
    setTopic(idea);
    setMode('script');
    setOut('');
  };

  const run = async () => {
    if (!topic && mode !== 'repurpose') return;
    if (mode === 'brief' && !topic) return;
    setLoading(true); setOut('');
    let prompt = '';
    const client = selectedClient || activeClient;
    const voiceFP = (() => { try { const fps = JSON.parse(localStorage.getItem('encis_voice_fingerprints')||'{}'); return fps[client?.id] || null; } catch { return null; } })();
    const voiceContext = voiceFP ? `VOICE FINGERPRINT:\nTone: ${voiceFP.tone}\nVocabulary: ${(voiceFP.vocabulary||[]).join(', ')}\nAvoids: ${(voiceFP.avoids||[]).join(', ')}` : (client?.voice||'');
    const researchContext = autoContext?.source==='research' ? `\n\nRESEARCH INTEL CONTEXT:\n${autoContext.content?.slice(0,800)||''}` : '';
    if (mode === 'script') prompt = SCRIPT_PROMPT(topic, ANGLES.find(a=>a.id===angle)?.label||angle, platform, scriptMode, voiceContext + researchContext);
    else if (mode === 'caption') prompt = CAPTION_PROMPT(topic, platform, ANGLES.find(a=>a.id===angle)?.label||angle, voiceContext);
    else if (mode === 'batch') prompt = BULK_PROMPT(ANGLES.find(a=>a.id===angle)?.label||angle, platform, topic, batchCount, voiceContext);
    else if (mode === 'episode') prompt = EPISODE_PROMPT(episodeTitle||topic, episodeNotes||topic);
    else if (mode === 'repurpose') prompt = REPURPOSE_PROMPT(repurposeFrom||topic, repurposePlatform, platform);
    else if (mode === 'brief') prompt = CONTENT_BRIEF_PROMPT(client||{name:'Jason Fricka',handle:'@everydayelevations'}, topic, intensity, sessionDate, sessionLocation, sessionEquip, sessionDuration);
    const res = await ai(prompt);
    setOut(res); setLoading(false);
  };

  const MODES = [
    { id:'topics',    label:'Topic Generator', desc:'Start here — get ideas', isStart: true },
    { id:'script',    label:'Script',           desc:'Camera-ready scripts' },
    { id:'caption',   label:'Caption',          desc:'Platform captions' },
    { id:'batch',     label:'Batch',            desc:'Multiple posts at once' },
    { id:'episode',   label:'Episode Clips',    desc:'Long-form to clips' },
    { id:'repurpose', label:'Repurpose',        desc:'Cross-platform' },
    { id:'brief',     label:'Filming Brief',    desc:'Full shoot plan' },
  ];

  const taStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box'};
  const inStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'};

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Content Creation Hub</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Generate ideas, then create — scripts, captions, batches, and more.</p>
        </div>
      </div>

      {/* Auto-loaded context banner */}
      {autoContext && (
        <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:8,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div>
            <span style={{color:'#2563EB',fontWeight:700,fontSize:11,letterSpacing:1,textTransform:'uppercase'}}>
              {autoContext.source==='research'?'Research Intel loaded':'Strategy loaded'}
            </span>
            <span style={{color:'#6B7280',fontSize:11,marginLeft:8}}>{autoContext.name}</span>
          </div>
          {autoContext.source==='research' && (
            <button onClick={()=>{ setMode('script'); }}
              style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:5,padding:'5px 12px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
              Use in Script
            </button>
          )}
        </div>
      )}

      {/* Mode selector */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {MODES.map(m => (
          <button key={m.id} onClick={()=>{setMode(m.id);setOut('');}}
            style={{
              background: mode===m.id ? (m.isStart?'#2563EB':'#EEF2FF') : (m.isStart?'#F0F7FF':'#F9FAFB'),
              color: mode===m.id ? (m.isStart?'#fff':'#2563EB') : (m.isStart?'#2563EB':'#6B7280'),
              border: '1px solid ' + (mode===m.id ? (m.isStart?'#2563EB':'#C7D2FE') : (m.isStart?'#BFDBFE':'#E5E7EB')),
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: mode===m.id ? 700 : (m.isStart ? 600 : 500),
              transition: 'all 0.15s',
              position: 'relative',
            }}>
            {m.isStart && mode!==m.id && (
              <span style={{position:'absolute',top:-8,left:8,background:'#2563EB',color:'#fff',
                fontSize:8,fontWeight:800,letterSpacing:1,padding:'1px 6px',borderRadius:3,
                textTransform:'uppercase'}}>Start here</span>
            )}
            <div style={{fontWeight:'inherit'}}>{m.label}</div>
            <div style={{fontSize:10,opacity:0.75,marginTop:1}}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── TOPIC GENERATOR ── */}
      {mode === 'topics' && (
        <Card>
          <div style={{marginBottom:16}}>
            <SecLabel>Seed Topic (optional)</SecLabel>
            <input value={topicSeed} onChange={e=>setTopicSeed(e.target.value)}
              placeholder="e.g. morning routines, real estate investing, mindset... or leave blank"
              style={inStyle}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            <div>
              <SecLabel>Content Length</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Short','Medium','Long'].map(l=>(
                  <button key={l} onClick={()=>setTopicLength(l)}
                    style={{background:topicLength===l?'#EEF2FF':'#F9FAFB',
                      color:topicLength===l?'#2563EB':'#374151',
                      border:'1px solid '+(topicLength===l?'#C7D2FE':'#E5E7EB'),
                      borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,
                      fontWeight:topicLength===l?700:500}}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{fontSize:10,color:'#9CA3AF',marginTop:4}}>
                {topicLength==='Short'?'Reel / Short (15-60s)':topicLength==='Medium'?'Video / Carousel (1-3 min)':'YouTube / Podcast (5+ min)'}
              </div>
            </div>
            <div>
              <SecLabel>Content Angle</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Emotional','Physical','Social','Intellectual','Occupational','Financial','Environmental','Spiritual'].map(a=>(
                  <button key={a} onClick={()=>setTopicAngle(a)}
                    style={{background:topicAngle===a?'#EEF2FF':'#F9FAFB',
                      color:topicAngle===a?'#2563EB':'#374151',
                      border:'1px solid '+(topicAngle===a?'#C7D2FE':'#E5E7EB'),
                      borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,
                      fontWeight:topicAngle===a?700:500}}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SecLabel>Platform</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {PLATFORMS.map(p=>(
              <button key={p} onClick={()=>setPlatform(p)}
                style={{background:platform===p?'#EEF2FF':'#F9FAFB',
                  color:platform===p?'#2563EB':'#6B7280',
                  border:'1px solid '+(platform===p?'#C7D2FE':'#E5E7EB'),
                  borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,
                  fontWeight:platform===p?700:500}}>
                {p}
              </button>
            ))}
          </div>

          <button onClick={generateTopics} disabled={topicLoading}
            style={{background:topicLoading?'#F9FAFB':'#2563EB',color:topicLoading?'#9CA3AF':'#fff',
              border:'none',borderRadius:8,padding:'11px 24px',fontWeight:700,fontSize:14,
              cursor:topicLoading?'not-allowed':'pointer',width:'100%',marginBottom:generatedIdeas.length?16:0}}>
            {topicLoading ? 'Generating ideas...' : 'Generate 5 Topic Ideas'}
          </button>

          {topicLoading && <Spin/>}

          {generatedIdeas.length > 0 && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#6B7280',letterSpacing:'0.06em',
                textTransform:'uppercase',marginBottom:10}}>
                Pick one to script immediately
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {generatedIdeas.map((idea, idx) => (
                  <button key={idx} onClick={()=>selectIdea(idea)}
                    style={{
                      background: selectedIdea===idea ? '#EEF2FF' : '#F9FAFB',
                      border: '1px solid ' + (selectedIdea===idea ? '#C7D2FE' : '#E5E7EB'),
                      borderRadius: 8,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.15s',
                    }}>
                    <span style={{width:22,height:22,borderRadius:'50%',background:'#2563EB',
                      color:'#fff',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',
                      justifyContent:'center',flexShrink:0}}>{idx+1}</span>
                    <span style={{fontSize:13,color:'#111827',fontWeight:selectedIdea===idea?700:500,flex:1,textAlign:'left',lineHeight:1.4}}>
                      {idea}
                    </span>
                    <span style={{fontSize:11,color:'#2563EB',fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>
                      {selectedIdea===idea ? 'Scripting →' : 'Use this →'}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{marginTop:12,fontSize:11,color:'#9CA3AF',textAlign:'center'}}>
                Selecting an idea loads it directly into the Script tool
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── SCRIPT / CAPTION / BATCH / EPISODE / REPURPOSE / BRIEF ── */}
      {mode !== 'topics' && (
        <Card>
          {/* Carried-over idea from Topic Generator */}
          {selectedIdea && mode === 'script' && (
            <div style={{background:'#EFF6FF',border:'1px solid #BFDBFE',borderRadius:6,
              padding:'8px 12px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:9,fontWeight:800,color:'#2563EB',letterSpacing:1,textTransform:'uppercase',flexShrink:0}}>
                From Topic Generator
              </span>
              <span style={{fontSize:12,color:'#374151',flex:1}}>{selectedIdea}</span>
              <button onClick={()=>{setSelectedIdea(null);setTopic('');}}
                style={{background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:11,flexShrink:0}}>
                ✕
              </button>
            </div>
          )}

          {/* Client selector for brief mode */}
          {mode === 'brief' && (
            <>
              <SecLabel>Client</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {clients.map(c=>(
                  <button key={c.id} onClick={()=>setSelectedClient(c)}
                    style={{background:selectedClient?.id===c.id?'#2563EB':'#F9FAFB',color:selectedClient?.id===c.id?'#fff':'#111827',
                      border:'1px solid '+(selectedClient?.id===c.id?'#2563EB':'#E5E7EB'),borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>
                    {c.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Topic input */}
          {mode !== 'repurpose' && (
            <>
              <SecLabel>{mode==='brief'?'Topics / Content Ideas for This Session':mode==='episode'?'Episode Title':'Topic'}</SecLabel>
              <input value={mode==='episode'?episodeTitle:topic}
                onChange={e=>mode==='episode'?setEpisodeTitle(e.target.value):setTopic(e.target.value)}
                placeholder={mode==='brief'?'List the pieces you want to film...':mode==='episode'?'e.g. My morning routine that changed everything':'e.g. Why most people fail at building habits...'}
                style={inStyle}/>
            </>
          )}

          {/* Script length */}
          {mode === 'script' && (
            <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
              {['short','medium','long','thread'].map(s=>(
                <button key={s} onClick={()=>setScriptMode(s)}
                  style={{background:scriptMode===s?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid '+(scriptMode===s?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:scriptMode===s?700:500,textTransform:'capitalize'}}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Caption hook */}
          {mode === 'caption' && (
            <>
              <SecLabel>Opening Hook (optional)</SecLabel>
              <input value={captionHook} onChange={e=>setCaptionHook(e.target.value)}
                placeholder="First line of your caption..." style={inStyle}/>
            </>
          )}

          {/* Batch count */}
          {mode === 'batch' && (
            <>
              <SecLabel>Number of Posts</SecLabel>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                {['3','5','7','10'].map(n=>(
                  <button key={n} onClick={()=>setBatchCount(n)}
                    style={{background:batchCount===n?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid '+(batchCount===n?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:batchCount===n?700:500}}>
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Episode notes */}
          {mode === 'episode' && (
            <>
              <SecLabel>Episode Notes / Timestamps</SecLabel>
              <textarea value={episodeNotes} onChange={e=>setEpisodeNotes(e.target.value)} rows={3}
                placeholder="Paste transcript, notes, or timestamps..." style={taStyle}/>
            </>
          )}

          {/* Repurpose inputs */}
          {mode === 'repurpose' && (
            <>
              <SecLabel>Original Script or Content</SecLabel>
              <textarea value={repurposeFrom} onChange={e=>setRepurposeFrom(e.target.value)} rows={4}
                placeholder="Paste your original script, post, or transcript here..." style={taStyle}/>
              <SecLabel>Original Platform</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                {PLATFORMS.map(p=>(
                  <button key={p} onClick={()=>setRepurposePlatform(p)}
                    style={{background:repurposePlatform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid '+(repurposePlatform===p?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:repurposePlatform===p?700:500}}>
                    {p}
                  </button>
                ))}
              </div>
              <SecLabel>Repurpose To</SecLabel>
            </>
          )}

          {/* Brief session inputs */}
          {mode === 'brief' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <SecLabel>Session Date</SecLabel>
                <input value={sessionDate} onChange={e=>setSessionDate(e.target.value)} placeholder="e.g. Saturday morning" style={inStyle}/>
              </div>
              <div>
                <SecLabel>Location</SecLabel>
                <input value={sessionLocation} onChange={e=>setSessionLocation(e.target.value)} placeholder="e.g. Home office, gym" style={inStyle}/>
              </div>
              <div>
                <SecLabel>Equipment</SecLabel>
                <input value={sessionEquip} onChange={e=>setSessionEquip(e.target.value)} placeholder="e.g. iPhone, ring light" style={inStyle}/>
              </div>
              <div>
                <SecLabel>Duration</SecLabel>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['1 hour','2-3 hours','4-5 hours','Full day'].map(d=>(
                    <button key={d} onClick={()=>setSessionDuration(d)}
                      style={{background:sessionDuration===d?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid '+(sessionDuration===d?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:sessionDuration===d?700:500}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Angle + Platform (not for episode/brief) */}
          {!['episode','brief'].includes(mode) && (
            <>
              <SecLabel>Content Angle</SecLabel>
              <AngleGrid selected={angle} onSelect={setAngle}/>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {PLATFORMS.map(p=>(
                  <button key={p} onClick={()=>setPlatform(p)}
                    style={{background:platform===p?'#EEF2FF':'#F9FAFB',
                      color:platform===p?'#2563EB':'#6B7280',
                      border:'1px solid '+(platform===p?'#C7D2FE':'#E5E7EB'),
                      borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:500}}>
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}

          <button onClick={run} disabled={loading||(!topic&&mode!=='repurpose')||(!repurposeFrom&&mode==='repurpose')}
            style={{background:loading?'#F9FAFB':'#2563EB',color:loading?'#9CA3AF':'#fff',
              border:'none',borderRadius:8,padding:'11px 24px',fontWeight:700,cursor:loading?'not-allowed':'pointer',
              fontSize:14,width:'100%',letterSpacing:'0.01em'}}>
            {loading ? 'Generating...' : MODES.find(m2=>m2.id===mode)?.label + ' →'}
          </button>
        </Card>
      )}

      {loading && <Spin/>}
      {out && <DocOutput text={out} title={MODES.find(m2=>m2.id===mode)?.label + ' — SIGNAL'}/>}
    </div>
  );
}

function TrendIntelPanel() {
  const { alerts, loading, lastRun, checkTrends, markSeen, unseen, apiError } = useTrendAlerts();
  const [expanded, setExpanded] = React.useState(null); // id of expanded card

  const stripMd = (str) => (str || '').replace(/\*\*/g, '').replace(/\*/g, '');

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h3 style={{margin:0,fontSize:15,fontWeight:800,color:'#111827',letterSpacing:'-0.02em'}}>Trend Intel</h3>
          <p style={{margin:'3px 0 0',fontSize:12,color:'#6B7280'}}>
            {lastRun ? `Last scanned: ${lastRun}` : 'Scan for viral content across your content angles'}
          </p>
        </div>
        <button onClick={checkTrends} disabled={loading}
          style={{background:loading?'#F9FAFB':'#2563EB',color:loading?'#9CA3AF':'#fff',
            border:'none',borderRadius:8,padding:'8px 18px',fontWeight:700,fontSize:13,
            cursor:loading?'default':'pointer'}}>
          {loading ? 'Scanning...' : alerts.length > 0 ? 'Refresh Trends' : 'Scan Now'}
        </button>
      </div>

      {apiError && (
        <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'12px 16px',marginBottom:16,fontSize:12,color:'#DC2626'}}>
          {apiError}
        </div>
      )}

      {loading && (
        <div style={{textAlign:'center',padding:'32px 0',color:'#6B7280',fontSize:13}}>
          Scanning 3 content angles via Perplexity... this takes about 5 seconds.
        </div>
      )}

      {!loading && alerts.length === 0 && !apiError && (
        <div style={{textAlign:'center',padding:'40px 0',color:'#9CA3AF',fontSize:13}}>
          No trends scanned yet. Hit Scan Now to find viral content across your angles.
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
          {alerts.map(alert => {
            const isOpen = expanded === alert.id;
            const cleanText = stripMd(alert.text);
            return (
              <div key={alert.id} style={{
                background:'#FFFFFF',
                border:`1px solid ${isOpen?'#C7D2FE':'#E5E7EB'}`,
                borderRadius:10,
                boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
                overflow:'hidden',
                cursor:'pointer',
              }} onClick={()=>{ setExpanded(isOpen?null:alert.id); if(!alert.seen)markSeen(); }}>
                {/* Card header */}
                <div style={{padding:'12px 14px 10px',borderBottom:'1px solid #F3F4F6'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:9,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'#2563EB'}}>
                      {alert.angle}
                    </span>
                    {!alert.seen && (
                      <span style={{background:'#2563EB',color:'#fff',borderRadius:3,padding:'1px 6px',fontSize:8,fontWeight:800}}>NEW</span>
                    )}
                  </div>
                  {alert.account && alert.account !== alert.platform+' trend' && (
                    <div style={{fontSize:13,fontWeight:700,color:'#111827',marginBottom:2}}>{alert.account}</div>
                  )}
                  <div style={{fontSize:11,color:'#6B7280',lineHeight:1.5}}>
                    {cleanText.slice(0, isOpen ? 500 : 120)}{!isOpen && cleanText.length > 120 ? '...' : ''}
                  </div>
                </div>

                {/* Card footer */}
                <div style={{padding:'8px 14px',display:'flex',alignItems:'center',gap:8,background:'#FAFAFA'}}>
                  {alert.views && (
                    <span style={{fontSize:10,fontWeight:700,color:'#16a34a',background:'#DCFCE7',
                      borderRadius:4,padding:'2px 7px'}}>{alert.views}</span>
                  )}
                  <span style={{fontSize:10,color:'#9CA3AF',flex:1}}>{alert.platform}</span>
                  {alert.profileUrl && (
                    <a href={alert.profileUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{fontSize:10,color:'#2563EB',fontWeight:700,textDecoration:'none'}}>
                      View →
                    </a>
                  )}
                  <a href={alert.searchUrl} target="_blank" rel="noopener noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{fontSize:10,color:'#6B7280',textDecoration:'none'}}>
                    Search
                  </a>
                  <span style={{fontSize:9,color:'#D1D5DB'}}>{isOpen?'▲':'▼'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function ResearchHub() {
  const [mode, setMode] = useState('pipeline');
  const [clients] = useClients();
  const [activeClient] = useActiveClient();

  // Pipeline state
  const [query, setQuery] = useState('');
  const [angle, setAngle] = useState('occupational');
  const [platform, setPlatform] = useState('Instagram');
  const [tier, setTier] = useState(0);
  const [research, setResearch] = useState('');
  const [intel, setIntel] = useState('');
  const [script, setScript] = useState('');
  const [step, setStep] = useState('idle');

  // Shared output
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  // CompetitorSpy state
  const [spyHandle, setSpyHandle] = useState('');
  const [rawData, setRawData] = useState('');

  // Hashtag state
  const [niche, setNiche] = useState('');
  const [followers, setFollowers] = useState('Under 10K');

  // ViralFormat state
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [viralTopic, setViralTopic] = useState('');
  useEffect(() => { setSelectedClient(activeClient); }, []);

  // Extract state
  const [extractContent, setExtractContent] = useState('');
  const [extractQ, setExtractQ] = useState('');

  const trendingChips = (() => {
    try {
      const stored = localStorage.getItem('encis_trend_alerts');
      if (!stored) return [];
      return JSON.parse(stored).filter(a=>a.title||a.text).map(a=>({label:a.title||a.text?.slice(0,50),angle:a.angle})).slice(0,6);
    } catch { return []; }
  })();

  const runPipelineResearch = async () => {
    if(!query) return;
    setStep('researching'); setResearch(''); setIntel(''); setScript('');
    const t = TIER_PROMPTS[tier];
    const today = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const res = await perp(`Today is ${today}. ${t.desc}: ${query} — focus on ${ANGLES.find(a=>a.id===angle)?.label||angle} angle. Include credible sources with URLs and publication dates.`);
    setResearch(res); setStep('idle');
  };
  const runExtractIntel = async () => {
    if(!research) return;
    setStep('extracting'); setIntel(''); setScript('');
    const res = await ai(PIPELINE_EXTRACT(research, ANGLES.find(a=>a.id===angle)?.label||angle));
    setIntel(res); setStep('idle');
    // Save intel so ContentCreationHub can auto-load it
    try { localStorage.setItem('encis_pipeline_intel', JSON.stringify({ content: res, topic: query, angle: angle, timestamp: Date.now() })); } catch {}
  };
  const runScriptFromIntel = async () => {
    if(!intel) return;
    setStep('scripting'); setScript('');
    const res = await ai(PIPELINE_SCRIPT(intel, platform));
    setScript(res); setStep('idle');
  };

  const runSpy = async () => {
    if(!spyHandle) return;
    setLoading(true); setOut('');
    const res = await ai(SPY_PROMPT(spyHandle, platform, rawData, ANGLES.find(a=>a.id===angle)?.label||angle));
    setOut(res); setLoading(false);
    try { const h = JSON.parse(localStorage.getItem('encis_spy_history')||'[]'); h.unshift({handle:spyHandle,platform,angle:ANGLES.find(a=>a.id===angle)?.label||angle,summary:res.slice(0,200),date:new Date().toLocaleDateString()}); localStorage.setItem('encis_spy_history',JSON.stringify(h.slice(0,10))); } catch {}
  };
  const runHashtag = async () => {
    if(!niche) return;
    setLoading(true); setOut('');
    const res = await ai(HASHTAG_PROMPT(niche, platform, ANGLES.find(a=>a.id===angle)?.label||angle, followers));
    setOut(res); setLoading(false);
  };
  const runViral = async () => {
    if(!selectedFormat) return;
    setLoading(true); setOut('');
    const res = await ai(VIRAL_FORMAT_PROMPT(selectedClient||activeClient, selectedFormat, viralTopic, platform));
    setOut(res); setLoading(false);
  };
  const runExtract = async () => {
    if(!extractContent) return;
    setLoading(true); setOut('');
    const res = await ai(EP_PROMPT(extractContent, extractQ));
    setOut(res); setLoading(false);
  };

  const MODES = [
    { id:'pipeline',  label:'Research Pipeline', desc:'Perplexity → Intel → Script' },
    { id:'trends',    label:'Trend Intel',       desc:'Live viral content alerts' },
    { id:'spy',       label:'Competitor Intel',  desc:'Analyze competitor strategy' },
    { id:'hashtag',   label:'Hashtag Strategy',  desc:'Tiered hashtag research' },
    { id:'viral',     label:'Viral Formats',     desc:'18 proven content formats' },
    { id:'extract',   label:'Insight Extract',   desc:'Pull hooks from any content' },
  ];

  const VIRAL_FORMATS = ['Problem-Agitate-Solve','Before-After-Bridge','5 Things Nobody Tells You','Day in My Life','Myth vs Reality','Hot Take','Story + Lesson','React + Commentary','Step-by-Step Tutorial','Controversial Opinion','Behind the Scenes','Q&A Format','Prediction','Listicle','Personal Failure Story'];
  const inStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'};
  const taStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box',fontFamily:'inherit'};
  const btnBase = (active) => ({background:active?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.04)',color:active?'#00C2FF':'#6B7280',border:'1px solid '+(active?'rgba(0,194,255,0.2)':'rgba(255,255,255,0.06)'),borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,fontWeight:active?700:400,transition:'all 0.15s'});

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Research Hub</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Research pipeline, competitor intel, hashtag strategy, viral formats, and insight extraction.</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setOut('');setResearch('');setIntel('');setScript('');}}
            style={{...btnBase(mode===m.id)}}>
            <div style={{fontWeight:700}}>{m.label}</div>
            <div style={{fontSize:10,opacity:0.7,marginTop:1}}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── PIPELINE ── */}
      {mode==='pipeline' && (
        <div>
          <Card style={{marginBottom:12}}>
            <SecLabel>Research Topic</SecLabel>
            {trendingChips.length>0 && (
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                {trendingChips.map((chip,i)=>(
                  <button key={i} onClick={()=>setQuery(chip.label)}
                    style={{background:query===chip.label?'#EEF2FF':'#F9FAFB',border:`1px solid ${query===chip.label?'#2563EB':'rgba(0,194,255,0.15)'}`,borderRadius:20,padding:'4px 12px',cursor:'pointer',color:'#374151',fontSize:11}}>
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Colorado real estate market, mindset for high performers..." style={inStyle}/>
            <SecLabel>Content Angle</SecLabel>
            <AngleGrid selected={angle} onSelect={setAngle}/>
            <SecLabel>Research Depth</SecLabel>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
              {TIER_PROMPTS.map((t,i)=>(
                <button key={i} onClick={()=>setTier(i)}
                  style={{background:tier===i?'#2563EB':'#F3F4F6',color:tier===i?'#FFFFFF':'#374151',border:'1px solid '+(tier===i?'transparent':'#E5E7EB'),borderRadius:8,padding:'10px 8px',cursor:'pointer',textAlign:'left'}}>
                  <div style={{fontWeight:700,fontSize:12}}>{t.label}</div>
                  <div style={{color:tier===i?'rgba(255,255,255,0.8)':'#6B7280',fontSize:10,marginTop:2}}>{t.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={runPipelineResearch} disabled={step==='researching'||!query}
              style={{background:step==='researching'||!query?'rgba(255,255,255,0.04)':'#00C2FF',color:step==='researching'||!query?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:step==='researching'||!query?'not-allowed':'pointer',fontSize:13}}>
              {step==='researching'?'Researching...':'Step 1: Research'}
            </button>
          </Card>
          {research && (
            <Card style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <SecLabel style={{margin:0}}>Raw Research</SecLabel>
                <div style={{display:'flex',gap:8}}>
                  <CopyBtn text={research}/>
                  <button onClick={runExtractIntel} disabled={step==='extracting'}
                    style={{background:step==='extracting'?'rgba(255,255,255,0.04)':'#00C2FF',color:step==='extracting'?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:step==='extracting'?'not-allowed':'pointer'}}>
                    {step==='extracting'?'Extracting...':'Step 2: Extract Intel'}
                  </button>
                </div>
              </div>
              <div style={{color:'#6B7280',fontSize:12,lineHeight:1.7,whiteSpace:'pre-wrap'}}
                dangerouslySetInnerHTML={{__html:research.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" style="color:#00C2FF;text-decoration:none;">$1</a>')}}>
              </div>
            </Card>
          )}
          {intel && (
            <Card style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <SecLabel style={{margin:0}}>Intelligence Brief</SecLabel>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <CopyBtn text={intel}/>
                  <div style={{display:'flex',gap:4}}>
                    {PLATFORMS.map(p=>(
                      <button key={p} onClick={()=>setPlatform(p)}
                        style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:5,padding:'4px 8px',cursor:'pointer',fontSize:11}}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button onClick={runScriptFromIntel} disabled={step==='scripting'}
                    style={{background:step==='scripting'?'rgba(255,255,255,0.04)':'#00C2FF',color:step==='scripting'?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:step==='scripting'?'not-allowed':'pointer'}}>
                    {step==='scripting'?'Writing...':'Step 3: Write Script'}
                  </button>
                </div>
              </div>
              <pre style={{color:'#111827',fontSize:12,whiteSpace:'pre-wrap',margin:0,lineHeight:1.6,maxHeight:280,overflowY:'auto'}}>{intel}</pre>
            </Card>
          )}
          {script && <DocOutput text={script} title="Research Pipeline Script — SIGNAL"/>}
          {(step==='researching'||step==='extracting'||step==='scripting') && <Spin/>}
        </div>
      )}

      {/* ── COMPETITOR SPY ── */}
      {mode==='trends' && (
        <TrendIntelPanel/>
      )}

      {mode==='spy' && (
        <Card>
          <SecLabel>Competitor Handle or Name</SecLabel>
          <input value={spyHandle} onChange={e=>setSpyHandle(e.target.value)} placeholder="@handle or Creator Name" style={inStyle}/>
          <SecLabel>Platform</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
            {PLATFORMS.map(p=><button key={p} onClick={()=>setPlatform(p)} style={btnBase(platform===p)}>{p}</button>)}
          </div>
          <SecLabel>Content Angle to Analyze</SecLabel>
          <AngleGrid selected={angle} onSelect={setAngle}/>
          <SecLabel>Raw Data (paste their recent posts, stats, or observations)</SecLabel>
          <textarea value={rawData} onChange={e=>setRawData(e.target.value)} rows={4}
            placeholder="Paste their recent post titles, view counts, engagement rates, or any intel you have..." style={taStyle}/>
          <button onClick={runSpy} disabled={loading||!spyHandle}
            style={{background:!spyHandle||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!spyHandle||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!spyHandle||loading?'not-allowed':'pointer',fontSize:13}}>
            {loading?'Analyzing...':'Analyze Competitor'}
          </button>
          {loading&&<Spin/>}
          {out&&<DocOutput text={out} title={`Competitor Intel: ${spyHandle}`}/>}
        </Card>
      )}

      {/* ── HASHTAG STRATEGY ── */}
      {mode==='hashtag' && (
        <Card>
          <SecLabel>Niche or Topic</SecLabel>
          <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. Colorado real estate, health coaching, mindset..." style={inStyle}/>
          <SecLabel>Content Angle</SecLabel>
          <AngleGrid selected={angle} onSelect={setAngle}/>
          <SecLabel>Platform</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
            {PLATFORMS.map(p=><button key={p} onClick={()=>setPlatform(p)} style={btnBase(platform===p)}>{p}</button>)}
          </div>
          <SecLabel>Account Size</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
            {['Under 1K','Under 10K','10K-50K','50K-100K','100K+'].map(s=>(
              <button key={s} onClick={()=>setFollowers(s)} style={btnBase(followers===s)}>{s}</button>
            ))}
          </div>
          <button onClick={runHashtag} disabled={loading||!niche}
            style={{background:!niche||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!niche||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!niche||loading?'not-allowed':'pointer',fontSize:13}}>
            {loading?'Researching...':'Generate Hashtag Strategy'}
          </button>
          {loading&&<Spin/>}
          {out&&<DocOutput text={out} title={`Hashtag Strategy: ${niche} on ${platform}`}/>}
        </Card>
      )}

      {/* ── VIRAL FORMATS ── */}
      {mode==='viral' && (
        <Card>
          <SecLabel>Select Format</SecLabel>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
            {VIRAL_FORMATS.map(f=>(
              <button key={f} onClick={()=>setSelectedFormat(f)}
                style={{background:selectedFormat===f?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.04)',color:selectedFormat===f?'#00C2FF':'#374151',border:'1px solid '+(selectedFormat===f?'rgba(0,194,255,0.25)':'rgba(255,255,255,0.06)'),borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:11,fontWeight:selectedFormat===f?700:400}}>
                {f}
              </button>
            ))}
          </div>
          <SecLabel>Topic</SecLabel>
          <input value={viralTopic} onChange={e=>setViralTopic(e.target.value)} placeholder="What is this piece about?" style={inStyle}/>
          <SecLabel>Platform</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
            {PLATFORMS.map(p=><button key={p} onClick={()=>setPlatform(p)} style={btnBase(platform===p)}>{p}</button>)}
          </div>
          <button onClick={runViral} disabled={loading||!selectedFormat}
            style={{background:!selectedFormat||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!selectedFormat||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!selectedFormat||loading?'not-allowed':'pointer',fontSize:13}}>
            {loading?'Building...':'Apply Format'}
          </button>
          {loading&&<Spin/>}
          {out&&<DocOutput text={out} title={`${selectedFormat} — SIGNAL`}/>}
        </Card>
      )}

      {/* ── EXTRACT ── */}
      {mode==='extract' && (
        <Card>
          <SecLabel>Content to Analyze</SecLabel>
          <textarea value={extractContent} onChange={e=>setExtractContent(e.target.value)} rows={5}
            placeholder="Paste any content — article, transcript, podcast notes, competitor post..." style={taStyle}/>
          <SecLabel>What to Extract (optional)</SecLabel>
          <input value={extractQ} onChange={e=>setExtractQ(e.target.value)}
            placeholder="e.g. hooks, key insights, content angles, monetization ideas..." style={inStyle}/>
          <button onClick={runExtract} disabled={loading||!extractContent}
            style={{background:!extractContent||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!extractContent||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!extractContent||loading?'not-allowed':'pointer',fontSize:13}}>
            {loading?'Extracting...':'Extract Intelligence'}
          </button>
          {loading&&<Spin/>}
          {out&&<DocOutput text={out} title="Insight Extraction — SIGNAL"/>}
        </Card>
      )}
    </div>
  );
}

function HookWorkshop() {
  const [mode, setMode] = useState('generate');
  const [topic, setTopic] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [hooks, setHooks] = useState('');
  const [testTopic, setTestTopic] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const runGenerate = async () => {
    if (!topic) return;
    setLoading(true); setOut('');
    const res = await ai(HOOK_PROMPT(topic, parseInt(quantity)||10));
    setOut(res); setLoading(false);
  };
  const runTest = async () => {
    if (!hooks) return;
    setLoading(true); setOut('');
    const res = await ai(HOOK_TEST_PROMPT(hooks, testTopic||topic));
    setOut(res); setLoading(false);
  };

  const inStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'};
  const taStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box',fontFamily:'inherit'};

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Hook Workshop</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Generate scroll-stopping hooks and score them before you film.</p>
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {[{id:'generate',label:'Generate Hooks'},{id:'test',label:'Score Hooks'}].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setOut('');}}
            style={{background:mode===m.id?'#EEF2FF':'#F9FAFB',color:mode===m.id?'#2563EB':'#6B7280',border:'1px solid '+(mode===m.id?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:700}}>
            {m.label}
          </button>
        ))}
      </div>
      <Card>
        {mode==='generate' ? (
          <>
            <SecLabel>Topic or Concept</SecLabel>
            <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. morning routine, real estate investing, mindset shift..." style={inStyle}/>
            <SecLabel>Number of Hooks</SecLabel>
            <div style={{display:'flex',gap:6,marginBottom:14}}>
              {['5','10','15','20'].map(n=>(
                <button key={n} onClick={()=>setQuantity(n)}
                  style={{background:quantity===n?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'5px 14px',cursor:'pointer',fontSize:12,fontWeight:700}}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={runGenerate} disabled={loading||!topic}
              style={{background:!topic||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!topic||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!topic||loading?'not-allowed':'pointer',fontSize:13}}>
              {loading?'Writing hooks...':'Generate Hooks'}
            </button>
          </>
        ) : (
          <>
            <SecLabel>Paste Your Hooks to Score</SecLabel>
            <textarea value={hooks} onChange={e=>setHooks(e.target.value)} rows={6}
              placeholder="Paste your hooks here, one per line..." style={taStyle}/>
            <SecLabel>Topic Context (optional)</SecLabel>
            <input value={testTopic} onChange={e=>setTestTopic(e.target.value)} placeholder="What is this content about?" style={inStyle}/>
            <button onClick={runTest} disabled={loading||!hooks}
              style={{background:!hooks||loading?'rgba(255,255,255,0.04)':'#00C2FF',color:!hooks||loading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:!hooks||loading?'not-allowed':'pointer',fontSize:13}}>
              {loading?'Scoring...':'Score Hooks'}
            </button>
          </>
        )}
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title="Hook Workshop — SIGNAL"/>}
    </div>
  );
}

function GrowthDashboard() {
  const [mode, setMode] = useState('roi');
  const [activeClient] = useActiveClient();

  // ROI state (preserved from ROIDashboard)
  const [weeks, setWeeks] = useState(() => { try { return JSON.parse(localStorage.getItem('encis_roi_weeks')||'[]'); } catch { return []; } });
  const [form, setForm] = useState({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', notes:'' });
  const [showForm, setShowForm] = useState(false);
  const saveWeek = () => {
    if (!form.week) return;
    const updated = [form, ...weeks.filter(w=>w.week!==form.week)].sort((a,b)=>b.week.localeCompare(a.week));
    setWeeks(updated);
    try { localStorage.setItem('encis_roi_weeks', JSON.stringify(updated)); } catch {}
    setForm({ week:'', followers:'', reach:'', saves:'', shares:'', leads:'', notes:'' });
    setShowForm(false);
  };

  // A/B state
  const [tests, setTests] = useState(() => { try { return JSON.parse(localStorage.getItem('encis_ab_tests')||'[]'); } catch { return []; } });
  const [abForm, setAbForm] = useState({ hypothesis:'', varA:'', varB:'', metric:'', winner:'', insight:'' });
  const [showAbForm, setShowAbForm] = useState(false);
  const saveTest = () => {
    if (!abForm.hypothesis) return;
    const updated = [{ ...abForm, id: Date.now(), date: new Date().toLocaleDateString() }, ...tests];
    setTests(updated);
    try { localStorage.setItem('encis_ab_tests', JSON.stringify(updated)); } catch {}
    setAbForm({ hypothesis:'', varA:'', varB:'', metric:'', winner:'', insight:'' });
    setShowAbForm(false);
  };

  // Revenue state
  const [revEntries, setRevEntries] = useState(() => { try { return JSON.parse(localStorage.getItem('encis_revenue')||'[]'); } catch { return []; } });
  const [revForm, setRevForm] = useState({ source:'', content:'', leads:'', revenue:'', notes:'' });
  const [showRevForm, setShowRevForm] = useState(false);
  const saveRev = () => {
    if (!revForm.source) return;
    const updated = [{ ...revForm, id: Date.now(), date: new Date().toLocaleDateString() }, ...revEntries];
    setRevEntries(updated);
    try { localStorage.setItem('encis_revenue', JSON.stringify(updated)); } catch {}
    setRevForm({ source:'', content:'', leads:'', revenue:'', notes:'' });
    setShowRevForm(false);
  };

  // Gap analysis
  const [gapOut, setGapOut] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const runGapAnalysis = async () => {
    setGapLoading(true); setGapOut('');
    const log = (() => { try { return JSON.parse(localStorage.getItem('encis_content_log')||'[]'); } catch { return []; } })();
    const roiStr = weeks.length ? weeks.slice(0,8).map(w=>`Week ${w.week}: Followers ${w.followers||'?'}, Reach ${w.reach||'?'}, Saves ${w.saves||'?'}`).join('\n') : 'No ROI data';
    const prompt = `${VOICE}
You are a content gap analyst. Based on this creator's data, identify the 5 highest-impact content angles they are under-using.

ROI DATA:
${roiStr}

CONTENT LOG SAMPLE:
${log.slice(0,20).map(e=>`${e.platform} ${e.type}: ${e.title||e.topic||''} (${e.perf||'unrated'})`).join('\n')||'No content logged'}

For each gap:
1. The angle or content type being missed
2. Why it would perform based on the data
3. Three specific post ideas to fill it
4. Expected impact`;
    const res = await ai(prompt);
    setGapOut(res); setGapLoading(false);
  };

  const MODES = [
    { id:'growth', label:'Growth Dashboard' },
    { id:'ab', label:'A/B Tests' },
    { id:'revenue', label:'Revenue Attribution' },
    { id:'gaps', label:'Content Gaps' },
  ];
  const inStyle = {background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:7,padding:'8px 10px',color:'#111827',fontSize:12,boxSizing:'border-box'};

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2,flexShrink:0}}/>
        <div style={{flex:1}}>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Growth Dashboard</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>ROI tracking, A/B tests, revenue attribution, and content gap analysis — one command center.</p>
        </div>
        {(() => { try { const r = JSON.parse(localStorage.getItem('encis_last_review')||'null'); return r ? (
          <div style={{fontSize:10,color:'rgba(0,194,255,0.6)',textAlign:'right'}}>
            <div style={{fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>Last review</div>
            <div style={{color:'#6B7280'}}>{new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
          </div>
        ) : null; } catch { return null; } })()}
      </div>
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{background:mode===m.id?'#EEF2FF':'#F9FAFB',color:mode===m.id?'#2563EB':'#6B7280',border:'1px solid '+(mode===m.id?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:700}}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ROI Dashboard */}
      {mode==='roi' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <SecLabel style={{margin:0}}>Weekly Metrics</SecLabel>
            <button onClick={()=>setShowForm(s=>!s)}
              style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              + Log Week
            </button>
          </div>
          {showForm && (
            <Card style={{marginBottom:14}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                {['week','followers','reach','saves','shares','leads'].map(f=>(
                  <div key={f}>
                    <SecLabel style={{marginBottom:4}}>{f}</SecLabel>
                    <input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} placeholder={f==='week'?'e.g. Mar 10-16':'number'} style={{...inStyle,width:'100%'}}/>
                  </div>
                ))}
              </div>
              <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Notes..." style={{...inStyle,width:'100%',marginBottom:8}}/>
              <button onClick={saveWeek} style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Save</button>
            </Card>
          )}
          {weeks.length===0 ? (
            <div style={{background:'rgba(0,194,255,0.03)',border:'1px dashed #D1D5DB',borderRadius:10,padding:24,textAlign:'center',color:'#6B7280',fontSize:12}}>
              No metrics logged yet. Click + Log Week to start tracking.
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {weeks.slice(0,12).map((w,i)=>(
                <div key={i} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px 16px',display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
                  <div style={{fontWeight:700,color:'#111827',fontSize:13,minWidth:80}}>{w.week}</div>
                  {[['Followers',w.followers],['Reach',w.reach],['Saves',w.saves],['Shares',w.shares],['Leads',w.leads]].map(([k,v])=>v?(
                    <div key={k} style={{textAlign:'center'}}>
                      <div style={{fontSize:10,color:'#6B7280',letterSpacing:1,textTransform:'uppercase'}}>{k}</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111827'}}>{Number(v).toLocaleString()}</div>
                    </div>
                  ):null)}
                  {w.notes && <div style={{color:'#6B7280',fontSize:11,flex:1}}>{w.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* A/B Tests */}
      {mode==='ab' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <SecLabel style={{margin:0}}>Test Log</SecLabel>
            <button onClick={()=>setShowAbForm(s=>!s)}
              style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              + New Test
            </button>
          </div>
          {showAbForm && (
            <Card style={{marginBottom:14}}>
              {[['hypothesis','Hypothesis (what you are testing)'],['varA','Variant A'],['varB','Variant B'],['metric','Success Metric'],['winner','Winner'],['insight','Key Insight']].map(([f,label])=>(
                <div key={f} style={{marginBottom:8}}>
                  <SecLabel style={{marginBottom:4}}>{label}</SecLabel>
                  <input value={abForm[f]} onChange={e=>setAbForm(p=>({...p,[f]:e.target.value}))} style={{...inStyle,width:'100%'}}/>
                </div>
              ))}
              <button onClick={saveTest} style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer',marginTop:4}}>Save Test</button>
            </Card>
          )}
          {tests.length===0 ? (
            <div style={{background:'rgba(0,194,255,0.03)',border:'1px dashed #D1D5DB',borderRadius:10,padding:24,textAlign:'center',color:'#6B7280',fontSize:12}}>No tests logged yet.</div>
          ) : tests.map(t=>(
            <div key={t.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px 16px',marginBottom:8}}>
              <div style={{fontWeight:700,color:'#111827',fontSize:13,marginBottom:6}}>{t.hypothesis}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:6}}>
                <div style={{background:'#F9FAFB',borderRadius:6,padding:'8px 10px'}}>
                  <div style={{fontSize:9,color:'#6B7280',letterSpacing:1,textTransform:'uppercase',marginBottom:2}}>Variant A</div>
                  <div style={{color:'#6B7280',fontSize:12}}>{t.varA}</div>
                </div>
                <div style={{background:'#F9FAFB',borderRadius:6,padding:'8px 10px'}}>
                  <div style={{fontSize:9,color:'#6B7280',letterSpacing:1,textTransform:'uppercase',marginBottom:2}}>Variant B</div>
                  <div style={{color:'#6B7280',fontSize:12}}>{t.varB}</div>
                </div>
              </div>
              {t.winner && <div style={{color:'#27ae60',fontSize:12,fontWeight:700}}>Winner: {t.winner}</div>}
              {t.insight && <div style={{color:'#6B7280',fontSize:11,marginTop:4}}>{t.insight}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Revenue Attribution */}
      {mode==='revenue' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <SecLabel style={{margin:0}}>Revenue Log</SecLabel>
            <button onClick={()=>setShowRevForm(s=>!s)}
              style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              + Log Entry
            </button>
          </div>
          {showRevForm && (
            <Card style={{marginBottom:14}}>
              {[['source','Lead Source'],['content','Content That Converted'],['leads','Leads Generated'],['revenue','Revenue ($)'],['notes','Notes']].map(([f,label])=>(
                <div key={f} style={{marginBottom:8}}>
                  <SecLabel style={{marginBottom:4}}>{label}</SecLabel>
                  <input value={revForm[f]} onChange={e=>setRevForm(p=>({...p,[f]:e.target.value}))} style={{...inStyle,width:'100%'}}/>
                </div>
              ))}
              <button onClick={saveRev} style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer',marginTop:4}}>Save</button>
            </Card>
          )}
          {revEntries.length===0 ? (
            <div style={{background:'rgba(0,194,255,0.03)',border:'1px dashed #D1D5DB',borderRadius:10,padding:24,textAlign:'center',color:'#6B7280',fontSize:12}}>No revenue entries logged yet.</div>
          ) : revEntries.map(r=>(
            <div key={r.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px 16px',marginBottom:8,display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{fontWeight:700,color:'#111827',fontSize:13}}>{r.source}</div>
              {r.revenue && <div style={{color:'#27ae60',fontWeight:700,fontSize:14}}>${r.revenue}</div>}
              {r.leads && <div style={{color:'#6B7280',fontSize:12}}>{r.leads} leads</div>}
              {r.content && <div style={{color:'#6B7280',fontSize:11,flex:1}}>{r.content}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Content Gaps */}
      {mode==='gaps' && (
        <div>
          <Card>
            <p style={{color:'#6B7280',fontSize:13,lineHeight:1.7,marginBottom:16}}>
              SIGNAL analyzes your logged metrics and content history to find the 5 highest-impact angles you are under-using. The more data you have logged in ROI Dashboard and Content Memory, the more specific the analysis.
            </p>
            <button onClick={runGapAnalysis} disabled={gapLoading}
              style={{background:gapLoading?'rgba(255,255,255,0.04)':'#00C2FF',color:gapLoading?'#6B7280':'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:gapLoading?'not-allowed':'pointer',fontSize:13}}>
              {gapLoading?'Analyzing...':'Find Content Gaps'}
            </button>
          </Card>
          {gapLoading&&<Spin/>}
          {gapOut&&<DocOutput text={gapOut} title="Content Gap Analysis — SIGNAL"/>}
        </div>
      )}
    </div>
  );
}

function BioSuite() {
  const [mode, setMode] = useState('optimize');
  const [clients] = useClients();
  const [activeClient] = useActiveClient();
  const [selectedClient, setSelectedClient] = useState(null);
  useEffect(() => { setSelectedClient(activeClient); }, []);

  // Optimize state
  const [platform, setPlatform] = useState('Instagram');
  const [currentBio, setCurrentBio] = useState('');
  const [goals, setGoals] = useState('');

  // Link builder state
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [links, setLinks] = useState([{label:'',url:'',icon:''}]);

  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const runOptimize = async () => {
    setLoading(true); setOut('');
    const res = await ai(BIO_OPTIMIZER_PROMPT(selectedClient||activeClient, platform, currentBio, goals));
    setOut(res); setLoading(false);
  };
  const runBioLink = async () => {
    setLoading(true); setOut('');
    const linkList = links.map(l=>`${l.icon} ${l.label}: ${l.url}`).join('\n');
    const res = await ai(BIOLINK_PROMPT(selectedClient||activeClient, headline, subtext, linkList));
    setOut(res); setLoading(false);
  };

  const inStyle = {width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'9px 12px',color:'#111827',fontSize:13,marginBottom:12,boxSizing:'border-box'};
  const btnBase = (active) => ({background:active?'rgba(0,194,255,0.1)':'rgba(255,255,255,0.04)',color:active?'#00C2FF':'#6B7280',border:'1px solid '+(active?'rgba(0,194,255,0.25)':'rgba(255,255,255,0.06)'),borderRadius:6,padding:'7px 18px',cursor:'pointer',fontSize:12,fontWeight:700});

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2,flexShrink:0}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800,letterSpacing:'-0.03em'}}>Bio Suite</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Optimize your profile bio and build your bio link page.</p>
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {[{id:'optimize',label:'Bio Optimizer'},{id:'link',label:'Bio Link Builder'}].map(m=>(
          <button key={m.id} onClick={()=>{setMode(m.id);setOut('');}} style={btnBase(mode===m.id)}>{m.label}</button>
        ))}
      </div>
      <Card>
        <SecLabel>Client</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
          {clients.map(c=>(
            <button key={c.id} onClick={()=>setSelectedClient(c)}
              style={{background:selectedClient?.id===c.id?'#2563EB':'rgba(255,255,255,0.06)',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700}}>
              {c.name}
            </button>
          ))}
        </div>
        {mode==='optimize' ? (
          <>
            <SecLabel>Platform</SecLabel>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {PLATFORMS.map(p=><button key={p} onClick={()=>setPlatform(p)} style={btnBase(platform===p)}>{p}</button>)}
            </div>
            <SecLabel>Current Bio</SecLabel>
            <textarea value={currentBio} onChange={e=>setCurrentBio(e.target.value)} rows={3}
              placeholder="Paste your current bio here..."
              style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:12,boxSizing:'border-box',fontFamily:'inherit'}}/>
            <SecLabel>Goals</SecLabel>
            <input value={goals} onChange={e=>setGoals(e.target.value)} placeholder="e.g. grow email list, attract real estate leads, book podcast guests..." style={inStyle}/>
            <button onClick={runOptimize} disabled={loading}
              style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:'pointer',fontSize:13}}>
              {loading?'Optimizing...':'Optimize Bio'}
            </button>
          </>
        ) : (
          <>
            <SecLabel>Headline</SecLabel>
            <input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Real estate. Mindset. Colorado life." style={inStyle}/>
            <SecLabel>Subtext</SecLabel>
            <input value={subtext} onChange={e=>setSubtext(e.target.value)} placeholder="e.g. Helping working parents build wealth through real estate" style={inStyle}/>
            <SecLabel>Links</SecLabel>
            {links.map((l,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'60px 1fr 2fr auto',gap:6,marginBottom:6,alignItems:'center'}}>
                <input value={l.icon} onChange={e=>{const n=[...links];n[i]={...n[i],icon:e.target.value};setLinks(n);}} placeholder="Icon" style={{...inStyle,margin:0,textAlign:'center'}}/>
                <input value={l.label} onChange={e=>{const n=[...links];n[i]={...n[i],label:e.target.value};setLinks(n);}} placeholder="Label" style={{...inStyle,margin:0}}/>
                <input value={l.url} onChange={e=>{const n=[...links];n[i]={...n[i],url:e.target.value};setLinks(n);}} placeholder="URL" style={{...inStyle,margin:0}}/>
                <button onClick={()=>setLinks(links.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'#6B7280',cursor:'pointer',fontSize:16,padding:'0 4px'}}>×</button>
              </div>
            ))}
            <button onClick={()=>setLinks([...links,{label:'',url:'',icon:''}])}
              style={{background:'#FFFFFF',color:'#6B7280',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,marginBottom:14}}>
              + Add Link
            </button>
            <button onClick={runBioLink} disabled={loading}
              style={{display:'block',background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:6,padding:'9px 20px',fontWeight:700,cursor:'pointer',fontSize:13}}>
              {loading?'Building...':'Generate Bio Link Page'}
            </button>
          </>
        )}
      </Card>
      {loading&&<Spin/>}
      {out&&<DocOutput text={out} title="Bio Suite — SIGNAL"/>}
    </div>
  );
}


function ContentLibrary() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('client_id', (() => { try { const c = JSON.parse(localStorage.getItem('encis_active_client') || 'null'); return c?.id || 'jason'; } catch { return 'jason'; } })())
        .limit(200);
      if (!error) setItems(data || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    await supabase.from('saved_content').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const types = ['all', ...new Set(items.map(i => i.type).filter(Boolean))];

  const filtered = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (search && !JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeColors = {
    script: '#1B4F72', caption: '#145A32', batch: '#7E5109',
    calendar: '#6E2F8E', profile: '#0A66C2', magnet: '#C0392B',
    community: '#1A5276', default: '#2C3E50',
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Content Library</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>
              {items.length > 0 ? `${items.length} pieces saved to Supabase` : 'Saved content appears here'}
            </p>
          </div>
        </div>
        <button onClick={fetchItems}
          style={{background:'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          Refresh
        </button>
      </div>

      {items.length > 0 && (
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search saved content..."
            style={{flex:1,minWidth:200,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'8px 12px',color:'#111827',fontSize:13}}/>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {types.map(t => (
              <button key={t} onClick={()=>setFilter(t)}
                style={{background:filter===t?'#EEF2FF':'#F9FAFB',color:'#111827',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:filter===t?700:400,textTransform:'capitalize'}}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{textAlign:'center',padding:'3rem',color:'#6B7280',fontSize:13}}>
          Loading from Supabase...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          <div style={{fontSize:32,marginBottom:12}}>📭</div>
          <div style={{color:'#111827',fontWeight:700,fontSize:18,marginBottom:8}}>Nothing saved yet</div>
          <div style={{color:'#6B7280',fontSize:14}}>Generate content in any tool and hit Save — it shows up here.</div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background:'#FFFFFF',
              border:'1px solid #E5E7EB',
              borderLeft:`3px solid ${typeColors[item.type]||typeColors.default}`,
              borderRadius:10,
              padding:'14px 16px',
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{background:typeColors[item.type]||typeColors.default,color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase'}}>
                      {item.type||'content'}
                    </span>
                    <span style={{color:'#6B7280',fontSize:11}}>
                      {new Date(item.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                    {item.platform && <span style={{background:'#F9FAFB',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10}}>{item.platform}</span>}
                    {item.client_name && <span style={{background:'#F9FAFB',color:'#6B7280',borderRadius:4,padding:'2px 7px',fontSize:10}}>👤 {item.client_name}</span>}
                  </div>
                  <div style={{color:'#111827',fontWeight:600,fontSize:13,marginBottom:4}}>{item.title||'Untitled'}</div>
                  {item.content_preview && (
                    <div style={{color:'#6B7280',fontSize:12,lineHeight:1.6}}>
                      {item.content_preview.slice(0,200)}{item.content_preview.length>200?'...':''}
                    </div>
                  )}
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>navigator.clipboard.writeText(item.full_content||item.content_preview||'')}
                    style={{background:'#F9FAFB',color:'#6B7280',border:'1px solid #E5E7EB',borderRadius:6,padding:'5px 10px',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                    Copy
                  </button>
                  <button onClick={()=>deleteItem(item.id)}
                    style={{background:'transparent',color:'#D1D5DB',border:'none',borderRadius:6,padding:'5px 8px',fontSize:14,cursor:'pointer'}}>
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && items.length>0 && (
            <div style={{textAlign:'center',padding:'2rem',color:'#6B7280',fontSize:13}}>No results match your filter.</div>
          )}
        </div>
      )}
    </div>
  );
}


const ABHookTester = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [hooks, setHooks] = useState(['', '', '']);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try { const s = localStorage.getItem('encis_ab_hooks'); if (s) setSaved(JSON.parse(s)); } catch {}
  }, []);

  const addHook = () => { if (hooks.length < 6) setHooks([...hooks, '']); };
  const removeHook = (i) => { if (hooks.length > 2) setHooks(hooks.filter((_, idx) => idx !== i)); };
  const updateHook = (i, val) => setHooks(hooks.map((h, idx) => idx === i ? val : h));

  const run = async () => {
    const filled = hooks.filter(h => h.trim());
    if (!topic || filled.length < 2) return;
    setLoading(true); setOut('');
    const prompt = `You are a viral content strategist who has analyzed thousands of hooks.
Topic: "${topic}" | Platform: ${platform}
Score each hook variation below. Be direct and specific.
HOOKS:
${filled.map((h, i) => `${i + 1}. ${h}`).join('\n')}
For EACH hook:
**HOOK [N]:** [quote the hook]
**Score:** [X/10]
**Scroll-Stop Power:** [1-10]
**Curiosity Gap:** [1-10]
**Specificity:** [1-10]
**Weakness:** [one sentence]
**Rewrite:** [improved version]
---
After all hooks:
**WINNER:** Hook [N] — [one sentence why]
**THE OPTIMAL HOOK:** [best possible version combining strongest elements]
**Why This Wins:** [3 specific reasons]`;
    const res = await ai(prompt);
    setOut(res);
    const entry = { id: Date.now(), topic, platform, hooks: filled, result: res, date: new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) };
    const updated = [entry, ...saved].slice(0, 20);
    setSaved(updated);
    try { localStorage.setItem('encis_ab_hooks', JSON.stringify(updated)); } catch {}
    setLoading(false);
  };

  const filledCount = hooks.filter(h => h.trim()).length;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>A/B Hook Tester</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Write 2-6 hook variations. Each gets scored and rewritten. The winner gets built into the optimal version.</p>
        </div>
      </div>
      <Card>
        <SecLabel>What is the video about?</SecLabel>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Why most people quit before they see results"
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>
        <SecLabel>Platform</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {['Instagram','TikTok','YouTube','X','LinkedIn'].map(p => (
            <button key={p} onClick={()=>setPlatform(p)}
              style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#2563EB':'#374151',border:'1px solid '+(platform===p?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:500}}>
              {p}
            </button>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <SecLabel style={{margin:0}}>Hook Variations ({filledCount} entered)</SecLabel>
          {hooks.length < 6 && <button onClick={addHook} style={{background:'#F9FAFB',color:'#6B7280',border:'1px solid #E5E7EB',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:12}}>+ Add Hook</button>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          {hooks.map((hook, i) => (
            <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{color:'#2563EB',fontWeight:800,fontSize:13,minWidth:20}}>{i+1}.</span>
              <input value={hook} onChange={e=>updateHook(i,e.target.value)} placeholder={i===0?'Your first hook...':i===1?'Your second hook...':'Another variation...'}
                style={{flex:1,background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,boxSizing:'border-box'}}/>
              {hooks.length > 2 && <button onClick={()=>removeHook(i)} style={{background:'transparent',color:'#D1D5DB',border:'none',fontSize:16,cursor:'pointer'}}>×</button>}
            </div>
          ))}
        </div>
        <RedBtn onClick={run} disabled={loading||!topic||filledCount<2}>
          {loading ? 'Scoring hooks...' : `Score ${filledCount} Hook${filledCount!==1?'s':''}`}
        </RedBtn>
      </Card>
      {loading && <Spin/>}
      {out && <DocOutput text={out} title={`Hook Test: ${topic}`}/>}
      {saved.length > 0 && (
        <div style={{marginTop:24}}>
          <div style={{fontSize:11,color:'#6B7280',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Test History</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {saved.map(s => (
              <div key={s.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px 16px',cursor:'pointer'}} onClick={()=>setOut(s.result)}>
                <div style={{color:'#111827',fontWeight:700,fontSize:13}}>{s.topic}</div>
                <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{s.platform} · {s.hooks.length} hooks · {s.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const WEEKLY_BRIEF_KEY = 'encis_weekly_briefs';

function WeeklyBriefAgent() {
  const [activeClient] = useActiveClient();
  const [step, setStep] = useState('form');
  const [identity, setIdentity] = useState('');
  const [focus, setFocus] = useState('');
  const [avoid, setAvoid] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const [selectedBrief, setSelectedBrief] = useState(null);

  useEffect(() => {
    try { const s = localStorage.getItem(WEEKLY_BRIEF_KEY); if (s) setBriefs(JSON.parse(s)); } catch {}
    if (activeClient?.voice) setIdentity(activeClient.voice.slice(0, 120));
  }, [activeClient]);

  const saveBrief = (briefText) => {
    const entry = { id: Date.now(), date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), week: new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'}), focus, platform, client: activeClient?.name || 'Jason', content: briefText };
    const updated = [entry, ...briefs].slice(0, 12);
    setBriefs(updated);
    try { localStorage.setItem(WEEKLY_BRIEF_KEY, JSON.stringify(updated)); } catch {}
    try { supabase.from('weekly_plans').insert([{ week_label: entry.week, plan_data: { focus, identity, avoid, platform }, client_name: entry.client, notes: briefText.slice(0, 500) }]); } catch {}
  };

  const run = async () => {
    if (!focus) return;
    setLoading(true); setOut('');
    const today = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const prompt = `You are the Weekly Brief Agent for ${activeClient?.name || 'Jason Fricka'} (@everydayelevations). Today is ${today}.
Identity this week: ${identity}
Content focus: ${focus}
Avoid: ${avoid || 'Nothing specific'}
Primary platform: ${platform}

Generate a complete Monday morning content brief. Be specific. Every piece should be filmable this week.

# Weekly Brief: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}

## This Week Strategic Focus
One paragraph. What the week is about and what success looks like by Sunday.

## Content Plan (5 posts)
For each post:
**Post [N] — [Day] [Platform]**
Format: [Reel/Carousel/Story/Post]
Hook: [exact first words]
Topic: [specific filmable topic]
Angle: [which dimension this serves]
CTA: [exact words]
Est. time to film: [X min]

## The One Post That Matters Most
Which of the 5 has highest potential and why.

## Monday Morning Actions
3 specific actions to start the week. Setup work that makes content better.

## 5 Hooks Ready to Use
Written out and ready. First 2-3 words carry everything.

## What to Watch This Week
2 signals that tell you the theme is landing.`;
    const res = await ai(prompt);
    setOut(res);
    saveBrief(res);
    setStep('result');
    setLoading(false);
  };

  const today = new Date();
  const isMonday = today.getDay() === 1;
  const daysUntilMonday = isMonday ? 0 : (8 - today.getDay()) % 7;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Weekly Brief Agent</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>3 questions. Full week plan. 5 ready-to-film posts. Run every Monday.</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {briefs.length > 0 && <button onClick={()=>setStep(step==='history'?'form':'history')} style={{background:step==='history'?'#EEF2FF':'#F9FAFB',color:step==='history'?'#2563EB':'#6B7280',border:'1px solid #E5E7EB',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>History ({briefs.length})</button>}
          {step !== 'form' && <button onClick={()=>{setStep('form');setOut('');}} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>+ New Brief</button>}
        </div>
      </div>
      <div style={{background:isMonday?'rgba(39,174,96,0.08)':'rgba(0,194,255,0.06)',border:`1px solid ${isMonday?'rgba(39,174,96,0.2)':'rgba(0,194,255,0.15)'}`,borderRadius:10,padding:'10px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontSize:18}}>{isMonday?'🟢':'📅'}</div>
        <div>
          <div style={{color:isMonday?'#27ae60':'#00C2FF',fontWeight:700,fontSize:13}}>{isMonday?'It's Monday — run your brief now.':`Next Monday: ${daysUntilMonday} day${daysUntilMonday!==1?'s':''} away`}</div>
          <div style={{color:'#6B7280',fontSize:11,marginTop:1}}>{briefs.length > 0 ? `Last brief: ${briefs[0].date}` : 'No briefs run yet'}</div>
        </div>
      </div>
      {step === 'form' && (
        <Card>
          <SecLabel>Who are you showing up as this week?</SecLabel>
          <textarea value={identity} onChange={e=>setIdentity(e.target.value)} rows={2} placeholder="e.g. The HR manager who sees what leadership costs real people. The dad showing his kid what discipline looks like."
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box',fontFamily:'inherit'}}/>
          <SecLabel>What is the one thing you want to focus on this week?</SecLabel>
          <textarea value={focus} onChange={e=>setFocus(e.target.value)} rows={2} placeholder="e.g. The gap between wanting to change and actually doing the work."
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box',fontFamily:'inherit'}}/>
          <SecLabel>What to avoid this week? (optional)</SecLabel>
          <input value={avoid} onChange={e=>setAvoid(e.target.value)} placeholder="e.g. Anything political, real estate pitching, hype language"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>
          <SecLabel>Primary Platform</SecLabel>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
            {['Instagram','YouTube','LinkedIn','TikTok','X','Facebook'].map(p=>(
              <button key={p} onClick={()=>setPlatform(p)} style={{background:platform===p?'#EEF2FF':'#F9FAFB',color:platform===p?'#2563EB':'#374151',border:'1px solid '+(platform===p?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'7px 14px',cursor:'pointer',fontSize:12,fontWeight:platform===p?700:500}}>{p}</button>
            ))}
          </div>
          <button onClick={run} disabled={loading||!focus} style={{background:!focus||loading?'#F3F4F6':'linear-gradient(135deg,#00C2FF,#0096CC)',color:!focus||loading?'#9CA3AF':'#000D1A',border:'none',borderRadius:8,padding:'12px 24px',fontWeight:800,cursor:!focus||loading?'not-allowed':'pointer',fontSize:14,width:'100%'}}>
            {loading ? 'Building your week...' : 'Run Weekly Brief Agent'}
          </button>
        </Card>
      )}
      {loading && <Spin/>}
      {step === 'result' && out && (
        <div>
          <div style={{background:'rgba(39,174,96,0.08)',border:'1px solid rgba(39,174,96,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:18}}>✅</span>
            <div style={{color:'#27ae60',fontWeight:700,fontSize:13}}>Brief generated and saved to history</div>
          </div>
          <DocOutput text={out} title={`Weekly Brief — ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}`}/>
        </div>
      )}
      {step === 'history' && (
        <div>
          {selectedBrief ? (
            <div>
              <button onClick={()=>setSelectedBrief(null)} style={{background:'#F9FAFB',color:'#6B7280',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',marginBottom:16}}>← Back</button>
              <DocOutput text={selectedBrief.content} title={`Weekly Brief — ${selectedBrief.week}`}/>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {briefs.map(b => (
                <div key={b.id} onClick={()=>setSelectedBrief(b)} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'16px',cursor:'pointer'}}>
                  <div style={{color:'#111827',fontWeight:700,fontSize:14}}>Week of {b.week}</div>
                  <div style={{color:'#6B7280',fontSize:12,marginTop:3}}>{b.focus?.slice(0,80)}{b.focus?.length>80?'...':''}</div>
                  <div style={{color:'#6B7280',fontSize:11,marginTop:2}}>{b.platform} · {b.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


const TREND_MONITOR_KEY = 'encis_trend_monitor';
const TREND_MONITOR_DATE_KEY = 'encis_trend_monitor_date';

const TREND_MONITOR_QUERIES = {
  Emotional: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering mental health at work, stress management for professionals, self-talk and identity, burnout recovery, or the psychological cost of carrying responsibility for others. Audience: working parents in their 30s-40s, HR managers, professionals grinding but quietly struggling. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how an HR manager and dad in Colorado should use this] / VIEWS:`,
  Physical: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering endurance athletics, training over 35, military fitness culture, morning routines and discipline, or recovering from physical setbacks. Audience: veterans and working professionals with real athletic goals — people who treat physical discipline as a proxy for life discipline. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how a Colorado endurance athlete and veteran should use this] / VIEWS:`,
  Social: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering fatherhood, parenting under career pressure, veteran community building, or showing up for people who depend on you. Audience: dads in their 30s-40s balancing career and family, veterans building civilian identity. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how a Colorado dad and veteran should use this] / VIEWS:`,
  Intellectual: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering AI tools for non-developers, learning systems for busy professionals, HR strategy, workforce intelligence, or the skill gap between school and real work. Audience: HR managers implementing AI, self-taught builders, practical learners who want intelligence not theory. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how an HR manager building AI tools should use this] / VIEWS:`,
  Occupational: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from HR influencers, people managers, or workforce consultants covering HR management, hiring and firing realities, workplace culture, managing difficult people, or the real cost of leadership. Specific niches: HR creators on Instagram or TikTok targeting professionals 30-50. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how an HR Manager at a manufacturing company in Colorado should use this] / VIEWS:`,
  Financial: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from real estate agents, mortgage educators, or wealth builders covering Colorado housing market, VA loans, veteran homebuying, first-time buyer education, or building wealth on a W-2. Specific niches: Colorado real estate social content, veteran real estate creators. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how a licensed Colorado real estate agent serving veterans and families should use this] / VIEWS:`,
  Environmental: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering Colorado outdoor life, trail running or mountain cycling, training outside year-round, or using your physical environment as part of your identity. Audience: Colorado outdoor athletes who live their environment not just pass through it. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how a Colorado-based endurance athlete and content creator should use this] / VIEWS:`,
  Spiritual: (today) => `Today is ${today}. You are a viral content analyst. Find the single most viral piece of content THIS WEEK from creators covering purpose-driven living, values-based decisions, why discipline matters beyond the obvious, veteran identity post-service, or legacy building for parents. Audience: people who want meaning not motivation, veterans building post-service identity, parents thinking about what they are passing on. Return ONLY: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: [how a veteran, dad, and mindset coach in Colorado should use this] / VIEWS:`,
};

const TREND_MONITOR_PROMPT = (angle) => {
  const today = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
  const queryFn = TREND_MONITOR_QUERIES[angle];
  return queryFn ? queryFn(today) : `Today is ${today}. Find the most viral content this week in the "${angle}" space relevant to HR managers, real estate agents, endurance athletes, and veterans in Colorado. Return: ACCOUNT: / PLATFORM: / HOOK: / WHY: / STEAL: / VIEWS:`;
};

function TrendMonitorAgent() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [scanning, setScanning] = useState(null);
  const [progress, setProgress] = useState(0);
  const [autoRunEnabled, setAutoRunEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TREND_MONITOR_KEY);
      if (stored) setAlerts(JSON.parse(stored));
      const date = localStorage.getItem(TREND_MONITOR_DATE_KEY);
      if (date) setLastRun(new Date(parseInt(date)).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}));
      const auto = localStorage.getItem('encis_trend_auto');
      if (auto) setAutoRunEnabled(JSON.parse(auto));
    } catch {}
  }, []);

  useEffect(() => {
    if (!autoRunEnabled) return;
    const lastTs = localStorage.getItem(TREND_MONITOR_DATE_KEY);
    if (!lastTs) { runScan(); return; }
    const hoursSince = (Date.now() - parseInt(lastTs)) / (1000 * 60 * 60);
    if (hoursSince > 20) runScan();
  }, [autoRunEnabled]);

  const parseAlert = (raw, angle) => {
    const lines = raw.split('\n').filter(l => l.trim());
    const get = (key) => { const line = lines.find(l => l.toUpperCase().startsWith(key + ':')); return line ? line.slice(key.length + 1).trim() : ''; };
    return { id: Date.now() + Math.random(), angle, account: get('ACCOUNT'), platform: get('PLATFORM'), hook: get('HOOK'), why: get('WHY'), steal: get('STEAL'), views: get('VIEWS'), scannedAt: Date.now(), seen: false };
  };

  const runScan = async () => {
    setLoading(true); setProgress(0);
    const newAlerts = [];
    for (let i = 0; i < ANGLES.length; i++) {
      const angle = ANGLES[i];
      setScanning(angle.label);
      setProgress(Math.round((i / ANGLES.length) * 100));
      try {
        const res = await perp(TREND_MONITOR_PROMPT(angle.label));
        if (res && res.length > 20) newAlerts.push(parseAlert(res, angle.label));
        await new Promise(r => setTimeout(r, 600));
      } catch(e) { console.error('Trend scan error', angle.label, e); }
    }
    const timestamp = Date.now().toString();
    setAlerts(newAlerts);
    setLastRun(new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}));
    setProgress(100); setScanning(null);
    try { localStorage.setItem(TREND_MONITOR_KEY, JSON.stringify(newAlerts)); localStorage.setItem(TREND_MONITOR_DATE_KEY, timestamp); } catch {}
    try { await supabase.from('agent_runs').insert([{ tool_name: 'trend_monitor', input_data: { angles: ANGLES.map(a => a.label) }, output_text: JSON.stringify(newAlerts.map(a => ({angle:a.angle,hook:a.hook,steal:a.steal}))), platform: 'multi' }]); } catch {}
    setLoading(false);
  };

  const toggleAutoRun = () => {
    const next = !autoRunEnabled;
    setAutoRunEnabled(next);
    try { localStorage.setItem('encis_trend_auto', JSON.stringify(next)); } catch {}
  };

  const markSeen = (id) => {
    const updated = alerts.map(a => a.id === id ? {...a, seen: true} : a);
    setAlerts(updated);
    try { localStorage.setItem(TREND_MONITOR_KEY, JSON.stringify(updated)); } catch {}
  };

  const unseenCount = alerts.filter(a => !a.seen).length;
  const angleColors = { Emotional:'#8B5CF6', Physical:'#EF4444', Social:'#10B981', Intellectual:'#F59E0B', Occupational:'#2563EB', Financial:'#059669', Environmental:'#0891B2', Spiritual:'#7C3AED' };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Trend Monitor Agent {unseenCount > 0 && <span style={{marginLeft:10,background:'#EF4444',color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:800,verticalAlign:'middle'}}>{unseenCount} NEW</span>}</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>8 hyper-specific queries across HR, real estate, health and wellness. Flags what's viral before competitors see it.</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={toggleAutoRun} style={{background:autoRunEnabled?'rgba(39,174,96,0.1)':'#F9FAFB',color:autoRunEnabled?'#27ae60':'#6B7280',border:'1px solid '+(autoRunEnabled?'rgba(39,174,96,0.3)':'#E5E7EB'),borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {autoRunEnabled ? '🟢 Auto-scan ON' : 'Auto-scan OFF'}
          </button>
          <button onClick={runScan} disabled={loading} style={{background:loading?'#F9FAFB':'#2563EB',color:loading?'#9CA3AF':'#fff',border:'none',borderRadius:8,padding:'7px 18px',fontSize:12,fontWeight:700,cursor:loading?'not-allowed':'pointer'}}>
            {loading ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>
      <div style={{background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{fontSize:12,color:'#6B7280'}}>{lastRun ? `Last scan: ${lastRun}` : 'Never scanned — hit Scan Now to start'}</div>
        <div style={{fontSize:11,color:'#6B7280'}}>Auto-scan runs every 20 hours when enabled</div>
      </div>
      {loading && (
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'20px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <div style={{color:'#111827',fontWeight:700,fontSize:13}}>Scanning trends...</div>
            <div style={{color:'#6B7280',fontSize:12}}>{progress}%</div>
          </div>
          <div style={{height:6,background:'#F3F4F6',borderRadius:3,marginBottom:12}}>
            <div style={{height:'100%',background:'#2563EB',borderRadius:3,width:`${progress}%`,transition:'width 0.3s'}}/>
          </div>
          {scanning && <div style={{color:'#6B7280',fontSize:12}}>Scanning: <strong style={{color:'#00C2FF'}}>{scanning}</strong></div>}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>
            {ANGLES.map(a => (
              <span key={a.id} style={{background:scanning===a.label?'rgba(0,194,255,0.15)':alerts.find(al=>al.angle===a.label)?'rgba(39,174,96,0.1)':'#F3F4F6',color:scanning===a.label?'#00C2FF':alerts.find(al=>al.angle===a.label)?'#27ae60':'#9CA3AF',borderRadius:4,padding:'3px 8px',fontSize:10,fontWeight:700}}>
                {a.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {!loading && alerts.length === 0 && (
        <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          <div style={{fontSize:40,marginBottom:12}}>📡</div>
          <div style={{color:'#111827',fontWeight:700,fontSize:18,marginBottom:8}}>No scans yet</div>
          <div style={{color:'#6B7280',fontSize:14,marginBottom:20}}>Hit Scan Now to check all 8 content angles for viral trends.</div>
          <button onClick={runScan} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Run First Scan</button>
        </div>
      )}
      {!loading && alerts.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
          {alerts.map(alert => (
            <div key={alert.id} onClick={()=>markSeen(alert.id)} style={{background:'#FFFFFF',border:`1px solid ${!alert.seen?'#C7D2FE':'#E5E7EB'}`,borderTop:`3px solid ${angleColors[alert.angle]||'#2563EB'}`,borderRadius:10,padding:'16px',cursor:'pointer',boxShadow:!alert.seen?'0 2px 8px rgba(37,99,235,0.08)':'none'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span style={{background:angleColors[alert.angle]||'#2563EB',color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{alert.angle}</span>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {!alert.seen && <span style={{background:'#EEF2FF',color:'#2563EB',borderRadius:10,padding:'1px 6px',fontSize:9,fontWeight:800}}>NEW</span>}
                  {alert.views && <span style={{fontSize:10,color:'#27ae60',fontWeight:700}}>{alert.views}</span>}
                  {alert.platform && <span style={{fontSize:10,color:'#6B7280'}}>{alert.platform}</span>}
                </div>
              </div>
              {alert.account && <div style={{color:'#111827',fontWeight:700,fontSize:13,marginBottom:6}}>{alert.account}</div>}
              {alert.hook && <div style={{background:'#F9FAFB',borderRadius:6,padding:'8px 10px',marginBottom:8,fontSize:12,color:'#111827',lineHeight:1.5,fontStyle:'italic'}}>"{alert.hook}"</div>}
              {alert.why && <div style={{fontSize:11,color:'#6B7280',lineHeight:1.5,marginBottom:6}}><strong style={{color:'#374151'}}>Why it works:</strong> {alert.why}</div>}
              {alert.steal && <div style={{fontSize:11,color:'#2563EB',lineHeight:1.5,fontWeight:600}}>→ {alert.steal}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const APPROVAL_QUEUE_KEY = 'encis_approval_queue';

function ApprovalQueueAgent() {
  const [activeClient] = useActiveClient();
  const [queue, setQueue] = useState([]);
  const [view, setView] = useState('queue');
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState('Script');
  const [genPlatform, setGenPlatform] = useState('Instagram');
  const [genAngle, setGenAngle] = useState('occupational');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    try { const s = localStorage.getItem(APPROVAL_QUEUE_KEY); if (s) setQueue(JSON.parse(s)); } catch {}
  }, []);

  const saveQueue = (updated) => { setQueue(updated); try { localStorage.setItem(APPROVAL_QUEUE_KEY, JSON.stringify(updated)); } catch {} };

  const generate = async () => {
    if (!genTopic) return;
    setGenerating(true);
    const angleLabel = ANGLES.find(a => a.id === genAngle)?.label || genAngle;
    const prompt = `${CONTENT_SOP}
Write a ${genType} for ${genPlatform} about: "${genTopic}"
Content angle: ${angleLabel}
Make it camera-ready. No filler. Hook in the first 3 seconds.
Include: Hook, Body (3 punchy points), CTA, Caption, 10 Hashtags.`;
    const res = await ai(prompt);
    const entry = { id: Date.now(), topic: genTopic, type: genType, platform: genPlatform, angle: angleLabel, content: res, status: 'pending', client: activeClient?.name || 'Jason', date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), createdAt: Date.now() };
    saveQueue([entry, ...queue]);
    setGenTopic(''); setView('queue'); setGenerating(false);
  };

  const approve = async (id) => {
    const item = queue.find(q => q.id === id);
    if (!item) return;
    saveQueue(queue.map(q => q.id === id ? {...q, status:'approved', approvedAt: Date.now()} : q));
    await saveToSupabase({ type: item.type.toLowerCase(), title: item.topic, platform: item.platform, angle: item.angle, preview: item.content.slice(0,500), full: item.content, client: item.client, notes: 'approved via queue' });
  };

  const reject = (id) => saveQueue(queue.map(q => q.id === id ? {...q, status:'rejected'} : q));
  const removeItem = (id) => { saveQueue(queue.filter(q => q.id !== id)); if (editingId === id) setEditingId(null); };
  const startEdit = (item) => { setEditingId(item.id); setEditText(item.content); };
  const saveEdit = (id) => { saveQueue(queue.map(q => q.id === id ? {...q, content: editText} : q)); setEditingId(null); };

  const pending = queue.filter(q => q.status === 'pending');
  const approved = queue.filter(q => q.status === 'approved');
  const rejected = queue.filter(q => q.status === 'rejected');
  const statusColors = { pending:'#F59E0B', approved:'#10B981', rejected:'#EF4444' };
  const genTypes = ['Script','Caption','Hook Pack','Carousel Outline','Email','LinkedIn Post'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Approval Queue {pending.length > 0 && <span style={{marginLeft:10,background:'#F59E0B',color:'#fff',borderRadius:20,padding:'2px 8px',fontSize:11,fontWeight:800,verticalAlign:'middle'}}>{pending.length} pending</span>}</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Generate → review → approve. Approved pieces go straight to Content Library.</p>
          </div>
        </div>
        <button onClick={()=>setView(view==='generate'?'queue':'generate')} style={{background:view==='generate'?'#2563EB':'#F9FAFB',color:view==='generate'?'#fff':'#374151',border:'1px solid '+(view==='generate'?'#2563EB':'#E5E7EB'),borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {view==='generate' ? 'Back to Queue' : '+ Generate Content'}
        </button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {[['Pending',pending.length,'#F59E0B'],['Approved',approved.length,'#10B981'],['Rejected',rejected.length,'#EF4444']].map(([label,val,color])=>(
          <div key={label} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color}}>{val}</div>
            <div style={{fontSize:10,color:'#6B7280',marginTop:2,textTransform:'uppercase',letterSpacing:1}}>{label}</div>
          </div>
        ))}
      </div>
      {view === 'generate' && (
        <Card style={{marginBottom:20}}>
          <SecLabel>Topic</SecLabel>
          <input value={genTopic} onChange={e=>setGenTopic(e.target.value)} placeholder="e.g. Why most people quit week 3"
            style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:13,marginBottom:14,boxSizing:'border-box'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <SecLabel>Type</SecLabel>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {genTypes.map(t=>(
                  <button key={t} onClick={()=>setGenType(t)} style={{background:genType===t?'#EEF2FF':'#F9FAFB',color:genType===t?'#2563EB':'#374151',border:'1px solid '+(genType===t?'#C7D2FE':'#E5E7EB'),borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:genType===t?700:500}}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <SecLabel>Platform</SecLabel>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {['Instagram','YouTube','LinkedIn','TikTok','X'].map(p=>(
                  <button key={p} onClick={()=>setGenPlatform(p)} style={{background:genPlatform===p?'#EEF2FF':'#F9FAFB',color:genPlatform===p?'#2563EB':'#374151',border:'1px solid '+(genPlatform===p?'#C7D2FE':'#E5E7EB'),borderRadius:5,padding:'5px 10px',cursor:'pointer',fontSize:11,fontWeight:genPlatform===p?700:500}}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <SecLabel>Content Angle</SecLabel>
          <AngleGrid selected={genAngle} onSelect={setGenAngle}/>
          <button onClick={generate} disabled={generating||!genTopic} style={{background:!genTopic||generating?'#F3F4F6':'linear-gradient(135deg,#00C2FF,#0096CC)',color:!genTopic||generating?'#9CA3AF':'#000D1A',border:'none',borderRadius:8,padding:'11px 24px',fontWeight:800,cursor:!genTopic||generating?'not-allowed':'pointer',fontSize:14,width:'100%',marginTop:12}}>
            {generating ? 'Generating...' : 'Generate & Add to Queue'}
          </button>
          {generating && <Spin/>}
        </Card>
      )}
      {view === 'queue' && (
        <div>
          {queue.length === 0 ? (
            <div style={{textAlign:'center',padding:'4rem 2rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{color:'#111827',fontWeight:700,fontSize:18,marginBottom:8}}>Queue is empty</div>
              <div style={{color:'#6B7280',fontSize:14,marginBottom:20}}>Generate content and review it before it goes live.</div>
              <button onClick={()=>setView('generate')} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Generate First Piece</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {queue.map(item => (
                <div key={item.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderLeft:`4px solid ${statusColors[item.status]}`,borderRadius:10,overflow:'hidden'}}>
                  <div style={{padding:'14px 16px',borderBottom:'1px solid #F3F4F6'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                          <span style={{background:`rgba(${item.status==='pending'?'245,158,11':item.status==='approved'?'16,185,129':'239,68,68'},0.1)`,color:statusColors[item.status],borderRadius:4,padding:'2px 8px',fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{item.status}</span>
                          <span style={{background:'#F3F4F6',color:'#374151',borderRadius:4,padding:'2px 8px',fontSize:10}}>{item.type}</span>
                          <span style={{background:'#F3F4F6',color:'#374151',borderRadius:4,padding:'2px 8px',fontSize:10}}>{item.platform}</span>
                          <span style={{color:'#9CA3AF',fontSize:11}}>{item.date}</span>
                        </div>
                        <div style={{color:'#111827',fontWeight:700,fontSize:14}}>{item.topic}</div>
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        {item.status === 'pending' && <>
                          <button onClick={()=>approve(item.id)} style={{background:'rgba(16,185,129,0.1)',color:'#10B981',border:'1px solid rgba(16,185,129,0.3)',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>✓ Approve</button>
                          <button onClick={()=>startEdit(item)} style={{background:'#F9FAFB',color:'#374151',border:'1px solid #E5E7EB',borderRadius:6,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Edit</button>
                          <button onClick={()=>reject(item.id)} style={{background:'rgba(239,68,68,0.08)',color:'#EF4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,padding:'6px 12px',fontSize:12,fontWeight:700,cursor:'pointer'}}>✕</button>
                        </>}
                        {item.status === 'approved' && <>
                          <button onClick={()=>navigator.clipboard.writeText(item.content)} style={{background:'rgba(16,185,129,0.1)',color:'#10B981',border:'1px solid rgba(16,185,129,0.3)',borderRadius:6,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Copy</button>
                          <button onClick={()=>removeItem(item.id)} style={{background:'transparent',color:'#D1D5DB',border:'none',borderRadius:6,padding:'6px 8px',fontSize:14,cursor:'pointer'}}>×</button>
                        </>}
                        {item.status === 'rejected' && <button onClick={()=>removeItem(item.id)} style={{background:'transparent',color:'#D1D5DB',border:'none',borderRadius:6,padding:'6px 8px',fontSize:14,cursor:'pointer'}}>×</button>}
                      </div>
                    </div>
                  </div>
                  {editingId === item.id ? (
                    <div style={{padding:'14px 16px'}}>
                      <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={8}
                        style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'10px 12px',color:'#111827',fontSize:12,resize:'vertical',boxSizing:'border-box',fontFamily:'inherit',lineHeight:1.7}}/>
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button onClick={()=>saveEdit(item.id)} style={{background:'#2563EB',color:'#fff',border:'none',borderRadius:6,padding:'7px 16px',fontSize:12,fontWeight:700,cursor:'pointer'}}>Save</button>
                        <button onClick={()=>setEditingId(null)} style={{background:'#F9FAFB',color:'#6B7280',border:'none',borderRadius:6,padding:'7px 14px',fontSize:12,cursor:'pointer'}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{padding:'14px 16px',maxHeight:220,overflowY:'auto'}}>
                      <pre style={{color:'#374151',fontSize:12,whiteSpace:'pre-wrap',lineHeight:1.7,fontFamily:'inherit',margin:0}}>{item.content}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


const PERF_AGENT_KEY = 'encis_perf_analysis';

function ContentPerformanceAgent() {
  const [activeClient] = useActiveClient();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [lastRun, setLastRun] = useState(null);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PERF_AGENT_KEY);
      if (saved) { const d = JSON.parse(saved); setAnalysis(d.analysis||''); setLastRun(d.date||null); }
    } catch {}
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setFetching(true);
    try {
      const clientId = (() => { try { const c = JSON.parse(localStorage.getItem('encis_active_client') || 'null'); return c?.id || 'jason'; } catch { return 'jason'; } })();
      const { data } = await supabase.from('saved_content').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(100);
      setItems(data || []);
      const r = {};
      (data || []).forEach(i => { if (i.perf_rating) r[i.id] = i.perf_rating; });
      setRatings(r);
    } catch(e) { console.error(e); }
    setFetching(false);
  };

  const rateItem = async (id, rating) => {
    setRatings(prev => ({...prev, [id]: rating}));
    try { await supabase.from('saved_content').update({ perf_rating: rating }).eq('id', id); } catch {}
  };

  const runAnalysis = async () => {
    const ratedItems = items.filter(i => ratings[i.id]);
    if (ratedItems.length < 3) return;
    setLoading(true); setAnalysis('');

    const viral = ratedItems.filter(i => ratings[i.id] === 'viral');
    const solid = ratedItems.filter(i => ratings[i.id] === 'solid');
    const flopped = ratedItems.filter(i => ratings[i.id] === 'flopped');

    const prompt = `You are a content performance analyst. Analyze this creator's content data and give direct, actionable intelligence.

Creator: ${activeClient?.name || 'Jason Fricka'} (@everydayelevations) — HR Manager, Colorado real estate agent, endurance athlete, veteran, mindset coach, dad.

CONTENT DATA:
VIRAL (${viral.length} pieces):
${viral.slice(0,8).map(i => `- [${i.type||'content'}] [${i.platform||'?'}] ${i.title || i.content_preview?.slice(0,80)}`).join('\n')}

SOLID PERFORMERS (${solid.length} pieces):
${solid.slice(0,8).map(i => `- [${i.type||'content'}] [${i.platform||'?'}] ${i.title || i.content_preview?.slice(0,80)}`).join('\n')}

FLOPPED (${flopped.length} pieces):
${flopped.slice(0,8).map(i => `- [${i.type||'content'}] [${i.platform||'?'}] ${i.title || i.content_preview?.slice(0,80)}`).join('\n')}

Analyze this data and produce:

# Content Performance Intelligence Report
**Week of ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}**

## What Is Working (make more of this)
3-4 specific patterns from the viral and solid content. Not vague — name the exact format, angle, or topic pattern.

## What Is Not Working (stop doing this)
2-3 specific patterns from the flopped content. Be direct.

## Your Content Sweet Spot
One paragraph. Based on all the data, what is this creator's unique zone where their content consistently performs?

## This Week's Recommendations
5 specific pieces to create based on what the data says works. Include type, platform, and suggested hook.

## Pattern Alert
Any surprising pattern in the data — something that's working you might not have expected, or something that's flopping that seems counterintuitive.`;

    const res = await ai(prompt);
    setAnalysis(res);
    const entry = { analysis: res, date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), itemCount: ratedItems.length };
    try { localStorage.setItem(PERF_AGENT_KEY, JSON.stringify(entry)); } catch {}
    setLastRun(entry.date);
    setLoading(false);
  };

  const ratedCount = items.filter(i => ratings[i.id]).length;
  const viralCount = items.filter(i => ratings[i.id] === 'viral').length;
  const ratingColors = { viral: '#10B981', solid: '#F59E0B', flopped: '#EF4444' };
  const ratingLabels = { viral: '🔥 Viral', solid: '✓ Solid', flopped: '✕ Flopped' };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
          <div>
            <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Content Performance Agent</h2>
            <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Rate what worked and what flopped. The agent finds the pattern and tells you exactly what to make more of.</p>
          </div>
        </div>
        <button onClick={fetchItems} disabled={fetching} style={{background:'#F9FAFB',color:'#374151',border:'1px solid #E5E7EB',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          {fetching ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div style={{background:'rgba(0,194,255,0.06)',border:'1px solid rgba(0,194,255,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#374151',lineHeight:1.7}}>
        Rate at least 3 pieces below, then hit Run Analysis. The more you rate, the smarter it gets.
        {lastRun && <span style={{marginLeft:8,color:'#6B7280',fontSize:11}}>Last analysis: {lastRun}</span>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {[['Rated',ratedCount,'#00C2FF'],['Viral',viralCount,'#10B981'],['Total Saved',items.length,'#6B7280']].map(([label,val,color])=>(
          <div key={label} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:8,padding:'10px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:800,color}}>{val}</div>
            <div style={{fontSize:10,color:'#6B7280',marginTop:2,textTransform:'uppercase',letterSpacing:1}}>{label}</div>
          </div>
        ))}
      </div>

      {fetching && <Spin/>}

      {!fetching && items.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',background:'#FFFFFF',borderRadius:16,border:'1px solid #E5E7EB'}}>
          <div style={{fontSize:32,marginBottom:8}}>📭</div>
          <div style={{color:'#111827',fontWeight:700,marginBottom:4}}>No saved content yet</div>
          <div style={{color:'#6B7280',fontSize:13}}>Generate content in any tool — it auto-saves and appears here for rating.</div>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
            {items.map(item => (
              <div key={item.id} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:6,marginBottom:4,flexWrap:'wrap'}}>
                    {item.type && <span style={{background:'#F3F4F6',color:'#374151',borderRadius:4,padding:'1px 6px',fontSize:10}}>{item.type}</span>}
                    {item.platform && <span style={{background:'#F3F4F6',color:'#374151',borderRadius:4,padding:'1px 6px',fontSize:10}}>{item.platform}</span>}
                    <span style={{color:'#9CA3AF',fontSize:10}}>{new Date(item.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                  </div>
                  <div style={{color:'#111827',fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title || item.content_preview?.slice(0,60) || 'Untitled'}</div>
                </div>
                <div style={{display:'flex',gap:5,flexShrink:0}}>
                  {['viral','solid','flopped'].map(r => (
                    <button key={r} onClick={()=>rateItem(item.id, r)}
                      style={{background:ratings[item.id]===r?ratingColors[r]:'#F9FAFB',color:ratings[item.id]===r?'#fff':ratingColors[r],border:`1px solid ${ratingColors[r]}`,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:700,opacity:ratings[item.id]&&ratings[item.id]!==r?0.4:1}}>
                      {ratingLabels[r]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={runAnalysis} disabled={loading||ratedCount<3}
            style={{background:ratedCount<3||loading?'#F3F4F6':'linear-gradient(135deg,#00C2FF,#0096CC)',color:ratedCount<3||loading?'#9CA3AF':'#000D1A',border:'none',borderRadius:8,padding:'12px 24px',fontWeight:800,cursor:ratedCount<3||loading?'not-allowed':'pointer',fontSize:14,width:'100%',marginBottom:20}}>
            {loading ? 'Analyzing patterns...' : ratedCount < 3 ? `Rate ${3-ratedCount} more piece${3-ratedCount!==1?'s':''} to unlock analysis` : `Run Performance Analysis (${ratedCount} pieces rated)`}
          </button>

          {loading && <Spin/>}
          {analysis && <DocOutput text={analysis} title="Content Performance Intelligence Report"/>}
        </>
      )}
    </div>
  );
}


function RepurposeAgent() {
  const [activeClient] = useActiveClient();
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('Script');
  const [platforms, setPlatforms] = useState(['Instagram','LinkedIn']);
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePlatform = (p) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p]);
  };

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setOut('');

    const prompt = `You are a content repurposing expert. Take the source content below and repurpose it into every requested platform format. Keep the core message. Adapt the format, length, and tone for each platform. Never sound like a copy-paste. Each piece should feel native to its platform.

Creator: ${activeClient?.name || 'Jason Fricka'} | Voice: Direct, real, no corporate speak. Short sentences. High accountability energy.

Source content type: ${inputType}
Source content:
---
${input}
---

Repurpose into each of these formats:

${platforms.includes('Instagram') ? `## INSTAGRAM REEL SCRIPT
[Hook — first 3 seconds, spoken on camera]
[3 punchy body points — one sentence each]
[CTA]

## INSTAGRAM CAPTION
[Full caption with hook, story, CTA]
[10 hashtags]
` : ''}
${platforms.includes('LinkedIn') ? `## LINKEDIN POST
[Professional but human — 150-250 words]
[3-5 line breaks for readability]
[CTA that fits LinkedIn culture]
` : ''}
${platforms.includes('YouTube') ? `## YOUTUBE SHORT SCRIPT
[Hook — 1 sentence]
[Core content — 45-60 seconds when spoken]
[End screen CTA]

## YOUTUBE VIDEO TITLE
[SEO-optimized, 60 chars max]
` : ''}
${platforms.includes('X') ? `## X / TWITTER THREAD
Tweet 1 (hook):
Tweet 2:
Tweet 3:
Tweet 4:
Tweet 5 (CTA):
` : ''}
${platforms.includes('Email') ? `## EMAIL NEWSLETTER TEASER
Subject line:
Preview text:
Body (150 words max — drive to the content):
` : ''}
${platforms.includes('TikTok') ? `## TIKTOK SCRIPT
[Hook — spoken in first 2 seconds]
[Fast-paced body — 30-45 second total]
[CTA]
` : ''}

---
After all formats, add:

## THE HOOK THAT WORKS ACROSS ALL PLATFORMS
[One universal hook rewritten to work anywhere]

## SCHEDULING RECOMMENDATION
[Which platform to post first, second, third and why — based on content type]`;

    const res = await ai(prompt);
    setOut(res);
    await saveToSupabase({ type: 'repurposed', title: input.slice(0,80), preview: res.slice(0,500), full: res, notes: `repurposed from ${inputType} to ${platforms.join(', ')}` });
    setLoading(false);
  };

  const allPlatforms = ['Instagram','LinkedIn','YouTube','X','Email','TikTok'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <div style={{width:3,height:28,background:'#00C2FF',borderRadius:2}}/>
        <div>
          <h2 style={{color:'#111827',margin:0,fontSize:18,fontWeight:800}}>Repurpose Agent</h2>
          <p style={{color:'#6B7280',margin:'4px 0 0',fontSize:13}}>Drop in one piece of content. Get every platform format automatically. One input, full week of content.</p>
        </div>
      </div>

      <div style={{background:'rgba(0,194,255,0.06)',border:'1px solid rgba(0,194,255,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#374151',lineHeight:1.7}}>
        Paste a script, podcast transcript, YouTube video outline, or any long-form content. Select the platforms you want. Hit Repurpose.
      </div>

      <Card>
        <SecLabel>Source Content Type</SecLabel>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
          {['Script','Podcast Transcript','YouTube Video','Blog Post','Long Caption','Outline'].map(t=>(
            <button key={t} onClick={()=>setInputType(t)} style={{background:inputType===t?'#EEF2FF':'#F9FAFB',color:inputType===t?'#2563EB':'#374151',border:'1px solid '+(inputType===t?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:inputType===t?700:500}}>{t}</button>
          ))}
        </div>

        <SecLabel>Paste Your Content</SecLabel>
        <textarea value={input} onChange={e=>setInput(e.target.value)} rows={10}
          placeholder="Paste your script, transcript, or long-form content here..."
          style={{width:'100%',background:'#F9FAFB',border:'1px solid #D1D5DB',borderRadius:8,padding:'12px',color:'#111827',fontSize:13,resize:'vertical',marginBottom:16,boxSizing:'border-box',fontFamily:'inherit',lineHeight:1.7}}/>

        <SecLabel>Repurpose Into ({platforms.length} selected)</SecLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          {allPlatforms.map(p=>(
            <button key={p} onClick={()=>togglePlatform(p)}
              style={{background:platforms.includes(p)?'#EEF2FF':'#F9FAFB',color:platforms.includes(p)?'#2563EB':'#374151',border:'1px solid '+(platforms.includes(p)?'#C7D2FE':'#E5E7EB'),borderRadius:6,padding:'7px 16px',cursor:'pointer',fontSize:12,fontWeight:platforms.includes(p)?700:500}}>
              {platforms.includes(p) ? '✓ ' : ''}{p}
            </button>
          ))}
        </div>

        <button onClick={run} disabled={loading||!input.trim()||platforms.length===0}
          style={{background:!input.trim()||loading||platforms.length===0?'#F3F4F6':'linear-gradient(135deg,#00C2FF,#0096CC)',color:!input.trim()||loading||platforms.length===0?'#9CA3AF':'#000D1A',border:'none',borderRadius:8,padding:'12px 24px',fontWeight:800,cursor:!input.trim()||loading||platforms.length===0?'not-allowed':'pointer',fontSize:14,width:'100%'}}>
          {loading ? `Repurposing into ${platforms.length} formats...` : `Repurpose into ${platforms.length} Platform${platforms.length!==1?'s':''}`}
        </button>
      </Card>

      {loading && <Spin/>}
      {out && <DocOutput text={out} title={`Repurposed: ${input.slice(0,50)}...`}/>}
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
  create: ContentCreationHub,
  script: ContentCreationHub,
  caption: ContentCreationHub,
  batch: ContentCreationHub,
  episode: ContentCreationHub,
  repurpose: ContentCreationHub,
  contentbrief: ContentCreationHub,
  research: ResearchHub,
  pipeline: ResearchHub,
  spy: ResearchHub,
  hashtags: ResearchHub,
  viral: ResearchHub,
  extract: ResearchHub,
  hooks: HookWorkshop,
  hooktester: HookWorkshop,
  growth: GrowthDashboard,
  roi: GrowthDashboard,
  gaps: GrowthDashboard,
  abtests: GrowthDashboard,
  revenue: GrowthDashboard,
  bio: BioSuite,
  biolink: BioSuite,
  biooptimizer: BioSuite,
  vault: Vault,
  collab: CollabFinder,
  design: DesignStudio,
  review: WeeklyReview,
  memory: ContentMemory,
  schedule: ScheduleOptimizer,
  tracker: CollabTracker,
  clients: ClientMode,
  comment: CommentResponder,
  email: EmailSequenceBuilder,
  podcast: PodcastPreProd,
  yttoolkit: YouTubeToolkit,
  dmscripts: DMScriptLibrary,
  challenge: ChallengeBuilder,
  portal: ClientPortal,
  deliverable: DeliverableBuilder,
  report: MonthlyReportSuite,
  voice: BrandVoiceFingerprint,
  videodirector: VideoScriptDirector,
  campaign: CampaignBuilder,
  predictor: ContentPredictor,
  whitelabel: WhiteLabelMode,
  persona: CustomPersona,
  transcript: TranscriptIntel,
  analytics: AnalyticsHub,
  visualcal: VisualCalendar,
  stratreview: AIStrategyReview,
  library: ContentLibrary,
  weeklybrief: WeeklyBriefAgent,
  trendmonitor: TrendMonitorAgent,
  approvalqueue: ApprovalQueueAgent,
  perfagent: ContentPerformanceAgent,
  abhook: ABHookTester,
  repurpose: RepurposeAgent,
  onboardauto: OnboardingAutomation,
  clientcomms: ClientCommsTemplates,
  pricing: PricingCalculator,
  storyarc: StoryArcPlanner,
  guestprep: GuestPrepKit,
  objections: ObjectionHandler,
  series: ContentSeriesPlanner,
  compintel: CompetitorIntel,
};

// ── Global Error Boundary — prevents white screen crashes ───────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('SIGNAL Error:', error, info); }
  render() {
    if (this.state.hasError) return (
      <div style={{minHeight:'100vh',background:'#080D14',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif'}}>
        <div style={{background:'#FFFFFF',border:'1px solid #D1D5DB',borderRadius:16,padding:40,maxWidth:480,textAlign:'center'}}>
          <h2 style={{color:'#F1F5F9',fontWeight:900,fontSize:22,letterSpacing:'-0.03em',marginBottom:8}}>Something went wrong</h2>
          <p style={{color:'#5A6A82',fontSize:14,marginBottom:20}}>SIGNAL hit an unexpected error. Your data is safe in localStorage.</p>
          <div style={{background:'#F9FAFB',borderRadius:8,padding:'10px 14px',marginBottom:20,fontFamily:'monospace',fontSize:12,color:'#8B9AB4',textAlign:'left'}}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button onClick={()=>window.location.reload()}
            style={{background:'#00C2FF',color:'#000D1A',border:'none',borderRadius:8,padding:'12px 28px',fontWeight:800,cursor:'pointer',fontSize:14}}>
            Reload SIGNAL
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const [nav, setNav] = useState('home');
  const [sub, setSub] = useState(null);
  const { save: memorySave } = useContentMemory();
  const [activeClient] = useActiveClient();
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try { return !!localStorage.getItem(ONBOARDING_DONE_KEY); } catch { return true; }
  });

  // Check if this is a client approval link
  const approvalPayload = (() => {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (hash.startsWith('#approval=')) return hash.slice(10);
    } catch {}
    return null;
  })();

  // If approval link, render standalone approval page
  if (approvalPayload) {
    return <ApprovalPage encodedPayload={approvalPayload} onBack={() => { window.location.hash = ''; window.location.reload(); }}/>;
  }

  // Register memory save function globally so all tools can log to it
  useEffect(() => { registerMemorySave(memorySave); }, [memorySave]);

  // Listen for internal navigation events (e.g. Generate Calendar from Strategy)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.nav) { setNav(e.detail.nav); setSub(e.detail.sub || null); }
    };
    window.addEventListener('signal-nav', handler);
    return () => window.removeEventListener('signal-nav', handler);
  }, []);

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
    <ErrorBoundary>
      {!onboardingDone && <OnboardingFlow onComplete={() => setOnboardingDone(true)}/>}
      <Head>
        <title>8th Ascent</title>
        <meta name="description" content="SIGNAL Social Media OS by Everyday Elevations"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #F7F9FC;
            background-image:
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,194,255,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 80% 80%, rgba(0,194,255,0.03) 0%, transparent 50%);
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            letter-spacing: -0.01em;
          }
          textarea, input, select { outline: none; color-scheme: light; font-family: 'DM Sans', sans-serif; }
          textarea:focus, input:focus { border-color: #00C2FF !important; box-shadow: 0 0 0 2px rgba(0,194,255,0.08); }
          select:focus { border-color: #00C2FF !important; }
          button { font-family: 'DM Sans', sans-serif; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
          @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,194,255,0.2); border-radius: 2px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,194,255,0.4); }
          * { scrollbar-width: thin; scrollbar-color: rgba(0,194,255,0.2) transparent; }

          /* ── MOBILE RESPONSIVE ── */
          @media (max-width: 640px) {
            /* Nav scrolls horizontally — never wraps */
            .signal-nav-inner { gap: 0 !important; }
            .signal-nav-btn { padding: 14px 10px !important; font-size: 11px !important; }
            .signal-subnav { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .signal-subnav::-webkit-scrollbar { display: none; }
            .signal-subnav-inner { gap: 0 !important; padding-bottom: 1px; }
            .signal-subnav-btn { padding: 8px 12px !important; font-size: 10px !important; flex-shrink: 0; }
            /* Main content full-width */
            .signal-main { padding: 1rem 12px !important; }
            /* Cards tighter on mobile */
            .signal-card { padding: 1rem !important; }
            /* Grids collapse to single column */
            .signal-grid-2 { grid-template-columns: 1fr !important; }
            .signal-grid-3 { grid-template-columns: 1fr !important; }
            .signal-grid-auto { grid-template-columns: 1fr 1fr !important; }
            /* Header stacks vertically */
            .signal-tool-header { flex-direction: column !important; gap: 8px !important; }
            /* Buttons full width on mobile */
            .signal-action-row { flex-direction: column !important; }
            .signal-action-row button { width: 100% !important; }
            /* KPI row — 2 across */
            .signal-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
            /* Trend banner text truncates properly */
            .signal-trend-preview { max-width: 120px !important; }
            /* Input font size 16px prevents iOS zoom */
            input, textarea, select { font-size: 16px !important; }
            /* Execution hub 2 col */
            .signal-exec-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 380px) {
            .signal-nav-btn { padding: 12px 8px !important; font-size: 10px !important; }
            .signal-kpi-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </Head>

      <div style={{minHeight:'100vh',background:'#F7F9FC',color:'#111827',backgroundImage:'none'}}>
        {/* TOP NAV */}
        <nav style={{
            background: 'rgba(15,25,35,0.96)',
            borderBottom: '1px solid rgba(0,194,255,0.08)',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 1px 0 rgba(0,194,255,0.06), 0 4px 24px rgba(0,0,0,0.5)',
          }}>
          <div className="signal-nav-inner" style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:4,overflowX:'auto',msOverflowStyle:'none',scrollbarWidth:'none'}}>
            <div style={{marginRight:12,padding:'12px 0'}}>
              <img src="/E-E-Logo.jpg" alt="EN" style={{width:32,height:32,borderRadius:'50%'}}/>
            </div>
            {TOP_NAV.map(n => (
              <button key={n.id} onClick={()=>handleNav(n.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: nav===n.id ? '#00C2FF' : 'rgba(0,194,255,0.5)',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: nav===n.id ? 700 : 500,
                  letterSpacing: nav===n.id ? '0.02em' : '0',
                  borderBottom: `2px solid ${nav===n.id ? '#00C2FF' : 'transparent'}`,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                {n.label}
              </button>
            ))}
            {/* Active client indicator in nav */}
            {activeClient && !activeClient.isDefault && (
              <div style={{marginLeft:'auto',background:'rgba(245,166,35,0.12)',border:'1px solid rgba(245,166,35,0.25)',borderRadius:6,padding:'4px 12px',fontSize:11,fontWeight:700,color:'#C9A84C',whiteSpace:'nowrap'}}>
                {activeClient.name}
              </div>
            )}
          </div>
        </nav>

        {/* SUB NAV */}
        {subItems && nav !== 'home' && (
          <div className="signal-subnav" style={{
              background: 'rgba(18,28,42,0.9)',
              borderBottom: '1px solid rgba(0,194,255,0.06)',
              padding: '0 16px',
              backdropFilter: 'blur(10px)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}>
            <div className="signal-subnav-inner" style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:0}}>
              {subItems.map(s => (
                <button key={s.id} onClick={()=>setSub(s.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: sub===s.id ? '#00C2FF' : 'rgba(0,194,255,0.55)',
                    padding: '9px 12px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: sub===s.id ? 800 : 500,
                    letterSpacing: '0.03em',
                    borderBottom: `2px solid ${sub===s.id ? '#00C2FF' : 'transparent'}`,
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TREND ALERT BANNER */}
        <TrendAlertBanner/>

        {/* MAIN CONTENT */}
        <NotificationBanner/>
        <AutoVoiceUpdateBanner activeClient={activeClient}/>
        <main className="signal-main" style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem 16px',animation:'slideUp 0.3s ease-out'}}>
          {ActiveComponent
            ? <ActiveComponent setNav={handleNav} setSub={setSub}/>
            : (
              <div style={{textAlign:'center',padding:'4rem 0',color:'#6B7280'}}>
                <p>Select a tool from the navigation above</p>
              </div>
            )
          }
        </main>
      </div>
    </ErrorBoundary>
  );
}
