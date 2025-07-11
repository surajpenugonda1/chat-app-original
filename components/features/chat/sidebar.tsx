// components/chat/sidebar.tsx
"use client"

import { memo, useState, useMemo } from "react"
import { useChatContext } from "./ChatContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Search, Plus, X, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Persona } from "@/lib/types"

const Sidebar = () => {
  const {
    personas,
    currentPersonaId,
    setCurrentPersonaId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useChatContext();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredPersonas = useMemo(() => {
    if (!searchQuery.trim()) return personas;
    const query = searchQuery.toLowerCase();
    return personas.filter((persona) =>
      persona.name.toLowerCase().includes(query) ||
      persona.description.toLowerCase().includes(query)
    );
  }, [personas, searchQuery]);

  const handlePersonaSelect = (id: string) => {
    setCurrentPersonaId(id);
    router.push(`/chat/${id}`);
    // Do NOT collapse sidebar here!
  };
  const handleAddPersona = () => router.push("/personas");
  const handleRemovePersona = (id: string) => {/* Implement as needed */};
  const handleToggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <nav
      aria-label="Sidebar"
      className={cn(
        "flex h-full flex-col bg-background border-r transition-all duration-300 ease-in-out overflow-hidden",
        "transition-[width]",
        isSidebarCollapsed ? "w-16" : "w-60" // 240px for desktop
      )}
    >
      {/* Header */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide flex-1 animate-in fade-in-0 duration-200">
              Your Personas ({personas.length})
            </h3>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Add Persona"
              onClick={handleAddPersona}
              className={cn(isSidebarCollapsed && "mx-auto")}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={handleToggleCollapse}
              className="hidden md:flex"
            >
              <PanelLeft className={cn(
                "h-4 w-4 transition-transform duration-200",
                isSidebarCollapsed && "rotate-180"
              )} />
            </Button>
          </div>
        </div>
        {!isSidebarCollapsed && (
          <div className="relative animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your personas..."
              className="pl-10 text-sm py-1.5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search personas"
            />
          </div>
        )}
      </div>
      {/* Personas List */}
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-1">
          {filteredPersonas.length === 0 ? (
            <div className={cn(
              "p-4 text-center text-muted-foreground text-xs",
              "animate-in fade-in-0 duration-200"
            )}>
              {searchQuery ? "No personas found" : "No personas available"}
            </div>
          ) : (
            filteredPersonas.map((persona) => (
              <TooltipProvider delayDuration={200} key={persona.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted transition-colors cursor-pointer",
                        persona.id === currentPersonaId && "bg-muted",
                        isSidebarCollapsed && "justify-center p-2"
                      )}
                      onClick={() => handlePersonaSelect(persona.id)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={persona.id === currentPersonaId}
                    >
                      <div className="flex items-center min-w-0 flex-1 gap-2">
                        <Avatar className={cn("shrink-0 transition-all duration-200", isSidebarCollapsed ? "h-8 w-8" : "h-8 w-8") }>
                          <AvatarImage src={persona.avatarUrl || "/placeholder.svg"} alt={persona.name} />
                          <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {!isSidebarCollapsed && (
                          <div className="flex-1 text-left min-w-0 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                            <div className="font-medium text-sm truncate">{persona.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{persona.description}</div>
                          </div>
                        )}
                      </div>
                      {!isSidebarCollapsed && filteredPersonas.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={e => { e.stopPropagation(); handleRemovePersona(persona.id); }}
                          aria-label={`Remove ${persona.name}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className={cn(!isSidebarCollapsed && "hidden") }>
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-xs text-muted-foreground">{persona.description}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          )}
        </div>
      </ScrollArea>
    </nav>
  );
};

export default memo(Sidebar);