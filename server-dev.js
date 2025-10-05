import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Import API handlers (same as production)
import pairHandler from './api/pair.js';
import checkHandler from './api/check.js';
import rankingsHandler from './api/rankings.js';
import scoreHandler from './api/score.js';
import adminPairsHandler from './api/admin/pairs.js';
import adminUploadPairHandler from './api/admin/upload/pair.js';
import adminImageDeleteHandler from './api/admin/image/[id].js';
import gameDataHandler from './api/game-data.js';
import configHandler from './api/admin/config/index.js';
import rankingEditHandler from './api/admin/ranking-edit/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Helper to wrap Vercel API handlers for Express
const wrapHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// API Routes - use production handlers (public endpoints)
app.get('/api/pair', wrapHandler(pairHandler));
app.post('/api/check', wrapHandler(checkHandler));
app.get('/api/rankings', wrapHandler(rankingsHandler));
app.post('/api/score', wrapHandler(scoreHandler));
app.get('/api/game-data', wrapHandler(gameDataHandler)); // New optimized endpoint

// Basic auth middleware for admin
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username === 'hacksense2025' && password === 'HackSense2025!') {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid credentials');
  }
};

// Admin login page (no auth required)
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Admin route - always serve, let client-side handle auth check
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Protect admin API routes
app.use('/api/admin', basicAuth);

// Admin-only API routes (must come after basicAuth middleware)
app.get('/api/admin/config', basicAuth, wrapHandler(configHandler));
app.post('/api/admin/config', basicAuth, wrapHandler(configHandler));
app.put('/api/admin/ranking-edit', basicAuth, wrapHandler(rankingEditHandler));
app.delete('/api/admin/ranking-edit', basicAuth, wrapHandler(rankingEditHandler));
app.get('/api/admin/pairs', wrapHandler(adminPairsHandler));
app.post('/api/admin/upload/pair', wrapHandler(adminUploadPairHandler));
app.delete('/api/admin/image/:id', (req, res) => {
  // Map Express params to Vercel format
  req.query = { ...req.query, id: req.params.id };
  wrapHandler(adminImageDeleteHandler)(req, res);
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
