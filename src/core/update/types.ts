export type UpdateState = "idle" | "checking" | "available" | "up-to-date" | "error";

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  releaseDate?: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

export interface UpdateManagerContract {
  getState(): UpdateState;

  getCurrentVersion(): string;

  getUpdateInfo(): UpdateInfo | null;

  checkForUpdates(): Promise<UpdateInfo>;
}
