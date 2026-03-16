# EN·CIS — Elevation Nation Content Intelligence System

Instagram growth engine for @everydayelevations.

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub
1. Go to github.com and create a new repository called `en-cis`
2. Upload all these files to the repo (drag and drop the folder works)

### Step 2 — Deploy on Vercel
1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your `en-cis` GitHub repository
4. Click Deploy — Vercel auto-detects Next.js

### Step 3 — Add your API key
1. In Vercel, go to your project → Settings → Environment Variables
2. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (get it from console.anthropic.com)
3. Click Save, then go to Deployments and click "Redeploy"

### Step 4 — Open on your phone
Your app will be live at `https://en-cis.vercel.app` (or similar URL Vercel assigns).
Bookmark it on your phone home screen for instant access.

## What's inside
- **Command Center** — workflow overview and session stats
- **Insight Extractor** — paste Perplexity research, get competitor intel + Reel ideas
- **Script Engine** — generate Reels scripts in Jason's voice
- **Prompt Vault** — 12 Perplexity prompts across 4 research tiers
