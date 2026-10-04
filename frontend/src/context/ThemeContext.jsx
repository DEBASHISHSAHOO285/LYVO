import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const CHAT_COLORS = {
  blue: {
    primary: "#6366f1",
    accent: "#8b5cf6",
    glow: "99 102 241",
  },
  violet: {
    primary: "#8b5cf6",
    accent: "#a855f7",
    glow: "139 92 246",
  },
  cyan: {
    primary: "#06b6d4",
    accent: "#0284c7",
    glow: "6 182 212",
  },
  green: {
    primary: "#10b981",
    accent: "#059669",
    glow: "16 185 129",
  },
  orange: {
    primary: "#f97316",
    accent: "#ea580c",
    glow: "249 115 22",
  },
  pink: {
    primary: "#ec4899",
    accent: "#db2777",
    glow: "236 72 153",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("lyvo-theme") || "dark";
  });

  const [chatColor, setChatColor] = useState(() => {
    return localStorage.getItem("lyvo-chat-color") || "blue";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lyvo-theme", theme);
  }, [theme]);

  useEffect(() => {
    const selectedColor =
      CHAT_COLORS[chatColor] || CHAT_COLORS.blue;

    document.documentElement.style.setProperty(
      "--lyvo-chat-primary",
      selectedColor.primary
    );

    document.documentElement.style.setProperty(
      "--lyvo-chat-accent",
      selectedColor.accent
    );

    document.documentElement.style.setProperty(
      "--lyvo-chat-glow",
      selectedColor.glow
    );

    localStorage.setItem("lyvo-chat-color", chatColor);
  }, [chatColor]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        chatColor,
        setChatColor,
        chatColors: CHAT_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}