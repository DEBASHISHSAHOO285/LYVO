import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Settings() {
  const navigate = useNavigate();

  const {
    theme,
    toggleTheme,
    chatColor,
    setChatColor,
  } = useTheme();

  const {
    user,
    setUser,
    logout,
  } = useAuth();

  const chatColors = [
    "blue",
    "violet",
    "cyan",
    "green",
    "orange",
    "pink",
  ];

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar_url: "",
  });

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      avatar_url: user.avatar_url || "",
    });
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    if (!profileForm.email.trim()) {
      setProfileError("Email is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await api.put(
        "/users/me",
        {
          name: profileForm.name.trim(),
          email: profileForm.email
            .trim()
            .toLowerCase(),
          avatar_url:
            profileForm.avatar_url.trim(),
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to update profile."
        );
      }

      if (response.user) {
        setUser(response.user);

        localStorage.setItem(
          "lyvo-user",
          JSON.stringify(response.user)
        );
      }

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordMessage("");
      setPasswordError("");

      const response = await api.put(
        "/users/me/password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to change password."
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="lyvo-settings-page">
      {/* Top Bar */}

      <header className="lyvo-settings-topbar">
        <button
          type="button"
          className="lyvo-settings-back-btn"
          onClick={() => navigate("/chat")}
        >
          ←
        </button>

        <div>
          <h1>Settings</h1>

          <p>
            Customize your LYVO experience.
          </p>
        </div>
      </header>

      <main className="lyvo-settings-main">
        {/* =================================================
            APPEARANCE
        ================================================= */}

        <section className="lyvo-settings-section">
          <div className="lyvo-settings-section-header">
            <div className="lyvo-settings-section-icon">
              ◐
            </div>

            <div>
              <h2>Appearance</h2>

              <p>
                Choose how LYVO looks on your device.
              </p>
            </div>
          </div>

          <div className="lyvo-settings-card">
            {/* Theme */}

            <div className="lyvo-settings-row">
              <div className="lyvo-settings-row-info">
                <h3>Theme</h3>

                <p>
                  Switch between dark and light
                  appearance.
                </p>
              </div>

              <button
                type="button"
                className={`lyvo-theme-switch ${
                  theme === "light"
                    ? "light"
                    : ""
                }`}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className="lyvo-theme-switch-icon">
                  {theme === "dark"
                    ? "☾"
                    : "☀"}
                </span>

                <span>
                  {theme === "dark"
                    ? "Dark"
                    : "Light"}
                </span>
              </button>
            </div>

            {/* Chat Color */}

            <div className="lyvo-settings-row">
              <div className="lyvo-settings-row-info">
                <h3>Chat Color</h3>

                <p>
                  Choose the accent color for
                  your chat messages.
                </p>
              </div>

              <div className="lyvo-chat-color-options">
                {chatColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`lyvo-chat-color-option ${color} ${
                      chatColor === color
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setChatColor(color)
                    }
                    aria-label={`${color} chat color`}
                    title={
                      color
                        .charAt(0)
                        .toUpperCase() +
                      color.slice(1)
                    }
                  >
                    {chatColor === color &&
                      "✓"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section className="lyvo-settings-section">
          <div className="lyvo-settings-section-header">
            <div className="lyvo-settings-section-icon">
              ◎
            </div>

            <div>
              <h2>Account</h2>

              <p>
                Manage your LYVO profile.
              </p>
            </div>
          </div>

          <div className="lyvo-settings-card lyvo-profile-card">
            <form
              onSubmit={handleSaveProfile}
              className="lyvo-profile-form"
            >
              {/* Avatar */}

              <div className="lyvo-profile-avatar-section">
                {profileForm.avatar_url ? (
                  <img
                    src={
                      profileForm.avatar_url
                    }
                    alt="Profile"
                    className="lyvo-profile-avatar"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="lyvo-profile-avatar lyvo-profile-avatar-placeholder">
                    {(
                      profileForm.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h3>Profile</h3>

                  <p>
                    Update your personal
                    information.
                  </p>
                </div>
              </div>

              {/* Name */}

              <div className="lyvo-settings-field">
                <label htmlFor="profile-name">
                  Name
                </label>

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={
                    handleProfileChange
                  }
                  placeholder="Your name"
                  className="lyvo-input"
                  autoComplete="name"
                />
              </div>

              {/* Email */}

              <div className="lyvo-settings-field">
                <label htmlFor="profile-email">
                  Email
                </label>

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={
                    handleProfileChange
                  }
                  placeholder="you@example.com"
                  className="lyvo-input"
                  autoComplete="email"
                />
              </div>

              {/* Avatar URL */}

              <div className="lyvo-settings-field">
                <label htmlFor="profile-avatar">
                  Avatar URL
                </label>

                <input
                  id="profile-avatar"
                  name="avatar_url"
                  type="url"
                  value={
                    profileForm.avatar_url
                  }
                  onChange={
                    handleProfileChange
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="lyvo-input"
                />

                <span className="lyvo-settings-field-hint">
                  Paste a public image URL for
                  your profile picture.
                </span>
              </div>

              {profileError && (
                <div className="lyvo-settings-form-error">
                  {profileError}
                </div>
              )}

              {profileMessage && (
                <div className="lyvo-settings-form-success">
                  {profileMessage}
                </div>
              )}

              <div className="lyvo-settings-form-actions">
                <button
                  type="submit"
                  className="lyvo-btn-primary"
                  disabled={savingProfile}
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="lyvo-settings-section">
          <div className="lyvo-settings-section-header">
            <div className="lyvo-settings-section-icon">
              ⌁
            </div>

            <div>
              <h2>Security</h2>

              <p>
                Keep your LYVO account secure.
              </p>
            </div>
          </div>

          <div className="lyvo-settings-card">
            <form
              onSubmit={handleChangePassword}
              className="lyvo-password-form"
            >
              <div className="lyvo-settings-field">
                <label htmlFor="current-password">
                  Current Password
                </label>

                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  className="lyvo-input"
                  autoComplete="current-password"
                />
              </div>

              <div className="lyvo-settings-field">
                <label htmlFor="new-password">
                  New Password
                </label>

                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Minimum 8 characters"
                  className="lyvo-input"
                  autoComplete="new-password"
                />
              </div>

              <div className="lyvo-settings-field">
                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Repeat new password"
                  className="lyvo-input"
                  autoComplete="new-password"
                />
              </div>

              {passwordError && (
                <div className="lyvo-settings-form-error">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="lyvo-settings-form-success">
                  {passwordMessage}
                </div>
              )}

              <div className="lyvo-settings-form-actions">
                <button
                  type="submit"
                  className="lyvo-btn-primary"
                  disabled={
                    changingPassword
                  }
                >
                  {changingPassword
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* =================================================
            SESSION
        ================================================= */}

        <section className="lyvo-settings-section">
          <div className="lyvo-settings-section-header">
            <div className="lyvo-settings-section-icon">
              ↪
            </div>

            <div>
              <h2>Session</h2>

              <p>
                Manage your current LYVO session.
              </p>
            </div>
          </div>

          <div className="lyvo-settings-card">
            <div className="lyvo-settings-row">
              <div className="lyvo-settings-row-info">
                <h3>Log out</h3>

                <p>
                  Sign out from this LYVO
                  account on this device.
                </p>
              </div>

              <button
                type="button"
                className="lyvo-settings-danger-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;