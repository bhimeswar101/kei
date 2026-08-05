import { describe, expect, it } from "vitest";

import { intelligenceEngine } from "@/core/intelligence";

describe("Intelligence test infrastructure", () => {
  it("resolves the Kei intelligence engine through the application alias", () => {
    expect(intelligenceEngine).toBeDefined();

    expect(typeof intelligenceEngine.process).toBe("function");

    expect(intelligenceEngine.isProcessing()).toBe(false);
  });
});
