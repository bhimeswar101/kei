import type { IntelligenceContext, IntelligenceIntent } from "@/core/intelligence";

export type CapabilityId = string;

export type CapabilityCategory =
  | "application"
  | "browser"
  | "file-system"
  | "media"
  | "communication"
  | "automation"
  | "device"
  | "system"
  | "search"
  | "custom";

export type CapabilityRiskLevel = "low" | "medium" | "high";

export interface CapabilityDefinition {
  readonly id: CapabilityId;

  readonly name: string;

  readonly description: string;

  readonly category: CapabilityCategory;

  readonly supportedIntents: readonly IntelligenceIntent[];

  readonly riskLevel: CapabilityRiskLevel;

  readonly requiresPermission: boolean;
}

export interface CapabilityMatch {
  readonly capability: CapabilityDefinition;

  readonly confidence: number;

  readonly reason?: string;
}

export interface CapabilityQuery {
  readonly requestId: string;

  readonly intent: IntelligenceIntent;

  readonly text: string;

  readonly entities: readonly unknown[];

  readonly requiresAction: boolean;
}

export interface CapabilityResolution {
  readonly requestId: string;

  readonly available: boolean;

  readonly matches: readonly CapabilityMatch[];

  readonly selected?: CapabilityMatch;
}

export interface CapabilityResolverContract {
  resolve(context: IntelligenceContext, query: CapabilityQuery): Promise<CapabilityResolution>;
}
