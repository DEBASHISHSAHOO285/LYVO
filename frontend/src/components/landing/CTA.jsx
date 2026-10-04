import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();

  const handleStartCreating = () => {
    navigate("/login");
  };

  return (
    <section
      style={{
        padding: "100px 0 120px",
      }}
    >
      <div className="lyvo-container">
        <div
          className="lyvo-glow"
          style={{
            padding: "80px 40px",
            borderRadius: "28px",
            textAlign: "center",
            border: "1px solid var(--lyvo-border)",
            background:
              "radial-gradient(circle at 50% 0%, rgb(var(--lyvo-glow) / 0.14), transparent 45%), var(--lyvo-surface)",
          }}
        >
          <h2
            className="lyvo-heading"
            style={{
              margin: 0,
              fontSize: "clamp(42px, 6vw, 76px)",
              letterSpacing: "-0.055em",
            }}
          >
            Ready to meet{" "}
            <span className="lyvo-gradient-text">
              LYVO?
            </span>
          </h2>

          <p
            className="lyvo-subheading"
            style={{
              margin: "22px auto 0",
              maxWidth: "650px",
              fontSize: "18px",
            }}
          >
            One intelligent workspace for thinking,
            creating and building.
          </p>

          <button
            type="button"
            className="lyvo-btn-primary"
            onClick={handleStartCreating}
            style={{
              marginTop: "42px",
              padding: "17px 32px",
              fontSize: "17px",
              fontWeight: 700,
              borderRadius: "15px",
              boxShadow:
                "0 15px 40px rgb(var(--lyvo-glow) / 0.22)",
            }}
          >
            Start Creating →
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;