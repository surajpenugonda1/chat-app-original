// components/message-bubble.tsx
"use client"

import { useState, useEffect, memo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        // Use external handler if provided
        onCopy(message.id, message.content)
      } else {
        // Use local state
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
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = content.slice(lastIndex, match.index).trim()
        if (textContent) {
          parts.push({ type: "text", content: textContent })
        }
      }

      // Add code block
      const language = match[1] || "text"
      const codeContent = match[2].trim()
      if (codeContent) {
        parts.push({ type: "code", content: codeContent, language })
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex).trim()
      if (textContent) {
        parts.push({ type: "text", content: textContent })
      }
    }

    // If no code blocks found, return the entire content as text
    if (parts.length === 0) {
      parts.push({ type: "text", content })
    }

    return parts
  }

  const formatTextContent = (text: string) => {
    // Handle inline code
    const inlineCodeRegex = /`([^`]+)`/g
    let formatted = text.replace(inlineCodeRegex, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />')
    
    return formatted
  }

  const messageParts = parseMessageContent(message.content)

  return (
    <div className={cn(
      "flex gap-3 group animate-in fade-in-0 duration-300",
      isUserMessage ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage 
          src={avatarUrl || "/placeholder.svg"} 
          alt={userName || (isUserMessage ? "You" : "Assistant")} 
        />
        <AvatarFallback>
          {userName?.charAt(0) || (isUserMessage ? "U" : "A")}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex-1 space-y-1 max-w-[85%]",
        isUserMessage ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "transition-all duration-200",
          isUserMessage 
            ? "ml-auto bg-primary text-primary-foreground" 
            : "mr-auto hover:shadow-md"
        )}>
          <CardContent className="p-3">
            <div className="space-y-3">
              {messageParts.map((part, index) => (
                <div key={index}>
                  {part.type === "text" ? (
                    <div
                      className={cn(
                        "prose prose-sm max-w-none",
                        isUserMessage 
                          ? "prose-invert" 
                          : "dark:prose-invert"
                      )}
                      dangerouslySetInnerHTML={{
                        __html: formatTextContent(part.content),
                      }}
                    />
                  ) : (
                    <CodeRenderer 
                      code={part.content} 
                      language={part.language} 
                      className="my-2" 
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className={cn(
          "flex items-center gap-1 transition-all duration-200",
          "opacity-0 group-hover:opacity-100"
        )}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-7 text-xs"
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>

          {!isUserMessage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction("like")}
                className={cn(
                  "h-7",
                  reaction === "like" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                )}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction("dislike")}
                className={cn(
                  "h-7",
                  reaction === "dislike" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                )}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>

              <Button variant="ghost" size="sm" className="h-7">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-muted-foreground",
          isUserMessage && "text-right"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = "MessageBubble"