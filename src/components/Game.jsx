import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Game.css';

function Game({ onGameEnd, onBackToHome }) {
  const [pair, setPair] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [usedPairIds, setUsedPairIds] = useState([]);
  const [maxQuestions, setMaxQuestions] = useState(10);

  useEffect(() => {
    loadPairCount();
  }, []);

  async function loadPairCount() {
    try {
      const res = await fetch('/api/admin/pairs');
      const pairs = await res.json();
      const pairCount = pairs.length || 1;

      // If 1 pair: 1 round, if >10 pairs: 10 rounds, else: match pair count
      setMaxQuestions(Math.min(pairCount, 10));
      loadPair();
    } catch (error) {
      console.error('Erro ao carregar pares:', error);
      setMaxQuestions(1);
      loadPair();
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
      const newScore = score + (result.correct ? 10 : 0);

      if (result.correct) {
        setFeedback('Acertou! 🎉');
        setScore(newScore);

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

        if (round >= maxQuestions) {
          // Game over - pass final score to parent
          onGameEnd(newScore);
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

  return (
    <div className="game-view">
      {/* Home Button */}
      <button
        className="home-btn glass-button"
        onClick={onBackToHome}
        title="Voltar para home"
      >
        🏠
      </button>

      {/* Score Display */}
      <div className="score-display glass">
        <div className="score">Pontos: {score}</div>
        <div className="round">Rodada: {round}/{maxQuestions}</div>
      </div>

      {/* Main Game Area */}
      <div className="game-container">
        {loading && <div className="loading">Carregando...</div>}

        {pair && !loading && (
          <div className="image-pair">
            <div className={`image-card glass ${isAnimating ? 'disabled' : ''}`}>
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

            <div className={`image-card glass ${isAnimating ? 'disabled' : ''}`}>
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

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <button className="close-fullscreen" onClick={() => setFullscreenImage(null)}>
            ✕
          </button>
          <img src={fullscreenImage} alt="Imagem em tela cheia" />
        </div>
      )}
    </div>
  );
}

export default Game;
