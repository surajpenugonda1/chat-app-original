// hooks/use-chat.ts
"use client"

import type React from "react"
import { useState, useCallback, useMemo, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface UseChatProps {
  personaId: string
}


export function useChat({ personaId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // Use refs to avoid stale closures
  const messagesRef = useRef<Message[]>(messages)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Keep messages ref in sync
  messagesRef.current = messages

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) return

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: input.trim(),
        timestamp: new Date().toISOString(),
      }

      // Use functional update to avoid stale state
      setMessages(prev => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messagesRef.current, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            personaId,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader available")

        let responseText = ""
        const aiMessageId = uuidv4()
        const decoder = new TextDecoder()

        // Add initial empty AI message
        const aiMessage: Message = {
          id: aiMessageId,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        }
        
        setMessages(prev => [...prev, aiMessage])

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            responseText += chunk

            // Update the AI message with accumulated text
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, content: responseText } 
                  : msg
              )
            )
          }
        } finally {
          reader.releaseLock()
        }
      } catch (error) {
        // Don't show error if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request was aborted')
          return
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send message",
        })
        
        // Remove both the user message and any empty AI message
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage?.role === "assistant" && !lastMessage.content) {
            // Remove empty AI message and user message
            return prev.slice(0, -2)
          }
          // Just remove user message
          return prev.slice(0, -1)
        })
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [input, isLoading, personaId, toast] // Removed messages from dependencies
  )

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
  }, [])

  // Cleanup on unmount
  const cleanupRef = useRef<() => void>(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  })

  // Return stable object reference
  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      handleSubmit,
      isLoading,
      clearMessages,
      addMessage,
    }),
    [messages, input, handleSubmit, isLoading, clearMessages, addMessage]
  )
}