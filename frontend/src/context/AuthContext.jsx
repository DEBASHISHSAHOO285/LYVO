import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("lyvo-token");

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");
        setUser(response.user);

        localStorage.setItem(
          "lyvo-user",
          JSON.stringify(response.user)
        );
      } catch (error) {
        console.error("Auth check failed:", error);

        localStorage.removeItem("lyvo-token");
        localStorage.removeItem("lyvo-user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const logout = () => {
    localStorage.removeItem("lyvo-token");
    localStorage.removeItem("lyvo-user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: Boolean(token && user),
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}