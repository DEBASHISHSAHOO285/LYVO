function Footer() {
  return (
    <footer
      style={{
        padding: "30px 0",
        borderTop:
          "1px solid var(--lyvo-border)",
      }}
    >
      <div
        className="lyvo-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            className="lyvo-gradient-text"
            style={{
              fontWeight: 800,
              fontSize: "20px",
            }}
          >
            LYVO
          </div>

          <div
            style={{
              color: "var(--lyvo-text-soft)",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            Your AI Workspace
          </div>
        </div>

        <div
          style={{
            color: "var(--lyvo-text-soft)",
            fontSize: "12px",
          }}
        >
          © 2026 LYVO. Built for ideas.
        </div>
      </div>
    </footer>
  );
}

export default Footer;