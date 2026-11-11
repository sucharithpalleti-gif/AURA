export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function addDays(dateKey: string, amount: number): string {
  const date = parseDateKey(dateKey);

  if (!date) {
    return getTodayKey();
  }

  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function getLastNDays(
  count: number,
  endDate: string = getTodayKey()
): string[] {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) =>
    addDays(endDate, index - count + 1)
  );
}

export function formatDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = parseDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...options
  }).format(date);
}

export function formatLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function getMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function getMonthLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function getCurrentStreak(
  completedDates: string[],
  today: string = getTodayKey()
): number {
  const completed = new Set(completedDates);
  let cursor = completed.has(today) ? today : addDays(today, -1);

  if (!completed.has(cursor)) {
    return 0;
  }

  let streak = 0;

  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount);
}