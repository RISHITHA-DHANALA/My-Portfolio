import { useState } from "react";
import { makeCase } from "../simpleCase.js";
import { IconAlert, IconCheck, IconRefresh, IconSearch, IconShield } from "./Icons.jsx";

const STORE_KEY = "missing-case-solved";
const readSolved = () => {
  try { return Number(localStorage.getItem(STORE_KEY)) || 0; } catch { return 0; }
};

// The Missing Case — a simple, randomized mystery: read a short story and
// three plain clues, pick the one person who matches them all, get an
// instant result, then take a brand-new case.
export default function MissingFileGame({ onBackToSelection }) {
  const [current, setCurrent] = useState(() => makeCase());
  const [pickedId, setPickedId] = useState(null);
  const [solved, setSolved] = useState(readSolved);

  const culprit = current.suspects.find((s) => s.id === current.culpritId);
  const correct = pickedId === current.culpritId;

  const pickSuspect = (id) => {
    if (pickedId) return;
    setPickedId(id);
    if (id === current.culpritId) {
      const next = solved + 1;
      setSolved(next);
      try { localStorage.setItem(STORE_KEY, String(next)); } catch { /* no storage — the game still works */ }
    }
  };

  const newCase = () => {
    setCurrent(makeCase());
    setPickedId(null);
  };

  return (
    <div className="mf mf-fade">
      {onBackToSelection && (
        <div style={{ marginBottom: "1.2rem" }}>
          <button type="button" className="iconbtn" onClick={onBackToSelection}>
            ← All Games
          </button>
        </div>
      )}
      <div className="mf-hero">
        <p className="mf-eyebrow"><IconShield /> Detective Mystery</p>
        <h3 className="mf-title">The Missing File</h3>
        <p className="mf-sub">{current.story} Read the clues and figure out who took it. A new mystery is created every time.</p>
      </div>

      <div className="mf-col" style={{ marginTop: "1.4rem" }}>
        <h4 className="mf-coltitle">Clues found at the scene</h4>
        <ul className="mf-clues">
          {current.clues.map((text) => (
            <li className="mf-clue" key={text}>
              <span className="mf-cluetext"><IconSearch /> {text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mf-col" style={{ marginTop: "1.2rem" }}>
        <h4 className="mf-coltitle">Who took it? Pick one person.</h4>
        <ul className="mf-caselist">
          {current.suspects.map((suspect) => {
            const state = !pickedId ? "" : suspect.id === current.culpritId ? "right" : "wrong";
            return (
              <li key={suspect.id}>
                <button
                  type="button"
                  className={`mf-opt suspect ${state}`}
                  onClick={() => pickSuspect(suspect.id)}
                  disabled={Boolean(pickedId)}
                >
                  <span className="mf-optlabel">{suspect.name}</span>
                  {suspect.lines.map((line) => (
                    <span className="mf-optsub" key={line}>{line}</span>
                  ))}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {pickedId && (
        <div className={`mf-feedback ${correct ? "ok" : "bad"}`} style={{ marginTop: "1.2rem", maxWidth: "44rem" }} role="status">
          <p style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            {correct ? <IconCheck /> : <IconAlert />}
            <strong>{correct ? "Case closed — you found it!" : "Not quite."} It was {culprit.name}.</strong>
          </p>
          <p style={{ margin: 0 }}>{current.explanation}</p>
        </div>
      )}

      <div className="mf-actions">
        <button type="button" className="mf-btn primary" onClick={newCase}>
          <IconRefresh /> {pickedId ? "Next case" : "New case"}
        </button>
        <span className="mf-note">Cases solved: {solved}</span>
      </div>
    </div>
  );
}