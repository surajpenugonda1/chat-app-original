import { api } from "./api-client"
import { API_ENDPOINTS } from "./config"
import type { User, LoginCredentials, RegisterCredentials } from "./types"

// Mock user for fallback
const DEMO_USER: User = {
  id: "demo",
  name: "Demo User",
  email: "demo@example.com",
  role: "user",
  isAdmin: false,
}

// Login user with API
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  try {
    console.log("Attempting login with API...")
    console.log(credentials);

    // Single login attempt matching backend expectations
    const loginData = new URLSearchParams();
    loginData.append("username", credentials.email);
    loginData.append("password", credentials.password);

    try {
      console.log("Trying login with:", { username: credentials.email, password: "***" })

      const response = await api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log("Login successful:", response)

      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.access_token)
        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token)
        }
      }

      // Get user profile
      try {
        const userProfile = await api.get(API_ENDPOINTS.AUTH.ME)
        return {
          id: userProfile.id.toString(),
          name: userProfile.full_name || userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          isAdmin: userProfile.role === "admin",
        }
      } catch (profileError) {
        // If profile fetch fails, return basic user info
        return {
          id: "1",
          name: credentials.email,
          email: credentials.email,
          role: "user",
          isAdmin: false,
        }
      }
    } catch (error: any) {
      console.log("Login attempt failed:", error.message)
      throw error
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

    // Fallback to mock login for development
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, using mock login")
      if (credentials.email === "demo@example.com" && credentials.password === "password123") {
        return DEMO_USER
      }
      throw new Error("Demo credentials: demo@example.com / password123")
    }

    throw new Error(error.message || "Login failed")
  }
}

// Register user with API
export async function registerUser(credentials: RegisterCredentials): Promise<User> {
  try {
    console.log("Attempting registration with API...")

    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: credentials.email,
      username: credentials.name.toLowerCase().replace(/\s+/g, ""),
      password: credentials.password,
      full_name: credentials.name,
    })

    console.log("Registration successful:", response)

    return {
      id: response.id.toString(),
      name: response.full_name,
      email: response.email,
      role: response.role,
      isAdmin: response.role === "admin",
    }
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

    // Fallback for development
    if (error.status === 0 || error.status >= 500) {
      console.warn("API unavailable, registration not available in demo mode")
      throw new Error("Registration not available in demo mode")
    }

    throw new Error(error.message || "Registration failed")
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT)
  } catch (error) {
    console.warn("Logout API call failed:", error)
  } finally {
    // Always clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
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

    return {
      id: response.id.toString(),
      name: response.full_name || response.username,
      email: response.email,
      role: response.role,
      isAdmin: response.role === "admin",
    }
  } catch (error: any) {
    console.error("Get current user error:", error)

    // If token is invalid, clear it
    if (error.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }

    return null
  }
}

// Check if token is valid
export async function isTokenValid(token: string): Promise<boolean> {
  try {
    await api.get(API_ENDPOINTS.AUTH.ME)
    return true
  } catch (error) {
    return false
  }
}
