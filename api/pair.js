import { getImages } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get used pair IDs from query param
    const usedPairIdsParam = req.query.used || '';
    const usedPairIds = usedPairIdsParam ? usedPairIdsParam.split(',').map(Number) : [];

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
    let completePairs = Object.values(pairGroups).filter(group => {
      return group.length === 2 &&
             group.some(i => i.type === 'ai') &&
             group.some(i => i.type === 'human');
    });

    // Filter out already used pairs
    const availablePairs = completePairs.filter(pair => {
      return !usedPairIds.includes(pair[0].pair_id);
    });

    // If no available pairs, reset and use all pairs
    const pairsToUse = availablePairs.length > 0 ? availablePairs : completePairs;

    if (pairsToUse.length === 0) {
      return res.status(503).json({
        error: 'Nenhum par completo disponível. Adicione pelo menos 1 par (1 IA + 1 Humana).'
      });
    }

    // Select a random pair
    const selectedPair = pairsToUse[Math.floor(Math.random() * pairsToUse.length)];

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
      },
      pairId: shuffled[0].pair_id
    });
  } catch (error) {
    console.error('Error loading pair:', error);
    res.status(500).json({ error: 'Erro ao carregar imagens' });
  }
}
