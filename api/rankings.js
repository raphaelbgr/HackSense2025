import { getRankings } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rankings = await getRankings();
    const top10 = rankings.slice(0, 10);
    res.json(top10);
  } catch (error) {
    console.error('Error loading rankings:', error);
    res.json([]);
  }
}
