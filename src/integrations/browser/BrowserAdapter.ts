import { platformApplicationAdapterManager } from "@/core/platform";

export interface BrowserAdapterContract {
  openUrl(url: string): Promise<{ success: boolean; error?: string }>;
  search(query: string): Promise<{ success: boolean; results?: string[]; error?: string }>;
}

export class BrowserAdapter implements BrowserAdapterContract {
  async openUrl(url: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.openBrowserUrl({ url });
  }

  async search(query: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.browserSearch({ query });
  }
}

export const browserAdapter = new BrowserAdapter();
