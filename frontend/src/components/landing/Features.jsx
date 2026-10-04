const features = [
  {
    icon: "💬",
    title: "AI Chat",
    description:
      "Ask questions, learn, brainstorm and have natural conversations.",
  },
  {
    icon: "🧠",
    title: "Deep Think",
    description:
      "Break complicated problems into structured reasoning.",
  },
  {
    icon: "🎨",
    title: "Image Studio",
    description:
      "Turn your ideas into original AI-generated visuals.",
  },
  {
    icon: "⚔️",
    title: "AI Debate",
    description:
      "Explore a question through Analyst, Critic and Strategist perspectives.",
  },
  {
    icon: "💻",
    title: "Build Mode",
    description:
      "Turn ideas into code, projects and practical solutions.",
  },
  {
    icon: "🎯",
    title: "Decision Mode",
    description:
      "Compare choices, risks and outcomes before deciding.",
  },
];

function Features() {
  return (
    <>
      <style>{`
        .lyvo-features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .lyvo-feature-card {
          position: relative;
          min-height: 285px;
          padding: 30px !important;
          overflow: hidden;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .lyvo-feature-card::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          top: -100px;
          right: -100px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgb(var(--lyvo-glow) / 0.18),
            transparent 70%
          );
          pointer-events: none;
          transition: transform 0.4s ease;
        }

        .lyvo-feature-card:hover {
          transform: translateY(-7px);
          border-color: rgb(var(--lyvo-glow) / 0.35);
          box-shadow:
            0 20px 50px rgb(var(--lyvo-glow) / 0.10),
            0 0 35px rgb(var(--lyvo-glow) / 0.06);
        }

        .lyvo-feature-card:hover::before {
          transform: scale(1.5);
        }

        .lyvo-feature-icon {
          position: relative;
          z-index: 1;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: var(--lyvo-surface-soft);
          border: 1px solid var(--lyvo-border);
          font-size: 24px;
          margin-bottom: 24px;
          box-shadow: 0 8px 25px rgb(var(--lyvo-glow) / 0.06);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .lyvo-feature-card:hover .lyvo-feature-icon {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 30px rgb(var(--lyvo-glow) / 0.15);
        }

        .lyvo-feature-card h3,
        .lyvo-feature-card p {
          position: relative;
          z-index: 1;
        }

        .lyvo-feature-card h3 {
          margin: 0 0 12px;
          font-size: 20px;
          font-weight: 650;
          letter-spacing: -0.02em;
        }

        .lyvo-feature-card p {
          margin: 0;
          font-size: 15px;
          line-height: 1.75;
        }

        @media (max-width: 950px) {
          .lyvo-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .lyvo-features-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .lyvo-feature-card {
            min-height: auto;
            padding: 24px !important;
          }
        }
      `}</style>

      <section
        id="features"
        style={{
          padding: "120px 0",
        }}
      >
        <div className="lyvo-container">
          <div
            style={{
              maxWidth: "700px",
              marginBottom: "55px",
            }}
          >
            <div
              style={{
                color: "var(--lyvo-primary-hover)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              One workspace
            </div>

            <h2
              className="lyvo-heading"
              style={{
                fontSize: "clamp(38px, 5vw, 64px)",
                margin: 0,
              }}
            >
              More than a
              <span className="lyvo-gradient-text">
                {" "}
                chatbot.
              </span>
            </h2>

            <p
              className="lyvo-subheading"
              style={{
                fontSize: "17px",
                marginTop: "20px",
              }}
            >
              LYVO combines conversation, creativity,
              reasoning and productivity in one place.
            </p>
          </div>

          <div className="lyvo-features-grid">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="lyvo-card lyvo-feature-card"
              >
                <div className="lyvo-feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>

                <p className="lyvo-subheading">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Features;