import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { theme, toggleTheme } = useTheme();

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect already authenticated users
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Registration successful
      navigate("/login");
    } catch (error) {
      setError(
        error.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lyvo-auth-page">
      {/* Background */}
      <div className="lyvo-auth-background">
        <div className="lyvo-auth-orb lyvo-auth-orb-one"></div>
        <div className="lyvo-auth-orb lyvo-auth-orb-two"></div>
      </div>

      {/* Top Bar */}
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

      {/* Register Card */}
      <section className="lyvo-auth-card">
        <div className="lyvo-auth-icon">✦</div>

        <h1>Create your account</h1>

        <p className="lyvo-auth-subtitle">
          Start building, thinking and creating with LYVO.
        </p>

        {/* Error */}
        {error && (
          <div className="lyvo-auth-error">
            {error}
          </div>
        )}

        <form
          className="lyvo-auth-form"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div className="lyvo-auth-field">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="lyvo-auth-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="lyvo-auth-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="lyvo-auth-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="lyvo-btn-primary lyvo-auth-submit"
            disabled={loading || authLoading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            {!loading && <span>→</span>}
          </button>
        </form>

        {/* Login Link */}
        <p className="lyvo-auth-footer-text">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;