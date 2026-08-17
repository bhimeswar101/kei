import { platformApplicationAdapterManager } from "@/core/platform";

export interface SystemAdapterContract {
  openApplication(name: string): Promise<{ success: boolean; error?: string }>;
  closeApplication(name: string): Promise<{ success: boolean; error?: string }>;
}

export class SystemAdapter implements SystemAdapterContract {
  async openApplication(name: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.openApplication({ name });
  }

  async closeApplication(name: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.closeApplication({ name });
  }
}

export const systemAdapter = new SystemAdapter();
