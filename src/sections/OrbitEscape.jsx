import { useEffect, useRef, useState } from "react";
const T = 40, COLS = 16, ROWS = 10, W = 640, H = 400, SPEED = 150;
const MAZE = ["################", "#S...#.....#...#", "#.##.#.###.#.#.#", "#.#..#.#...#.#.#", "#.#.##.#.###.#.#", "#.#....#.....#.#", "#.######.#####.#", "#........#.....#", "#.####.#.#####.#", "################"];
const ctr = (c, r) => [c * T + T / 2, r * T + T / 2];
const START = ctr(1, 1), EXIT = ctr(14, 7), ORB_CELLS = [[3, 4], [9, 3], [6, 8]];
const DRONES = [{ x: true, line: 7, a: 2, b: 7, sp: 90 }, { x: false, line: 8, a: 3, b: 6, sp: 80 }];
const GATES = [{ c: 10, r: 5, ph: 0 }, { c: 14, r: 4, ph: 1.2 }];
const KEYMAP = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "u", w: "u", W: "u", ArrowDown: "d", s: "d", S: "d" };
const wall = (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || MAZE[r][c] === "#";
const hitsWall = (x, y) => { const h = 7; for (let r = Math.floor((y - h) / T); r <= Math.floor((y + h) / T); r++) for (let c = Math.floor((x - h) / T); c <= Math.floor((x + h) / T); c++) if (wall(c, r)) return true; return false; };
const droneXY = (d) => (d.x ? [d.p, d.line * T + T / 2] : [d.line * T + T / 2, d.p]);
const gateOn = (g, t) => (t + g.ph) % 2.4 < 1.2;
const gateWarn = (g, t) => (t + g.ph) % 2.4 > 2.0;
const fresh = () => ({ px: START[0], py: START[1], got: [false, false, false], open: false, lives: 3, inv: 0, t: 0, status: "idle", keys: {}, drones: DRONES.map((d) => ({ ...d, p: d.a * T + T / 2, dir: 1 })) });

export default function OrbitEscape() {
  const cv = useRef(null), g = useRef(fresh()), raf = useRef(0), last = useRef(0), col = useRef({}), frame = useRef(0), hudKey = useRef("");
  const [hud, setHud] = useState({ got: 0, lives: 3, t: 0 });
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");
  const [score, setScore] = useState(0);
  const slow = useRef(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

  const readColors = () => { const s = getComputedStyle(cv.current); ["accent", "accent2", "text", "muted"].forEach((k) => (col.current[k] = s.getPropertyValue("--" + k).trim() || "#7cc4ff")); };
  const draw = () => {
    const c = cv.current.getContext("2d"), s = g.current, k = col.current, TAU = 6.283;
    c.clearRect(0, 0, W, H);
    c.fillStyle = k.accent2; c.globalAlpha = 0.3;
    for (let r = 0; r < ROWS; r++) for (let q = 0; q < COLS; q++) if (MAZE[r][q] === "#") c.fillRect(q * T + 1, r * T + 1, T - 2, T - 2);
    c.globalAlpha = 1;
    GATES.forEach((gt) => {
      const x = gt.c * T, y = gt.r * T;
      if (gateOn(gt, s.t)) { c.fillStyle = "#ff5c7c"; c.globalAlpha = 0.85; c.fillRect(x + 6, y + 6, T - 12, T - 12); }
      else { c.strokeStyle = "#ff5c7c"; c.globalAlpha = gateWarn(gt, s.t) ? 0.7 : 0.25; c.lineWidth = 2; c.setLineDash([4, 4]); c.strokeRect(x + 6, y + 6, T - 12, T - 12); c.setLineDash([]); }
      c.globalAlpha = 1;
    });
    c.lineWidth = 3; c.strokeStyle = s.open ? k.accent : k.muted; c.globalAlpha = s.open ? 1 : 0.5;
    [15, 8].forEach((r) => { c.beginPath(); c.arc(EXIT[0], EXIT[1], r, 0, TAU); c.stroke(); }); c.globalAlpha = 1;
    ORB_CELLS.forEach(([q, r], i) => { if (s.got[i]) return; const [x, y] = ctr(q, r); c.fillStyle = k.accent; c.globalAlpha = 0.3; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill(); c.globalAlpha = 1; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); });
    s.drones.forEach((d) => { const [x, y] = droneXY(d); c.fillStyle = "#ff5c7c"; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.stroke(); });
    if (!(s.inv > 0 && Math.floor(s.inv * 10) % 2)) { c.fillStyle = k.text; c.strokeStyle = k.accent; c.lineWidth = 3; c.beginPath(); c.arc(s.px, s.py, 7, 0, TAU); c.fill(); c.stroke(); }
  };
  const finish = (res) => {
    const s = g.current; s.status = res; setStatus(res);
    if (res === "won") { const sc = 300 + s.lives * 50 + Math.max(0, 300 - Math.round(s.t) * 3); setScore(sc); setMsg(`You escaped with ${sc} points.`); } else setMsg("Out of lives. Try again.");
  };
  const update = (dt) => {
    const s = g.current, k = s.keys; s.t += dt; if (s.inv > 0) s.inv -= dt;
    let dx = (k.r ? 1 : 0) - (k.l ? 1 : 0), dy = (k.d ? 1 : 0) - (k.u ? 1 : 0); if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
    const nx = s.px + dx * SPEED * dt, ny = s.py + dy * SPEED * dt;
    if (!hitsWall(nx, s.py)) s.px = nx; if (!hitsWall(s.px, ny)) s.py = ny;
    const m = slow.current ? 0.6 : 1;
    s.drones.forEach((d) => { const lo = d.a * T + T / 2, hi = d.b * T + T / 2; d.p += d.dir * d.sp * m * dt; if (d.p > hi) { d.p = hi; d.dir = -1; } if (d.p < lo) { d.p = lo; d.dir = 1; } });
    ORB_CELLS.forEach(([q, r], i) => { const [x, y] = ctr(q, r); if (!s.got[i] && Math.hypot(s.px - x, s.py - y) < 15) { s.got[i] = true; setMsg(`Energy orb collected: ${s.got.filter(Boolean).length} of 3.`); } });
    if (!s.open && s.got.every(Boolean)) { s.open = true; setMsg("All three orbs collected. The exit portal is open."); }
    const hazard = s.drones.some((d) => { const [x, y] = droneXY(d); return Math.hypot(s.px - x, s.py - y) < 16; }) || GATES.some((gt) => gateOn(gt, s.t) && Math.abs(s.px - (gt.c * T + T / 2)) < 20 && Math.abs(s.py - (gt.r * T + T / 2)) < 20);
    if (s.inv <= 0 && hazard) {
      s.lives -= 1; s.inv = 1.5; s.px = START[0]; s.py = START[1];
      if (s.lives <= 0) return finish("lost"); setMsg(`Hit. ${s.lives} ${s.lives === 1 ? "life" : "lives"} left.`);
    }
    if (s.open && Math.hypot(s.px - EXIT[0], s.py - EXIT[1]) < 16) finish("won");
  };
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last.current) / 1000); last.current = now; update(dt);
    if (frame.current++ % 60 === 0) readColors(); draw();
    const s = g.current, key = `${s.got.filter(Boolean).length}|${s.lives}|${Math.floor(s.t)}`;
    if (key !== hudKey.current) { hudKey.current = key; setHud({ got: s.got.filter(Boolean).length, lives: s.lives, t: Math.floor(s.t) }); }
    if (s.status === "playing") raf.current = requestAnimationFrame(loop);
  };
  const start = () => {
    cancelAnimationFrame(raf.current); g.current = { ...fresh(), status: "playing" };
    setStatus("playing"); setScore(0); setHud({ got: 0, lives: 3, t: 0 }); hudKey.current = ""; setMsg("Go. Collect all three energy orbs."); readColors();
    last.current = performance.now(); raf.current = requestAnimationFrame(loop); cv.current.focus({ preventScroll: true });
  };
  useEffect(() => {
    readColors(); draw();
    const mo = new MutationObserver(() => { if (g.current.status !== "playing") { readColors(); draw(); } });
    mo.observe(document.documentElement, { attributes: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf.current); };
  }, []);
  useEffect(() => { if (status !== "playing") draw(); }, [status]);

  const key = (v) => (e) => { const k = KEYMAP[e.key]; if (k && g.current.status === "playing") { e.preventDefault(); g.current.keys[k] = v; } };
  const hold = (k, v) => () => { g.current.keys[k] = v; };
  const pad = (k, label, sym) => (
    <button className="pad" data-k={k} aria-label={label} onPointerDown={hold(k, true)} onPointerUp={hold(k, false)} onPointerLeave={hold(k, false)} onPointerCancel={hold(k, false)} onContextMenu={(e) => e.preventDefault()}>{sym}</button>
  );
  return (
    <div className="game-pane">
      <h3 className="gtitle">Orbit Escape</h3>
      <p className="muted">Explore the cosmic maze and collect three energy orbs. Dodge the red drones and the pulsing laser gates (they flash a warning first), then fly into the exit portal. You have three lives.</p>
      <div className="hud" aria-label="Game status">
        <span>Energy orbs {"●".repeat(hud.got)}{"○".repeat(3 - hud.got)} {hud.got}/3</span><span>Lives {hud.lives}</span><span>Time {hud.t}s</span>
        {status === "playing" && <button className="iconbtn" onClick={start}>Restart</button>}
      </div>
      <div className="gwrap">
        <canvas ref={cv} width={W} height={H} tabIndex={0} role="img" aria-label="Orbit Escape game board. Use arrow keys or WASD to move." onKeyDown={key(true)} onKeyUp={key(false)} onBlur={() => { g.current.keys = {}; }} />
        {status !== "playing" && (
          <div className="ov">
            <h4>{status === "won" ? "You escaped!" : status === "lost" ? "Signal lost" : "Orbit Escape"}</h4>
            <p>{status === "won" ? `Score ${score}. Time ${hud.t}s.` : status === "lost" ? "The drones got you." : "Arrow keys or WASD to move. On touch, hold the arrow pad below."}</p>
            <button className="btn primary" onClick={start}>{status === "idle" ? "Start Game" : "Play Again"}</button>
          </div>
        )}
      </div>
      <div className="dpad" role="group" aria-label="Touch controls">{pad("u", "Move up", "▲")}{pad("l", "Move left", "◀")}{pad("d", "Move down", "▼")}{pad("r", "Move right", "▶")}</div>
      <p className="sr" role="status" aria-live="polite">{msg}</p>
      <p className="note" aria-hidden="true">{msg}</p>
    </div>
  );
}