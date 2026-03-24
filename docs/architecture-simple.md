# AI vs Human - Simple 1-Day Architecture

**Goal:** Working demo in 1 day
**Approach:** Minimal viable implementation, no overengineering

---

## Tech Stack (Keep It Simple!)

```
Frontend: React + Vite (no TypeScript for speed)
Backend: Express.js (minimal API)
Storage: JSON files (no database)
Styling: Plain CSS with liquid glass effects
Auth: Hardcoded password (no JWT complexity)
Deploy: Vercel (one command deploy)
```

---

## File Structure

```
/
├── index.html
├── package.json
├── server.js                  # Express backend (1 file!)
├── data/
│   ├── images.json           # Image list
│   └── rankings.json         # Leaderboard
├── public/
│   └── images/
│       ├── ai/               # AI images
│       └── human/            # Human images
└── src/
    ├── App.jsx               # Main React app
    ├── main.jsx              # Entry point
    ├── components/
    │   ├── GamePage.jsx      # Game + leaderboard
    │   ├── AdminPage.jsx     # Simple admin
    │   └── GlassCard.jsx     # Reusable glass component
    └── styles.css            # All styles in one file
```

---

## Data Model (Super Simple)

**images.json:**
```json
[
  { "id": "1", "file": "ai/img1.jpg", "type": "ai" },
  { "id": "2", "file": "human/img2.jpg", "type": "human" }
]
```

**rankings.json:**
```json
[
  { "name": "Ana", "score": 80, "date": "2025-09-30" }
]
```

---

## API (3 Endpoints Only!)

```javascript
// 1. Get random pair
GET /api/pair → { imageA: {id, url}, imageB: {id, url} }

// 2. Check answer
POST /api/check → { correct: true, points: 10 }
Body: { selectedId: "1" }

// 3. Save score
POST /api/score → { success: true }
Body: { name: "Ana", score: 80 }

// Admin upload (bonus if time)
POST /api/upload → { success: true }
```

---

## Frontend (Single Page App)

```jsx
<App>
  {isAdmin ? <AdminPage /> : <GamePage />}
</App>

<GamePage>
  <Leaderboard />        // Right side: Top 10
  <ImagePair />          // Center: 2 images
  <ScoreDisplay />       // Top: Current score
  <HistoryPanel />       // Left: Past choices (optional)
</GamePage>
```

---

## Liquid Glass Styling (Minimal)

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.glass-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  /* ... */
}
```

---

## 1-Day Implementation Plan

**Hour 1-2: Setup**
- Create Vite React app
- Add Express server
- Create data/images.json with 4 test images
- Basic routing

**Hour 3-4: Game Logic**
- Random pair API endpoint
- Image display (2 side-by-side)
- Click handler + answer checking
- Score counter

**Hour 5-6: Animations**
- "Acertou!" green flash
- "Errou!" red shake
- Confetti on correct (canvas-confetti library)

**Hour 7: Leaderboard**
- Display top 10
- Name input modal
- Save to rankings.json

**Hour 8: Liquid Glass Styling**
- Apply glassmorphic CSS to all components
- Make it look beautiful

**Bonus (if time):**
- Admin page with image upload
- History panel

---

## Deployment (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Done! Get URL
```

---

## Cut Features for 1-Day Build

❌ TypeScript (use plain JavaScript)
❌ Authentication (hardcode admin password if needed)
❌ Testing (manual testing only)
❌ Database (use JSON files)
❌ Complex state management (use useState)
❌ Image optimization (use images as-is)
❌ History panel (if no time)
❌ Email field (name only)
❌ Responsive mobile (desktop-first)

---

## Must-Have Features

✅ 2 images side-by-side
✅ Click to select
✅ Acertou/Errou animation
✅ Score counter
✅ Leaderboard (top 10)
✅ Name entry
✅ Liquid glass design
✅ Works on desktop

---

## Sample Code Snippets

**server.js (Minimal Express):**
```javascript
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Get random pair
app.get('/api/pair', (req, res) => {
  const images = JSON.parse(fs.readFileSync('data/images.json'));
  const ai = images.filter(i => i.type === 'ai');
  const human = images.filter(i => i.type === 'human');

  const randomAI = ai[Math.floor(Math.random() * ai.length)];
  const randomHuman = human[Math.floor(Math.random() * human.length)];

  const pair = [randomAI, randomHuman].sort(() => Math.random() - 0.5);

  res.json({
    imageA: { id: pair[0].id, url: `/images/${pair[0].file}` },
    imageB: { id: pair[1].id, url: `/images/${pair[1].file}` }
  });
});

// Check answer
app.post('/api/check', (req, res) => {
  const images = JSON.parse(fs.readFileSync('data/images.json'));
  const selected = images.find(i => i.id === req.body.selectedId);
  const correct = selected.type === 'ai';

  res.json({ correct, points: correct ? 10 : 0 });
});

// Save score
app.post('/api/score', (req, res) => {
  const rankings = JSON.parse(fs.readFileSync('data/rankings.json'));
  rankings.push({
    name: req.body.name,
    score: req.body.score,
    date: new Date().toISOString()
  });
  rankings.sort((a, b) => b.score - a.score);
  fs.writeFileSync('data/rankings.json', JSON.stringify(rankings.slice(0, 50)));

  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on :3000'));
```

**App.jsx (Minimal Game):**
```jsx
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

function App() {
  const [pair, setPair] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    loadPair();
    loadRankings();
  }, []);

  async function loadPair() {
    const res = await fetch('/api/pair');
    setPair(await res.json());
  }

  async function loadRankings() {
    const res = await fetch('/api/rankings');
    setRankings(await res.json());
  }

  async function selectImage(id) {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedId: id })
    });
    const result = await res.json();

    if (result.correct) {
      setFeedback('Acertou! 🎉');
      setScore(score + 10);
      confetti();
    } else {
      setFeedback('Errou! 😞');
    }

    setTimeout(() => {
      setFeedback('');
      loadPair();
    }, 2000);
  }

  return (
    <div className="app">
      <div className="score glass">Pontos: {score}</div>

      {pair && (
        <div className="images">
          <img
            src={pair.imageA.url}
            onClick={() => selectImage(pair.imageA.id)}
            className="glass"
          />
          <img
            src={pair.imageB.url}
            onClick={() => selectImage(pair.imageB.id)}
            className="glass"
          />
        </div>
      )}

      {feedback && <div className="feedback">{feedback}</div>}

      <div className="leaderboard glass">
        <h3>Ranking</h3>
        {rankings.map((r, i) => (
          <div key={i}>{i+1}. {r.name} - {r.score}</div>
        ))}
      </div>
    </div>
  );
}
```

---

## That's It!

**Total Files:** ~10 files
**Total Lines:** ~500 lines
**Build Time:** 1 day
**Result:** Working, beautiful demo

**Focus:** Make it work, make it pretty, ship it fast!
