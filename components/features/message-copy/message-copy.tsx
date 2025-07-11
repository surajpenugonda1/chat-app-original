"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFeatures } from "@/lib/hooks/use-features"

interface MessageCopyProps {
  content: string
  messageId: string
  className?: string
}

export function MessageCopy({ content, messageId, className }: MessageCopyProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const { isFeatureEnabled } = useFeatures()

  if (!isFeatureEnabled("MESSAGE_COPY")) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
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
  }

  return (
    <Button variant="ghost" size="icon" className={className} onClick={handleCopy}>
      {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}
