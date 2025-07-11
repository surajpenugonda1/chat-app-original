"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAppStore } from "@/lib/store/app-store"
import { getCurrentUser, loginUser, registerUser, logoutUser } from "@/lib/auth"
import type { User, LoginCredentials, RegisterCredentials } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setUser, setAuthenticated } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setAuthenticated(true)
        } else {
          // Auto-login with demo user if no token
          // await autoLoginDemo()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Fallback to demo user
        // await autoLoginDemo()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [setUser, setAuthenticated])

  const autoLoginDemo = async () => {
    try {
      const demoUser = await loginUser({
        email: "demo@example.com",
        password: "password123",
      })
      setUser(demoUser)
      setAuthenticated(true)
    } catch (error) {
      console.warn("Demo login failed:", error)
      // Set a basic demo user without API
      const demoUser: User = {
        id: "demo",
        name: "Demo User",
        email: "demo@example.com",
        role: "user",
        isAdmin: false,
      }
      setUser(demoUser)
      setAuthenticated(true)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    console.log("🔄 Auth context login started with:", { email: credentials.email, password: "***" })
    
    try {
      const user = await loginUser(credentials)
      console.log("✅ LoginUser returned:", user)
      
      setUser(user)
      setAuthenticated(true)
      
      console.log("✅ Auth state updated successfully")
    } catch (error) {
      console.error("❌ Login failed in auth context:", error)
      throw error
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      const user = await registerUser(credentials)
      setUser(user)
      setAuthenticated(true)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setAuthenticated(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
