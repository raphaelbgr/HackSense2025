// Edit or delete ranking entries
import { getRankings } from '../../../supabase-direct.js';

const SUPABASE_URL = 'https://afmsegsxgvsqwdctasyl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXNlZ3N4Z3ZzcXdkY3Rhc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzE0NDcsImV4cCI6MjA3NDg0NzQ0N30.kBSJi74iiKWZIhDOa1nMTYyKqNJOzykMu9dE8GXNVY0';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // Update ranking
    const { name, email, score } = req.body;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rankings?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name, email, score })
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Delete ranking
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rankings?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
