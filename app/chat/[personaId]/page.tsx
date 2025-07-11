// app/chat/[personaId]/page.tsx
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { fetchPersonaById, fetchUserAssignedPersonas } from "@/lib/api"
import type { Persona } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"
import { useMobile } from "@/hooks/use-mobile"
import { TooltipProvider } from "@/components/ui/tooltip"

// Import our new components
import { Sidebar } from "@/components/features/chat/sidebar"
import { ChatHeader } from "@/components/features/chat/chat-header"
import { ChatMessages } from "@/components/features/chat/chat-messages"
import { ChatInput } from "@/components/features/chat/chat-input"

// Types
interface AppState {
  personas: Persona[]
  currentPersona: Persona | null
  sidebarCollapsed: boolean
  isRecording: boolean
  copiedMessageId: string | null
  isLoadingMessages: boolean
  isInitialized: boolean
  isMobileMenuOpen: boolean
}

export default function ChatPage({ params }: { params: { personaId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  
  // Memoize personaId
  const personaId = useMemo(() => params.personaId, [params.personaId])
  
  // Unified state management
  const [state, setState] = useState<AppState>({
    personas: [],
    currentPersona: null,
    sidebarCollapsed: false,
    isRecording: false,
    copiedMessageId: null,
    isLoadingMessages: false,
    isInitialized: false,
    isMobileMenuOpen: false,
  })
  
  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout>()
  const currentPersonaRef = useRef<string | null>(null)
  
  // Chat hook
  const { messages, input, setInput, handleSubmit, isLoading, clearMessages, addMessage } = useChat({
    personaId: personaId,
  })
  
  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])
  
  // Load initial data
  useEffect(() => {
    if (!user || state.isInitialized) return
    
    let isMounted = true
    const controller = new AbortController()
    
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoadingMessages: true }))
        
        const [userAssignedPersonas, currentPersonaData] = await Promise.all([
          fetchUserAssignedPersonas(),
          fetchPersonaById(personaId).catch(() => null),
        ])
        
        if (!isMounted) return
        
        const assignedPersonaIds = new Set(userAssignedPersonas.map((p: Persona) => p.id))
        
        if (!assignedPersonaIds.has(personaId)) {
          if (userAssignedPersonas.length > 0) {
            router.push(`/chat/${userAssignedPersonas[0].id}`)
          } else {
            router.push("/personas")
          }
          return
        }
        
        setState(prev => ({
          ...prev,
          personas: userAssignedPersonas,
          currentPersona: currentPersonaData,
          isLoadingMessages: false,
          isInitialized: true,
        }))
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          setState(prev => ({ ...prev, isLoadingMessages: false }))
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load data",
          })
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [user, personaId, state.isInitialized, toast, router])
  
  // Handle persona switching
  useEffect(() => {
    if (!state.isInitialized || !state.personas.length) return
    
    const persona = state.personas.find(p => p.id === personaId)
    
    if (persona && currentPersonaRef.current !== persona.id) {
      currentPersonaRef.current = persona.id
      
      setState(prev => ({ 
        ...prev, 
        currentPersona: persona,
        isLoadingMessages: true 
      }))
      
      clearMessages()
      
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isLoadingMessages: false }))
      }, 800)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [personaId, state.personas, state.isInitialized, clearMessages])
  
  // Callbacks
  const handlePersonaSelect = useCallback((personaId: string) => {
    setState(prev => ({ ...prev, isMobileMenuOpen: false }))
    router.push(`/chat/${personaId}`)
  }, [router])
  
  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }, [logout, router, toast])
  
  const handleClearChat = useCallback(() => {
    clearMessages()
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared.",
    })
  }, [clearMessages, toast])
  
  const handleBackToPersonas = useCallback(() => {
    router.push("/personas")
  }, [router])
  
  const handleAddPersona = useCallback(() => {
    router.push("/personas")
  }, [router])
  
  const handleRemovePersona = useCallback((personaIdToRemove: string) => {
    if (personaIdToRemove === personaId) {
      const remainingPersonas = state.personas.filter(p => p.id !== personaIdToRemove)
      if (remainingPersonas.length > 0) {
        router.push(`/chat/${remainingPersonas[0].id}`)
      } else {
        router.push("/personas")
      }
    }
  }, [router, personaId, state.personas])
  
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setState(prev => ({ ...prev, copiedMessageId: messageId }))
      
      setTimeout(() => {
        setState(prev => ({ ...prev, copiedMessageId: null }))
      }, 2000)
      
      toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy message to clipboard.",
      })
    }
  }, [toast])
  
  const handleAudioMessage = useCallback((audioBlob: Blob) => {
    const mockTranscription = "This is a mock transcription of the audio message."
    setInput(mockTranscription)
    toast({
      title: "Audio transcribed",
      description: "Your audio message has been converted to text.",
    })
  }, [setInput, toast])
  
  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0]
    if (file) {
      const fileMessage = `[File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)]`
      addMessage({
        role: "user",
        content: fileMessage,
      })
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded.`,
      })
    }
  }, [addMessage, toast])
  
  const handleToggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }, [])
  
  const handleSetIsRecording = useCallback((recording: boolean) => {
    setState(prev => ({ ...prev, isRecording: recording }))
  }, [])
  
  const handleSampleQuestionClick = useCallback((question: string) => {
    setInput(question)
  }, [setInput])
  
  const handleMobileMenuClick = useCallback(() => {
    setState(prev => ({ ...prev, isMobileMenuOpen: true }))
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  // Early return if no user
  if (!user) return null
  
  // Mobile sidebar content
  const sidebarContent = (
    <Sidebar
      personas={state.personas}
      currentPersonaId={personaId}
      isCollapsed={state.sidebarCollapsed}
      onToggleCollapse={handleToggleSidebar}
      onPersonaSelect={handlePersonaSelect}
      onAddPersona={handleAddPersona}
      onRemovePersona={handleRemovePersona}
    />
  )
  
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className={cn(
            "h-full transition-all duration-300 ease-in-out",
            state.sidebarCollapsed ? "w-16" : "w-80"
          )}>
            {sidebarContent}
          </div>
        )}
        
        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={state.isMobileMenuOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isMobileMenuOpen: open }))}>
            <SheetContent side="left" className="p-0 w-80">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <ChatHeader
            currentPersona={state.currentPersona}
            isMobile={isMobile}
            isCollapsed={state.sidebarCollapsed}
            onToggleSidebar={!isMobile ? handleToggleSidebar : undefined}
            onMobileMenuClick={isMobile ? handleMobileMenuClick : undefined}
            onBackToPersonas={handleBackToPersonas}
            onClearChat={handleClearChat}
            onLogout={handleLogout}
          />
          
          {/* Messages */}
          <ChatMessages
            messages={messages}
            currentPersona={state.currentPersona}
            isLoading={state.isLoadingMessages}
            copiedMessageId={state.copiedMessageId}
            onCopyMessage={handleCopyMessage}
            onSampleQuestionClick={handleSampleQuestionClick}
          />
          
          {/* Input */}
          <ChatInput
            input={input}
            isLoading={isLoading}
            isRecording={state.isRecording}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onFileUpload={handleFileUpload}
            onAudioMessage={handleAudioMessage}
            onSetIsRecording={handleSetIsRecording}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}