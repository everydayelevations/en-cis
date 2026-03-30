export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, message, model, max_tokens } = req.body;

  if (!system || !message) {
    return res.status(400).json({ error: 'Missing system or message' });
  }

  // Model routing:
  // - Caller can pass model/max_tokens explicitly
  // - Default: Sonnet at 2500 tokens (faster than 4000, still high quality)
  // - 'fast' shorthand: Haiku at 1500 tokens for quick generations
  const resolvedModel = model === 'fast'
    ? 'claude-haiku-4-5-20251001'
    : (model || 'claude-sonnet-4-20250514');

  const resolvedTokens = max_tokens || (model === 'fast' ? 1500 : 2500);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: resolvedModel,
        max_tokens: resolvedTokens,
        system,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: 'API call failed' });
  }
}
