"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (files: FileList) => void
  accept?: string
  multiple?: boolean
}

export function FileUpload({ onFileUpload, accept = "*/*", multiple = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFileUpload(files)
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ""
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
      />
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleClick}>
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  )
}
