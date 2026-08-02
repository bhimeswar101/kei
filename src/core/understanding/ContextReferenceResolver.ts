import { createContextKey, ContextNamespaces } from "@/core/context";

import type { IntelligenceContext } from "@/core/intelligence";

import { ReferenceResolver } from "./ReferenceResolver";

import type { RequestReference } from "./types";

export class ContextReferenceResolver
  extends ReferenceResolver
{
  async resolve(
    context: IntelligenceContext,
    normalizedText: string,
  ): Promise<readonly RequestReference[]> {
    const references: RequestReference[] = [];

    const referenceExpressions = [
      "it",
      "that",
      "this",
      "there",
    ];

    const words: string[] =
  normalizedText
    .toLowerCase()
    .match(/\b[\w']+\b/g) ?? [];

    for (const expression of referenceExpressions) {
      if (!words.includes(expression)) {
        continue;
      }

      const resolvedValue =
        this.resolveFromContext(context);

      references.push({
        expression,
        resolvedValue,
        resolved: resolvedValue !== undefined,
      });
    }

    return references;
  }

  private resolveFromContext(
    context: IntelligenceContext,
  ): unknown {
    const activeApplicationKey =
      createContextKey(
        ContextNamespaces.APPLICATION,
        "active",
      );

    const activeApplication =
      context.context.entries.get(
        activeApplicationKey,
      );

    if (activeApplication) {
      return activeApplication.value;
    }

    const lastTargetKey =
      createContextKey(
        ContextNamespaces.EXECUTION,
        "lastTarget",
      );

    const lastTarget =
      context.context.entries.get(
        lastTargetKey,
      );

    return lastTarget?.value;
  }
}

export const contextReferenceResolver =
  new ContextReferenceResolver();