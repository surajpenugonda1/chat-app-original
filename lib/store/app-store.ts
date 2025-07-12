import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Message, ChatSession } from "./types"

interface AppState {
  // Auth state
  user: User | null
  isAuthenticated: boolean

  // UI state
  sidebarOpen: boolean
  theme: "light" | "dark" | "system"

  // Chat state
  currentPersonaId: string | null
  chatSessions: Record<string, ChatSession>
  messages: Record<string, Message[]>

  // Feature state
  features: Record<string, boolean>

  // Preferences
  selectedPersonas: Set<string>
  recentPersonas: string[]

  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setCurrentPersonaId: (personaId: string | null) => void
  addChatSession: (session: ChatSession) => void
  addMessage: (personaId: string, message: Message) => void
  clearMessages: (personaId: string) => void
  setFeature: (featureId: string, enabled: boolean) => void
  addSelectedPersona: (personaId: string) => void
  removeSelectedPersona: (personaId: string) => void
  addRecentPersona: (personaId: string) => void
  clearRecentPersonas: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      theme: "system",
      currentPersonaId: null,
      chatSessions: {},
      messages: {},
      features: {
        "message-copy": true,
        "message-reactions": true,
        "code-renderer": true,
        "typing-indicator": true,
        "file-upload": true,
        "audio-recorder": false,
      },
      selectedPersonas: new Set(),
      recentPersonas: [],

      // Actions
      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
          isAuthenticated: !!user,
        })),

      setAuthenticated: (authenticated) =>
        set((state) => ({
          ...state,
          isAuthenticated: authenticated,
        })),

      setSidebarOpen: (open) =>
        set((state) => ({
          ...state,
          sidebarOpen: open,
        })),

      setTheme: (theme) =>
        set((state) => ({
          ...state,
          theme,
        })),

      setCurrentPersonaId: (personaId) =>
        set((state) => ({
          ...state,
          currentPersonaId: personaId,
        })),

      addChatSession: (session) =>
        set((state) => ({
          ...state,
          chatSessions: {
            ...state.chatSessions,
            [session.personaId]: session,
          },
        })),

      addMessage: (personaId, message) =>
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [personaId]: [...(state.messages[personaId] || []), message],
          },
        })),

      clearMessages: (personaId) =>
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [personaId]: [],
          },
        })),

      setFeature: (featureId, enabled) =>
        set((state) => ({
          ...state,
          features: {
            ...state.features,
            [featureId]: enabled,
          },
        })),

      addSelectedPersona: (personaId) =>
        set((state) => {
          const newSelectedPersonas = new Set(state.selectedPersonas)
          newSelectedPersonas.add(personaId)
          return {
            ...state,
            selectedPersonas: newSelectedPersonas,
          }
        }),

      removeSelectedPersona: (personaId) =>
        set((state) => {
          const newSelectedPersonas = new Set(state.selectedPersonas)
          newSelectedPersonas.delete(personaId)
          return {
            ...state,
            selectedPersonas: newSelectedPersonas,
          }
        }),

      addRecentPersona: (personaId) =>
        set((state) => {
          const newRecentPersonas = [personaId, ...state.recentPersonas.filter((id) => id !== personaId)].slice(0, 5)
          return {
            ...state,
            recentPersonas: newRecentPersonas,
          }
        }),

      clearRecentPersonas: () =>
        set((state) => ({
          ...state,
          recentPersonas: [],
        })),
    }),
    {
      name: "chat-app-storage",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        features: state.features,
        selectedPersonas: Array.from(state.selectedPersonas),
        recentPersonas: state.recentPersonas,
        // Don't persist auth state - it should be managed by AuthProvider
        // user: state.user,
        // isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.selectedPersonas)) {
          state.selectedPersonas = new Set(state.selectedPersonas)
        }
      },
    },
  ),
)
