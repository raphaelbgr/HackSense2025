import { getImages } from '../../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const images = await getImages();
    const aiImages = images.filter(i => i.type === 'ai');
    const humanImages = images.filter(i => i.type === 'human');

    const pairs = [];
    const minLength = Math.min(aiImages.length, humanImages.length);

    for (let i = 0; i < minLength; i++) {
      pairs.push({
        ai: aiImages[i],
        human: humanImages[i]
      });
    }

    res.json(pairs);
  } catch (error) {
    console.error('Error loading pairs:', error);
    res.status(500).json({ error: error.message });
  }
}
