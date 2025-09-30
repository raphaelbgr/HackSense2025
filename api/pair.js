import { getImages } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const images = await getImages();
    const ai = images.filter(i => i.type === 'ai');
    const human = images.filter(i => i.type === 'human');

    if (ai.length < 1 || human.length < 1) {
      return res.status(503).json({
        error: 'Imagens insuficientes. Adicione pelo menos 1 IA e 1 Humana.'
      });
    }

    const randomAI = ai[Math.floor(Math.random() * ai.length)];
    const randomHuman = human[Math.floor(Math.random() * human.length)];
    const pair = [randomAI, randomHuman].sort(() => Math.random() - 0.5);

    res.json({
      imageA: {
        id: pair[0].id,
        url: pair[0].url
      },
      imageB: {
        id: pair[1].id,
        url: pair[1].url
      }
    });
  } catch (error) {
    console.error('Error loading pair:', error);
    res.status(500).json({ error: 'Erro ao carregar imagens' });
  }
}
