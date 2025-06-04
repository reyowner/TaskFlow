"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useRouter, usePathname } from "next/navigation"
import authService from "../services/authService"
import { API_URL } from '../config/api'

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true,
  isAuthenticated: false,
})

export const AuthProvider = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (!token) {
        console.log("No token found")
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }

      await validateToken()
    } catch (error) {
      console.error("Error checking auth state:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const validateToken = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setUser(null)
      setIsAuthenticated(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("Invalid token")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      const userData = await response.json()
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      console.error("Token validation error:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await authService.login({ email: username, password })
      if (response) {
        await validateToken()
        router.push("/categories")
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (username, email, password) => {
    try {
      await authService.register({ username, email, password })
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return error.response?.data?.detail || "Registration failed"
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
