import { getImages } from '../../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const images = await getImages();

    // Group images by pair_id
    const pairGroups = {};
    images.forEach(img => {
      if (!pairGroups[img.pair_id]) {
        pairGroups[img.pair_id] = [];
      }
      pairGroups[img.pair_id].push(img);
    });

    // Build pairs array with complete pairs only
    const pairs = [];
    Object.values(pairGroups).forEach(group => {
      const ai = group.find(i => i.type === 'ai');
      const human = group.find(i => i.type === 'human');

      if (ai && human) {
        pairs.push({ ai, human });
      }
    });

    res.json(pairs);
  } catch (error) {
    console.error('Error loading pairs:', error);
    res.status(500).json({ error: error.message });
  }
}
