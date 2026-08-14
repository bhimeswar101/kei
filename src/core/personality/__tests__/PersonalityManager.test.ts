import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { personalityManager } from "../PersonalityManager";
import { eventBus } from "@/core/events";
import { EVENTS } from "@/shared/constants/events";

describe("PersonalityManager", () => {
  beforeEach(() => {
    // Reset emotional state and preferences before each test
    personalityManager.setUserPreferences({});
    try {
      personalityManager.setEmotion("neutral");
    } catch {
      // Ignore transition checks if starting clean
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers initial baseline states correctly", () => {
    expect(personalityManager.getEmotion()).toBe("neutral");
    expect(personalityManager.getPersonaConfig().name).toBe("Kei");
  });

  it("handles valid transitions and blocks invalid ones", () => {
    personalityManager.setEmotion("focused");
    expect(personalityManager.getEmotion()).toBe("focused");

    personalityManager.setEmotion("happy");
    expect(personalityManager.getEmotion()).toBe("happy");

    expect(() => personalityManager.setEmotion("concerned")).toThrow();
  });

  it("constructs authoritative system prompts with user preferences", () => {
    personalityManager.setUserPreferences({
      username: "Alice",
      brevity: "brief",
      formattingStyle: "none",
    });

    const prompt = personalityManager.buildSystemPrompt("Test Request");
    expect(prompt).toContain("Kei");
    expect(prompt).toContain("Alice");
    expect(prompt).toContain("extremely brief");
    expect(prompt).toContain("Do not use markdown format");
    expect(prompt).toContain("Test Request");
  });

  it("sanitizes username input to block injection payloads", () => {
    personalityManager.setUserPreferences({
      username: "Alice; drop tables --",
    });
    expect(personalityManager.getUserPreferences().username).toBe("Alice drop tables --");
  });

  it("responds to agent events on the EventBus", async () => {
    personalityManager.setEmotion("neutral");

    await eventBus.emit(EVENTS.AGENT_STARTED, { taskId: "123" });
    expect(personalityManager.getEmotion()).toBe("focused");

    await eventBus.emit(EVENTS.AGENT_COMPLETED, { taskId: "123" });
    expect(personalityManager.getEmotion()).toBe("happy");
  });
});
