// components/chat/chat-messages.tsx
"use client"

import { memo, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { cn } from "@/lib/utils"
import type { Persona } from "@/lib/types"
import type { Message } from "@/lib/types"

interface ChatMessagesProps {
  messages: Message[]
  currentPersona: Persona | null
  isLoading: boolean
  copiedMessageId: string | null
  onCopyMessage: (messageId: string, content: string) => void
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

// Empty state component
const EmptyState = memo(({ 
  persona, 
  onSampleQuestionClick 
}: { 
  persona: Persona | null
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
      Chat with {persona?.name || "..."}
    </h3>
    <p className="text-muted-foreground mb-8 max-w-md">
      {persona?.description || "Select a persona to start chatting"}
    </p>
    {persona?.sampleQuestions && persona.sampleQuestions.length > 0 && (
      <div className="w-full max-w-md space-y-3">
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
  isLoading,
  copiedMessageId,
  onCopyMessage,
  onSampleQuestionClick,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages.length])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {isLoading ? (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        ) : messages.length === 0 ? (
          <EmptyState 
            persona={currentPersona} 
            onSampleQuestionClick={onSampleQuestionClick}
          />
        ) : (
          messages.map((message, index) => (
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
})

ChatMessages.displayName = "ChatMessages"