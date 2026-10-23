import { site } from "../data/siteData.js";

const ICON = {
  LinkedIn: [
    "0 0 24 24",
    "M4 9h4v11H4zM6 3.5a2.2 2.2 0 110 4.4 2.2 2.2 0 010-4.4zM10 9h3.8v1.6c.6-1 1.9-1.9 3.8-1.9 3.5 0 4.4 2.2 4.4 5.300V20h-4v-5.100c0-1.300-.3-2.300-1.700-2.300-1.600 0-2.300 1.100-2.300 2.500V20h-4z",
  ],
  YouTube: [
    "0 0 24 24",
    "M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3zm7 2v6l5-3z",
  ],
  GitHub: [
    "0 0 16 16",
    "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z",
  ],
};

const LINKS = [
  ["LinkedIn", "https://linkedin.com/in/rishitha-dhanala"],
  ["YouTube", "https://www.youtube.com/@rishithaspace"],
  ["GitHub", "https://github.com/RISHITHA-DHANALA"],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <p>&copy; {new Date().getFullYear()} {site.name}</p>
          <span style={{ opacity: 0.4 }}>·</span>
          <a
            href="/rishitha-portfolio-complete.zip"
            download="rishitha-portfolio-complete.zip"
            className="lnk"
            style={{ fontSize: "0.82rem", textDecoration: "none" }}
          >
            Download Project ZIP
          </a>
        </div>

        <ul aria-label="Social links">
          {LINKS.map(([n, h]) => (
            <li key={n}>
              <a
                href={h}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${n} (opens in a new tab)`}
                className="soc"
              >
                <svg viewBox={ICON[n][0]} width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d={ICON[n][1]} />
                </svg>
                {n}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
