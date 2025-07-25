"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { useChatContext } from "@/components/features/chat/ChatContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreVertical, Trash2, LogOut, PanelLeft } from "lucide-react"
import { ModalWithDynamicFields } from "@/components/ui/modal-with-dynamic-fields"
import { useState } from "react"

interface ChatHeaderProps {
  isMobile: boolean
  onMobileMenuClick?: () => void
  onBackToPersonas: () => void
  onClearChat: () => void
  onLogout: () => void
}

export const ChatHeader = memo(({
  isMobile,
  onMobileMenuClick,
  onBackToPersonas,
  onClearChat,
  onLogout,
}: ChatHeaderProps) => {
  const { 
    personas, 
    currentPersonaId, 
    isSidebarCollapsed, 
    setIsSidebarCollapsed 
  } = useChatContext()

  // Find the current persona from the context
  const currentPersona = personas.find(p => p.id === currentPersonaId) || null

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const [credentialsOpen, setCredentialsOpen] = useState(false)
  const [credentials, setCredentials] = useState<{ title: string; fields: { key: string; value: string }[] }>({ title: "", fields: [] })

  const handleCredentialsSave = (title: string, fields: { key: string; value: string }[]) => {
    setCredentials({ title, fields })
    setCredentialsOpen(false)
    // You can add logic here to persist or use credentials
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleSidebar} 
              className="mr-2 transition-transform duration-200 hover:scale-105"
            >
              <PanelLeft className={`h-5 w-5 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          )}

          {/* Mobile menu trigger */}
          {isMobile && onMobileMenuClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={onMobileMenuClick}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={currentPersona?.avatarUrl || "/placeholder.svg"}
                  alt={currentPersona?.name}
                />
                <AvatarFallback>{currentPersona?.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
            </Button>
          )}

          {/* Back button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 transition-transform duration-200 hover:scale-105"
            onClick={onBackToPersonas}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Persona info */}
          <div className="flex items-center flex-1 min-w-0">
            <Avatar className="h-10 w-10 mr-3 transition-transform duration-200 hover:scale-105">
              <AvatarImage
                src={currentPersona?.avatarUrl || "/placeholder.svg"}
                alt={currentPersona?.name}
              />
              <AvatarFallback>{currentPersona?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 animate-in fade-in-0 duration-200">
              <div className="font-semibold truncate">{currentPersona?.name || "Select a persona"}</div>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="transition-transform duration-200 hover:scale-105"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <DropdownMenuItem onClick={() => setCredentialsOpen(true)}>
                <span className="mr-2">🔑</span>
                Credentials
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClearChat}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ModalWithDynamicFields
        open={credentialsOpen}
        onSave={handleCredentialsSave}
        onCancel={() => setCredentialsOpen(false)}
        initialTitle={credentials.title}
        initialFields={credentials.fields}
      />
    </>
  )
})

ChatHeader.displayName = "ChatHeader"

export const ChatHeaderSkeleton = () => (
  <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-pulse">
    <div className="flex h-16 items-center px-4">
      {/* Sidebar toggle button (desktop) or mobile menu button (mobile) skeleton */}
      <div className="h-10 w-10 rounded-full bg-muted mr-2" />

      {/* Back button skeleton */}
      <div className="h-10 w-10 rounded-full bg-muted mr-2" />

      {/* Persona info skeleton */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="h-10 w-10 rounded-full bg-muted mr-3" />
        <div className="flex flex-col min-w-0 gap-2">
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Actions menu button skeleton */}
      <div className="h-10 w-10 rounded-full bg-muted ml-2" />
    </div>
  </header>
)