import { useState, useCallback } from "react"
import type { Persona } from "@/lib/types"

interface ChatState {
  personas: Persona[]
  currentPersona: Persona | null
  sidebarCollapsed: boolean
  isRecording: boolean
  copiedMessageId: string | null
  isLoadingMessages: boolean
  isInitialized: boolean
  isMobileMenuOpen: boolean
}

export function useChatState() {
  const [state, setState] = useState<ChatState>({
    personas: [],
    currentPersona: null,
    sidebarCollapsed: false,
    isRecording: false,
    copiedMessageId: null,
    isLoadingMessages: false,
    isInitialized: false,
    isMobileMenuOpen: false,
  })

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])

  const setIsRecording = useCallback((isRecording: boolean) => {
    setState(prev => ({ ...prev, isRecording }))
  }, [])

  const setCopiedMessageId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, copiedMessageId: id }))
  }, [])

  const setMobileMenuOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isMobileMenuOpen: open }))
  }, [])

  return {
    state,
    updateState,
    toggleSidebar,
    setIsRecording,
    setCopiedMessageId,
    setMobileMenuOpen,
  }
}