import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // verify token with backend
      try {
        const res = await api.get('/auth/me');
        setToken(storedToken);
        setUser(res.data.user || (storedUser ? JSON.parse(storedUser) : null));
      } catch (err) {
        // token invalid or expired -> clear
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = (newToken, userObj) => {
    setToken(newToken);
    setUser(userObj || null);
    localStorage.setItem("token", newToken);
    if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
