function WorkspaceShowcase() {
  return (
    <section
      id="workspace"
      style={{
        padding: "120px 0",
      }}
    >
      <div className="lyvo-container">
        <div
          className="lyvo-glass"
          style={{
            borderRadius: "28px",
            padding: "50px",
            display: "grid",
            gridTemplateColumns:
              "0.8fr 1.2fr",
            gap: "50px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--lyvo-primary-hover)",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "14px",
              }}
            >
              Your space
            </div>

            <h2
              className="lyvo-heading"
              style={{
                fontSize: "clamp(34px, 5vw, 58px)",
                margin: 0,
              }}
            >
              One place for
              <br />
              <span className="lyvo-gradient-text">
                everything.
              </span>
            </h2>

            <p
              className="lyvo-subheading"
              style={{
                marginTop: "20px",
                fontSize: "16px",
              }}
            >
              Keep conversations, ideas, images,
              projects and AI workflows organized
              inside your own workspace.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {[
              ["💬", "Conversations"],
              ["🎨", "Creations"],
              ["📁", "Projects"],
              ["🧠", "Memory"],
            ].map(([icon, title]) => (
              <div
                key={title}
                className="lyvo-card"
                style={{
                  padding: "22px",
                  minHeight: "120px",
                }}
              >
                <div style={{ fontSize: "25px" }}>
                  {icon}
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkspaceShowcase;