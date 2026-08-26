export type SourceCheckFrequency = "daily" | "weekly" | "manual";

export function isPdfSourceUrl(url: string) {
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

export function nextSourceCheckAt(checkFrequency: SourceCheckFrequency, checkedAt: Date) {
  if (checkFrequency === "manual") return null;
  const days = checkFrequency === "weekly" ? 7 : 1;
  return new Date(checkedAt.getTime() + days * 24 * 60 * 60 * 1_000).toISOString();
}
