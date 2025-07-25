import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"
import { API_CONFIG } from "./config"

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      // Remove default Content-Type - let it be set per request
      "Accept": "application/json",
    },
  })

  // Request interceptor to add auth token and handle Content-Type
  client.interceptors.request.use(
    (config) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Handle Content-Type based on data type
      if (config.data instanceof FormData) {
        // For FormData, don't set Content-Type (browser will set it with boundary)
        delete config.headers['Content-Type']
      } else if (!config.headers['Content-Type']) {
        // For other requests, default to JSON
        config.headers['Content-Type'] = 'application/json'
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      // Handle 401 errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
        originalRequest._retry = true

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem("refresh_token")
          if (refreshToken) {
            const response = await client.post("/auth/refresh", {
              refresh_token: refreshToken,
            })

            const { access_token } = response.data
            localStorage.setItem("access_token", access_token)

            // Retry original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`
            }
            return client(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, but only redirect if it's an auth error, not a network error
          if (refreshError.response?.status === 401) {
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
          }
          return Promise.reject(refreshError)
        }
      }

      return Promise.reject(error)
    },
  )

  return client
}

// Create singleton instance
export const apiClient = createApiClient()

// Generic API request wrapper with retry logic
export async function apiRequest<T = any>(
  config: AxiosRequestConfig,
  retryAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
): Promise<T> {
  let lastError: AxiosError | null = null

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await apiClient(config)
      return response.data
    } catch (error) {
      lastError = error as AxiosError

      // Don't retry on client errors (4xx)
      if (lastError.response?.status && lastError.response.status < 500) {
        break
      }

      // Don't retry on last attempt
      if (attempt === retryAttempts) {
        break
      }

      // Wait before retry with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Transform error for consistent handling
  if (!lastError) {
    throw new Error("An unknown error occurred")
  }
  
  const errorData = lastError.response?.data as any
  const apiError = {
    message: errorData?.message || errorData?.detail || lastError.message || "An error occurred",
    status: lastError.response?.status || 0,
    code: errorData?.code,
    details: errorData?.details,
    errors: errorData?.errors,
  }

  throw apiError
}

// Streaming function for Server-Sent Events
export async function streamRequest(
  url: string,
  params?: Record<string, string>,
  onMessage?: (data: string) => void,
  onError?: (error: any) => void,
  onComplete?: () => void
): Promise<void> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const headers: Record<string, string> = {
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const queryParams = params ? new URLSearchParams(params).toString() : ""
    const fullUrl = `${API_CONFIG.BASE_URL}${url}${queryParams ? `?${queryParams}` : ""}`

    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        onComplete?.()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data.trim() && data !== "[DONE]") {
            onMessage?.(data)
          }
        }
      }
    }
  } catch (error) {
    onError?.(error)
  }
}

// Convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiRequest<T>({ ...config, method: "GET", url }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: "POST", url, data }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: "PUT", url, data }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: "PATCH", url, data }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiRequest<T>({ ...config, method: "DELETE", url }),

  stream: streamRequest,
}