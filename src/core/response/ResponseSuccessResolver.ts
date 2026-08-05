import type { ResponseStrategy } from "./types";

export interface ResponseSuccessResolverContract {
  resolve(strategy: ResponseStrategy): boolean;
}

export class ResponseSuccessResolver implements ResponseSuccessResolverContract {
  resolve(strategy: ResponseStrategy): boolean {
    switch (strategy) {
      case "conversation":
      case "execution-success":
        return true;

      case "clarification":
      case "execution-failure":
      case "rejection":
      case "unsupported":
      case "cancelled":
      case "deferred":
        return false;
    }
  }
}

export const responseSuccessResolver = new ResponseSuccessResolver();
