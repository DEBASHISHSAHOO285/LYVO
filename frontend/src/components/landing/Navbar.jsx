import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--lyvo-border)",
        background: "color-mix(in srgb, var(--lyvo-bg) 82%, transparent)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        className="lyvo-container"
        style={{
          minHeight: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
          }}
        >
          <span
            className="lyvo-gradient-text"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            LYVO
          </span>
        </Link>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="lyvo-icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          <Link
            to="/login"
            className="lyvo-btn-secondary"
            style={{
              textDecoration: "none",
              padding: "9px 16px",
              fontSize: "14px",
            }}
          >
            Login
          </Link>

          <Link
            to="/login"
            className="lyvo-btn-primary"
            style={{
              textDecoration: "none",
              padding: "9px 16px",
              fontSize: "14px",
            }}
          >
            Start Creating
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;