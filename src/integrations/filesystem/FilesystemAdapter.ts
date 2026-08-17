import { platformApplicationAdapterManager } from "@/core/platform";

export interface FilesystemAdapterContract {
  readFile(path: string): Promise<{ success: boolean; content?: string; error?: string }>;
  searchFiles(query: string): Promise<{ success: boolean; paths?: string[]; error?: string }>;
}

export class FilesystemAdapter implements FilesystemAdapterContract {
  async readFile(path: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.readFile({ path });
  }

  async searchFiles(query: string) {
    const adapter = platformApplicationAdapterManager.getActive();
    return adapter.searchFiles({ query });
  }
}

export const filesystemAdapter = new FilesystemAdapter();
