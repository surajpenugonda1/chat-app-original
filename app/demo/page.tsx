"use client"

import { DemoCodeExamples } from "@/components/demo-code-examples"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DemoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold text-xl">
              <span>Code Rendering Demo</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <DemoCodeExamples />
      </main>
    </div>
  )
}
