"use client"

import { useFeatures } from "@/lib/hooks/use-features"

interface TypingIndicatorProps {
  isTyping: boolean
  personaName?: string
}

export function TypingIndicator({ isTyping, personaName = "AI" }: TypingIndicatorProps) {
  const { isFeatureEnabled } = useFeatures()

  if (!isFeatureEnabled("TYPING_INDICATORS") || !isTyping) {
    return null
  }

  return (
    <div className="flex items-center gap-3 max-w-[85%] mr-auto mb-4">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <div className="w-4 h-4 bg-primary/20 rounded-full" />
      </div>
      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{personaName} is typing</span>
          <div className="flex gap-1">
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
