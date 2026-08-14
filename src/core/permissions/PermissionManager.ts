import type { Permission } from "@/shared/constants/permissions";
import { storage } from "@/core/storage";

import type {
  PermissionManagerContract,
  PermissionRecord,
  PermissionStatus,
} from "./types";

const STORAGE_KEY = "permissions";

export class PermissionManager
  implements PermissionManagerContract
{
  private getRecords(): Partial<
    Record<Permission, PermissionRecord>
  > {
    return (
      storage.get<
        Partial<Record<Permission, PermissionRecord>>
      >(STORAGE_KEY) ?? {}
    );
  }

  private saveRecords(
    records: Partial<
      Record<Permission, PermissionRecord>
    >,
  ): void {
    storage.set(STORAGE_KEY, records);
  }

  getStatus(
    permission: Permission,
  ): PermissionStatus {
    const records = this.getRecords();

    return records[permission]?.status ?? "prompt";
  }

  isGranted(permission: Permission): boolean {
    return this.getStatus(permission) === "granted";
  }

  grant(permission: Permission): void {
    this.update(permission, "granted");
  }

  deny(permission: Permission): void {
    this.update(permission, "denied");
  }

  reset(permission: Permission): void {
    const records = this.getRecords();

    delete records[permission];

    this.saveRecords(records);
  }

  resetAll(): void {
    storage.remove(STORAGE_KEY);
  }

  async request(
    permission: Permission,
  ): Promise<PermissionStatus> {
    if (permission === "microphone") {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        this.deny(permission);
        return "denied";
      }

      try {
        const { voiceConfig } = await import("@/core/config/voice.config");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: voiceConfig.input.sampleRate,
            channelCount: voiceConfig.input.channels,
            echoCancellation: voiceConfig.echoCancellation,
            noiseSuppression: voiceConfig.noiseSuppression,
            autoGainControl: voiceConfig.autoGainControl,
          },
        });

        for (const track of stream.getTracks()) {
          track.stop();
        }

        this.grant(permission);
        return "granted";
      } catch {
        this.deny(permission);
        return "denied";
      }
    }

    return this.getStatus(permission);
  }

  private update(
    permission: Permission,
    status: PermissionStatus,
  ): void {
    const records = this.getRecords();

    records[permission] = {
      permission,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.saveRecords(records);
  }
}

export const permissionManager =
  new PermissionManager();