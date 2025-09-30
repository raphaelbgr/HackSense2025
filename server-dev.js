import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use('/images', express.static('public/images'));

// Multer configuration for file uploads
const createStorage = (type) => multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'images', type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const createUpload = (type) => multer({
  storage: createStorage(type),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido'));
    }
  }
});

// API Routes
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

    const correct = selected.type === 'human';
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

// === ADMIN API ROUTES ===

// Get game configuration
app.get('/api/admin/config', (req, res) => {
  try {
    const configPath = 'data/config.json';
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ maxQuestions: 10 }, null, 2));
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar configuração' });
  }
});

// Save game configuration
app.post('/api/admin/config', (req, res) => {
  try {
    const { maxQuestions } = req.body;
    const configPath = 'data/config.json';
    fs.writeFileSync(configPath, JSON.stringify({ maxQuestions }, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
});

// Get all images
app.get('/api/admin/images', (req, res) => {
  try {
    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));
    res.json(images);
  } catch (error) {
    res.json([]);
  }
});

// Upload pair of images
const uploadPair = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const type = file.fieldname === 'aiImage' ? 'ai' : 'human';
      const dir = path.join(__dirname, 'public', 'images', type);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido'));
    }
  }
});

app.post('/api/admin/upload/pair', uploadPair.fields([
  { name: 'aiImage', maxCount: 1 },
  { name: 'humanImage', maxCount: 1 }
]), (req, res) => {
  try {
    if (!req.files.aiImage || !req.files.humanImage) {
      return res.status(400).json({ error: 'Ambas as imagens são necessárias' });
    }

    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));

    const aiImage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file: `ai/${req.files.aiImage[0].filename}`,
      type: 'ai',
      pairId: Date.now()
    };

    const humanImage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + 'h',
      file: `human/${req.files.humanImage[0].filename}`,
      type: 'human',
      pairId: Date.now()
    };

    images.push(aiImage, humanImage);

    fs.writeFileSync('data/images.json', JSON.stringify(images, null, 2));
    res.json({ success: true, aiImage, humanImage });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do par' });
  }
});

// Get all pairs
app.get('/api/admin/pairs', (req, res) => {
  try {
    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));
    const aiImages = images.filter(i => i.type === 'ai');
    const humanImages = images.filter(i => i.type === 'human');

    // Match by pairId or just pair them by index
    const pairs = [];
    const minLength = Math.min(aiImages.length, humanImages.length);

    for (let i = 0; i < minLength; i++) {
      pairs.push({
        ai: aiImages[i],
        human: humanImages[i]
      });
    }

    res.json(pairs);
  } catch (error) {
    res.json([]);
  }
});

// Delete image
app.delete('/api/admin/image/:id', (req, res) => {
  try {
    const images = JSON.parse(fs.readFileSync('data/images.json', 'utf-8'));
    const imageToDelete = images.find(img => img.id === req.params.id);

    if (!imageToDelete) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, 'public', 'images', imageToDelete.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from JSON
    const updatedImages = images.filter(img => img.id !== req.params.id);
    fs.writeFileSync('data/images.json', JSON.stringify(updatedImages, null, 2));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

// Admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Create Vite server in middleware mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Use vite's connect instance as middleware
app.use(vite.middlewares);

const PORT = process.env.PORT || 4111;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Make sure to add images to public/images/ai and public/images/human`);
});
