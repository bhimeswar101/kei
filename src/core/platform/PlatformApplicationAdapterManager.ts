import type {
  PlatformApplicationAdapterContract,
  PlatformType,
} from "./types";

export class PlatformApplicationAdapterManager {
  private readonly adapters =
    new Map<
      PlatformType,
      PlatformApplicationAdapterContract
    >();

  private activePlatform:
    PlatformType | undefined;

  register(
    adapter: PlatformApplicationAdapterContract,
  ): void {
    if (
      this.adapters.has(adapter.platform)
    ) {
      throw new Error(
        `A platform application adapter for "${adapter.platform}" is already registered.`,
      );
    }

    this.adapters.set(
      adapter.platform,
      adapter,
    );
  }

  unregister(
    platform: PlatformType,
  ): boolean {
    const removed =
      this.adapters.delete(platform);

    if (
      this.activePlatform === platform
    ) {
      this.activePlatform = undefined;
    }

    return removed;
  }

  has(
    platform: PlatformType,
  ): boolean {
    return this.adapters.has(platform);
  }

  get(
    platform: PlatformType,
  ): PlatformApplicationAdapterContract
    | undefined {
    return this.adapters.get(platform);
  }

  getAll():
    readonly PlatformApplicationAdapterContract[] {
    return Array.from(
      this.adapters.values(),
    );
  }

  setActive(
    platform: PlatformType,
  ): void {
    if (!this.adapters.has(platform)) {
      throw new Error(
        `No platform application adapter is registered for "${platform}".`,
      );
    }

    this.activePlatform = platform;
  }

  getActive():
    PlatformApplicationAdapterContract {
    if (!this.activePlatform) {
      throw new Error(
        "No active platform application adapter has been selected.",
      );
    }

    const adapter =
      this.adapters.get(
        this.activePlatform,
      );

    if (!adapter) {
      throw new Error(
        `The active platform application adapter "${this.activePlatform}" is not registered.`,
      );
    }

    return adapter;
  }

  getActivePlatform():
    PlatformType | undefined {
    return this.activePlatform;
  }

  clear(): void {
    this.adapters.clear();
    this.activePlatform = undefined;
  }
}

export const platformApplicationAdapterManager =
  new PlatformApplicationAdapterManager();
  