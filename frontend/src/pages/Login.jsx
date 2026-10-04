import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { theme, toggleTheme } = useTheme();

  const {
    setUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      // Store authentication data
      localStorage.setItem("lyvo-token", response.token);

      localStorage.setItem(
        "lyvo-user",
        JSON.stringify(response.user)
      );

      // Update AuthContext immediately
      setUser(response.user);

      // Go to workspace
      navigate("/chat");
    } catch (error) {
      setError(
        error.message || "Unable to sign in. Please try again."
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

      {/* Login Card */}
      <section className="lyvo-auth-card">
        <div className="lyvo-auth-icon">✦</div>

        <h1>Welcome back</h1>

        <p className="lyvo-auth-subtitle">
          Sign in to continue to your AI workspace.
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
            <div className="lyvo-auth-label-row">
              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="lyvo-btn-primary lyvo-auth-submit"
            disabled={loading || authLoading}
          >
            {loading ? "Signing in..." : "Sign in"}

            {!loading && <span>→</span>}
          </button>
        </form>

        {/* Divider */}
        <div className="lyvo-auth-divider">
          <span>or</span>
        </div>

        {/* Register */}
        <p className="lyvo-auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;