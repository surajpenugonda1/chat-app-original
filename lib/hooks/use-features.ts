"use client"

import { useAppStore } from "@/lib/store/app-store"
import { featureManager } from "@/lib/features/feature-manager"
import { useEffect } from "react"

export function useFeatures() {
  const { enabledFeatures, userRole, isAdmin, enableFeature, disableFeature } = useAppStore()

  useEffect(() => {
    featureManager.setUserContext(userRole, isAdmin)
  }, [userRole, isAdmin])

  const isFeatureEnabled = (featureId: string): boolean => {
    return enabledFeatures.has(featureId) && featureManager.isFeatureEnabled(featureId)
  }

  const toggleFeature = (featureId: string, enabled: boolean) => {
    if (enabled) {
      enableFeature(featureId)
      featureManager.enableFeature(featureId)
    } else {
      disableFeature(featureId)
      featureManager.disableFeature(featureId)
    }
  }

  return {
    isFeatureEnabled,
    toggleFeature,
    enabledFeatures: Array.from(enabledFeatures),
    allFeatures: featureManager.getAllFeatures(),
  }
}
