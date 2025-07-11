"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store/app-store"
import { FeatureManagement } from "@/components/admin/feature-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin } = useAppStore()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!isAdmin) {
      router.push("/personas")
      return
    }
  }, [user, isAdmin, router])

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/personas")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold text-xl">
              <span>Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <FeatureManagement />
      </main>
    </div>
  )
}
