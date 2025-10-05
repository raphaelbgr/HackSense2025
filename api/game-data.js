// API to download all game data (pairs with answers) at game start
import { getImages } from '../supabase-direct.js';

export default async function handler(req, res) {
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

    // Build game data with answers
    const gamePairs = [];
    Object.values(pairGroups).forEach(group => {
      const ai = group.find(i => i.type === 'ai');
      const human = group.find(i => i.type === 'human');

      if (ai && human) {
        // Randomly decide which position for each image
        const isAFirst = Math.random() > 0.5;

        gamePairs.push({
          pairId: ai.pair_id,
          imageA: {
            id: isAFirst ? ai.id : human.id,
            url: isAFirst ? `${ai.url}?v=${ai.cache_version || 1}` : `${human.url}?v=${human.cache_version || 1}`,
            isAI: isAFirst
          },
          imageB: {
            id: isAFirst ? human.id : ai.id,
            url: isAFirst ? `${human.url}?v=${human.cache_version || 1}` : `${ai.url}?v=${ai.cache_version || 1}`,
            isAI: !isAFirst
          }
        });
      }
    });

    // Shuffle pairs
    gamePairs.sort(() => Math.random() - 0.5);

    res.json({
      pairs: gamePairs,
      totalPairs: gamePairs.length,
      maxRounds: Math.min(gamePairs.length, 10)
    });
  } catch (error) {
    console.error('Error loading game data:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do jogo' });
  }
}
