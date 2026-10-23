import { useState } from "react";
import Section from "../components/Section.jsx";
import MissingFileGame from "../game/components/MissingFileGame.jsx";
import BluePulseGame from "../game/components/BluePulseGame.jsx";
import { translations } from "../data/translations.js";

export default function Playground({ onBack, lang = "en" }) {
  // Neither game launches automatically: initial state is null (shows the game selection screen)
  const [activeGame, setActiveGame] = useState(null);
  const t = translations[lang]?.playground || translations.en.playground;

  return (
    <Section id="playground" title={t.title}>
      {/* Playground Top Bar */}
      <div className="pg-top">
        <button
          type="button"
          className="btn"
          onClick={onBack}
          aria-label="Back to Portfolio"
        >
          {t.back}
        </button>

        {activeGame && (
          <button
            type="button"
            className="iconbtn"
            onClick={() => setActiveGame(null)}
            aria-label="Return to game selection"
          >
            ← {lang === "te" ? "అన్ని గేమ్‌లు" : "All Games"}
          </button>
        )}
      </div>

      {/* Game Selection Screen (Rendered when neither game is active) */}
      {!activeGame && (
        <div className="pg-selection-screen">
          <p className="muted" style={{ marginBottom: "1.8rem", fontSize: "1.02rem", maxWidth: "42rem" }}>
            {t.subtitle || "Select an interactive game below to test your deduction skills or your reaction reflexes."}
          </p>

          <div className="pg-cards-grid">
            {/* Game Card 1: The Missing File */}
            <div className="pg-game-card">
              <div className="pg-card-header">
                <span className="pg-card-badge blue">
                  {t.missingFileBadge || "Detective Mystery"}
                </span>
                <span className="pg-card-icon" aria-hidden="true">🔍</span>
              </div>
              <h3 className="pg-card-title">{t.missingFileTitle || "The Missing File"}</h3>
              <p className="pg-card-desc">
                {t.missingFileDesc || "Read the scenario, inspect the physical clues left at the crime scene, and deduce which suspect took the confidential project file. A fresh randomized case every playthrough."}
              </p>
              <div className="pg-card-meta">
                <span className="pg-chip">Logic &amp; Reasoning</span>
                <span className="pg-chip">Clue Analysis</span>
              </div>
              <button
                type="button"
                className="btn primary pg-play-btn"
                onClick={() => setActiveGame("missing-file")}
              >
                ▶ {t.playBtn || "Play The Missing File"}
              </button>
            </div>

            {/* Game Card 2: Blue Pulse */}
            <div className="pg-game-card highlight">
              <div className="pg-card-header">
                <span className="pg-card-badge ice">
                  {t.bluePulseBadge || "Reaction Challenge"}
                </span>
                <span className="pg-card-icon" aria-hidden="true">⚡</span>
              </div>
              <h3 className="pg-card-title">{t.bluePulseTitle || "Blue Pulse"}</h3>
              <p className="pg-card-desc">
                {t.bluePulseDesc || "A high-speed 30-second reflex challenge. Tap glowing blue pulse targets (+10 pts) before they reposition, steer clear of red decoys (-5 pts), and beat your personal best score."}
              </p>
              <div className="pg-card-meta">
                <span className="pg-chip">Reflex &amp; Speed</span>
                <span className="pg-chip">30-Second Timer</span>
                <span className="pg-chip">High Score Tracking</span>
              </div>
              <button
                type="button"
                className="btn primary pg-play-btn"
                onClick={() => setActiveGame("blue-pulse")}
              >
                ▶ {t.playBtn || "Play Blue Pulse"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game 1: The Missing File */}
      {activeGame === "missing-file" && (
        <div className="game-pane">
          <MissingFileGame onBackToSelection={() => setActiveGame(null)} />
        </div>
      )}

      {/* Game 2: Blue Pulse Reaction Game */}
      {activeGame === "blue-pulse" && (
        <div className="game-pane">
          <BluePulseGame lang={lang} onBackToSelection={() => setActiveGame(null)} />
        </div>
      )}
    </Section>
  );
}