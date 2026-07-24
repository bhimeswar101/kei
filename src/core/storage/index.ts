import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { Storage } from "./Storage";

export * from "./LocalStorageAdapter";
export * from "./Storage";
export * from "./types";

export const storage = new Storage(
  new LocalStorageAdapter(),
);