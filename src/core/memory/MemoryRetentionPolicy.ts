export interface MemoryRetentionPolicyContract {
  shouldPersist(
    importance: number,
  ): boolean;
}

export class MemoryRetentionPolicy
  implements MemoryRetentionPolicyContract
{
  private static readonly DEFAULT_THRESHOLD =
    0.5;

  shouldPersist(
    importance: number,
  ): boolean {
    return (
      importance >=
      MemoryRetentionPolicy.DEFAULT_THRESHOLD
    );
  }
}

export const memoryRetentionPolicy =
  new MemoryRetentionPolicy();