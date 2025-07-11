"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import { Search, LogOut, ArrowLeft, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { fetchPersonas, assignPersonaToUser } from "@/lib/api"
import type { Persona } from "@/lib/types"
import { PersonaCard } from "@/components/persona-card"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 8

export default function PersonasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  
  // State management
  const [personas, setPersonas] = useState<Persona[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [assigningPersonaId, setAssigningPersonaId] = useState<string | null>(null)

  // Memoized filtered personas to prevent unnecessary recalculations
  const filteredPersonas = useMemo(() => {
    if (searchQuery.trim() === "") {
      return personas
    }
    const query = searchQuery.toLowerCase()
    return personas.filter(
      (persona) =>
        persona.name.toLowerCase().includes(query) ||
        persona.description.toLowerCase().includes(query)
    )
  }, [personas, searchQuery])

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredPersonas.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedPersonas = filteredPersonas.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    
    return {
      totalPages,
      paginatedPersonas,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  }, [filteredPersonas, currentPage])

  // Memoized handlers to prevent unnecessary rerenders
  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }, [logout])

  const handleBackHome = useCallback(() => {
    router.push("/")
  }, [router])

  const handlePersonaSelect = useCallback(async (personaId: string) => {
    if (assigningPersonaId) return // Prevent multiple simultaneous assignments
    
    setAssigningPersonaId(personaId)
    try {
      await assignPersonaToUser(personaId)
      router.push(`/chat/${personaId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign persona. Please try again.",
      })
      setAssigningPersonaId(null)
    }
  }, [assigningPersonaId])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages))
  }, [paginationData.totalPages])

  // Load personas on mount
  useEffect(() => {
    console.log('rendering two times ')
    if (!user) {
      router.push("/login")
      return
    }

    let isMounted = true // Prevent state updates if component unmounts

    const loadPersonas = async () => {
      try {
        const data = await fetchPersonas()
        if (isMounted) {
          setPersonas(data)
        }
      } catch (error) {
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load personas",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPersonas()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Reset to first page when search results change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-40 w-full" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Render empty state
  const renderEmptyState = () => (
    <Card className="p-8 text-center">
      <CardTitle className="mb-2">No personas found</CardTitle>
      <CardDescription>
        Try adjusting your search query or check back later for new personas.
      </CardDescription>
    </Card>
  )

  // Render pagination
  const renderPagination = () => {
    if (paginationData.totalPages <= 1) return null

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevPage}
              className={
                !paginationData.hasPrevPage 
                  ? "pointer-events-none opacity-50" 
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {Array.from({ length: paginationData.totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i + 1)}
                isActive={currentPage === i + 1}
                className="cursor-pointer"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={handleNextPage}
              className={
                !paginationData.hasNextPage 
                  ? "pointer-events-none opacity-50" 
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackHome}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold text-xl">
              <MessageSquare className="h-5 w-5" />
              <span>NextChat</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Choose a Persona</h1>
          <p className="text-muted-foreground">Select an AI persona to start chatting with</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search personas..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {isLoading ? (
          renderSkeletons()
        ) : filteredPersonas.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paginationData.paginatedPersonas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  onClick={() => handlePersonaSelect(persona.id)}
                  loading={assigningPersonaId === persona.id}
                />
              ))}
            </div>

            {renderPagination()}
          </>
        )}
      </main>
    </div>
  )
}