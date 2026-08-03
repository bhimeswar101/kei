import type {
  KeiDevHarness,
} from "./KeiDevHarness";

declare global {
  interface Window {
    keiDev?: KeiDevHarness;
  }
}

export {};
