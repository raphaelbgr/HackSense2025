# 🚀 AI vs Human - 1-Day Build Plan

**Goal:** Working demo with liquid glass design in 8 hours
**Philosophy:** Ship fast, make it pretty, skip the complexity

---

## ⏱️ Hour-by-Hour Breakdown

### **Hour 1: Project Setup (Setup & Foundation)**

```bash
# Create Vite app
npm create vite@latest ai-vs-human -- --template react
cd ai-vs-human
npm install

# Install only what you need
npm install express canvas-confetti

# Create structure
mkdir -p public/images/ai public/images/human data
touch server.js data/images.json data/rankings.json
```

**Create initial data files:**

`data/images.json`:
```json
[
  { "id": "1", "file": "ai/1.jpg", "type": "ai" },
  { "id": "2", "file": "ai/2.jpg", "type": "ai" },
  { "id": "3", "file": "human/1.jpg", "type": "human" },
  { "id": "4", "file": "human/2.jpg", "type": "human" }
]
```

`data/rankings.json`:
```json
[]
```

**Add 4 test images** (2 AI, 2 Human) to `/public/images/`

**✅ Goal:** Project running with `npm run dev`

---

### **Hour 2: Express Backend (3 Endpoints)**

**Create `server.js`:**

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/dist', express.static('dist'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 1. Get random pair
app.get('/api/pair', (req, res) => {
  const images = JSON.parse(fs.readFileSync('data/images.json'));
  const ai = images.filter(i => i.type === 'ai');
  const human = images.filter(i => i.type === 'human');

  if (ai.length < 1 || human.length < 1) {
    return res.status(503).json({ error: 'Not enough images' });
  }

  const randomAI = ai[Math.floor(Math.random() * ai.length)];
  const randomHuman = human[Math.floor(Math.random() * human.length)];
  const pair = [randomAI, randomHuman].sort(() => Math.random() - 0.5);

  res.json({
    imageA: { id: pair[0].id, url: `/images/${pair[0].file}` },
    imageB: { id: pair[1].id, url: `/images/${pair[1].file}` },
    correctId: randomAI.id // Hidden from client later
  });
});

// 2. Check answer
app.post('/api/check', (req, res) => {
  const images = JSON.parse(fs.readFileSync('data/images.json'));
  const selected = images.find(i => i.id === req.body.selectedId);
  const correct = selected?.type === 'ai';

  res.json({ correct, points: correct ? 10 : 0 });
});

// 3. Get leaderboard
app.get('/api/rankings', (req, res) => {
  const rankings = JSON.parse(fs.readFileSync('data/rankings.json'));
  res.json(rankings.slice(0, 10));
});

// 4. Save score
app.post('/api/score', (req, res) => {
  const rankings = JSON.parse(fs.readFileSync('data/rankings.json'));
  rankings.push({
    name: req.body.name,
    score: req.body.score,
    date: new Date().toISOString().split('T')[0]
  });
  rankings.sort((a, b) => b.score - a.score);
  fs.writeFileSync('data/rankings.json', JSON.stringify(rankings.slice(0, 50), null, 2));

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server.js",
    "start": "npm run build && npm run server"
  }
}
```

**✅ Goal:** API working (`curl http://localhost:3000/api/pair`)

---

### **Hour 3: Game Interface (Core Functionality)**

**Update `src/App.jsx`:**

```jsx
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
  const [pair, setPair] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    loadPair();
    loadRankings();
  }, []);

  async function loadPair() {
    const res = await fetch('/api/pair');
    const data = await res.json();
    setPair(data);
  }

  async function loadRankings() {
    const res = await fetch('/api/rankings');
    const data = await res.json();
    setRankings(data);
  }

  async function selectImage(id) {
    if (isAnimating) return;

    setIsAnimating(true);
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedId: id })
    });
    const result = await res.json();

    if (result.correct) {
      setFeedback('Acertou! 🎉');
      setScore(score + 10);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setFeedback('Errou! 😢');
    }

    setTimeout(() => {
      setFeedback('');
      setIsAnimating(false);
      setRound(round + 1);
      loadPair();
    }, 2500);
  }

  async function handleReset() {
    if (score > 0) {
      setShowNameModal(true);
    } else {
      resetGame();
    }
  }

  async function submitScore(name) {
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    await loadRankings();
    setShowNameModal(false);
    resetGame();
  }

  function resetGame() {
    setScore(0);
    setRound(1);
    loadPair();
  }

  return (
    <div className="app">
      {/* Score Display */}
      <div className="score-display glass">
        <div className="score">Pontos: {score}</div>
        <div className="round">Rodada: {round}</div>
      </div>

      {/* Main Game Area */}
      <div className="game-container">
        {pair && (
          <div className="image-pair">
            <div
              className="image-card glass"
              onClick={() => selectImage(pair.imageA.id)}
              style={{ cursor: isAnimating ? 'wait' : 'pointer' }}
            >
              <img src={pair.imageA.url} alt="Imagem A" />
              <p className="instruction">Clique se for IA</p>
            </div>

            <div
              className="image-card glass"
              onClick={() => selectImage(pair.imageB.id)}
              style={{ cursor: isAnimating ? 'wait' : 'pointer' }}
            >
              <img src={pair.imageB.url} alt="Imagem B" />
              <p className="instruction">Clique se for IA</p>
            </div>
          </div>
        )}

        {/* Feedback Overlay */}
        {feedback && (
          <div className={`feedback ${feedback.includes('Acertou') ? 'success' : 'error'}`}>
            {feedback}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="leaderboard glass">
        <h3>🏆 Ranking</h3>
        {rankings.length === 0 && <p>Seja o primeiro!</p>}
        {rankings.map((r, i) => (
          <div key={i} className="rank-item">
            <span className="rank-number">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
            <span className="rank-name">{r.name}</span>
            <span className="rank-score">{r.score}</span>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button className="reset-btn glass-button" onClick={handleReset}>
        ↻ Reiniciar
      </button>

      {/* Name Entry Modal */}
      {showNameModal && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>Parabéns! 🎉</h2>
            <p>Você fez {score} pontos!</p>
            <input
              type="text"
              placeholder="Seu nome"
              id="nameInput"
              className="glass-input"
            />
            <div className="modal-buttons">
              <button
                className="glass-button"
                onClick={() => submitScore(document.getElementById('nameInput').value)}
              >
                Enviar
              </button>
              <button
                className="glass-button secondary"
                onClick={() => { setShowNameModal(false); resetGame(); }}
              >
                Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
```

**✅ Goal:** Game playable (click images, see score, animations work)

---

### **Hour 4-5: Liquid Glass Styling**

**Create `src/App.css`:**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* Glass Effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.glass-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.glass-button.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.glass-input {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 16px;
  width: 100%;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

/* Score Display */
.score-display {
  padding: 20px 40px;
  display: flex;
  gap: 30px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

/* Game Container */
.game-container {
  position: relative;
  margin-top: 100px;
  width: 100%;
  max-width: 1400px;
}

.image-pair {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.image-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.image-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.image-card img {
  width: 500px;
  height: 500px;
  object-fit: cover;
  border-radius: 12px;
}

.image-card .instruction {
  margin-top: 10px;
  color: white;
  font-size: 14px;
  opacity: 0.8;
}

/* Feedback Animation */
.feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 72px;
  font-weight: bold;
  padding: 40px 80px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  animation: feedbackPop 0.5s ease;
  z-index: 1000;
}

.feedback.success {
  background: rgba(0, 212, 170, 0.3);
  border: 2px solid rgba(0, 212, 170, 0.5);
  color: #00d4aa;
}

.feedback.error {
  background: rgba(239, 71, 111, 0.3);
  border: 2px solid rgba(239, 71, 111, 0.5);
  color: #ef476f;
}

@keyframes feedbackPop {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

/* Leaderboard */
.leaderboard {
  position: fixed;
  top: 120px;
  right: 20px;
  width: 300px;
  padding: 20px;
  color: white;
  max-height: 500px;
  overflow-y: auto;
}

.leaderboard h3 {
  margin-bottom: 15px;
  text-align: center;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 5px 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.rank-number {
  font-weight: bold;
  min-width: 30px;
}

.rank-name {
  flex: 1;
  padding: 0 10px;
}

.rank-score {
  font-weight: bold;
}

/* Reset Button */
.reset-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 10;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  padding: 40px;
  max-width: 500px;
  width: 90%;
  color: white;
  text-align: center;
}

.modal h2 {
  margin-bottom: 20px;
  font-size: 36px;
}

.modal p {
  margin-bottom: 20px;
  font-size: 24px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons button {
  flex: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .image-card img {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 900px) {
  .image-pair {
    flex-direction: column;
    align-items: center;
  }

  .leaderboard {
    position: static;
    width: 100%;
    max-width: 500px;
    margin: 20px auto;
  }
}
```

**✅ Goal:** Beautiful liquid glass UI, responsive, smooth animations

---

### **Hour 6: Polish & Testing**

1. **Test game flow:**
   - Play multiple rounds
   - Check leaderboard saves
   - Test confetti animation
   - Verify reset button

2. **Add 10-20 real images:**
   - Find AI-generated images online
   - Find real photos
   - Add to `/public/images/` and update `images.json`

3. **Fine-tune styling:**
   - Adjust glass opacity
   - Perfect animation timing
   - Test on different screen sizes

**✅ Goal:** Polished, working demo

---

### **Hour 7: Deployment to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Create vercel.json
```

**Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" },
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/dist/$1" }
  ]
}
```

**Deploy:**
```bash
vercel
```

**✅ Goal:** Live URL, shareable demo

---

### **Hour 8: Bonus Features (If Time)**

**Priority:**
1. Add more images (20+ total)
2. Admin page (simple password check)
3. History panel (left sidebar)
4. Sound effects
5. Mobile optimizations

---

## 📦 What You Get

✅ Working game (2 images, click, score)
✅ "Acertou!" / "Errou!" animations
✅ Confetti on correct answer
✅ Leaderboard (persistent, top 10)
✅ Name entry modal
✅ Beautiful liquid glass design
✅ Deployed to Vercel
✅ ~500 lines of code total

---

## 🎯 Success Criteria

- [ ] Can play game (select images)
- [ ] Score increments on correct answers
- [ ] Confetti plays on success
- [ ] Leaderboard displays and saves
- [ ] Liquid glass styling looks beautiful
- [ ] Deployed and accessible via URL
- [ ] Demo-ready for presentation

---

## 💡 Tips

- **Don't overthink it** - Hardcode where needed
- **Copy-paste is fine** - Speed over perfection
- **Use test images** - Grab from Unsplash/MidJourney
- **Skip auth** - Admin can be a bonus feature
- **Manual testing** - No need for unit tests
- **Desktop-first** - Mobile can wait

---

## 🚀 Let's Build!

**Total Time:** 8 hours
**Total Fun:** 100%
**Ship it!** 🎉
