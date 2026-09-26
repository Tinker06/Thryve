import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section>
      <div
        style={{
          minHeight: "calc(100vh - 136px)",
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: 30,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        <div>
          <div className="eyebrow">AI-BASED COLLABORATIVE LEARNING INTELLIGENCE</div>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(54px,7vw,100px)",
              lineHeight: 0.86,
              margin: "0 0 24px",
              letterSpacing: "-5px",
            }}
          >
            MAKE TEAM
            <br />
            <span
              style={{
                background: "var(--pink)",
                padding: "0 10px",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              THINKING
            </span>
            <br />
            VISIBLE.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.45, maxWidth: 650, fontWeight: 700 }}>
            One shared workspace for team discussions, project documents, task
            contributions and AI-powered collaboration intelligence — built for
            student teams.
          </p>
          <Link to="/team-login">
            <button className="btn">ENTER YOUR TEAM ↗</button>
          </Link>{" "}
          <Link to="/team-signup">
  <button className="btn pink">NEW TEAM +</button>
</Link>
          <div className="notice blue" style={{ maxWidth: 680, marginTop: 20 }}>
            HACKATHON DEMO: click through the full product story.
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="tag">TEAM / INSIGHTS</div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 34,
              marginTop: 10,
              border: "3px solid var(--ink)",
              background: "var(--yellow)",
              padding: 18,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            78%
            <br />
            <small>COLLECTIVE INTELLIGENCE</small>
          </div>
        </div>
      </div>
    </section>
  );
}