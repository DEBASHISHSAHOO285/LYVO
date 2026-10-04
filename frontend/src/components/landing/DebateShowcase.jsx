function DebateShowcase() {
  return (
    <section
      style={{
        padding: "120px 0",
      }}
    >
      <div className="lyvo-container">
        <div
          style={{
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto 55px",
          }}
        >
          <div
            style={{
              color: "var(--lyvo-primary-hover)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Think deeper
          </div>

          <h2
            className="lyvo-heading"
            style={{
              fontSize: "clamp(38px, 5vw, 64px)",
              margin: "15px 0",
            }}
          >
            Don't just get an answer.
            <br />
            <span className="lyvo-gradient-text">
              Challenge it.
            </span>
          </h2>

          <p className="lyvo-subheading">
            LYVO Debate brings multiple perspectives
            together before reaching a conclusion.
          </p>
        </div>

        <div
  className="lyvo-debate-grid"
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "16px",
    maxWidth: "900px",
    margin: "0 auto",
  }}
>
          {[
            ["🧠", "Analyst", "Looks at facts and evidence."],
            ["⚔️", "Critic", "Finds weaknesses and risks."],
            ["🎯", "Strategist", "Turns insights into action."],
          ].map(([icon, title, text]) => (
            <div
              key={title}
              className="lyvo-card"
              style={{
                padding: "28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "35px",
                  marginBottom: "18px",
                }}
              >
                {icon}
              </div>

              <h3 style={{ margin: "0 0 10px" }}>
                {title}
              </h3>

              <p className="lyvo-subheading">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DebateShowcase;