// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  PERSONAS: {
    LIST: "/personas",
    CREATE: "/personas",
    DETAIL: (id: string) => `/personas/${id}`,
    UPDATE: (id: string) => `/personas/${id}`,
    DELETE: (id: string) => `/personas/${id}`,
    ASSIGN: (id: string) => `/personas/${id}/assign`,
  },
  CONVERSATIONS: {
    LIST: "/conversations",
    CREATE: "/conversations",
    DETAIL: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
  },
  MESSAGES: {
    CREATE: "/messages",
    DETAIL: (id: string) => `/messages/${id}`,
    UPDATE: (id: string) => `/messages/${id}`,
    DELETE: (id: string) => `/messages/${id}`,
  },
  CHAT: {
    STREAM: (personaId: string) => `/chat/${personaId}/stream`,
  },
} as const

// Request/Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
  errors?: Record<string, string[]>
}

// Personas API Types
export interface PersonasListParams {
  page?: number
  limit?: number
  search?: string
}

export interface PersonasListResponse {
  items: PersonaApiResponse[]
  total: number
  page: number
  limit: number
}

export interface Tag {
  id: number
  name: string
}

export interface PersonaApiResponse {
  id: number
  name: string
  description: string
  system_prompt: string
  is_active: boolean
  is_public: boolean
  model_config?: Record<string, any>
  tags: Tag[]
  created_at?: string
  updated_at?: string
}

export interface CreatePersonaRequest {
  name: string
  description: string
  system_prompt: string
  is_public: boolean
  model_config?: Record<string, any>
}

// Messages API Types
export interface MessagesListParams {
  cursor?: string
  limit?: number
  direction?: "after" | "before"
}

export interface MessagesListResponse {
  items: MessageApiResponse[]
  has_next: boolean
  has_previous: boolean
  next_cursor?: string
  previous_cursor?: string
}

export interface MessageApiResponse {
  id: number
  content: string
  message_type: "text" | "image" | "file" | "system" | "code"
  is_from_user: boolean
  created_at: string
}

export interface CreateMessageRequest {
  conversation_id: number
  content: string
  message_type: "text" | "image" | "file" | "system" | "code"
  is_from_user: boolean
  files?: File[]
}
