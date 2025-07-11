export interface User {
  id: string
  name: string
  email: string
  password?: string
  role?: string
  isAdmin?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface Tag {
  id: number
  name: string
}

export interface Persona {
  id: string
  name: string
  description: string
  avatarUrl: string
  tags: Tag[]
  sampleQuestions?: string[]
  systemPrompt?: string
  isActive?: boolean
  isPublic?: boolean
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  reactions?: Record<string, number>
  edited?: boolean
  editedAt?: string
  messageType?: "text" | "image" | "file" | "system" | "code"
}

export interface ChatSession {
  id: string
  personaId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

// API Types
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, any>
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Conversation Types
export interface Conversation {
  id: string
  personaId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}
