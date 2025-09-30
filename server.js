import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import { getImages, addImage, deleteImage, getRankings, addRanking, uploadImageToStorage, deleteStorageImage } from './supabase-direct.js';

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

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    const images = await getImages();

    res.json({
      success: true,
      message: 'Supabase connected!',
      count: images.length
    });
  } catch (err) {
    console.error('Test error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 1. Get random pair of images
app.get('/api/pair', async (req, res) => {
  try {
    const images = await getImages();
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
});

// 2. Check if answer is correct
app.post('/api/check', async (req, res) => {
  try {
    const images = await getImages();
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
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Erro ao verificar resposta' });
  }
});

// 3. Get leaderboard (top 10)
app.get('/api/rankings', async (req, res) => {
  try {
    const rankings = await getRankings();
    const top10 = rankings.slice(0, 10);
    res.json(top10);
  } catch (error) {
    console.error('Error loading rankings:', error);
    res.json([]);
  }
});

// 4. Save score to leaderboard
app.post('/api/score', async (req, res) => {
  try {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Nome e pontuação são obrigatórios' });
    }

    await addRanking({
      name: name.trim().substring(0, 50),
      score,
      date: new Date().toISOString().split('T')[0]
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Erro ao salvar pontuação' });
  }
});

// === ADMIN API ROUTES ===

// Get all pairs
app.get('/api/admin/pairs', async (req, res) => {
  try {
    console.log('Fetching images from Supabase...');
    const images = await getImages();
    console.log(`Got ${images.length} images`);

    const aiImages = images.filter(i => i.type === 'ai');
    const humanImages = images.filter(i => i.type === 'human');

    const pairs = [];
    const minLength = Math.min(aiImages.length, humanImages.length);

    for (let i = 0; i < minLength; i++) {
      pairs.push({
        ai: aiImages[i],
        human: humanImages[i]
      });
    }

    console.log(`Returning ${pairs.length} pairs`);
    res.json(pairs);
  } catch (error) {
    console.error('Error loading pairs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload pair of images with compression
const uploadPair = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit before compression
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
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
]), async (req, res) => {
  try {
    if (!req.files.aiImage || !req.files.humanImage) {
      return res.status(400).json({ error: 'Ambas as imagens são necessárias' });
    }

    const pairId = Date.now();

    // Compress AI image
    const aiCompressed = await sharp(req.files.aiImage[0].buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // Compress Human image
    const humanCompressed = await sharp(req.files.humanImage[0].buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // Upload to Supabase Storage
    const aiFileName = `ai/${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const humanFileName = `human/${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

    const aiUpload = await uploadImageToStorage(aiCompressed, aiFileName);
    const humanUpload = await uploadImageToStorage(humanCompressed, humanFileName);

    // Save metadata to database
    const aiImage = await addImage({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file: aiUpload.fileName,
      url: aiUpload.url,
      type: 'ai',
      pair_id: pairId
    });

    const humanImage = await addImage({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + 'h',
      file: humanUpload.fileName,
      url: humanUpload.url,
      type: 'human',
      pair_id: pairId
    });

    res.json({ success: true, aiImage, humanImage });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do par: ' + error.message });
  }
});

// Delete image
app.delete('/api/admin/image/:id', async (req, res) => {
  try {
    const images = await getImages();
    const imageToDelete = images.find(img => img.id === req.params.id);

    if (!imageToDelete) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    // Delete from storage
    await deleteStorageImage(imageToDelete.file);

    // Delete from database
    await deleteImage(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

// For Vercel serverless function
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4111;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Using Supabase for storage`);
  });
}
