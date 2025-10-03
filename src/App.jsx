import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Home from './components/Home';
import Game from './components/Game';
import RegistrationModal from './components/RegistrationModal';
import './App.css';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'game' | 'registration'
  const [finalScore, setFinalScore] = useState(0);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    loadRankings();
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
    setView('game');
  }

  function handleGameEnd(score) {
    setFinalScore(score);
    setView('registration');
  }

  async function handleSubmitScore(name, email) {
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, score: finalScore })
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Erro ao salvar pontuação: ' + (error.error || 'Erro desconhecido'));
        return false; // Return false on error - keep modal open
      }

      await loadRankings();
      setView('home');
      return true; // Return true on success
    } catch (error) {
      alert('Erro ao salvar pontuação: ' + error.message);
      return false; // Return false on error - keep modal open
    }
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
        <Home rankings={rankings} onStartGame={handleStartGame} />
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
