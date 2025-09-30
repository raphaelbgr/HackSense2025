import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/dist', express.static('dist'));

// Serve frontend in production
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 1. Get random pair of images
app.get('/api/pair', (req, res) => {
  try {
    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));
    const ai = images.filter(i => i.type === 'ai');
    const human = images.filter(i => i.type === 'human');

    if (ai.length < 1 || human.length < 1) {
      return res.status(503).json({
        error: 'Imagens insuficientes. Adicione pelo menos 1 IA e 1 Humana.'
      });
    }

    // Random selection
    const randomAI = ai[Math.floor(Math.random() * ai.length)];
    const randomHuman = human[Math.floor(Math.random() * human.length)];

    // Shuffle positions
    const pair = [randomAI, randomHuman].sort(() => Math.random() - 0.5);

    res.json({
      imageA: {
        id: pair[0].id,
        url: `/images/${pair[0].file}`
      },
      imageB: {
        id: pair[1].id,
        url: `/images/${pair[1].file}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar imagens' });
  }
});

// 2. Check if answer is correct
app.post('/api/check', (req, res) => {
  try {
    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));
    const selected = images.find(i => i.id === req.body.selectedId);

    if (!selected) {
      return res.status(400).json({ error: 'Imagem inválida' });
    }

    const correct = selected.type === 'ai';
    const points = correct ? 10 : 0;

    res.json({
      correct,
      points,
      type: selected.type
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar resposta' });
  }
});

// 3. Get leaderboard (top 10)
app.get('/api/rankings', (req, res) => {
  try {
    const rankings = JSON.parse(fs.readFileSync('data/rankings.json', 'utf-8'));
    const top10 = rankings
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(top10);
  } catch (error) {
    res.json([]);
  }
});

// 4. Save score to leaderboard
app.post('/api/score', (req, res) => {
  try {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Nome e pontuação são obrigatórios' });
    }

    const rankings = JSON.parse(fs.readFileSync('data/rankings.json', 'utf-8'));

    rankings.push({
      name: name.trim().substring(0, 50),
      score,
      date: new Date().toISOString().split('T')[0]
    });

    // Sort and keep top 50
    rankings.sort((a, b) => b.score - a.score);
    const top50 = rankings.slice(0, 50);

    fs.writeFileSync('data/rankings.json', JSON.stringify(top50, null, 2));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar pontuação' });
  }
});

// For Vercel serverless function
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4111;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Make sure to add images to public/images/ai and public/images/human`);
  });
}
