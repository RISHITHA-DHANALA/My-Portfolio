import { Fragment, useEffect, useRef } from "react";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Letters drop in once, hop away from the cursor (mouse) or from a tap (touch), then settle back.
export default function GravityWord({ text, as: Tag = "p", className = "" }) {
  const els = useRef([]), st = useRef([]), raf = useRef(0), cool = useRef([]);
  const run = () => {
    if (raf.current) return;
    const tick = () => {
      let busy = false;
      st.current.forEach((s, i) => {
        s.vy += 0.7; s.y += s.vy;
        if (s.y > 0) { s.y = 0; s.vy = Math.abs(s.vy) < 1.2 ? 0 : -s.vy * 0.45; }
        s.vx += -s.x * 0.08; s.vx *= 0.88; s.x += s.vx;
        s.vr += -s.r * 0.1; s.vr *= 0.88; s.r += s.vr;
        if (Math.abs(s.y) > 0.1 || Math.abs(s.vy) > 0.1 || Math.abs(s.x) > 0.1 || Math.abs(s.r) > 0.1) busy = true; else s.x = s.y = s.r = 0;
        if (els.current[i]) els.current[i].style.transform = `translate(${s.x}px,${s.y}px) rotate(${s.r}deg)`;
      });
      raf.current = busy ? requestAnimationFrame(tick) : 0;
    };
    raf.current = requestAnimationFrame(tick);
  };
  const poke = (i, dir, power) => {
    const now = performance.now();
    if (now - (cool.current[i] || 0) < 450 || !st.current[i]) return;
    cool.current[i] = now;
    const s = st.current[i]; s.vy = -power; s.vx = dir * power * 0.5; s.vr = dir * 7; run();
  };
  useEffect(() => {
    st.current = [...text].filter((c) => c !== " ").map(() => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 }));
    if (reduced()) return;
    st.current.forEach((s, i) => { s.y = -(20 + i * 4); });
    run();
    return () => { cancelAnimationFrame(raf.current); raf.current = 0; };
  }, [text]);
  const move = (e) => {
    if (e.pointerType === "touch" || reduced()) return;
    els.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < Math.max(34, r.width * 0.9)) poke(i, cx >= e.clientX ? 1 : -1, 7);
    });
  };
  const tap = () => { if (!reduced()) els.current.forEach((_, i) => setTimeout(() => poke(i, i % 2 ? 1 : -1, 6), i * 40)); };
  let idx = 0;
  const words = text.split(" ");
  return (
    <Tag className={`gword ${className}`}>
      <span className="sr">{text}</span>
      <span className="gw-hit" aria-hidden="true" onPointerMove={move} onPointerDown={tap}>
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="gw-w">{[...w].map((c) => { const i = idx++; return <span key={i} ref={(el) => (els.current[i] = el)}>{c}</span>; })}</span>
            {wi < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
