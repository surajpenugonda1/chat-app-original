// components/chat/chat-messages.tsx
"use client"

import { memo, useEffect, useRef, useCallback, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ChevronUp } from "lucide-react"
import { MessageBubble } from "@/components/message-bubble"
import { cn } from "@/lib/utils"
import type { Persona, Conversation } from "@/lib/types"
import type { Message } from "@/lib/types"

interface ChatMessagesProps {
  messages: Message[]
  currentPersona: Persona | null
  currentConversation?: Conversation | null
  isLoading: boolean
  isLoadingOlder?: boolean
  copiedMessageId: string | null
  canLoadOlder?: boolean
  onCopyMessage: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onLoadOlderMessages?: () => void
  onSampleQuestionClick: (question: string) => void
}

export const MessageSkeleton = memo(() => (
  <>
    {/* User message skeleton */}
    <div className="flex gap-3 sm:gap-4 flex-row-reverse group animate-in fade-in-0 duration-300 w-full mb-4">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted mt-1" />
      {/* Message Content */}
      <div className="flex flex-col min-w-0 flex-1 items-end">
        {/* Bubble */}
        <div className="rounded-2xl rounded-br-md px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] min-w-fit break-words bg-primary text-primary-foreground w-full">
          <div className="space-y-2 w-full">
            <div className="h-4 bg-primary-foreground/20 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-primary-foreground/20 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center gap-2 mt-1 px-1 flex-row-reverse">
          {/* Timestamp skeleton */}
          <div className="h-3 w-12 rounded bg-primary-foreground/20 animate-pulse" />
          {/* Action button skeletons */}
          <div className="flex items-center gap-1 opacity-60">
            <div className="h-6 w-6 rounded-full bg-primary-foreground/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
    {/* AI message skeleton */}
    <div className="flex gap-3 sm:gap-4 flex-row group animate-in fade-in-0 duration-300 w-full mb-4">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted mt-1" />
      {/* Message Content */}
      <div className="flex flex-col min-w-0 flex-1 items-start">
        {/* Bubble */}
        <div className="rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] min-w-fit break-words bg-background border w-full">
          <div className="space-y-2 w-full">
            <div className="h-4 bg-muted-foreground/20 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center gap-2 mt-1 px-1 flex-row">
          {/* Timestamp skeleton */}
          <div className="h-3 w-12 rounded bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
    </div>
  </>
))

MessageSkeleton.displayName = "MessageSkeleton"

// Load more button component
const LoadMoreButton = memo(({ 
  onLoadMore, 
  isLoading 
}: { 
  onLoadMore: () => void
  isLoading: boolean 
}) => (
  <div className="flex justify-center py-4">
    <Button
      variant="outline"
      size="sm"
      onClick={onLoadMore}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ChevronUp className="h-4 w-4" />
      )}
      {isLoading ? "Loading..." : "Load older messages"}
    </Button>
  </div>
))

LoadMoreButton.displayName = "LoadMoreButton"

// Empty state component
const EmptyState = memo(({ 
  persona, 
  conversation,
  onSampleQuestionClick 
}: { 
  persona: Persona | null
  conversation?: Conversation | null
  onSampleQuestionClick: (question: string) => void 
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 animate-in fade-in-0 duration-500">
    <div className="rounded-full bg-primary/10 p-6 mb-6 transition-transform duration-300 hover:scale-105">
      <Avatar className="h-20 w-20">
        <AvatarImage
          src={persona?.avatarUrl || "/placeholder.svg"}
          alt={persona?.name}
        />
        <AvatarFallback className="text-2xl">
          {persona?.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>
    </div>
    <h3 className="text-2xl font-semibold mb-3">
      {conversation?.title || `Chat with ${persona?.name || "..."}`}
    </h3>
    <p className="text-muted-foreground mb-8 max-w-md">
      {persona?.description || "Select a persona to start chatting"}
    </p>
    {persona?.sampleQuestions && persona.sampleQuestions.length > 0 && (
      <div className="w-full max-w-md space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground mb-4">
          Try asking:
        </h4>
        {persona.sampleQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "w-full justify-start text-left h-auto p-4 whitespace-normal",
              "bg-transparent hover:bg-muted/50 transition-all duration-200",
              "animate-in fade-in-0 slide-in-from-bottom-2",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onSampleQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    )}
  </div>
))

EmptyState.displayName = "EmptyState"

export const ChatMessages = memo(({
  messages,
  currentPersona,
  currentConversation,
  isLoading,
  isLoadingOlder = false,
  copiedMessageId,
  canLoadOlder = false,
  onCopyMessage,
  onDeleteMessage,
  onLoadOlderMessages,
  onSampleQuestionClick,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLElement | null>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const scrollAnchor = useRef<{ scrollTop: number; scrollHeight: number } | null>(null)

  // Helper to get the actual scrollable viewport
  const getViewport = useCallback(() => {
    if (viewportRef.current) return viewportRef.current
    
    if (!scrollAreaRef.current) return null
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    viewportRef.current = viewport
    return viewport
  }, [])

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const viewport = getViewport()
    if (viewport) {
      if (behavior === "auto") {
        // Instant scroll without any animation
        viewport.scrollTop = viewport.scrollHeight
      } else {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior
        })
      }
    }
  }, [getViewport])

  // Check if user is near bottom of scroll
  const checkIfNearBottom = useCallback(() => {
    const viewport = getViewport()
    if (!viewport) return true
    
    const threshold = 100 // pixels from bottom
    const isNear = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - threshold
    setIsNearBottom(isNear)
    return isNear
  }, [getViewport])

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && shouldScrollToBottom) {
      // Instant scroll to bottom without any delay or animation
      scrollToBottom("auto")
      setShouldScrollToBottom(false)
    }
  }, [isLoading, messages.length, shouldScrollToBottom, scrollToBottom])

  // Auto-scroll to bottom when new messages arrive (only if user was near bottom)
  useEffect(() => {
    if (!isLoadingOlder && !isLoading && messages.length > 0 && !shouldScrollToBottom) {
      if (isNearBottom) {
        // Instant scroll without animation for new messages too
        scrollToBottom("auto")
      }
    }
  }, [messages.length, isLoadingOlder, isLoading, isNearBottom, shouldScrollToBottom, scrollToBottom])

  // Handle loading older messages
  const handleLoadOlderMessages = useCallback(() => {
    const viewport = getViewport()
    if (viewport && onLoadOlderMessages) {
      // Save current scroll position
      scrollAnchor.current = {
        scrollTop: viewport.scrollTop,
        scrollHeight: viewport.scrollHeight
      }
      onLoadOlderMessages()
    }
  }, [getViewport, onLoadOlderMessages])

  // Restore scroll position after loading older messages
  useEffect(() => {
    if (!isLoadingOlder && scrollAnchor.current) {
      const viewport = getViewport()
      if (viewport) {
        // Calculate the new scroll position
        const heightDifference = viewport.scrollHeight - scrollAnchor.current.scrollHeight
        const newScrollTop = scrollAnchor.current.scrollTop + heightDifference
        
        // Set scroll position without animation
        viewport.scrollTop = Math.max(0, newScrollTop)
        
        // Clear the anchor
        scrollAnchor.current = null
      }
    }
  }, [isLoadingOlder, messages.length, getViewport])

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    if (!viewport) return

    // Update near bottom status
    checkIfNearBottom()
    
    // Load older messages if scrolled to top
    const scrollTop = viewport.scrollTop
    if (scrollTop === 0 && canLoadOlder && !isLoadingOlder) {
      handleLoadOlderMessages()
    }
  }, [canLoadOlder, isLoadingOlder, handleLoadOlderMessages, checkIfNearBottom])

  // Reset scroll state when conversation changes
  useEffect(() => {
    setShouldScrollToBottom(true)
    setIsNearBottom(true)
    scrollAnchor.current = null
    viewportRef.current = null
  }, [currentConversation?.id])

  const handleMessageDelete = useCallback((messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId)
    }
  }, [onDeleteMessage])

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      ref={scrollAreaRef}
      onScrollCapture={handleScroll}
    >
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Load more button at the top */}
        {canLoadOlder && messages.length > 0 && (
          <LoadMoreButton 
            onLoadMore={handleLoadOlderMessages} 
            isLoading={isLoadingOlder} 
          />
        )}

        {/* Loading indicator for older messages */}
        {isLoadingOlder && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading older messages...
            </div>
          </div>
        )}

        {/* Messages or empty state */}
        {messages.length === 0 ? (
          <EmptyState 
            persona={currentPersona}
            conversation={currentConversation}
            onSampleQuestionClick={onSampleQuestionClick}
          />
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
              >
                <MessageBubble
                  message={message}
                  onCopy={onCopyMessage}
                  onDelete={handleMessageDelete}
                  isCopied={copiedMessageId === message.id}
                />
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
})

ChatMessages.displayName = "ChatMessages"