export type AgentEmotion = "neutral" | "focused" | "happy" | "concerned" | "calm";

export interface PersonaConfig {
  readonly name: string;
  readonly baseIdentityPrompt: string;
  readonly traits: readonly string[];
  readonly writingRules: readonly string[];
  readonly concisenessInstructions: string;
}

export interface UserPreferences {
  readonly username?: string;
  readonly brevity?: "brief" | "detailed" | "default";
  readonly formattingStyle?: "natural" | "markdown" | "none";
}

export interface PersonalityManagerContract {
  getEmotion(): AgentEmotion;
  setEmotion(emotion: AgentEmotion): void;
  getPersonaConfig(): PersonaConfig;
  getUserPreferences(): UserPreferences;
  setUserPreferences(preferences: UserPreferences): void;
  buildSystemPrompt(contextString?: string): string;
}
