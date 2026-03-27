/**
 * pages/api/heygen.js
 *
 * Server-side proxy for HeyGen API.
 * NEVER exposes API keys to the browser.
 * Uses the CLIENT's own HeyGen API key — not the platform key.
 * Falls back to HEYGEN_API_KEY env var for the default (solo) account only.
 *
 * Supported actions:
 *   - generate    : submit a video generation job
 *   - status      : poll a video job by video_id
 *   - avatars     : list available avatars for this account
 *   - voices      : list available voices
 *   - verify      : test that an API key + avatar_id are valid
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, clientApiKey, ...payload } = req.body;

  // Key resolution: client key first, env fallback for solo account
  const apiKey = clientApiKey || process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'No HeyGen API key provided. Add your HeyGen API key in Client Settings.' });
  }

  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    switch (action) {

      // ── LIST AVATARS ────────────────────────────────────────────────────────
      case 'avatars': {
        const r = await fetch('https://api.heygen.com/v2/avatars', { headers });
        const data = await r.json();
        if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Failed to fetch avatars' });
        // Return only custom/instant avatars (the user's own digital twins)
        const avatars = data?.data?.avatars || [];
        const custom = avatars.filter(a =>
          a.avatar_type === 'custom' ||
          a.avatar_type === 'instant' ||
          a.avatar_type === 'video'
        );
        return res.status(200).json({ avatars: custom.length > 0 ? custom : avatars.slice(0, 20) });
      }

      // ── LIST VOICES ─────────────────────────────────────────────────────────
      case 'voices': {
        const r = await fetch('https://api.heygen.com/v2/voices', { headers });
        const data = await r.json();
        if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Failed to fetch voices' });
        const voices = data?.data?.voices || [];
        // Prioritize cloned/custom voices
        const sorted = [
          ...voices.filter(v => v.voice_type === 'cloned' || v.voice_type === 'custom'),
          ...voices.filter(v => v.voice_type !== 'cloned' && v.voice_type !== 'custom').slice(0, 30),
        ];
        return res.status(200).json({ voices: sorted });
      }

      // ── VERIFY KEY + AVATAR ─────────────────────────────────────────────────
      case 'verify': {
        // Test the key by hitting the avatars endpoint
        const r = await fetch('https://api.heygen.com/v2/avatars', { headers });
        const data = await r.json();
        if (!r.ok) return res.status(200).json({ valid: false, error: 'Invalid API key or insufficient permissions' });

        // If avatarId provided, check it exists
        const { avatarId } = payload;
        if (avatarId) {
          const avatars = data?.data?.avatars || [];
          const found = avatars.find(a => a.avatar_id === avatarId);
          if (!found) {
            return res.status(200).json({
              valid: false,
              error: `Avatar ID "${avatarId}" not found in this account. Make sure you created a Video Avatar in HeyGen first.`,
            });
          }
          return res.status(200).json({ valid: true, avatar: found });
        }

        return res.status(200).json({ valid: true, avatarCount: (data?.data?.avatars || []).length });
      }

      // ── GENERATE VIDEO ──────────────────────────────────────────────────────
      case 'generate': {
        const { avatarId, voiceId, script, aspectRatio = '9:16', title } = payload;

        if (!avatarId) return res.status(400).json({ error: 'avatarId is required' });
        if (!script?.trim()) return res.status(400).json({ error: 'script is required' });

        // Trim script to HeyGen's 5000 char limit
        const trimmedScript = script.slice(0, 4900);

        // Map aspect ratio to HeyGen dimension format
        const dimensions = {
          '9:16':  { width: 1080, height: 1920 }, // Reels / TikTok / Shorts
          '16:9':  { width: 1920, height: 1080 }, // YouTube / landscape
          '1:1':   { width: 1080, height: 1080 }, // Square
        }[aspectRatio] || { width: 1080, height: 1920 };

        const body = {
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: avatarId,
              avatar_style: 'normal',
            },
            voice: {
              type: 'text',
              input_text: trimmedScript,
              ...(voiceId ? { voice_id: voiceId } : {}),
              speed: 1.0,
            },
            background: {
              type: 'color',
              value: '#ffffff',
            },
          }],
          dimension: dimensions,
          ...(title ? { title } : {}),
          test: false, // Set true during dev to skip credit deduction
        };

        const r = await fetch('https://api.heygen.com/v2/video/generate', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const data = await r.json();

        if (!r.ok || data?.error) {
          return res.status(r.status || 400).json({
            error: data?.message || data?.error?.message || 'Video generation failed',
          });
        }

        return res.status(200).json({
          videoId: data?.data?.video_id,
          status: 'pending',
        });
      }

      // ── POLL STATUS ─────────────────────────────────────────────────────────
      case 'status': {
        const { videoId } = payload;
        if (!videoId) return res.status(400).json({ error: 'videoId is required' });

        const r = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, { headers });
        const data = await r.json();

        if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Failed to get status' });

        const video = data?.data;
        return res.status(200).json({
          status: video?.status,           // pending | processing | completed | failed
          videoUrl: video?.video_url || null,
          thumbnailUrl: video?.thumbnail_url || null,
          duration: video?.duration || null,
          error: video?.error || null,
        });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('HeyGen API error:', err);
    return res.status(500).json({ error: 'Server error: ' + (err.message || 'Unknown') });
  }
}
