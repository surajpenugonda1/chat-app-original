// components/chat/chat-messages.tsx
"use client"

import { memo, useEffect, useRef, useCallback } from "react"
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
  <div className="flex gap-3 max-w-[85%] mr-auto mb-4 animate-in fade-in-0 duration-300">
    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    <div className="flex flex-col gap-1 flex-1">
      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="h-3 bg-muted-foreground/20 rounded w-16 animate-pulse" />
    </div>
  </div>
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
  const previousScrollHeight = useRef<number>(0)

  // Auto-scroll to bottom when new messages arrive (but not when loading older messages)
  useEffect(() => {
    if (!isLoadingOlder) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, isLoadingOlder])

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (isLoadingOlder && scrollAreaRef.current) {
      previousScrollHeight.current = scrollAreaRef.current.scrollHeight
    }
  }, [isLoadingOlder])

  useEffect(() => {
    if (!isLoadingOlder && scrollAreaRef.current && previousScrollHeight.current > 0) {
      const newScrollHeight = scrollAreaRef.current.scrollHeight
      const scrollDiff = newScrollHeight - previousScrollHeight.current
      scrollAreaRef.current.scrollTop = scrollDiff
      previousScrollHeight.current = 0
    }
  }, [messages.length, isLoadingOlder])

  // Handle scroll-based loading of older messages
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    
    // Check if user scrolled to the top and can load more
    if (target.scrollTop === 0 && canLoadOlder && !isLoadingOlder && onLoadOlderMessages) {
      onLoadOlderMessages()
    }
  }, [canLoadOlder, isLoadingOlder, onLoadOlderMessages])

  const handleMessageDelete = useCallback((messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId)
    }
  }, [onDeleteMessage])

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
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
        {canLoadOlder && (
          <LoadMoreButton 
            onLoadMore={onLoadOlderMessages!} 
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