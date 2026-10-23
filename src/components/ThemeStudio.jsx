import { useEffect, useRef, useState } from "react";
import { PALETTES, MODES } from "../themes/themes.js";
export default function ThemeStudio({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    const out = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("keydown", esc); document.addEventListener("pointerdown", out);
    return () => { document.removeEventListener("keydown", esc); document.removeEventListener("pointerdown", out); };
  }, [open]);
  return (
    <div className="studio" ref={box}>
      <button className="iconbtn" aria-expanded={open} aria-controls="theme-panel" onClick={() => setOpen(!open)}>Theme</button>
      {open && (
        <div className="panel" id="theme-panel">
          <h3 id="pal-l">Palette</h3>
          <div className="sw" role="radiogroup" aria-labelledby="pal-l">
            {PALETTES.map((p) => (
              <button key={p.id} role="radio" aria-checked={theme.palette === p.id} onClick={() => setTheme({ ...theme, palette: p.id })}>
                <span className="dot" style={{ background: p.swatch }} />{p.label}
              </button>
            ))}
          </div>
          <h3>Mode</h3>
          <div className="seg">
            {MODES.map((m) => (
              <button key={m} aria-pressed={theme.mode === m} onClick={() => setTheme({ ...theme, mode: m })}>{m === "dark" ? "Dark" : "Light"}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
