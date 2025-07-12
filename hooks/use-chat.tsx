"use client"

import type React from "react"
import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/config"

interface UseChatProps {
  conversationId: number
  initialLimit?: number
}

interface PaginationInfo {
  hasNext: boolean
  hasPrevious: boolean
  nextCursor?: string
  previousCursor?: string
}

// Transform API message to our Message type
function transformMessage(apiMessage: any): Message {
  return {
    id: apiMessage.id.toString(),
    role: apiMessage.is_from_user ? "user" : "assistant",
    content: apiMessage.content,
    timestamp: apiMessage.created_at,
    messageType: apiMessage.message_type,
  }
}

export function useChat({ conversationId, initialLimit = 30 }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasNext: false,
    hasPrevious: false
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()
  
  // Use refs to avoid stale closures
  const messagesRef = useRef<Message[]>(messages)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Keep messages ref in sync
  messagesRef.current = messages

  // Load initial messages when conversation changes
  useEffect(() => {
    if (conversationId && !isInitialized) {
      loadInitialMessages()
    }
  }, [conversationId])

  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("Loading initial messages for conversation:", conversationId)
      
      const response = await api.get(
        `${API_ENDPOINTS.MESSAGES.RECENT(conversationId)}?limit=${initialLimit}`
      )
      
      console.log("Initial messages loaded:", response)
      
      setMessages(response.items?.map(transformMessage) || [])
      setPagination({
        hasNext: response.has_next || false,
        hasPrevious: response.has_previous || false,
        nextCursor: response.next_cursor,
        previousCursor: response.previous_cursor
      })
      setIsInitialized(true)
    } catch (error: any) {
      console.error("Failed to load initial messages:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages",
      })
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, initialLimit, toast])

  const loadOlderMessages = useCallback(async () => {
    if (!pagination.hasPrevious || !pagination.previousCursor || isLoadingOlder) return

    try {
      setIsLoadingOlder(true)
      console.log("Loading older messages before:", pagination.previousCursor)
      
      const response = await api.get(
        `${API_ENDPOINTS.MESSAGES.OLDER(conversationId)}?before_message_id=${pagination.previousCursor}&limit=20`
      )
      
      console.log("Older messages loaded:", response)
      
      // Prepend older messages to the beginning of the array
      const olderMessages = response.items?.map(transformMessage) || []
      setMessages(prev => [...olderMessages, ...prev])
      setPagination({
        hasNext: response.has_next || false,
        hasPrevious: response.has_previous || false,
        nextCursor: response.next_cursor,
        previousCursor: response.previous_cursor
      })
    } catch (error: any) {
      console.error("Failed to load older messages:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load older messages",
      })
    } finally {
      setIsLoadingOlder(false)
    }
  }, [conversationId, pagination.hasPrevious, pagination.previousCursor, isLoadingOlder, toast])

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() && (!files || files.length === 0)) return
      if (isLoading) return
  
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
  
      setIsLoading(true)
      abortControllerRef.current = new AbortController()
  
      try {
        console.log("Sending message:", { content, files: files?.length || 0 })
        
        // Prepare form data
        const formData = new FormData()
        
        // Add content if present
        if (content && content.trim()) {
          formData.append('content', content.trim())
        }
        
        // Add required fields with proper types
        formData.append('message_type', 'TEXT')
        formData.append('is_from_user', 'true')  // This should be a string 'true'
        
        // Add files if any - make sure files are valid
        if (files && files.length > 0) {
          files.forEach(file => {
            if (file && file.name) {  // Extra validation
              formData.append('files', file)
            }
          })
        }
  
        const response = await api.post(
          API_ENDPOINTS.MESSAGES.CREATE(conversationId),
          formData,
          {
            headers: {
              
            },
            signal: abortControllerRef.current.signal,
          }
        )
  
        console.log("Message sent successfully:", response)
        const newMessage = transformMessage(response)
        setMessages(prev => [...prev, newMessage])
        setInput("")
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request was aborted')
          return
        }
  
        console.error("Failed to send message:", error)
        
        // Enhanced error handling for 422
        let errorMessage = "Failed to send message"
        if (error.response?.status === 422) {
          const detail = error.response.data?.detail
          if (Array.isArray(detail)) {
            // FastAPI validation errors
            errorMessage = detail.map(err => 
              `${err.loc?.slice(1).join('.')}: ${err.msg}`
            ).join('; ')
          } else if (detail) {
            errorMessage = detail
          } else {
            errorMessage = "Validation error - please check your input"
          }
        } else if (error.response) {
          errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage
        } else if (error.request) {
          errorMessage = "No response from server"
        } else {
          errorMessage = error.message || errorMessage
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [conversationId, isLoading, setInput, setMessages]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      await sendMessage(input)
    },
    [input, sendMessage]
  )

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      console.log("Deleting message:", messageId)
      
      await api.delete(API_ENDPOINTS.MESSAGES.DELETE(conversationId, messageId))

      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      console.log("Message deleted successfully")
      toast({
        title: "Success",
        description: "Message deleted successfully",
      })
    } catch (error: any) {
      console.error("Failed to delete message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message",
      })
    }
  }, [conversationId, toast])

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const clearMessages = useCallback(() => {
    // Cancel any ongoing requests when clearing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setMessages([])
    setIsLoading(false)
    setIsInitialized(false)
    setPagination({
      hasNext: false,
      hasPrevious: false
    })
  }, [])

  const searchMessages = useCallback(async (query: string, page = 1, limit = 20) => {
    try {
      console.log("Searching messages:", { query, page, limit })
      
      const response = await api.get(
        `${API_ENDPOINTS.MESSAGES.SEARCH(conversationId)}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      )
      
      console.log("Search results:", response)
      
      // Transform search results
      const transformedResults = {
        ...response,
        items: response.items?.map(transformMessage) || []
      }
      
      return transformedResults
    } catch (error: any) {
      console.error("Failed to search messages:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search messages",
      })
      return null
    }
  }, [conversationId, toast])

  const refreshMessages = useCallback(async () => {
    console.log("Refreshing messages...")
    setIsInitialized(false)
    await loadInitialMessages()
  }, [loadInitialMessages])

  const getMessageCount = useCallback(async () => {
    try {
      console.log("Getting message count for conversation:", conversationId)
      
      const response = await api.get(API_ENDPOINTS.MESSAGES.COUNT(conversationId))
      
      console.log("Message count:", response)
      return response.total_messages || 0
    } catch (error: any) {
      console.error("Failed to get message count:", error)
      return 0
    }
  }, [conversationId])

  const getMessageAttachments = useCallback(async (messageId: string) => {
    try {
      console.log("Getting attachments for message:", messageId)
      
      const response = await api.get(
        API_ENDPOINTS.MESSAGES.ATTACHMENTS(conversationId, messageId)
      )
      
      console.log("Message attachments:", response)
      return response
    } catch (error: any) {
      console.error("Failed to get message attachments:", error)
      return []
    }
  }, [conversationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Return stable object reference
  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      handleSubmit,
      sendMessage,
      isLoading,
      isLoadingOlder,
      clearMessages,
      addMessage,
      deleteMessage,
      loadOlderMessages,
      searchMessages,
      refreshMessages,
      getMessageCount,
      getMessageAttachments,
      pagination,
      isInitialized,
    }),
    [
      messages,
      input,
      handleSubmit,
      sendMessage,
      isLoading,
      isLoadingOlder,
      clearMessages,
      addMessage,
      deleteMessage,
      loadOlderMessages,
      searchMessages,
      refreshMessages,
      getMessageCount,
      getMessageAttachments,
      pagination,
      isInitialized,
    ]
  )
}