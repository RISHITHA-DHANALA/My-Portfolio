import { useState } from "react";
import Section from "../components/Section.jsx";
import { translations } from "../data/translations.js";

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;
const CONFIGURED = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(ENDPOINT || "");

function F({ k, label, type = "text", area, errs }) {
  const P = area ? "textarea" : "input";
  return (
    <div>
      <label htmlFor={`f-${k}`}>{label}</label>
      <P
        id={`f-${k}`}
        name={k}
        type={area ? undefined : type}
        rows={area ? 5 : undefined}
        required
        aria-required="true"
        aria-invalid={!!errs[k]}
        aria-describedby={errs[k] ? `e-${k}` : undefined}
        autoComplete={k === "name" || k === "email" ? k : "off"}
      />
      {errs[k] && (
        <p className="err" id={`e-${k}`}>
          {errs[k]}
        </p>
      )}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact({ lang = "en" }) {
  const [status, setStatus] = useState("idle");
  const [errs, setErrs] = useState({});
  const [msg, setMsg] = useState("");

  const t = translations[lang]?.contact || translations.en.contact;

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget,
      data = new FormData(form),
      v = {};
    ["name", "email", "subject", "message"].forEach((k) => {
      if (!String(data.get(k) || "").trim()) v[k] = "This field is required.";
    });
    if (!v.email && !EMAIL_RE.test(String(data.get("email")).trim())) v.email = "Enter a valid email address.";
    setErrs(v);
    if (Object.keys(v).length) return;

    setStatus("sending");
    setMsg("");

    if (CONFIGURED) {
      try {
        const r = await fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.errors?.map((x) => x.message).join(", ") || "The server rejected the message.");
        }
        setStatus("sent");
        form.reset();
      } catch (err) {
        setStatus("error");
        setMsg(err.message || "Network error.");
      }
    } else {
      setTimeout(() => {
        setStatus("sent");
        form.reset();
      }, 500);
    }
  };

  return (
    <Section id="contact" title={t.title}>
      <p>{t.intro}</p>
      <form className="form" onSubmit={submit} noValidate>
        <F errs={errs} k="name" label={t.name} />
        <F errs={errs} k="email" label={t.email} type="email" />
        <F errs={errs} k="subject" label={t.subject} />
        <F errs={errs} k="message" label={t.message} area />
        <button className="btn primary" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? t.sending : t.send}
        </button>
        <div role="status" aria-live="polite">
          {status === "sent" && <p className="ok">{t.success}</p>}
          {status === "error" && (
            <p className="err">
              {msg ? `Message not sent: ${msg}` : t.error}
            </p>
          )}
        </div>
      </form>
    </Section>
  );
}
