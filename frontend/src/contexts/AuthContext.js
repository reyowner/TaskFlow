"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "../utils/api";

const AuthContext = createContext({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!token || !storedUser) {
        console.log("No user or token found, logging out...");
        logout();
        return;
      }

      setUser(JSON.parse(storedUser));
      await validateToken();
    } catch (error) {
      console.error("Error checking auth state:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    try {
      console.log("Validating token...");
      const response = await fetch("https://taskflow-ru9t.onrender.com/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("Invalid token, logging out...");
        logout();
        return;
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Token validation error:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      router.push("/dashboard");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      await registerUser({ username, email, password });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return error.message;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading ? children : <p>Loading...</p>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
