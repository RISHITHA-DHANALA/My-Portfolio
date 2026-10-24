import { translations } from "../data/translations.js";

export default function ResumeCta({ lang = "en" }) {
  const t = translations[lang]?.resume || translations.en.resume;

  return (
    <section id="resume" className="rcta" aria-labelledby="rcta-h">
      <div className="wrap">
        <div>
          <h2 id="rcta-h">{t.heading}</h2>
          <p>{t.body}</p>
        </div>
        <a
          className="rcta-btn"
          href="/Rishitha_Dhanala_Resume.pdf"
          download="Rishitha_Dhanala_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.button}
        </a>
      </div>
    </section>
  );
}
