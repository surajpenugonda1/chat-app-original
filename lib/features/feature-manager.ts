import type { FeatureConfig } from "./feature-config"
import { FEATURE_FLAGS } from "./feature-config"

export class FeatureManager {
  private static instance: FeatureManager
  private features: Map<string, FeatureConfig> = new Map()
  private userRole = "user"
  private isAdmin = false

  private constructor() {
    this.initializeFeatures()
  }

  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager()
    }
    return FeatureManager.instance
  }

  private initializeFeatures(): void {
    Object.values(FEATURE_FLAGS).forEach((feature) => {
      this.features.set(feature.id, { ...feature })
    })
  }

  public setUserContext(role: string, isAdmin: boolean): void {
    this.userRole = role
    this.isAdmin = isAdmin
  }

  public isFeatureEnabled(featureId: string): boolean {
    const feature = this.features.get(featureId)
    if (!feature) return false

    // Check if feature is globally enabled
    if (!feature.enabled) return false

    // Check admin-only features
    if (feature.adminOnly && !this.isAdmin) return false

    // Check role-based access
    if (feature.userRoles && !feature.userRoles.includes(this.userRole)) return false

    // Check dependencies
    if (feature.dependencies) {
      return feature.dependencies.every((dep) => this.isFeatureEnabled(dep))
    }

    return true
  }

  public enableFeature(featureId: string): void {
    const feature = this.features.get(featureId)
    if (feature) {
      feature.enabled = true
      this.features.set(featureId, feature)
    }
  }

  public disableFeature(featureId: string): void {
    const feature = this.features.get(featureId)
    if (feature) {
      feature.enabled = false
      this.features.set(featureId, feature)
    }
  }

  public getFeature(featureId: string): FeatureConfig | undefined {
    return this.features.get(featureId)
  }

  public getAllFeatures(): FeatureConfig[] {
    return Array.from(this.features.values())
  }

  public getEnabledFeatures(): FeatureConfig[] {
    return this.getAllFeatures().filter((feature) => this.isFeatureEnabled(feature.id))
  }
}

// Singleton instance
export const featureManager = FeatureManager.getInstance()
