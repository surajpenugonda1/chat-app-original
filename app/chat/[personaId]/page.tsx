"use client"

import { useState, useEffect, useCallback, useMemo, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { fetchPersonaById, fetchUserAssignedPersonas, fetchConversationById } from "@/lib/api"
import type { Persona, Conversation } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"
import { useMobile } from "@/hooks/use-mobile"
import { TooltipProvider } from "@/components/ui/tooltip"

// Import our new components
import { ChatHeader, ChatHeaderSkeleton } from "@/components/features/chat/chat-header"
import { ChatMessages, MessageSkeleton } from "@/components/features/chat/chat-messages"
import { ChatInput } from "@/components/features/chat/chat-input"
import { useChatContext } from "@/components/features/chat/ChatContext"

// Types
interface AppState {
  currentPersona: Persona | null
  currentConversation: Conversation | null
  isRecording: boolean
  copiedMessageId: string | null
  isLoadingMessages: boolean
  isInitialized: boolean
  isMobileMenuOpen: boolean
  error: string | null
}

export default function ChatPage({ params }: { params: Promise<{ personaId: string }> })
{
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout, isLoading: authLoading, error: authError } = useAuth()
  const isMobile = useMobile()
  
  // Unwrap params using React.use()
  const resolvedParams = use(params)
  
  // Memoize personaId (keep routing based on persona)
  const personaId = useMemo(() => resolvedParams.personaId, [resolvedParams.personaId])
  
  // Unified state management
  const [state, setState] = useState<AppState>({
    currentPersona: null,
    currentConversation: null,
    isRecording: false,
    copiedMessageId: null,
    isLoadingMessages: false,
    isInitialized: false,
    isMobileMenuOpen: false,
    error: null,
  })
  
  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const currentPersonaRef = useRef<string | null>(null)
  const initializationRef = useRef(false)
  
  const { 
    personas, 
    setPersonas, 
    currentPersonaId, 
    setCurrentPersonaId, 
    currentConversationId, 
    setCurrentConversationId,
    isSidebarCollapsed,
    setIsSidebarCollapsed
  } = useChatContext()
  
  // Chat hook - will be initialized once we have conversationId
  const chat = useChat({
    conversationId: currentConversationId ? parseInt(currentConversationId) : 0,
  })
  
  const { 
    messages, 
    input, 
    setInput, 
    handleSubmit, 
    sendMessage,
    streamAIReply,
    stopStreaming,
    isLoading, 
    isStreaming,
    isLoadingOlder,
    clearMessages, 
    addMessage,
    deleteMessage,
    loadOlderMessages,
    searchMessages,
    refreshMessages,
    pagination,
    isInitialized: chatInitialized
  } = chat

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setState(prev => ({ ...prev, error: authError }))
    } else {
      // Clear local error when auth error is cleared
      setState(prev => ({ ...prev, error: null }))
    }
  }, [authError])
  
  // Redirect if no user (but wait for auth to load)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])
  
  // Load initial data and get/create conversation for persona
  useEffect(() => {
    if (!user || authLoading) return
    
    // Reset initialization flag if user or personaId changes
    if (initializationRef.current) {
      initializationRef.current = false
    }
    
    initializationRef.current = true
    let isMounted = true
    const controller = new AbortController()
    
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoadingMessages: true, error: null }))
        
        console.log('Loading data for persona:', personaId)
        
        const [userAssignedPersonas, currentPersonaData] = await Promise.all([
          fetchUserAssignedPersonas(),
          fetchPersonaById(personaId).catch((error) => {
            console.error('Failed to fetch persona:', error)
            return null
          }),
        ])
        
        if (!isMounted || controller.signal.aborted) return
        
        console.log('User assigned personas:', userAssignedPersonas)
        console.log('Current persona data:', currentPersonaData)
        
        // Check if user has access to this persona
        const assignedPersonaIds = new Set(userAssignedPersonas.map((p: Persona) => p.id))
        if (!assignedPersonaIds.has(personaId)) {
          console.log('User does not have access to persona:', personaId)
          setState(prev => ({ ...prev, isLoadingMessages: false }))
          if (userAssignedPersonas.length > 0) {
            router.push(`/chat/${userAssignedPersonas[0].id}`)
          } else {
            router.push("/personas")
          }
          return
        }
        
        if (!currentPersonaData) {
          setState(prev => ({ ...prev, isLoadingMessages: false }))
          toast({
            variant: "destructive",
            title: "Error",
            description: "Persona not found",
          })
          router.push("/personas")
          return
        }
        
        // Try to get existing conversation for this persona, or create new one
        let conversationData: Conversation | null = null
        try {
          conversationData = await fetchConversationById(personaId)
          console.log('Conversation data:', conversationData)
        } catch (error) {
          console.error('Failed to fetch conversation:', error)
          setState(prev => ({ ...prev, error: 'Failed to load conversation' }))
          return
        }
        
        if (!conversationData) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load or create conversation",
          })
          setState(prev => ({ ...prev, error: 'Failed to load conversation' }))
          return
        }
        
        if (!isMounted || controller.signal.aborted) return
        
        // Set the conversation ID for the chat hook (convert to string for context)
        setCurrentConversationId(conversationData.id.toString())
        
        setPersonas(userAssignedPersonas)
        setCurrentPersonaId(personaId)
        
        setState(prev => ({
          ...prev,
          currentPersona: currentPersonaData,
          currentConversation: conversationData,
          isLoadingMessages: false,
          isInitialized: true,
          error: null,
        }))
        
        console.log('Data loading completed successfully')
      } catch (error: any) {
        console.error('Error loading data:', error)
        if (isMounted && !controller.signal.aborted) {
          setState(prev => ({ 
            ...prev, 
            isLoadingMessages: false,
            error: error.message || 'Failed to load data'
          }))
          
          if (error.message?.includes('Backend service unavailable')) {
            toast({
              variant: "destructive",
              title: "Service Unavailable",
              description: "The chat service is temporarily unavailable. Please try again later.",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load data",
            })
          }
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [user, personaId, authLoading, router, toast, setPersonas, setCurrentPersonaId, setCurrentConversationId])
  
  // Handle persona switching (keep existing logic)
  useEffect(() => {
    if (!state.isInitialized || !personas.length || !personaId) return
    
    const persona = personas.find(p => p.id === personaId)
    
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
  }, [personaId, personas, state.isInitialized, clearMessages])
  
  // Callbacks - keep persona-based routing
  const handlePersonaSelect = useCallback((personaId: string) => {
    setState(prev => ({ ...prev, isMobileMenuOpen: false }))
    router.push(`/chat/${personaId}`)
  }, [router])
  
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push("/")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if logout API fails
      router.push("/")
    }
  }, [logout, router, toast])
  
  const handleClearChat = useCallback(() => {
    clearMessages()
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared from view.",
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
      const remainingPersonas = personas.filter(p => p.id !== personaIdToRemove)
      if (remainingPersonas.length > 0) {
        router.push(`/chat/${remainingPersonas[0].id}`)
      } else {
        router.push("/personas")
      }
    }
  }, [router, personaId, personas])
  
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
  
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId)
      toast({
        title: "Message deleted",
        description: "Message has been deleted.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message.",
      })
    }
  }, [deleteMessage, toast])
  
  const handleAudioMessage = useCallback((audioBlob: Blob) => {
    // TODO: Implement actual audio transcription
    const mockTranscription = "This is a mock transcription of the audio message."
    setInput(mockTranscription)
    toast({
      title: "Audio transcribed",
      description: "Your audio message has been converted to text.",
    })
  }, [setInput, toast])
  
  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    try {
      // Send message with files using the updated sendMessage function
      await sendMessage("", fileArray)
      
      toast({
        title: "Files uploaded",
        description: `${fileArray.length} file(s) have been uploaded.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload files.",
      })
    }
  }, [sendMessage, toast])
  
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }, [isSidebarCollapsed, setIsSidebarCollapsed])
  
  const handleSetIsRecording = useCallback((recording: boolean) => {
    setState(prev => ({ ...prev, isRecording: recording }))
  }, [])
  
  const handleSampleQuestionClick = useCallback((question: string) => {
    setInput(question)
  }, [setInput])
  
  const handleMobileMenuClick = useCallback(() => {
    setState(prev => ({ ...prev, isMobileMenuOpen: true }))
  }, [])
  
  const handleLoadOlderMessages = useCallback(async () => {
    if (pagination.hasPrevious && !isLoadingOlder) {
      try {
        await loadOlderMessages()
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load older messages.",
        })
      }
    }
  }, [pagination.hasPrevious, isLoadingOlder, loadOlderMessages])
  
  const handleSearchMessages = useCallback(async (query: string) => {
    try {
      const results = await searchMessages(query)
      if (results) {
        toast({
          title: "Search completed",
          description: `Found ${results.items?.length || 0} messages.`,
        })
        return results
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "Failed to search messages.",
      })
    }
  }, [searchMessages, toast])

  const handleRetry = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      isInitialized: false,
      isLoadingMessages: false 
    }))
    initializationRef.current = false
    // This will trigger the useEffect to reload data
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Show loading state while auth is initializing or data is loading
  if (authLoading || (!state.isInitialized && !state.error)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state if there's an error and we're not loading
  if (state.error && !authLoading && !state.isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <button 
            onClick={handleRetry} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  // Early return if no user (but auth is loaded)
  if (!user) {
    return null
  }
  
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={state.isMobileMenuOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isMobileMenuOpen: open }))}>
            <SheetContent side="left" className="p-0 w-80">
              {/* Sidebar content will be handled by context or layout */}
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main chat area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header with fade */}
          <div className="relative h-16">
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-300",
                state.isLoadingMessages ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              )}
            >
              <ChatHeaderSkeleton />
            </div>
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-300",
                state.isLoadingMessages ? "opacity-0 pointer-events-none" : "opacity-100 z-20"
              )}
            >
              <ChatHeader
                isMobile={isMobile}
                onMobileMenuClick={isMobile ? handleMobileMenuClick : undefined}
                onBackToPersonas={handleBackToPersonas}
                onClearChat={handleClearChat}
                onLogout={handleLogout}
              />
            </div>
          </div>
          
          {/* Messages with fade */}
          <div className="relative flex-1 min-h-0">
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-300 flex flex-col",
                state.isLoadingMessages ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
              )}
            >
              <div className="space-y-4 max-w-2xl mx-auto w-full p-6">
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
              </div>
            </div>
            <div
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-300 flex flex-col",
                state.isLoadingMessages ? "opacity-0 pointer-events-none" : "opacity-100 z-20"
              )}
            >
              <ChatMessages
                messages={messages}
                currentPersona={state.currentPersona}
                currentConversation={state.currentConversation}
                isLoading={state.isLoadingMessages}
                isLoadingOlder={isLoadingOlder}
                copiedMessageId={state.copiedMessageId}
                canLoadOlder={pagination.hasPrevious}
                onCopyMessage={handleCopyMessage}
                onDeleteMessage={handleDeleteMessage}
                onLoadOlderMessages={handleLoadOlderMessages}
                onSampleQuestionClick={handleSampleQuestionClick}
              />
            </div>
          </div>
          
          {/* Input */}
          <ChatInput
            input={input}
            isLoading={isLoading}
            isStreaming={isStreaming}
            isRecording={state.isRecording}
            onInputChange={setInput}
            onSubmit={(e) => handleSubmit(e as React.FormEvent<HTMLFormElement>)}
            onStopStreaming={stopStreaming}
            onFileUpload={handleFileUpload}
            onAudioMessage={handleAudioMessage}
            onSetIsRecording={handleSetIsRecording}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}