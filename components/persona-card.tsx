"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Persona } from "@/lib/types"

interface PersonaCardProps {
  persona: Persona
  onClick: () => void
  loading?: boolean
}

export function PersonaCard({ persona, onClick, loading = false }: PersonaCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-0">
        <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={persona.avatarUrl || "/placeholder.svg"} alt={persona.name} />
            <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="mb-2">{persona.name}</CardTitle>
        <CardDescription className="line-clamp-2 mb-4">{persona.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {persona.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onClick} disabled={loading}>
          {loading && <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>}
          Chat Now
        </Button>
      </CardFooter>
    </Card>
  )
}
