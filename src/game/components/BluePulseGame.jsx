import { useState, useRef, useEffect, useCallback } from "react";
import { translations } from "../../data/translations.js";

const BEST_SCORE_KEY = "blue-pulse-target-best-score";

const TARGET_DURATION = 1400; // time target stays visible before moving
const DECOY_DURATION = 1600;

export default function BluePulseGame({ lang = "en", onBackToSelection }) {
  const t = translations[lang]?.bluePulse || translations.en.bluePulse;

  const [gameState, setGameState] = useState("idle"); // "idle" | "playing" | "gameover"
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [activeItems, setActiveItems] = useState([]); // Array of { id, type: 'target' | 'decoy', x, y }
  const [feedback, setFeedback] = useState(null); // { text, color, x, y, id }
  const [bestScore, setBestScore] = useState(() => {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const timerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const arenaRef = useRef(null);
  const nextIdRef = useRef(1);

  // Generate a random position inside the playable arena (padding of 12% to prevent overflow)
  const getRandomPosition = useCallback(() => {
    const minX = 12;
    const maxX = 82;
    const minY = 12;
    const maxY = 82;
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
    return { x, y };
  }, []);

  // Spawn new target or occasional decoy
  const spawnItem = useCallback(() => {
    const id = nextIdRef.current++;
    const isDecoy = Math.random() < 0.22; // ~22% chance of decoy (occasional and harmless)
    const pos = getRandomPosition();

    const newItem = {
      id,
      type: isDecoy ? "decoy" : "target",
      x: pos.x,
      y: pos.y,
    };

    setActiveItems((prev) => [...prev.slice(-3), newItem]); // Max 4 items on screen at once

    // Auto-remove item after its duration expires
    const duration = isDecoy ? DECOY_DURATION : TARGET_DURATION;
    setTimeout(() => {
      setActiveItems((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  }, [getRandomPosition]);

  // Start the 30-second countdown game
  const startGame = useCallback(() => {
    // Reset state
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(30);
    setActiveItems([]);
    setFeedback(null);
    setGameState("playing");

    // Spawn first target immediately
    setTimeout(() => {
      spawnItem();
    }, 150);

    // Spawning interval (every 750ms new target or decoy)
    spawnTimerRef.current = setInterval(() => {
      spawnItem();
    }, 750);

    // 30-Second Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnTimerRef.current);
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [spawnItem]);

  // Handle Game Over score persistence
  useEffect(() => {
    if (gameState === "gameover") {
      setActiveItems([]);
      setBestScore((prev) => {
        if (score > prev) {
          try {
            localStorage.setItem(BEST_SCORE_KEY, String(score));
          } catch {
            // ignore fallback
          }
          return score;
        }
        return prev;
      });
    }
  }, [gameState, score]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  // Handle target or decoy click
  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (gameState !== "playing") return;

    // Remove clicked item immediately
    setActiveItems((prev) => prev.filter((i) => i.id !== item.id));

    if (item.type === "target") {
      // Award 10 points
      setScore((s) => s + 10);
      setHits((h) => h + 1);
      setFeedback({
        text: "+10",
        color: "#5EB1F2",
        x: item.x,
        y: item.y,
        id: Date.now(),
      });
    } else {
      // Decoy clicked: apply small, fair penalty (-5 points)
      setScore((s) => Math.max(0, s - 5));
      setMisses((m) => m + 1);
      setFeedback({
        text: "-5 Decoy!",
        color: "#ff6b81",
        x: item.x,
        y: item.y,
        id: Date.now(),
      });
    }

    // Immediately spawn a new target to keep the action fast and responsive
    setTimeout(spawnItem, 120);
  };

  // Performance rating message
  const getRatingMessage = () => {
    if (score >= 240) return "Incredible speed! Elite cyber reflexes.";
    if (score >= 170) return "Great agility and focus! Sharpshooter reflexes.";
    if (score >= 110) return "Solid reaction speed. Nicely done!";
    return "Good practice run! Play again to beat your personal best.";
  };

  return (
    <div className="game-pane bp-target-game">
      {/* Top Header / Navigation within game */}
      <div className="bp-target-top">
        {onBackToSelection && (
          <button type="button" className="iconbtn" onClick={onBackToSelection}>
            {t.backToGames}
          </button>
        )}
        <div className="bp-target-title-box">
          <h3 className="gtitle">{t.title}</h3>
          <p className="muted">{t.subtitle}</p>
        </div>
      </div>

      {/* Game HUD Bar */}
      <div className="hud bp-hud" aria-label="Game Stats">
        <span className="bp-hud-stat">
          <strong>{t.time}:</strong> <em className={timeLeft <= 5 ? "urgent" : ""}>{timeLeft}s</em>
        </span>
        <span className="bp-hud-stat">
          <strong>{t.score}:</strong> <em>{score}</em>
        </span>
        <span className="bp-hud-stat">
          <strong>{t.accuracy}:</strong> <em>{hits}</em>
        </span>
        <span className="bp-hud-stat">
          <strong>{t.best}:</strong> <em>{bestScore}</em>
        </span>
      </div>

      {/* Main Interactive Game Arena */}
      <div className="bp-target-arena" ref={arenaRef}>
        {/* State: Idle / Start Screen */}
        {gameState === "idle" && (
          <div className="bp-overlay-card">
            <div className="bp-badge-row">
              <span className="bp-tag blue">Target Challenge</span>
              <span className="bp-tag neutral">30 Seconds</span>
            </div>
            <h4>Blue Pulse: Reaction Challenge</h4>
            <p className="bp-rules-text">
              Glowing blue energy targets will appear across the arena. Tap them quickly before they move to score <strong>+10 points</strong> each. Avoid clicking red decoys (<strong>-5 points</strong>)!
            </p>
            <div className="bp-legend-row">
              <div className="bp-legend-item">
                <span className="bp-legend-disc blue" />
                <span>Blue Target: +10 pts</span>
              </div>
              <div className="bp-legend-item">
                <span className="bp-legend-disc red" />
                <span>Red Decoy: -5 pts</span>
              </div>
            </div>
            <button type="button" className="btn primary bp-start-btn" onClick={startGame}>
              ▶ {t.play}
            </button>
          </div>
        )}

        {/* State: Playing - Active Targets & Decoys */}
        {gameState === "playing" && (
          <>
            {activeItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`bp-target-btn ${item.type}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                onClick={(e) => handleItemClick(e, item)}
                aria-label={item.type === "target" ? "Blue target: click for points" : "Red decoy: do not click"}
              >
                <span className="bp-target-pulse-ring" />
                <span className="bp-target-core">
                  {item.type === "decoy" ? "✕" : "✦"}
                </span>
              </button>
            ))}

            {/* Score Float Feedback */}
            {feedback && (
              <div
                key={feedback.id}
                className="bp-feedback-pop"
                style={{
                  left: `${feedback.x}%`,
                  top: `${feedback.y}%`,
                  color: feedback.color,
                }}
              >
                {feedback.text}
              </div>
            )}
          </>
        )}

        {/* State: Game Over Screen */}
        {gameState === "gameover" && (
          <div className="bp-overlay-card gameover">
            <span className="bp-tag blue">Time's Up!</span>
            <div className="bp-final-score-box">
              <span className="bp-final-score-label">Final Score</span>
              <strong className="bp-final-score-number">{score}</strong>
            </div>

            <p className="bp-rating-msg">{getRatingMessage()}</p>

            <div className="bp-stats-summary">
              <div>
                <span>Targets Hit</span>
                <strong>{hits}</strong>
              </div>
              <div>
                <span>Decoys Clicked</span>
                <strong style={{ color: misses > 0 ? "#ff6b81" : "inherit" }}>{misses}</strong>
              </div>
              <div>
                <span>Personal Best</span>
                <strong style={{ color: "#5EB1F2" }}>{Math.max(score, bestScore)}</strong>
              </div>
            </div>

            <div className="bp-gameover-actions">
              <button type="button" className="btn primary" onClick={startGame}>
                ↺ {t.playAgain}
              </button>
              {onBackToSelection && (
                <button type="button" className="btn" onClick={onBackToSelection}>
                  {t.backToGames}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="note" style={{ textAlign: "center", marginTop: "0.8rem" }}>
        {t.rules}
      </p>
    </div>
  );
}
