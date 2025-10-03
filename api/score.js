import { addRanking } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Nome e pontuação são obrigatórios' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    await addRanking({
      name: name.trim().substring(0, 50),
      email: email ? email.trim().substring(0, 100) : null,
      score,
      date: new Date().toISOString().split('T')[0]
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Erro ao salvar pontuação' });
  }
}
