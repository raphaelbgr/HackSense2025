import './Home.css';

function Home({ rankings, onStartGame, highlightPlayerName, userScore }) {
  // Determine current day (11 or 12)
  const getCurrentDay = () => {
    const now = new Date();
    const day = now.getUTCDate();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    // Check if we're on October 11 or 12, 2025
    if (year === 2025 && month === 10 && (day === 11 || day === 12)) {
      return day;
    }
    // Default to day 12 if outside the event dates
    return 12;
  };

  const currentDay = getCurrentDay();

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

  // Calculate ranks with ties (same score = same rank)
  const calculateRanksWithTies = (dayRankings) => {
    const rankedPlayers = [];
    let currentRank = 1;

    for (let i = 0; i < dayRankings.length; i++) {
      const player = dayRankings[i];

      // Check if this player has the same score as the previous one
      if (i > 0 && player.score === dayRankings[i - 1].score) {
        // Same score as previous player, same rank
        rankedPlayers.push({
          ...player,
          rank: rankedPlayers[i - 1].rank,
          isTied: true
        });
      } else {
        // Different score, new rank
        rankedPlayers.push({
          ...player,
          rank: currentRank,
          isTied: false
        });
      }

      currentRank++;
    }

    return rankedPlayers;
  };

  // Find user's ranking position within the current day's rankings
  const currentDayRankings = currentDay === 11 ? day1 : day2;
  const rankedCurrentDay = calculateRanksWithTies(currentDayRankings);
  const userRankData = highlightPlayerName
    ? rankedCurrentDay.find(r => r.name === highlightPlayerName)
    : null;

  // Show user card if we have userScore (immediate after playing)
  const shouldShowUserCard = highlightPlayerName && userScore !== null;
  const displayRank = userRankData ? userRankData.rank - 1 : null;

  // Render a day's rankings
  const renderDayRankings = (dayRankings, dayTitle) => {
    const rankedPlayers = calculateRanksWithTies(dayRankings);

    return (
      <div className="leaderboard glass" style={{ flex: '1', minWidth: '300px' }}>
        <h3>🏆 {dayTitle}</h3>
        {dayRankings.length === 0 ? (
          <p className="empty">Nenhum jogador ainda</p>
        ) : (
          rankedPlayers.map((player, i) => {
            const getRankDisplay = (rank) => {
              return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            };

            return (
              <div
                key={i}
                className={`rank-item ${player.isTied ? 'tied-rank' : ''}`}
              >
                <span className="rank-number">
                  {getRankDisplay(player.rank)}
                </span>
                <span className="rank-name">{player.name}</span>
                <span className="rank-score">{player.score}</span>
              </div>
            );
          })
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
          <h4 style={{ marginBottom: '10px', color: '#ed752f', fontSize: '1.1rem' }}>
            Sua Posição - Dia {currentDay === 11 ? '1' : '2'}
          </h4>
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
          {renderDayRankings(day1, 'Dia 1')}
          {renderDayRankings(day2, 'Dia 2')}
        </div>
      )}
    </div>
  );
}

export default Home;
