"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAppStore } from "@/lib/store/app-store"
import { getCurrentUser, loginUser, registerUser, logoutUser, isAuthenticated, clearAuthData, getStoredUser } from "@/lib/auth"
import type { User, LoginCredentials, RegisterCredentials } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  retry: () => Promise<void>
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
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  const initializeAuth = async () => {
    console.log("🔄 Initializing authentication...")
    
    // Don't initialize if already loading to prevent double calls
    if (isLoading === false) {
      setIsLoading(true)
    }
    
    try {
      setError(null)
      
      // First check if user has a token (quick local check)
      const hasToken = isAuthenticated()
      console.log("🔍 Token check:", hasToken)
      
      if (!hasToken) {
        // No token, user is not authenticated
        console.log("❌ No token found, user not authenticated")
        setUser(null)
        setAuthenticated(false)
        return
      }

      // Token exists, try to get current user from backend
      console.log("✅ Token found, fetching user data...")
      const currentUser = await getCurrentUser()
      if (currentUser) {
        console.log("✅ User data fetched successfully:", currentUser)
        setUser(currentUser)
        setAuthenticated(true)
        setError(null) // Clear any previous errors on successful auth
      } else {
        // Token exists but couldn't get user - clear invalid tokens
        console.log("❌ Token invalid, clearing auth data")
        clearAuthData()
        setUser(null)
        setAuthenticated(false)
      }
    } catch (error: any) {
      console.error("❌ Auth initialization error:", error)
      setError(error.message || "Failed to initialize authentication")
      
      // If it's a backend unavailable error, try to use cached user data
      if (error.message?.includes("Backend service unavailable")) {
        console.log("⚠️ Backend unavailable, trying cached user data...")
        const cachedUser = getStoredUser()
        if (cachedUser && isAuthenticated()) {
          // Use cached user data when backend is unavailable
          console.log("✅ Using cached user data:", cachedUser)
          setUser(cachedUser)
          setAuthenticated(true)
          setError(null) // Clear error when using cached data successfully
        } else {
          console.log("❌ No cached user data available")
          setUser(null)
          setAuthenticated(false)
        }
      } else {
        // Other errors, clear everything
        console.log("❌ Clearing auth data due to error")
        clearAuthData()
        setUser(null)
        setAuthenticated(false)
      }
    } finally {
      console.log("🏁 Auth initialization complete")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initializeAuth()
  }, []) // Remove dependencies to prevent re-initialization

  const login = async (credentials: LoginCredentials) => {
    console.log("🔄 Auth context login started with:", { email: credentials.email, password: "***" })
    
    setError(null)
    
    try {
      const user = await loginUser(credentials)
      console.log("✅ LoginUser returned:", user)
      
      setUser(user)
      setAuthenticated(true)
      
      console.log("✅ Auth state updated successfully")
    } catch (error: any) {
      console.error("❌ Login failed in auth context:", error)
      setError(error.message || "Login failed")
      throw error
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setError(null)
    
    try {
      const user = await registerUser(credentials)
      setUser(user)
      setAuthenticated(true)
    } catch (error: any) {
      console.error("Registration failed:", error)
      setError(error.message || "Registration failed")
      throw error
    }
  }

  const logout = async () => {
    setError(null)
    
    try {
      await logoutUser()
    } catch (error: any) {
      console.error("Logout error:", error)
      // Don't set error for logout failures, just log them
    } finally {
      // Always clear local state regardless of API call success
      setUser(null)
      setAuthenticated(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const retry = async () => {
    await initializeAuth()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    retry,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}