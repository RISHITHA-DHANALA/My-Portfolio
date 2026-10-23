import { useEffect, useRef } from "react";
import { site } from "../data/siteData.js";
import { translations } from "../data/translations.js";
import GravityWord from "../components/GravityWord.jsx";

const TAGS = [
  ["C", "4%", "6%", 40, 0],
  ["Java", "64%", "2%", 64, 1],
  ["Python", "80%", "46%", 34, 2],
  ["HTML", "2%", "52%", 56, 3],
  ["CSS", "44%", "90%", 30, 4],
  ["JavaScript", "62%", "80%", 60, 5],
  ["DSA", "22%", "36%", 46, 1.5],
];

export default function Hero({ lang = "en" }) {
  const ref = useRef(null);
  const t = translations[lang]?.hero || translations.en.hero;

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    };

    const leave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const L = (d, cls, style, kids) => (
    <div key={`${cls}${d}${style.left || ""}`} className={`L ${cls}`} style={{ "--d": d, ...style }}>
      {kids}
    </div>
  );

  return (
    <section id="home" className="hero" ref={ref} aria-label="Introduction">
      <div className="wrap">
        <div>
          {/* Top row: Word 'Portfolio' with gravity effect + subtle 'Think with Rishi' tag */}
          <div className="hero-top-row">
            <GravityWord text={t.eyebrow || "Portfolio"} />
            <span className="hero-brand-pill">
              <span className="hero-spark">✦</span>
              {t.brand || site.brand}
            </span>
          </div>

          {/* Academic subtitle: Exactly 'B.Tech CSE · Undergraduate · AP RGUKT RK Valley' */}
          <p className="hero-academic-subtitle">{t.role || site.role}</p>

          {/* Name with gravity interaction */}
          <GravityWord as="h1" className="name" text={t.name || site.name} />

          {/* Exact Quote with line break preserved */}
          <div className="hero-quote-wrap">
            <blockquote className="hero-quote" aria-label="Quote">
              <span>{t.quoteLine1 || "I learn by building."}</span>
              <span className="hero-quote-break">{t.quoteLine2 || "I grow by solving."}</span>
            </blockquote>
          </div>

          {/* Bio */}
          <p className="lead">{t.intro || site.intro}</p>
        </div>

        {/* Stage with original moving decorative elements */}
        <div className="stage" aria-hidden="true">
          {L(-20, "orb", {})}
          {L(
            -40,
            "ring",
            {},
            <svg viewBox="0 0 200 200" className="fl spin">
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeDasharray="4 8" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" opacity=".5" />
            </svg>
          )}
          {L(-26, "cube", {}, <div className="fl" style={{ "--t": "1s" }} />)}
          {L(
            18,
            "tilt code a glass",
            {},
            <pre>
              <b>def </b>
              <i>explain</i>
              <b>(scan):</b>
              {"\n"}
              <b>  return </b>
              <i>heatmap</i>
              <b>(scan)</b>
            </pre>
          )}
          {L(
            30,
            "tilt code b glass",
            {},
            <pre>
              <b>for </b>
              <i>topic</i>
              <b> in </b>
              {'["DSA", "AI/ML"]: \n'}
              <b>  learn(topic)</b>
            </pre>
          )}
          {L(48, "info i1 glass", {}, <span className="fl">Java · OOP · file handling</span>)}
          {L(58, "info i2 glass", {}, <span className="fl" style={{ "--t": "2s" }}>Python · Streamlit · OpenCV</span>)}
          {TAGS.map(([tagText, left, top, depth, delay]) =>
            L(depth, "", { left, top }, (
              <span key={tagText} className="tag fl" style={{ "--t": `${delay}s` }}>
                {tagText}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
