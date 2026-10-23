import Section from "../components/Section.jsx";
import { site, education, skills, projects, achievements, interests } from "../data/siteData.js";
import { translations } from "../data/translations.js";

export const About = ({ lang = "en" }) => {
  const t = translations[lang]?.about || translations.en.about;
  const paragraphs = t.paragraphs || site.about;
  return (
    <Section id="about" title={t.title || "About me"}>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      {site.location && <p className="muted">{t.location || `Based in ${site.location}`}</p>}
    </Section>
  );
};

export const Education = ({ lang = "en" }) => {
  const t = translations[lang]?.education || translations.en.education;
  return (
    <Section id="education" title={t.title || "Education"}>
      {education.map((e, idx) => (
        <div className="row" key={idx}>
          <h3>{t.degree || e.degree}</h3>
          <p>{t.school || e.school}</p>
          <p className="muted">{t.years || e.years}</p>
        </div>
      ))}
    </Section>
  );
};

export const Skills = ({ lang = "en" }) => {
  const t = translations[lang]?.skills || translations.en.skills;
  const groupTitles = t.groups || {};
  return (
    <Section id="skills" title={t.title || "Technical skills"}>
      <div className="cols">
        {skills.map((g) => {
          let label = g.group;
          if (g.group === "Programming" && groupTitles.programming) label = groupTitles.programming;
          if (g.group === "Web" && groupTitles.web) label = groupTitles.web;
          if (g.group === "Core CS" && groupTitles.core) label = groupTitles.core;
          return (
            <div key={g.group}>
              <h3>{label}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export const Projects = ({ lang = "en" }) => {
  const t = translations[lang]?.projects || translations.en.projects;
  return (
    <Section id="projects" title={t.title || "Projects"}>
      {projects.map((p) => (
        <article className="row" key={p.title}>
          <h3>{p.title}</h3>
          <p className="muted">{t.drishtiDesc || p.description}</p>
          <ul className="tags" aria-label="Technologies">
            {p.tech.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <p className="plinks">
            {p.links.map((link) => {
              const label =
                link.label === "Live prototype"
                  ? t.liveBtn || link.label
                  : link.label === "GitHub"
                  ? t.githubBtn || link.label
                  : link.label;
              return (
                <a key={link.href} className="lnk" href={link.href} target="_blank" rel="noopener noreferrer">
                  {label}
                  <span className="sr"> (opens in a new tab)</span>
                </a>
              );
            })}
          </p>
        </article>
      ))}
    </Section>
  );
};

export const Achievements = ({ lang = "en" }) => {
  const t = translations[lang]?.achievements || translations.en.achievements;
  return (
    <Section id="achievements" title={t.title || "Achievements"}>
      {achievements.map((a, idx) => (
        <div className="row" key={idx}>
          <p className="big">{t.sihTitle || a.title}</p>
          <p className="muted">{t.sihDetail || a.detail}</p>
        </div>
      ))}
    </Section>
  );
};

export const Interests = ({ lang = "en" }) => {
  const t = translations[lang]?.interests || translations.en.interests;
  return (
    <Section id="interests" title={t.title || "Learning and interests"}>
      <ul className="icards">
        {interests.map((i) => (
          <li key={i.title} className="icard glass">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={i.icon} />
            </svg>
            <span>{i.title}</span>
            {i.status && <em className="status">{t.exploring || i.status}</em>}
          </li>
        ))}
      </ul>
    </Section>
  );
};
