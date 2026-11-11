export function createId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `aether-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function upsertById<T extends { id: string }>(
  items: T[],
  item: T
): T[] {
  const existingIndex = items.findIndex((existing) => existing.id === item.id);

  if (existingIndex === -1) {
    return [item, ...items];
  }

  return items.map((existing) =>
    existing.id === item.id ? item : existing
  );
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}