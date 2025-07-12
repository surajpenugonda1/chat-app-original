"use client"

import { memo, useRef, FormEvent, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, X, FileText, Image, Music, Video } from "lucide-react"
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

interface SelectedFile {
  file: File
  id: string
  type: 'image' | 'audio' | 'video' | 'document' | 'other'
}

const getFileType = (file: File): SelectedFile['type'] => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return 'document'
  return 'other'
}

const getFileIcon = (type: SelectedFile['type']) => {
  switch (type) {
    case 'image':
      return <Image className="h-3 w-3" />
    case 'audio':
      return <Music className="h-3 w-3" />
    case 'video':
      return <Video className="h-3 w-3" />
    case 'document':
      return <FileText className="h-3 w-3" />
    default:
      return <Paperclip className="h-3 w-3" />
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles: SelectedFile[] = Array.from(files).map(file => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}`,
      type: getFileType(file)
    }))
    
    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    
    // If we have files, send them via file upload
    if (selectedFiles.length > 0) {
      const fileList = new DataTransfer()
      selectedFiles.forEach(({ file }) => fileList.items.add(file))
      onFileUpload(fileList.files)
      setSelectedFiles([]) // Clear files after upload
      
      // If there's also text input, we'll send it as part of the file upload
      if (input.trim()) {
        // The backend handles both content and files in the same request
        onInputChange("") // Clear input after sending
      }
    } else if (input.trim()) {
      // Send text-only message
      onSubmit(e)
    }
  }, [selectedFiles, input, onFileUpload, onSubmit, onInputChange])

  const canSend = (input.trim() || selectedFiles.length > 0) && !isLoading && !isRecording

  return (
    <>
      <Separator />
      <div className="p-4 bg-background animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="max-w-4xl mx-auto">
          {/* File previews */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedFiles.map((selectedFile) => (
                <Badge
                  key={selectedFile.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-2 h-auto max-w-[200px]"
                >
                  {getFileIcon(selectedFile.type)}
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {selectedFile.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeFile(selectedFile.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder={selectedFiles.length > 0 ? "Add a message (optional)..." : "Type your message..."}
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
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.json,.csv,.xlsx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 transition-all duration-200 hover:scale-110",
                    selectedFiles.length > 0 && "text-primary"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
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
              disabled={!canSend}
              className={cn(
                "h-[44px] w-[44px] shrink-0",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                !canSend && "opacity-50"
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
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected • Press Enter to send` 
                : "Press Enter to send, Shift+Enter for new line"
              }
            </p>
          </div>
        </div>
      </div>
    </>
  )
})

ChatInput.displayName = "ChatInput"