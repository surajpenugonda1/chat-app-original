// components/chat/chat-header.tsx
"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreVertical, Trash2, LogOut, PanelLeft } from "lucide-react"
import type { Persona } from "@/lib/types"

interface ChatHeaderProps {
  currentPersona: Persona | null
  isMobile: boolean
  isCollapsed?: boolean
  onToggleSidebar?: () => void
  onMobileMenuClick?: () => void
  onBackToPersonas: () => void
  onClearChat: () => void
  onLogout: () => void
}

export const ChatHeader = memo(({
  currentPersona,
  isMobile,
  isCollapsed,
  onToggleSidebar,
  onMobileMenuClick,
  onBackToPersonas,
  onClearChat,
  onLogout,
}: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Desktop sidebar toggle */}
        {!isMobile && onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar} 
            className="mr-2 transition-transform duration-200 hover:scale-105"
          >
            <PanelLeft className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
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
            <div className="text-xs text-muted-foreground truncate">
              {currentPersona?.description || "Start a conversation"}
            </div>
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
  )
})

ChatHeader.displayName = "ChatHeader"