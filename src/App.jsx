import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import Home from "./components/Home";
import "./App.css";

function App() {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    loadRankings();
  }, []);

  async function loadRankings() {
    try {
      const res = await fetch("/api/rankings");
      const data = await res.json();
      setRankings(data);
    } catch (error) {
      console.error("Erro ao carregar rankings:", error);
    }
  }

  return (
    <div className="app">
      <Home rankings={rankings} />
      <Analytics />
    </div>
  );
}

export default App;
