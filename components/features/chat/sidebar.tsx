// components/chat/sidebar.tsx
"use client"

import { useState, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, Plus, X, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Persona } from "@/lib/types"

interface SidebarProps {
  personas: Persona[]
  currentPersonaId: string
  isCollapsed: boolean
  onToggleCollapse: () => void
  onPersonaSelect: (personaId: string) => void
  onAddPersona: () => void
  onRemovePersona: (personaId: string) => void
}

// Memoized persona item to prevent unnecessary re-renders
const PersonaItem = memo(({ 
  persona, 
  isActive, 
  isCollapsed, 
  canRemove,
  onSelect, 
  onRemove 
}: {
  persona: Persona
  isActive: boolean
  isCollapsed: boolean
  canRemove: boolean
  onSelect: () => void
  onRemove: () => void
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div
        className={cn(
          "group flex items-center justify-between rounded-lg p-3",
          "hover:bg-muted/50 transition-all duration-200 cursor-pointer",
          isActive && "bg-muted",
          isCollapsed && "justify-center p-2",
        )}
        onClick={onSelect}
      >
        <div className="flex items-center min-w-0 flex-1">
          <Avatar className={cn(
            "shrink-0 transition-all duration-200",
            isCollapsed ? "h-8 w-8" : "h-8 w-8 mr-3"
          )}>
            <AvatarImage src={persona.avatarUrl || "/placeholder.svg"} alt={persona.name} />
            <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0 animate-in fade-in-0 slide-in-from-left-2 duration-200">
              <div className="font-medium text-sm truncate">{persona.name}</div>
              <div className="text-xs text-muted-foreground truncate">{persona.description}</div>
            </div>
          )}
        </div>
        {!isCollapsed && canRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </TooltipTrigger>
    <TooltipContent side="right" className={cn(!isCollapsed && "hidden")}>
      <div>
        <div className="font-medium">{persona.name}</div>
        <div className="text-xs text-muted-foreground">{persona.description}</div>
      </div>
    </TooltipContent>
  </Tooltip>
))

PersonaItem.displayName = "PersonaItem"

export const Sidebar = memo(({
  personas,
  currentPersonaId,
  isCollapsed,
  onToggleCollapse,
  onPersonaSelect,
  onAddPersona,
  onRemovePersona,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize filtered personas
  const filteredPersonas = useMemo(() => {
    if (!searchQuery.trim()) return personas
    
    const query = searchQuery.toLowerCase()
    return personas.filter((persona) =>
      persona.name.toLowerCase().includes(query) ||
      persona.description.toLowerCase().includes(query)
    )
  }, [personas, searchQuery])

  return (
    <div className={cn(
      "flex h-full flex-col bg-background border-r",
      "transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex-1 animate-in fade-in-0 duration-200">
              Your Personas ({personas.length})
            </h3>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddPersona}
              className={cn(isCollapsed && "mx-auto")}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden md:flex"
            >
              <PanelLeft className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        {!isCollapsed && (
          <div className="relative animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your personas..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Personas List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredPersonas.length === 0 ? (
            <div className={cn(
              "p-4 text-center text-muted-foreground text-sm",
              "animate-in fade-in-0 duration-200"
            )}>
              {searchQuery ? "No personas found" : "No personas available"}
            </div>
          ) : (
            filteredPersonas.map((persona) => (
              <PersonaItem
                key={persona.id}
                persona={persona}
                isActive={persona.id === currentPersonaId}
                isCollapsed={isCollapsed}
                canRemove={personas.length > 1}
                onSelect={() => onPersonaSelect(persona.id)}
                onRemove={() => onRemovePersona(persona.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
})

Sidebar.displayName = "Sidebar"