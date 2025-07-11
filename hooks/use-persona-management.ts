import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function usePersonaManagement(currentPersonaId: string, personas: any[]) {
  const router = useRouter()
  const { toast } = useToast()

  const handlePersonaSelect = useCallback((personaId: string) => {
    router.push(`/chat/${personaId}`)
  }, [router])

  const handleAddPersona = useCallback(() => {
    router.push("/personas")
  }, [router])

  const handleRemovePersona = useCallback((personaIdToRemove: string) => {
    if (personaIdToRemove === currentPersonaId) {
      const remainingPersonas = personas.filter(p => p.id !== personaIdToRemove)
      if (remainingPersonas.length > 0) {
        router.push(`/chat/${remainingPersonas[0].id}`)
      } else {
        router.push("/personas")
      }
    }
  }, [router, currentPersonaId, personas])

  const handleBackToPersonas = useCallback(() => {
    router.push("/personas")
  }, [router])

  return {
    handlePersonaSelect,
    handleAddPersona,
    handleRemovePersona,
    handleBackToPersonas,
  }
}