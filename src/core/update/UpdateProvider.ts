import type { UpdateInfo } from "./types";

export interface UpdateProvider {
  readonly id: string;

  check(currentVersion: string): Promise<UpdateInfo>;
}
