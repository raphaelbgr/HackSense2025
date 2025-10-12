import './Home.css';

function Home({ rankings, onStartGame, highlightPlayerName, userScore }) {
  // Find user's ranking position if they're in the rankings
  const userRanking = highlightPlayerName
    ? rankings.findIndex(r => r.name === highlightPlayerName)
    : -1;

  // Show user card if we have userScore (immediate after playing)
  const shouldShowUserCard = highlightPlayerName && userScore !== null;
  const displayRank = userRanking !== -1 ? userRanking : null;

  return (
    <div className="home-container">
      {/* Hidden Admin Button */}
      <a
        href="/api/admin-login"
        className="hidden-admin-btn"
        aria-label="Admin"
      >
        ⚙️
      </a>

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

      {/* User Position Card - Only shows after playing, not on page reload */}
      {shouldShowUserCard && (
        <div className="user-rank-card">
          <h4 style={{ marginBottom: '10px', color: '#ed752f', fontSize: '1.1rem' }}>Sua Posição</h4>
          <div className="rank-item user-rank-highlight">
            <span className="rank-number">
              {displayRank === null ? '⏳' : displayRank === 0 ? '🥇' : displayRank === 1 ? '🥈' : displayRank === 2 ? '🥉' : `${displayRank + 1}.`}
            </span>
            <span className="rank-name">{highlightPlayerName}</span>
            <span className="rank-score">{userScore}</span>
          </div>
        </div>
      )}

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
