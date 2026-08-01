export function compareVersions(currentVersion: string, latestVersion: string): number {
  const current = currentVersion.split(".").map(Number);

  const latest = latestVersion.split(".").map(Number);

  const length = Math.max(current.length, latest.length);

  for (let index = 0; index < length; index++) {
    const currentPart = current[index] ?? 0;
    const latestPart = latest[index] ?? 0;

    if (currentPart < latestPart) {
      return -1;
    }

    if (currentPart > latestPart) {
      return 1;
    }
  }

  return 0;
}

export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(currentVersion, latestVersion) < 0;
}
