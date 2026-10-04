import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(response.message);

      /*
        Store email temporarily so the OTP page
        knows which account is being verified.
      */
      sessionStorage.setItem(
        "lyvo-reset-email",
        email.trim().toLowerCase()
      );

      /*
        Development/testing flow:
        Move to OTP verification page.
      */
      navigate("/verify-otp");
    } catch (error) {
      setError(
        error.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lyvo-auth-page">
      <div className="lyvo-auth-background">
        <div className="lyvo-auth-orb lyvo-auth-orb-one"></div>
        <div className="lyvo-auth-orb lyvo-auth-orb-two"></div>
      </div>

      <div className="lyvo-auth-topbar">
        <Link to="/" className="lyvo-auth-logo">
          <span className="lyvo-gradient-text">LYVO</span>
        </Link>

        <button
          type="button"
          className="lyvo-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      <section className="lyvo-auth-card">
        <div className="lyvo-auth-icon">✉</div>

        <h1>Forgot your password?</h1>

        <p className="lyvo-auth-subtitle">
          Enter your email and we'll send you a verification code
          to reset your password.
        </p>

        {error && (
          <div className="lyvo-auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="lyvo-auth-success">
            {success}
          </div>
        )}

        <form
          className="lyvo-auth-form"
          onSubmit={handleSubmit}
        >
          <div className="lyvo-auth-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="lyvo-btn-primary lyvo-auth-submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}

            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="lyvo-auth-footer-text">
          Remember your password?{" "}
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;