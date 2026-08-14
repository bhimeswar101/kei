import type { Permission } from "@/shared/constants/permissions";

export type PermissionStatus =
  | "granted"
  | "denied"
  | "prompt";

export interface PermissionRecord {
  permission: Permission;
  status: PermissionStatus;
  updatedAt: string;
}

export interface PermissionManagerContract {
  getStatus(permission: Permission): PermissionStatus;

  isGranted(permission: Permission): boolean;

  grant(permission: Permission): void;

  deny(permission: Permission): void;

  reset(permission: Permission): void;

  resetAll(): void;

  request(permission: Permission): Promise<PermissionStatus>;
}