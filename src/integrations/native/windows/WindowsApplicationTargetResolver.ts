export interface WindowsApplicationTarget {
  readonly id: string;

  readonly displayName: string;

  readonly launchTarget: string;
}

export class WindowsApplicationTargetResolver {
  private readonly targets =
    new Map<string, WindowsApplicationTarget>();

  constructor() {
    this.registerDefaults();
  }

  resolve(
    target: string,
  ): WindowsApplicationTarget | undefined {
    const normalized =
      this.normalize(target);

    return this.targets.get(normalized);
  }

  has(
    target: string,
  ): boolean {
    return (
      this.resolve(target) !== undefined
    );
  }

  getAll():
    readonly WindowsApplicationTarget[] {
    return Array.from(
      this.targets.values(),
    );
  }

  private register(
    aliases: readonly string[],
    target: WindowsApplicationTarget,
  ): void {
    for (const alias of aliases) {
      this.targets.set(
        this.normalize(alias),
        target,
      );
    }
  }

  private registerDefaults(): void {
    this.register(
      [
        "spotify",
      ],
      {
        id: "spotify",
        displayName: "Spotify",
        launchTarget: "spotify",
      },
    );

    this.register(
      [
        "chrome",
        "google chrome",
      ],
      {
        id: "google-chrome",
        displayName: "Google Chrome",
        launchTarget: "chrome",
      },
    );

    this.register(
      [
        "notepad",
      ],
      {
        id: "notepad",
        displayName: "Notepad",
        launchTarget: "notepad",
      },
    );

    this.register(
      [
        "calculator",
        "calc",
      ],
      {
        id: "calculator",
        displayName: "Calculator",
        launchTarget: "calculator",
      },
    );
  }

  private normalize(
    value: string,
  ): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }
}

export const windowsApplicationTargetResolver =
  new WindowsApplicationTargetResolver();
  