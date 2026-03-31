import "./Home.css";

function Home({ rankings }) {
  return (
    <div className="home-container">
      {/* Logo */}
      <div className="app-logo">
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "900",
            color: "#ed752f",
            textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
            marginBottom: "10px",
            letterSpacing: "2px",
          }}
        >
          HACKTUDO
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#ed752f",
            fontWeight: "500",
            letterSpacing: "1px",
            marginBottom: "20px",
          }}
        >
          FESTIVAL DE CULTURA DIGITAL
        </p>
      </div>

      {/* Deactivation Banner */}
      <div
        className="glass"
        style={{
          maxWidth: "700px",
          margin: "0 auto 30px",
          padding: "30px",
          textAlign: "center",
          borderLeft: "4px solid #ed752f",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#efefef",
            marginBottom: "15px",
          }}
        >
          Evento Encerrado
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#b0b0b0",
            lineHeight: "1.6",
            marginBottom: "10px",
          }}
        >
          O desafio <strong style={{ color: "#efefef" }}>AI vs Humano</strong>{" "}
          foi apresentado no{" "}
          <strong style={{ color: "#ed752f" }}>HackTudo 2025</strong> — Festival
          de Cultura Digital, em outubro de 2025.
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "#888",
            lineHeight: "1.5",
          }}
        >
          Este projeto foi desenvolvido como uma demonstracao interativa de
          reconhecimento de imagens geradas por IA. O jogo nao esta mais ativo,
          mas o ranking final dos participantes permanece abaixo como registro.
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#666",
            marginTop: "15px",
          }}
        >
          Codigo fonte disponivel em{" "}
          <a
            href="https://github.com/raphaelbgr/HackSense2025"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ed752f", textDecoration: "underline" }}
          >
            github.com/raphaelbgr/HackSense2025
          </a>
        </p>
      </div>

      {/* Final Leaderboard */}
      <div className="leaderboard glass">
        <h3>Ranking Final</h3>
        {rankings.length === 0 && (
          <p className="empty">Nenhum registro encontrado.</p>
        )}
        {rankings.map((r, i) => (
          <div key={i} className="rank-item">
            <span className="rank-number">
              {i === 0
                ? "\u{1F947}"
                : i === 1
                ? "\u{1F948}"
                : i === 2
                ? "\u{1F949}"
                : `${i + 1}.`}
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
