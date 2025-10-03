import './Home.css';

function Home({ rankings, onStartGame }) {
  return (
    <div className="home-container">
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
          margin: '0 auto 40px',
          lineHeight: '1.5'
        }}>
          Consegue diferenciar entre uma imagem gerada por IA e outra por humanos?
        </h2>
      </div>

      {/* Start Game Button */}
      <button className="start-game-btn glass-button" onClick={onStartGame}>
        Começar Jogo
      </button>

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
    </div>
  );
}

export default Home;
