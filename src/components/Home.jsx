import './Home.css';

function Home({ rankings, onStartGame, highlightPlayerName, userScore }) {
  // Find user's ranking position if they're in the rankings
  const userRanking = highlightPlayerName
    ? rankings.findIndex(r => r.name === highlightPlayerName)
    : -1;

  // Show user card if we have userScore (immediate after playing)
  const shouldShowUserCard = highlightPlayerName && userScore !== null;
  const displayRank = userRanking !== -1 ? userRanking : null;

  // Group rankings by day
  const groupRankingsByDay = (rankings) => {
    const day1 = [];
    const day2 = [];

    rankings.forEach((ranking) => {
      if (!ranking.date) return;

      const date = new Date(ranking.date);
      // Get date in UTC to avoid timezone issues
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1; // 0-indexed
      const day = date.getUTCDate();

      // Day 1: October 11, 2025
      if (year === 2025 && month === 10 && day === 11) {
        day1.push(ranking);
      }
      // Day 2: October 12, 2025
      else if (year === 2025 && month === 10 && day === 12) {
        day2.push(ranking);
      }
    });

    return { day1, day2 };
  };

  const { day1, day2 } = groupRankingsByDay(rankings);

  // Render a day's rankings
  const renderDayRankings = (dayRankings, dayTitle) => {
    return (
      <div className="leaderboard glass" style={{ flex: '1', minWidth: '300px' }}>
        <h3>🏆 {dayTitle}</h3>
        {dayRankings.length === 0 ? (
          <p className="empty">Nenhum jogador ainda</p>
        ) : (
          dayRankings.map((r, i) => (
            <div key={i} className="rank-item">
              <span className="rank-number">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>
              <span className="rank-name">{r.name}</span>
              <span className="rank-score">{r.score}</span>
            </div>
          ))
        )}
      </div>
    );
  };

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

      {/* Leaderboards by Day */}
      {rankings.length === 0 ? (
        <div className="leaderboard glass">
          <h3>🏆 Ranking</h3>
          <p className="empty">Seja o primeiro!</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: '30px',
          width: '100%',
          maxWidth: '1400px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {renderDayRankings(day1, 'Dia 1 - 11 de Outubro')}
          {renderDayRankings(day2, 'Dia 2 - 12 de Outubro')}
        </div>
      )}
    </div>
  );
}

export default Home;
