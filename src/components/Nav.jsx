import { useEffect, useRef, useState } from "react";
import ThemeStudio from "./ThemeStudio.jsx";
import { site } from "../data/siteData.js";
import { translations } from "../data/translations.js";

export default function Nav({ theme, setTheme, view, lang = "en", setLang }) {
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const navHeaderRef = useRef(null);
  const moreDropdownWrapRef = useRef(null);
  const moreBtnRef = useRef(null);
  const menuContainerRef = useRef(null);

  const t = translations[lang] || translations.en;

  const moreItems = [
    { id: "education", label: t.nav.education },
    { id: "skills", label: t.nav.skills },
    { id: "achievements", label: t.nav.achievements },
    { id: "interests", label: t.nav.interests },
    { id: "playground", label: t.nav.playground },
    { id: "contact", label: t.nav.contact },
    { id: "resume", label: t.nav.resume },
  ];

  // Outside click & escape handler
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If clicking outside entire nav header, close mobile menu and dropdown
      if (navHeaderRef.current && !navHeaderRef.current.contains(e.target)) {
        setMobileOpen(false);
        setMoreOpen(false);
      } else if (moreDropdownWrapRef.current && !moreDropdownWrapRef.current.contains(e.target)) {
        // If clicking inside nav header but outside 'More' dropdown
        setMoreOpen(false);
      }
    };

    const handleDocumentKeyDown = (e) => {
      if (e.key === "Escape") {
        if (moreOpen) {
          setMoreOpen(false);
          moreBtnRef.current?.focus();
        } else if (mobileOpen) {
          setMobileOpen(false);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [moreOpen, mobileOpen]);

  // Track active section for highlight
  useEffect(() => {
    if (view === "playground") {
      setActive("playground");
      return;
    }

    const observedIds = [
      "home",
      "about",
      "projects",
      "education",
      "skills",
      "achievements",
      "interests",
      "resume",
      "contact",
    ];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px" }
    );

    observedIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [view]);

  // Navigate to target section or view, closing all open menus
  const handleNavClick = (id) => {
    setMoreOpen(false);
    setMobileOpen(false);

    if (id === "playground") {
      window.location.hash = "#playground";
      return;
    }

    if (view === "playground") {
      // Return from playground to portfolio view and scroll to target
      window.location.hash = `#${id}`;
    } else {
      window.location.hash = `#${id}`;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Keyboard navigation on the More button
  const handleMoreButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!moreOpen) {
        setMoreOpen(true);
        setTimeout(() => {
          const menu = menuContainerRef.current;
          if (menu) {
            const firstInteractive = menu.querySelector("button, a");
            firstInteractive?.focus();
          }
        }, 40);
      } else {
        setMoreOpen(false);
      }
    } else if (e.key === "Escape" && moreOpen) {
      e.preventDefault();
      setMoreOpen(false);
    }
  };

  // Keyboard navigation within the dropdown menu items
  const handleDropdownKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setMoreOpen(false);
      moreBtnRef.current?.focus();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const menu = menuContainerRef.current;
      if (!menu) return;
      const items = Array.from(menu.querySelectorAll("button, a"));
      if (!items.length) return;
      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex = 0;
      if (e.key === "ArrowDown") {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      }
      items[nextIndex]?.focus();
      return;
    }

    if (e.key === "Tab") {
      const menu = menuContainerRef.current;
      if (!menu) return;
      const items = Array.from(menu.querySelectorAll("button, a"));
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (!e.shiftKey && document.activeElement === lastItem) {
        // Tabbing forward past the last dropdown item closes menu
        setMoreOpen(false);
      } else if (e.shiftKey && document.activeElement === firstItem) {
        // Shift+Tabbing backward past the first item closes menu and returns to button
        setMoreOpen(false);
        moreBtnRef.current?.focus();
      }
    }
  };

  const isMoreActive = moreItems.some((m) => m.id === active);

  return (
    <header className="nav glass" ref={navHeaderRef}>
      <div className="wrap">
        <a
          className="logo"
          href="#home"
          onClick={() => {
            setMobileOpen(false);
            setMoreOpen(false);
            if (view === "playground") {
              window.location.hash = "#home";
            }
          }}
        >
          {site.name}
        </a>

        <nav aria-label="Main Navigation">
          <ul className={`links ${mobileOpen ? "open" : ""}`}>
            {/* 1. Home */}
            <li>
              <a
                href="#home"
                aria-current={active === "home"}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("home");
                }}
              >
                {t.nav.home}
              </a>
            </li>

            {/* 2. About */}
            <li>
              <a
                href="#about"
                aria-current={active === "about"}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("about");
                }}
              >
                {t.nav.about}
              </a>
            </li>

            {/* 3. Projects */}
            <li>
              <a
                href="#projects"
                aria-current={active === "projects"}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("projects");
                }}
              >
                {t.nav.projects}
              </a>
            </li>

            {/* 4. More (Desktop Dropdown & Mobile Inline Accordion) */}
            <li className="nav-dropdown-wrap" ref={moreDropdownWrapRef}>
              <button
                ref={moreBtnRef}
                id="more-dropdown-btn"
                type="button"
                className="nav-dropdown-btn"
                aria-haspopup="true"
                aria-expanded={moreOpen}
                aria-controls="more-dropdown-menu"
                data-active={isMoreActive}
                onClick={() => setMoreOpen((prev) => !prev)}
                onKeyDown={handleMoreButtonKeyDown}
              >
                <span>{t.nav.more}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown Menu (Popover on Desktop, Inline Accordion on Mobile) */}
              {moreOpen && (
                <div
                  ref={menuContainerRef}
                  id="more-dropdown-menu"
                  className="nav-dropdown-menu"
                  role="menu"
                  aria-labelledby="more-dropdown-btn"
                  onKeyDown={handleDropdownKeyDown}
                >
                  {/* i18n Language Toggle inside More Menu */}
                  <div className="nav-i18n-row" role="group" aria-label="Language selection">
                    <span className="nav-i18n-label">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      {t.nav.language}:
                    </span>
                    <div className="nav-i18n-toggle">
                      <button
                        type="button"
                        className={`nav-i18n-btn ${lang === "en" ? "active" : ""}`}
                        onClick={() => setLang("en")}
                        aria-pressed={lang === "en"}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        className={`nav-i18n-btn ${lang === "te" ? "active" : ""}`}
                        onClick={() => setLang("te")}
                        aria-pressed={lang === "te"}
                      >
                        తెలుగు
                      </button>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  {/* Section Links (Education, Skills, Achievements, Interests, Playground, Contact, Resume) */}
                  {moreItems.map((item) => {
                    const isCurrent = active === item.id;
                    return (
                      <a
                        key={item.id}
                        role="menuitem"
                        tabIndex={0}
                        className="nav-dropdown-item"
                        href={`#${item.id}`}
                        aria-current={isCurrent}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNavClick(item.id);
                          }
                        }}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="nav-right">
          <ThemeStudio theme={theme} setTheme={setTheme} />
          <button
            className="iconbtn burger"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            onClick={() => {
              setMobileOpen((prev) => !prev);
              // If closing mobile menu, also close more dropdown
              if (mobileOpen) setMoreOpen(false);
            }}
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
