import { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import Hero from "../sections/Hero.jsx";
import { About, Education, Skills, Projects, Achievements, Interests } from "../sections/Content.jsx";
import Playground from "../sections/Playground.jsx";
import ResumeCta from "../sections/ResumeCta.jsx";
import Contact from "../sections/Contact.jsx";
import Footer from "../sections/Footer.jsx";
import { readTheme, saveTheme } from "../themes/themes.js";
import { readLang, saveLang } from "../data/translations.js";

const isPlayground = () => window.location.hash === "#playground";

export default function Home() {
  const [theme, setTheme] = useState(readTheme);
  const [lang, setLang] = useState(readLang);
  const [view, setView] = useState(() => (isPlayground() ? "playground" : "portfolio"));

  useEffect(() => {
    document.documentElement.dataset.palette = theme.palette;
    document.documentElement.dataset.mode = theme.mode;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "playground") {
        setView("playground");
      } else {
        setView("portfolio");
        setTimeout(() => {
          if (hash) {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 50);
      }
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (view === "playground") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = window.location.hash.slice(1);
    if (id && id !== "playground") {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [view]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav theme={theme} setTheme={setTheme} view={view} lang={lang} setLang={setLang} />
      <main id="main">
        {view === "playground" ? (
          <Playground
            lang={lang}
            onBack={() => {
              window.location.hash = "#home";
            }}
          />
        ) : (
          <>
            <Hero lang={lang} />
            <About lang={lang} />
            <Education lang={lang} />
            <Skills lang={lang} />
            <Projects lang={lang} />
            <Achievements lang={lang} />
            <Interests lang={lang} />
            <ResumeCta lang={lang} />
            <Contact lang={lang} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
