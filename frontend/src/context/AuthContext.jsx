import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("dpres_token"));
  const [user, setUser] = useState(
    localStorage.getItem("dpres_user")
      ? JSON.parse(localStorage.getItem("dpres_user"))
      : null
  );

  const login = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("dpres_token", payload.token);
    localStorage.setItem("dpres_user", JSON.stringify(payload.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("dpres_token");
    localStorage.removeItem("dpres_user");
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
