export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a social media research analyst. Provide detailed, specific, actionable insights with real examples and data where possible.' },
          { role: 'user', content: query }
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Perplexity API call failed' });
  }
}
