import Reveal from "./Reveal.jsx";
export default function Section({ id, title, children }) {
  return (
    <section id={id} className="sec" aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <h2 id={`${id}-h`}>{title}</h2>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
