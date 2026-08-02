import type {
  IntelligenceContext,
} from "@/core/intelligence";

import {
  capabilityRegistry,
} from "./CapabilityRegistry";
import {
  BaseCapabilityResolver,
} from "./CapabilityResolver";

import type {
  CapabilityDefinition,
  CapabilityMatch,
  CapabilityQuery,
  CapabilityResolution,
} from "./types";

export class KeiCapabilityResolver
  extends BaseCapabilityResolver
{
  async resolve(
    _context: IntelligenceContext,
    query: CapabilityQuery,
  ): Promise<CapabilityResolution> {
    if (!query.requiresAction) {
      return {
        requestId: query.requestId,
        available: false,
        matches: [],
      };
    }

    const capabilities =
      capabilityRegistry.getAll();

    const matches = capabilities
      .filter((capability) =>
        this.supportsIntent(
          capability,
          query,
        ),
      )
      .map((capability) =>
        this.createMatch(
          capability,
          query,
        ),
      )
      .sort(
        (a, b) =>
          b.confidence - a.confidence,
      );

    const selected = matches[0];

    return {
      requestId: query.requestId,
      available: selected !== undefined,
      matches,
      selected,
    };
  }

  private supportsIntent(
    capability: CapabilityDefinition,
    query: CapabilityQuery,
  ): boolean {
    return capability.supportedIntents.includes(
      query.intent,
    );
  }

  private createMatch(
    capability: CapabilityDefinition,
    query: CapabilityQuery,
  ): CapabilityMatch {
    const normalizedText =
      query.text.toLowerCase();

    const searchableText = [
      capability.id,
      capability.name,
      capability.description,
      capability.category,
    ]
      .join(" ")
      .toLowerCase();

    const capabilityTokens =
      this.tokenize(searchableText);

    const requestTokens =
      this.tokenize(normalizedText);

    const overlap = Array.from(
      requestTokens,
    ).filter((token) =>
      capabilityTokens.has(token),
    ).length;

    const confidence =
      requestTokens.size === 0
        ? 0
        : overlap / requestTokens.size;

    return {
      capability,
      confidence,
      reason:
        "Capability supports the request intent and was ranked using request metadata.",
    };
  }

  private tokenize(
    text: string,
  ): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .match(/[a-z0-9]+/g) ?? [],
    );
  }
}

export const capabilityResolver =
  new KeiCapabilityResolver();