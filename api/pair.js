import { getImages } from '../supabase-direct.js';

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

    // Get complete pairs (must have both AI and human)
    const completePairs = Object.values(pairGroups).filter(group => {
      return group.length === 2 &&
             group.some(i => i.type === 'ai') &&
             group.some(i => i.type === 'human');
    });

    if (completePairs.length === 0) {
      return res.status(503).json({
        error: 'Nenhum par completo disponível. Adicione pelo menos 1 par (1 IA + 1 Humana).'
      });
    }

    // Select a random pair
    const selectedPair = completePairs[Math.floor(Math.random() * completePairs.length)];

    // Shuffle the order (random position)
    const shuffled = [...selectedPair].sort(() => Math.random() - 0.5);

    res.json({
      imageA: {
        id: shuffled[0].id,
        url: shuffled[0].url
      },
      imageB: {
        id: shuffled[1].id,
        url: shuffled[1].url
      }
    });
  } catch (error) {
    console.error('Error loading pair:', error);
    res.status(500).json({ error: 'Erro ao carregar imagens' });
  }
}
