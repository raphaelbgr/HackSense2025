import { getImages } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { selectedId } = req.body;
    const images = await getImages();
    const selected = images.find(i => i.id === selectedId);

    if (!selected) {
      return res.status(400).json({ error: 'Imagem inválida' });
    }

    const correct = selected.type === 'human';
    const points = correct ? 10 : 0;

    res.json({
      correct,
      points,
      type: selected.type
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Erro ao verificar resposta' });
  }
}
