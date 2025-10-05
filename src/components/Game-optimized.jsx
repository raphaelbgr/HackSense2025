import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Game.css';

function Game({ onGameEnd, onBackToHome }) {
  const [gamePairs, setGamePairs] = useState([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [maxQuestions, setMaxQuestions] = useState(10);

  // Load ALL game data at start
  useEffect(() => {
    loadGameData();
  }, []);

  async function loadGameData() {
    try {
      setLoading(true);
      const res = await fetch('/api/game-data');
      const data = await res.json();

      setGamePairs(data.pairs);
      setMaxQuestions(data.maxRounds);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do jogo:', error);
      alert('Erro ao carregar jogo');
      setLoading(false);
    }
  }

  const currentPair = gamePairs[currentPairIndex];

  function selectImage(imageId) {
    if (isAnimating || loading || !currentPair) return;

    setIsAnimating(true);

    // Check answer CLIENT-SIDE (no API call!)
    const selectedImage = currentPair.imageA.id === imageId ? currentPair.imageA : currentPair.imageB;
    const isCorrect = selectedImage.isAI;

    const newScore = score + (isCorrect ? 10 : 0);

    if (isCorrect) {
      setFeedback('ACERTOU');
      setScore(newScore);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setFeedback('ERROU');
    }

    setTimeout(() => {
      setFeedback('');
      setIsAnimating(false);

      if (round >= maxQuestions) {
        // Game over - pass final score to parent
        onGameEnd(newScore);
      } else {
        setRound(round + 1);
        setCurrentPairIndex(currentPairIndex + 1);
      }
    }, 2500);
  }

  return (
    <>
      <div className="game-view">
        {/* Header Bar */}
        <header className="game-header">
          {/* Left: Score Display */}
          <div className="header-score">
            <div className="score-label">ACERTOS</div>
            <div className="score-value">{score.toString().padStart(2, '0')}</div>
          </div>

          {/* Center: Game Title */}
          <div className="header-title">
            <h1>REAL OU I.A.?</h1>
            <p>CLIQUE NA IMAGEM FEITA POR I.A.</p>
          </div>

          {/* Right: Round Counter */}
          <div className="header-round">
            <div className="round-label">IMAGEM</div>
            <div className="round-value">{round.toString().padStart(2, '0')}/{maxQuestions.toString().padStart(2, '0')}</div>
          </div>
        </header>

        {/* Main Game Area */}
        <div className="game-container">
          {loading && <div className="loading">Carregando...</div>}

          {currentPair && !loading && (
            <div className="image-pair">
              <div className={`image-card ${isAnimating ? 'disabled' : ''}`}>
                <div className="image-wrapper">
                  <img src={currentPair.imageA.url} alt="Imagem A" onClick={() => selectImage(currentPair.imageA.id)} />
                  <button
                    className="fullscreen-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage(currentPair.imageA.url);
                    }}
                    title="Ver em tela cheia"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className={`image-card ${isAnimating ? 'disabled' : ''}`}>
                <div className="image-wrapper">
                  <img src={currentPair.imageB.url} alt="Imagem B" onClick={() => selectImage(currentPair.imageB.id)} />
                  <button
                    className="fullscreen-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage(currentPair.imageB.url);
                    }}
                    title="Ver em tela cheia"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Overlay */}
          {feedback && (
            <div className={`feedback ${feedback === 'ACERTOU' ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal - Rendered outside game-view */}
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <button className="close-fullscreen" onClick={() => setFullscreenImage(null)}>
            ✕
          </button>
          <img src={fullscreenImage} alt="Imagem em tela cheia" />
        </div>
      )}
    </>
  );
}

export default Game;
