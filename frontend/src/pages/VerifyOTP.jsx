import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function VerifyOTP() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("lyvo-reset-email");

    if (!resetEmail) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    setEmail(resetEmail);
  }, [navigate]);

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");

    setOtp(value.slice(0, 6));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-reset-otp", {
        email,
        otp,
      });

      sessionStorage.setItem(
        "lyvo-reset-token-id",
        String(response.resetTokenId)
      );

      navigate("/reset-password");
    } catch (error) {
      setError(
        error.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    navigate("/forgot-password");
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
        <div className="lyvo-auth-icon">⌁</div>

        <h1>Verify your email</h1>

        <p className="lyvo-auth-subtitle">
          Enter the 6-digit verification code sent to your
          email address.
        </p>

        {email && (
          <p className="lyvo-auth-subtitle">
            Code sent to <strong>{email}</strong>
          </p>
        )}

        {error && (
          <div className="lyvo-auth-error">
            {error}
          </div>
        )}

        <form
          className="lyvo-auth-form"
          onSubmit={handleSubmit}
        >
          <div className="lyvo-auth-field">
            <label htmlFor="otp">
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="000000"
              autoComplete="one-time-code"
              value={otp}
              onChange={handleOtpChange}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="lyvo-btn-primary lyvo-auth-submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}

            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="lyvo-otp-actions">
          <button
            type="button"
            className="lyvo-resend-btn"
            onClick={handleResend}
          >
            Resend code
          </button>

          <Link to="/forgot-password">
            Change email
          </Link>
        </div>

        <p className="lyvo-auth-footer-text">
          Remember your password?{" "}
          <Link to="/login">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default VerifyOTP;