import type {
  NativeHostBridgeContract,
} from "./NativeHostBridge";

import type {
  NativeHostTransportContract,
} from "./NativeHostTransport";

import type {
  ApplicationLaunchResult,
  PlatformType,
} from "./types";

export class TransportNativeHostBridge
  implements NativeHostBridgeContract
{
  private readonly transport:
    NativeHostTransportContract;

  constructor(
    transport: NativeHostTransportContract,
  ) {
    this.transport = transport;
  }

  isAvailable(): boolean {
    return this.transport.isAvailable();
  }

  getPlatform(): PlatformType {
  return this.transport.getPlatform();
}

  async openApplication(
    target: string,
  ): Promise<ApplicationLaunchResult> {
    if (!this.transport.isAvailable()) {
      return {
        success: false,
        target,
        error:
          "Native host transport is unavailable.",
      };
    }

    return this.transport.openApplication(
      target,
    );
  }
}
