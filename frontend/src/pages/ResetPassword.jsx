import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function ResetPassword() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetTokenId, setResetTokenId] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("lyvo-reset-email");
    const tokenId = sessionStorage.getItem("lyvo-reset-token-id");

    if (!resetEmail || !tokenId) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    setEmail(resetEmail);
    setResetTokenId(tokenId);
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !resetTokenId) {
      setError(
        "Password reset session is missing. Please start again."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        email,
        resetTokenId,
        newPassword: password,
      });

      setSuccess(response.message);

      sessionStorage.removeItem("lyvo-reset-email");
      sessionStorage.removeItem("lyvo-reset-token-id");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      setError(
        error.message ||
          "Unable to reset password. Please try again."
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
        <div className="lyvo-auth-icon">🔐</div>

        <h1>Create a new password</h1>

        <p className="lyvo-auth-subtitle">
          Your identity has been verified. Choose a strong new
          password for your LYVO account.
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
            <label htmlFor="password">
              New password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div className="lyvo-auth-field">
            <label htmlFor="confirmPassword">
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="lyvo-btn-primary lyvo-auth-submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset password"}

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

export default ResetPassword;