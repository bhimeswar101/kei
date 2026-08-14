export interface MemoryImportanceScorerContract {
  score(
    userMessage: string,
    assistantMessage: string,
  ): number;
}

export class MemoryImportanceScorer
  implements MemoryImportanceScorerContract
{
  score(
    userMessage: string,
    assistantMessage: string,
  ): number {
    let score = 0;

    if (userMessage.length > 50) {
      score += 0.2;
    }

    if (assistantMessage.length > 100) {
      score += 0.2;
    }

    if (
      userMessage.includes("?") ||
      assistantMessage.includes("?")
    ) {
      score += 0.2;
    }

    const preferencePattern =
      /\b(prefer|favorite|always|never)\b/i;

    if (
      preferencePattern.test(userMessage) ||
      preferencePattern.test(assistantMessage)
    ) {
      score += 0.25;
    }

    const planningPattern =
      /\b(build|project|roadmap|implement|phase)\b/i;

    if (
      planningPattern.test(userMessage) ||
      planningPattern.test(assistantMessage)
    ) {
      score += 0.25;
    }

    return Math.min(score, 1);
  }
}

export const memoryImportanceScorer =
  new MemoryImportanceScorer();