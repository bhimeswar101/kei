import type {
  DesktopHostApiContract,
} from "./DesktopHostApi";

declare global {
  interface Window {
    keiNative?: DesktopHostApiContract;
  }
}

export {};