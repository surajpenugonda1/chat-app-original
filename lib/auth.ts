import { api } from "./api-client"
import { API_ENDPOINTS } from "./config"
import type { User, LoginCredentials, RegisterCredentials } from "./types"

// Utility functions (defined first)
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const token = localStorage.getItem("access_token")
  const hasToken = !!token
  console.log("🔍 isAuthenticated check:", { hasToken, tokenLength: token?.length })
  return hasToken
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  
  try {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      return JSON.parse(userData)
    }
  } catch (error) {
    console.warn("Failed to parse stored user data:", error)
  }
  
  return null
}

export function storeUserData(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
}

export function clearAuthData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
  }
}

// Login user with API
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  try {
    console.log("Attempting login with API...")
    
    // Single login attempt matching backend expectations
    const loginData = new URLSearchParams();
    loginData.append("username", credentials.email);
    loginData.append("password", credentials.password);

    console.log("Trying login with:", { username: credentials.email, password: "***" })

    const response = await api.post(
      API_ENDPOINTS.AUTH.LOGIN,
      loginData,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("Login successful:", response)

    // Store tokens securely
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }
    }

    // Get user profile
    try {
      const userProfile = await api.get(API_ENDPOINTS.AUTH.ME)
      const user = {
        id: userProfile.id.toString(),
        name: userProfile.full_name || userProfile.username,
        email: userProfile.email,
        role: userProfile.role,
        isAdmin: userProfile.role === "admin",
      }
      
      // Store user data for caching
      storeUserData(user)
      
      return user
    } catch (profileError) {
      console.warn("Profile fetch failed, using basic user info:", profileError)
      // If profile fetch fails, return basic user info
      const user = {
        id: "1",
        name: credentials.email,
        email: credentials.email,
        role: "user",
        isAdmin: false,
      }
      
      // Store basic user data
      storeUserData(user)
      
      return user
    }
  } catch (error: any) {
    console.error("Login error:", error)

    // Handle specific error cases
    if (error.status === 422) {
      if (error.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
          .join("; ")
        throw new Error(`Validation errors: ${errorMessages}`)
      }
      throw new Error("Invalid input data")
    }

    if (error.status === 401) {
      throw new Error("Invalid email or password")
    }

    // Network or server errors
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable")
      throw new Error("Backend service unavailable. Please try again later.")
    }

    throw new Error(error.message || "Login failed")
  }
}

// Register user with API
export async function registerUser(credentials: RegisterCredentials): Promise<User> {
  try {
    console.log("Attempting registration with API...")

    // Generate username from name
    const username = credentials.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: credentials.email,
      username: username,
      password: credentials.password,
      full_name: credentials.name,
    })

    console.log("Registration successful:", response)

    // After successful registration, automatically login to get tokens
    try {
      const loginData = new URLSearchParams();
      loginData.append("username", credentials.email);
      loginData.append("password", credentials.password);

      const loginResponse = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Store tokens securely
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", loginResponse.access_token)
        if (loginResponse.refresh_token) {
          localStorage.setItem("refresh_token", loginResponse.refresh_token)
        }
      }
    } catch (loginError) {
      console.warn("Auto-login after registration failed:", loginError)
      // Continue without tokens - user will need to login manually
    }

    const user = {
      id: response.id.toString(),
      name: response.full_name,
      email: response.email,
      role: response.role,
      isAdmin: response.role === "admin",
    }

    // Store user data
    storeUserData(user)

    return user
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.status === 400) {
      throw new Error("Email or username already registered")
    }

    if (error.status === 422) {
      if (error.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
          .join("; ")
        throw new Error(`Validation errors: ${errorMessages}`)
      }
      throw new Error("Invalid input data")
    }

    // Network or server errors
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, registration not available")
      throw new Error("Backend service unavailable. Please try again later.")
    }

    throw new Error(error.message || "Registration failed")
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (token) {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    }
  } catch (error) {
    console.warn("Logout API call failed:", error)
    // Don't throw error for logout API failures
  } finally {
    // Always clear local storage
    clearAuthData()
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      return null
    }

    const response = await api.get(API_ENDPOINTS.AUTH.ME)

    const user = {
      id: response.id.toString(),
      name: response.full_name || response.username,
      email: response.email,
      role: response.role,
      isAdmin: response.role === "admin",
    }
    
    // Store user data for caching
    storeUserData(user)
    
    return user
  } catch (error: any) {
    console.error("Get current user error:", error)

    // Clear tokens only on explicit auth errors (401/403)
    if (error.status === 401 || error.status === 403) {
      clearAuthData()
      return null
    }

    // For network errors or server issues, throw error to show backend unavailable
    if (error.status === 0 || error.status >= 500) {
      throw new Error("Backend service unavailable. Please try again later.")
    }

    return null
  }
}

// Check if token is valid
export async function isTokenValid(token: string): Promise<boolean> {
  if (!token) return false

  try {
    // Temporarily set the token for validation
    const originalToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
    
    await api.get(API_ENDPOINTS.AUTH.ME)
    
    // Restore original token
    if (typeof window !== "undefined") {
      if (originalToken) {
        localStorage.setItem("access_token", originalToken)
      } else {
        localStorage.removeItem("access_token")
      }
    }
    
    return true
  } catch (error: any) {
    // Restore original token on error
    if (typeof window !== "undefined") {
      const originalToken = localStorage.getItem("access_token")
      if (originalToken && originalToken !== token) {
        localStorage.setItem("access_token", originalToken)
      } else if (!originalToken) {
        localStorage.removeItem("access_token")
      }
    }
    
    // If backend is unavailable, throw error
    if (error.status === 0 || error.status >= 500) {
      throw new Error("Backend service unavailable. Cannot validate token.")
    }
    
    return false
  }
}

// Refresh access token
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
    if (!refreshToken) {
      return false
    }

    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    })

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }
    }

    return true
  } catch (error: any) {
    console.error("Token refresh failed:", error)
    
    // Clear tokens on explicit auth errors (401/403)
    if (error.status === 401 || error.status === 403) {
      clearAuthData()
      return false
    }
    
    // For network errors, throw error to show backend unavailable
    if (error.status === 0 || error.status >= 500) {
      throw new Error("Backend service unavailable. Cannot refresh token.")
    }
    
    return false
  }
}

// Get user from cache or return basic user info if token exists
export function getCurrentUserSync(): User | null {
  if (!isAuthenticated()) {
    return null
  }

  // Try to get cached user data first
  const cachedUser = getStoredUser()
  if (cachedUser) {
    return cachedUser
  }

  // If no cached data but token exists, return basic user
  return {
    id: "user",
    name: "User",
    email: "user@example.com",
    role: "user",
    isAdmin: false,
  }
}