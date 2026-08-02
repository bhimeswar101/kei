export class RequestNormalizer {
  normalize(text: string): string {
    return text.trim().replace(/\s+/g, " ");
  }
}

export const requestNormalizer = new RequestNormalizer();
