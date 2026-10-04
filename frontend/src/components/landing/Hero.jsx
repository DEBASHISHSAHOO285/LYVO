import { Link } from "react-router-dom";
function Hero() {
  return (
    <section
      id="top"
      className="lyvo-ambient"
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        padding: "90px 0 120px",
      }}
    >
      <div
        className="lyvo-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          alignItems: "center",
          gap: "60px",
        }}
      >
        {/* Content */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 13px",
              border: "1px solid var(--lyvo-border)",
              borderRadius: "999px",
              background: "var(--lyvo-surface)",
              color: "var(--lyvo-text-soft)",
              fontSize: "13px",
              marginBottom: "25px",
            }}
          >
            <span>✦</span>
            Your AI Workspace
          </div>

          <h1
            className="lyvo-heading"
            style={{
              fontSize: "clamp(52px, 7vw, 92px)",
              margin: 0,
            }}
          >
            Think.
            <br />

            <span className="lyvo-gradient-text">
              Create.
            </span>

            <br />

            Build.
          </h1>

          <p
            className="lyvo-subheading"
            style={{
              fontSize: "19px",
              maxWidth: "600px",
              marginTop: "28px",
            }}
          >
            Chat with AI, generate images, explore ideas,
            challenge decisions and build projects —
            all inside one intelligent workspace.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "32px",
            }}
          >
            <Link
  to="/login"
  className="lyvo-btn-primary"
  style={{
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  Start Building
  <span style={{ marginLeft: "8px" }}>→</span>
</Link>

            <button
              className="lyvo-btn-secondary"
              style={{
                padding: "14px 22px",
                fontSize: "15px",
              }}
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Explore Features
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              flexWrap: "wrap",
              marginTop: "28px",
              color: "var(--lyvo-text-soft)",
              fontSize: "13px",
            }}
          >
            <span>✓ AI Chat</span>
            <span>✓ Image Generation</span>
            <span>✓ AI Debate</span>
          </div>
        </div>

        {/* AI Orb */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="lyvo-orb-wrapper">
            <div className="lyvo-orb-ring ring-one" />
            <div className="lyvo-orb-ring ring-two" />

            <div className="lyvo-orb">
              <span>✦</span>
            </div>

            <div className="lyvo-orb-label">
              LYVO
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;