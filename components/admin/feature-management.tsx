"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Settings, Shield, Users } from "lucide-react"
import { useFeatures } from "@/lib/hooks/use-features"
import { useAppStore } from "@/lib/store/app-store"

export function FeatureManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const { allFeatures, toggleFeature, isFeatureEnabled } = useFeatures()
  const { isAdmin } = useAppStore()

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">You need administrator privileges to access feature management.</p>
        </CardContent>
      </Card>
    )
  }

  const filteredFeatures = allFeatures.filter(
    (feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categorizedFeatures = {
    core: filteredFeatures.filter((f) => f.id.startsWith("CHAT_") || f.id.startsWith("MESSAGE_")),
    media: filteredFeatures.filter(
      (f) => f.id.startsWith("AUDIO_") || f.id.startsWith("FILE_") || f.id.startsWith("IMAGE_"),
    ),
    persona: filteredFeatures.filter((f) => f.id.startsWith("PERSONA_")),
    admin: filteredFeatures.filter((f) => f.adminOnly),
    other: filteredFeatures.filter(
      (f) =>
        !f.id.startsWith("CHAT_") &&
        !f.id.startsWith("MESSAGE_") &&
        !f.id.startsWith("AUDIO_") &&
        !f.id.startsWith("FILE_") &&
        !f.id.startsWith("IMAGE_") &&
        !f.id.startsWith("PERSONA_") &&
        !f.adminOnly,
    ),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Management</h2>
          <p className="text-muted-foreground">Configure application features and permissions</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Export Config
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search features..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.entries(categorizedFeatures).map(
        ([category, features]) =>
          features.length > 0 && (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  {category === "admin" && <Shield className="h-5 w-5" />}
                  {category === "persona" && <Users className="h-5 w-5" />}
                  {category} Features
                </CardTitle>
                <CardDescription>
                  {category === "core" && "Basic chat and messaging functionality"}
                  {category === "media" && "Audio, file, and image handling features"}
                  {category === "persona" && "AI persona management and customization"}
                  {category === "admin" && "Administrative and management features"}
                  {category === "other" && "Additional application features"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{feature.name}</h4>
                          {feature.adminOnly && <Badge variant="destructive">Admin Only</Badge>}
                          {feature.dependencies && (
                            <Badge variant="outline">Depends on: {feature.dependencies.join(", ")}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Switch
                        checked={isFeatureEnabled(feature.id)}
                        onCheckedChange={(checked) => toggleFeature(feature.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ),
      )}
    </div>
  )
}
