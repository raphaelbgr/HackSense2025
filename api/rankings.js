import { getRankings } from '../supabase-direct.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // If admin requested (all results), return ALL rankings with emails (no limit)
    if (req.query.all === 'true') {
      const allRankings = await getRankings(); // No limit - get everything
      res.json(allRankings);
    } else {
      // Public view - all rankings without emails
      const rankings = await getRankings(); // No limit - return all rankings
      const publicRankings = rankings.map(r => ({
        name: r.name,
        score: r.score,
        date: r.date
      }));
      res.json(publicRankings);
    }
  } catch (error) {
    console.error('Error loading rankings:', error);
    res.json([]);
  }
}
