"use client"

import { memo, useRef, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Send, Paperclip } from "lucide-react"
import { AudioRecorder } from "@/components/audio-recorder"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  input: string
  isLoading: boolean
  isRecording: boolean
  onInputChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  onFileUpload: (files: FileList) => void
  onAudioMessage: (audioBlob: Blob) => void
  onSetIsRecording: (recording: boolean) => void
}

export const ChatInput = memo(({
  input,
  isLoading,
  isRecording,
  onInputChange,
  onSubmit,
  onFileUpload,
  onAudioMessage,
  onSetIsRecording,
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <>
      <Separator />
      <div className="p-4 bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={onSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "pr-20 min-h-[44px] resize-none",
                  "transition-all duration-200",
                  "focus:ring-2 focus:ring-primary/20"
                )}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                  accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 transition-transform duration-200 hover:scale-110"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <AudioRecorder
                  onRecordingComplete={onAudioMessage}
                  isRecording={isRecording}
                  setIsRecording={onSetIsRecording}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!input.trim() && !isRecording)}
              className={cn(
                "h-[44px] w-[44px] shrink-0",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                (isLoading || (!input.trim() && !isRecording)) && "opacity-50"
              )}
            >
              <Send className={cn(
                "h-4 w-4 transition-transform duration-200",
                isLoading && "animate-pulse"
              )} />
            </Button>
          </form>
          <div className="flex items-center justify-center mt-2">
            <p className="text-xs text-muted-foreground animate-in fade-in-0 duration-500">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  )
})

ChatInput.displayName = "ChatInput"