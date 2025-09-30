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
  const [loading, setLoading] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    loadPairCount();
    loadPair();
    loadRankings();
  }, []);

  async function loadPairCount() {
    try {
      const res = await fetch('/api/admin/pairs');
      const pairs = await res.json();
      setMaxQuestions(pairs.length || 1);
    } catch (error) {
      console.error('Erro ao carregar pares:', error);
      setMaxQuestions(1);
    }
  }

  async function loadPair() {
    try {
      setLoading(true);
      const res = await fetch('/api/pair');
      const data = await res.json();

      if (res.ok) {
        setPair(data);
      } else {
        alert(data.error || 'Erro ao carregar imagens');
      }
    } catch (error) {
      alert('Erro ao conectar com servidor');
    } finally {
      setLoading(false);
    }
  }

  async function loadRankings() {
    try {
      const res = await fetch('/api/rankings');
      const data = await res.json();
      setRankings(data);
    } catch (error) {
      console.error('Erro ao carregar rankings:', error);
    }
  }

  async function selectImage(id) {
    if (isAnimating || loading) return;

    setIsAnimating(true);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedId: id })
      });

      const result = await res.json();

      if (result.correct) {
        setFeedback('Acertou! 🎉');
        setScore(score + 10);

        // Confetti celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setFeedback('Errou! 😢');
      }

      // Wait for animation, then load next pair or end game
      setTimeout(() => {
        setFeedback('');
        setIsAnimating(false);

        if (round >= maxQuestions) {
          // Game over - show name modal if score > 0
          setGameOver(true);
          if (score + (result.correct ? 10 : 0) > 0) {
            setShowNameModal(true);
          }
        } else {
          setRound(round + 1);
          loadPair();
        }
      }, 2500);
    } catch (error) {
      alert('Erro ao verificar resposta');
      setIsAnimating(false);
    }
  }

  function handleReset() {
    if (score > 0) {
      setShowNameModal(true);
    } else {
      resetGame();
    }
  }

  async function submitScore(name) {
    if (!name || name.trim() === '') {
      alert('Digite seu nome!');
      return;
    }

    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), score })
      });

      await loadRankings();
      setShowNameModal(false);
      resetGame();
    } catch (error) {
      alert('Erro ao salvar pontuação');
    }
  }

  function resetGame() {
    setScore(0);
    setRound(1);
    setShowNameModal(false);
    setGameOver(false);
    loadPairCount();
    loadPair();
  }

  return (
    <div className="app">
      {/* Score Display */}
      <div className="score-display glass">
        <div className="score">Pontos: {score}</div>
        <div className="round">Rodada: {round}/{maxQuestions}</div>
      </div>

      {/* Main Game Area */}
      <div className="game-container">
        {loading && <div className="loading">Carregando...</div>}

        {gameOver && !showNameModal && (
          <div className="game-over glass">
            <h2>Jogo Finalizado! 🎉</h2>
            <p>Você completou {maxQuestions} perguntas!</p>
            <p className="final-score">Pontuação Final: {score}</p>
            <button className="glass-button" onClick={resetGame}>
              Jogar Novamente
            </button>
          </div>
        )}

        {pair && !loading && !gameOver && (
          <div className="image-pair">
            <div
              className={`image-card glass ${isAnimating ? 'disabled' : ''}`}
              onClick={() => selectImage(pair.imageA.id)}
            >
              <img src={pair.imageA.url} alt="Imagem A" />
              <p className="instruction">Clique se for Humana</p>
            </div>

            <div
              className={`image-card glass ${isAnimating ? 'disabled' : ''}`}
              onClick={() => selectImage(pair.imageB.id)}
            >
              <img src={pair.imageB.url} alt="Imagem B" />
              <p className="instruction">Clique se for Humana</p>
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
        {rankings.length === 0 && <p className="empty">Seja o primeiro!</p>}
        {rankings.map((r, i) => (
          <div key={i} className="rank-item">
            <span className="rank-number">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
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
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') {
            setShowNameModal(false);
            resetGame();
          }
        }}>
          <div className="modal glass">
            <h2>Parabéns! 🎉</h2>
            <p>Você fez {score} pontos!</p>
            <input
              type="text"
              placeholder="Seu nome"
              id="nameInput"
              className="glass-input"
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitScore(e.target.value);
                }
              }}
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
                onClick={() => {
                  setShowNameModal(false);
                  resetGame();
                }}
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
