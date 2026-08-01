import type { AIProvider } from "./types";

export class AIProviderManager {
  private providers = new Map<
    string,
    AIProvider
  >();

  private active?: AIProvider;

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  setActive(id: string): void {
    const provider = this.providers.get(id);

    if (!provider) {
      throw new Error(
        `Provider "${id}" not found.`,
      );
    }

    this.active = provider;
  }

  getActive(): AIProvider {
    if (!this.active) {
      throw new Error(
        "No active AI provider."
      );
    }

    return this.active;
  }
}

export const aiProviderManager =
  new AIProviderManager();