// components/message-bubble.tsx
"use client"

import { useState, useEffect, memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Check } from "lucide-react"
import { CodeRenderer } from "./features/code-renderer/code-renderer"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface MessageBubbleProps {
  message: Message
  onCopy?: (messageId: string, content: string) => void
  isCopied?: boolean
  isUser?: boolean
  avatarUrl?: string
  userName?: string
}

export const MessageBubble = memo(({ 
  message, 
  onCopy,
  isCopied: externalIsCopied,
  isUser, 
  avatarUrl, 
  userName 
}: MessageBubbleProps) => {
  const [localCopied, setLocalCopied] = useState(false)
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null)
  
  // Determine if message is from user based on role
  const isUserMessage = isUser ?? message.role === "user"
  
  // Use external copied state if provided, otherwise use local state
  const isCopied = externalIsCopied ?? localCopied

  // Sync local state with external state
  useEffect(() => {
    if (externalIsCopied !== undefined) {
      setLocalCopied(externalIsCopied)
    }
  }, [externalIsCopied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      
      if (onCopy) {
        onCopy(message.id, message.content)
      } else {
        setLocalCopied(true)
        setTimeout(() => setLocalCopied(false), 2000)
      }
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleReaction = (type: "like" | "dislike") => {
    setReaction(reaction === type ? null : type)
  }

  // Extract code blocks from message content
  const parseMessageContent = (content: string) => {
    const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = []
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim()
        if (textContent) {
          parts.push({ type: "text", content: textContent })
        }
      }

      const language = match[1] || "text"
      const codeContent = match[2].trim()
      if (codeContent) {
        parts.push({ type: "code", content: codeContent, language })
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim()
      if (textContent) {
        parts.push({ type: "text", content: textContent })
      }
    }

    if (parts.length === 0) {
      parts.push({ type: "text", content })
    }

    return parts
  }

  const formatTextContent = (text: string) => {
    let formatted = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
    formatted = formatted.replace(/\n/g, '<br />')
    return formatted
  }

  const messageParts = parseMessageContent(message.content)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    // Format: YYYY-MM-DD HH:mm
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  return (
    <div className={cn(
      "flex gap-3 sm:gap-4 group animate-in fade-in-0 duration-300 w-full",
      isUserMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarImage 
          src={avatarUrl || "/placeholder.svg"} 
          alt={userName || (isUserMessage ? "You" : "Assistant")} 
        />
        <AvatarFallback className="text-xs">
          {userName?.charAt(0) || (isUserMessage ? "U" : "A")}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        "flex flex-col min-w-0 flex-1",
        isUserMessage ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md",
          "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%]",
          "min-w-fit break-words",
          isUserMessage 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-background border rounded-bl-md"
        )}>
          <div className="space-y-3">
            {messageParts.map((part, index) => (
              <div key={index}>
                {part.type === "text" ? (
                  <div
                    className={cn(
                      "prose prose-sm max-w-none leading-relaxed",
                      isUserMessage 
                        ? "prose-invert" 
                        : "prose-gray dark:prose-invert",
                      "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono",
                      isUserMessage 
                        ? "[&_code]:bg-primary-foreground/20" 
                        : "[&_code]:bg-muted"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: formatTextContent(part.content),
                    }}
                  />
                ) : (
                  <div className="my-2 -mx-1">
                    <CodeRenderer 
                      code={part.content} 
                      language={part.language} 
                      className="text-sm" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with timestamp and actions */}
        <div className={cn(
          "flex items-center gap-2 mt-1 px-1",
          "transition-all duration-200",
          isUserMessage ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground select-none">
            {formatTime(message.timestamp)}
          </span>

          {/* Action Buttons */}
          <div className={cn(
            "flex items-center gap-1",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}>
            {/* Copy Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Copy message"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>

            {/* Assistant-only actions */}
            {!isUserMessage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("like")}
                  className={cn(
                    "h-6 w-6 p-0 hover:bg-muted",
                    reaction === "like" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  )}
                  title="Like message"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("dislike")}
                  className={cn(
                    "h-6 w-6 p-0 hover:bg-muted",
                    reaction === "dislike" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                  title="Dislike message"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-muted"
                  title="More options"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = "MessageBubble"