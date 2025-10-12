import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Home from './components/Home';
import Game from './components/Game-optimized'; // Use optimized version
import RegistrationModal from './components/RegistrationModal';
import { scoreQueue } from './utils/scoreQueue';
import './App.css';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'game' | 'registration'
  const [finalScore, setFinalScore] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [highlightPlayerName, setHighlightPlayerName] = useState(null);
  const [userScore, setUserScore] = useState(null); // Store user's score to show immediately

  useEffect(() => {
    loadRankings();

    // Auto-refresh rankings every 5 seconds
    const intervalId = setInterval(() => {
      loadRankings();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  async function loadRankings() {
    try {
      const res = await fetch('/api/rankings');
      const data = await res.json();
      setRankings(data);
    } catch (error) {
      console.error('Erro ao carregar rankings:', error);
    }
  }

  function handleStartGame() {
    setHighlightPlayerName(null); // Clear highlight when starting a new game
    setUserScore(null); // Clear user score when starting a new game
    setView('game');
  }

  function handleGameEnd(score) {
    setFinalScore(score);
    setView('registration');
  }

  async function handleSubmitScore(name, email) {
    // Store the player name and score for immediate display
    setHighlightPlayerName(name.trim());
    setUserScore(finalScore);

    // Add to queue immediately (background worker will handle sending)
    scoreQueue.addScore(name, email, finalScore);

    // Trigger background reload (don't wait for it)
    loadRankings();

    // Go to home immediately with user's score
    setView('home');

    return true; // Always return true - queue handles retries
  }

  function handleSkipRegistration() {
    setView('home');
  }

  function handleBackToHome() {
    setView('home');
  }

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          rankings={rankings}
          onStartGame={handleStartGame}
          highlightPlayerName={highlightPlayerName}
          userScore={userScore}
        />
      )}

      {view === 'game' && (
        <Game onGameEnd={handleGameEnd} onBackToHome={handleBackToHome} />
      )}

      {view === 'registration' && (
        <RegistrationModal
          score={finalScore}
          onSubmit={handleSubmitScore}
          onSkip={handleSkipRegistration}
        />
      )}

      <Analytics />
    </div>
  );
}

export default App;
