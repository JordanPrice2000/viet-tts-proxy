export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { text, voice, speed } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const apiKey = process.env.FPT_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'FPT API key not configured' });
    }
    
    const selectedVoice = voice || 'linhsanace';
    
    const response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'voice': selectedVoice,
        'speed': speed || '0',
        'Content-Type': 'text/plain'
      },
      body: text
    });
    
    const data = await response.json();
    
    if (data.error !== 0) {
      return res.status(500).json({ error: data.message || 'FPT TTS failed' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return res.status(200).json({ audioUrl: data.async });
    
  } catch (error) {
    console.error('TTS Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
