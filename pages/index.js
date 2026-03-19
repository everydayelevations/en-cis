import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  navy: '#080D14',
  navy2: '#0C1420',
  navy3: '#111B2B',
  red: '#00C2FF',
  white: '#F1F5F9',
  gray: '#5A6A82',
  light: '#8B9AB4',
  gold: '#C9A84C',
};

// ─── CONTENT ANGLES ──────────────────────────────────────────────────────────
const ANGLES = [
  { id: 'emotional', emoji: '🧠', label: 'Emotional', dimension: 'Emotional', desc: 'Self-awareness, stress, identity, how you talk to yourself' },
  { id: 'physical', emoji: '🏋️', label: 'Physical', dimension: 'Physical', desc: 'Training, sleep, recovery, nutrition, daily movement' },
  { id: 'social', emoji: '🤝', label: 'Social', dimension: 'Social', desc: 'Relationships, community, parenting, connection, belonging' },
  { id: 'intellectual', emoji: '📚', label: 'Intellectual', dimension: 'Intellectual', desc: 'Learning, problem-solving, curiosity, skills, sharp thinking' },
  { id: 'occupational', emoji: '💼', label: 'Occupational', dimension: 'Occupational', desc: 'Work ethic, career, HR, real estate, purpose in what you do' },
  { id: 'financial', emoji: '💰', label: 'Financial', dimension: 'Financial', desc: 'Real estate, money habits, building wealth, smart decisions' },
  { id: 'environmental', emoji: '🏔️', label: 'Environmental', dimension: 'Environmental', desc: 'Colorado, outdoor life, your physical space, the world around you' },
  { id: 'spiritual', emoji: '🔥', label: 'Spiritual', dimension: 'Spiritual', desc: 'Purpose, values, what drives you, the reason behind the work' },
];

// ─── FRAMEWORKS ──────────────────────────────────────────────────────────────
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

const VOICE = `Write in Jason Fricka's voice. He's an HR manager, mindset coach, endurance athlete, dad, and real estate agent in Colorado. He talks like he's sitting across the table from you : direct, no fluff, no corporate speak. Short sentences. Real stories. He doesn't hype things up. He doesn't use words like "transform" or "journey" or "find your potential." He says what he means. He talks about hard days, early mornings, the work nobody sees, and why showing up matters even when it doesn't feel like it. His community is the community : everyday people who refuse to stay where they are. He roots for them out loud. Today is ${new Date().toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})}. Write like him, not like a marketer writing about him. Never use em dashes. Never use AI buzzwords like "delve", "tapestry", "comprehensive", "leverage", "utilize", "paradigm", "synergy", "robust", "holistic", "facilitate", "foster", "streamline", or "cutting-edge". No hype. No filler. Jason does not talk like a LinkedIn consultant.`;

// ─── PLATFORMS, TIER_PROMPTS, VAULT_TABS (unchanged from your paste) ────────
const PLATFORMS = ['Instagram', 'YouTube', 'Facebook', 'LinkedIn', 'X', 'TikTok'];

const TIER_PROMPTS = [
  { label: 'Quick Pulse', desc: 'Top 3 viral angles right now', depth: 'surface' },
  { label: 'Deep Dive', desc: 'Trend analysis + audience psychology', depth: 'medium' },
  { label: 'Competitor Intel', desc: 'What competitors are missing', depth: 'deep' },
  { label: 'Full Intel', desc: 'Everything: trends, gaps, scripts, angles', depth: 'full' },
];

const VAULT_TABS = [
  // ... same as your paste.txt, omitted here for brevity
];

// ─── AI HELPERS ──────────────────────────────────────────────────────────────
async function ai(message, system = 'You are a helpful content strategist.') {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, message }),
  });
  const d = await res.json();
  return d.text || d.result || d.error || 'No response';
}

async function perp(query) {
  try {
    const res = await fetch('/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return `API error: ${res.status}`;
    const d = await res.json();
    return d.text || d.result || d.content || d.answer || d.output || d.error || 'No response';
  } catch (e) {
    return `Network error: ${e.message}`;
  }
}

// ─── UI PRIMITIVES (Spin, RedBtn, Card, SecLabel, SOPBadge, AngleGrid, CopyBtn)
// EXACTLY as in your paste.txt, unchanged ─────────────────────────────────────

// ... [keep all those component definitions exactly from your paste.txt] [file:18]

// ─── StrategyOutput, DocOutput, Output ───────────────────────────────────────
// Also exactly as in your paste.txt (no types, pure JS) [file:18]

// ... [full bodies from your paste.txt here] ...

// ─── ALL PROMPTS & TOOL COMPONENTS ───────────────────────────────────────────
// SCRIPT_PROMPT, STITCH_PROMPT, TREND_PROMPT, PIPELINE_EXTRACT, CALENDAR_PROMPT,
// EPISODE_PROMPT, REPURPOSE_PROMPT, HOOK_PROMPT, MAGNET_PROMPT, COMMUNITY_PROMPT,
// REVIEW_PROMPT, PROFILE_PROMPT, COLLAB_PROMPT, ONBOARD_PROMPT, plus:
// Onboarding, ContentCalendar, WeeklyReview, ScriptLab, RepurposeEngine,
// HookLibrary, DesignStudio, ContentMemory, PromptVault, ProfileAudit,
// LeadMagnet, CommunityBuilder, Teleprompter, TeleprompterPanel,
// TrendAlertBanner, ROIDashboard, etc. — all copied straight from paste.txt. [file:18]

// ─── ROOT APP COMPONENT ──────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState('strategy');

  return (
    <>
      <Head>
        <title>Everyday Elevations — Content Intelligence Studio</title>
        <meta name="description" content="Content strategy and memory for Jason Fricka" />
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, #112240 0, #050816 55%, #000 100%)',
          color: B.white,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '24px 16px 40px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>📡</span>
              <div>
                <h1 style={{ margin: 0, fontSize: 20 }}>
                  Everyday Elevations — Content Intelligence Studio
                </h1>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 12,
                    color: B.light,
                  }}
                >
                  Strategy, scripts, and memory for Jason Fricka.
                </p>
              </div>
            </div>
          </header>

          <nav style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[
              { id: 'strategy', label: '90-Day Strategy' },
              { id: 'scripts', label: 'Script Lab' },
              { id: 'memory', label: 'Content Memory' },
              { id: 'vault', label: 'Prompt Vault' },
            ].map((t) => (
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

          {tab === 'strategy' && (
            <>
              <Onboarding />
              <ContentCalendar />
              <WeeklyReview />
              <TrendAlertBanner />
              <ROIDashboard />
            </>
          )}

          {tab === 'scripts' && (
            <>
              <ScriptLab />
              <RepurposeEngine />
              <HookLibrary />
              <DesignStudio />
              <TeleprompterPanel />
            </>
          )}

          {tab === 'memory' && <ContentMemory />}

          {tab === 'vault' && <PromptVault />}
        </div>
      </div>
    </>
  );
}

// ─── ERROR BOUNDARY + EXPORT ─────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App error boundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: '#fff' }}>
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

