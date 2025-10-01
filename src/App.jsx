import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';
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
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [usedPairIds, setUsedPairIds] = useState([]);

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
      const usedParam = usedPairIds.length > 0 ? `?used=${usedPairIds.join(',')}` : '';
      const res = await fetch(`/api/pair${usedParam}`);
      const data = await res.json();

      if (res.ok) {
        setPair(data);
        // Track this pair ID
        if (data.pairId && !usedPairIds.includes(data.pairId)) {
          setUsedPairIds([...usedPairIds, data.pairId]);
        }
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
      console.log('Submitting score:', { name: name.trim(), score });
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), score })
      });

      console.log('Score response:', res.status);

      if (!res.ok) {
        const error = await res.json();
        console.error('Score error:', error);
        alert('Erro ao salvar pontuação: ' + (error.error || 'Erro desconhecido'));
        return;
      }

      console.log('Loading rankings...');
      await loadRankings();
      console.log('Rankings loaded');

      setShowNameModal(false);
      resetGame();
    } catch (error) {
      console.error('Submit score error:', error);
      alert('Erro ao salvar pontuação: ' + error.message);
    }
  }

  function resetGame() {
    setScore(0);
    setRound(1);
    setShowNameModal(false);
    setGameOver(false);
    setUsedPairIds([]); // Clear used pairs
    loadPairCount();
    loadPair();
  }

  return (
    <div className="app">
      {/* Logo */}
      <div className="app-logo">
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: '#ed752f',
          textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
          marginBottom: '10px',
          letterSpacing: '2px'
        }}>
          HACKTUDO
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#ed752f',
          fontWeight: '500',
          letterSpacing: '1px',
          marginBottom: '30px'
        }}>
          FESTIVAL DE CULTURA DIGITAL
        </p>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '500',
          color: '#efefef',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          Consegue diferenciar entre uma imagem gerada por IA e outra por humanos?
        </h2>
      </div>

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
            >
              <div className="image-wrapper">
                <img src={pair.imageA.url} alt="Imagem A" onClick={() => selectImage(pair.imageA.id)} />
                <button
                  className="fullscreen-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImage(pair.imageA.url);
                  }}
                  title="Ver em tela cheia"
                >
                  🔍
                </button>
              </div>
              <p className="instruction">Clique se for Humana</p>
            </div>

            <div
              className={`image-card glass ${isAnimating ? 'disabled' : ''}`}
            >
              <div className="image-wrapper">
                <img src={pair.imageB.url} alt="Imagem B" onClick={() => selectImage(pair.imageB.id)} />
                <button
                  className="fullscreen-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImage(pair.imageB.url);
                  }}
                  title="Ver em tela cheia"
                >
                  🔍
                </button>
              </div>
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

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <button className="close-fullscreen" onClick={() => setFullscreenImage(null)}>
            ✕
          </button>
          <img src={fullscreenImage} alt="Imagem em tela cheia" />
        </div>
      )}

      <Analytics />
    </div>
  );
}

export default App;
