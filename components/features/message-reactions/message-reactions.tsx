"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"
import { useFeatures } from "@/lib/hooks/use-features"

interface MessageReactionsProps {
  messageId: string
  reactions?: Record<string, number>
  onReact?: (emoji: string) => void
}

const EMOJI_OPTIONS = ["👍", "👎", "❤️", "😂", "😮", "😢", "😡", "🎉"]

export function MessageReactions({ messageId, reactions = {}, onReact }: MessageReactionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isFeatureEnabled } = useFeatures()

  if (!isFeatureEnabled("MESSAGE_REACTIONS")) {
    return null
  }

  const handleReact = (emoji: string) => {
    onReact?.(emoji)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Display existing reactions */}
      {Object.entries(reactions).map(
        ([emoji, count]) =>
          count > 0 && (
            <Button
              key={emoji}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleReact(emoji)}
            >
              {emoji} {count}
            </Button>
          ),
      )}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button key={emoji} variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleReact(emoji)}>
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
