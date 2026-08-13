export function todayDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function yesterdayDate(now = new Date()): string {
  const copy = new Date(now);
  copy.setDate(copy.getDate() - 1);
  return todayDate(copy);
}

export function isoNow(now = new Date()): string {
  return now.toISOString();
}

export function addDaysIso(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function daysBetween(fromIso: string, nowMs = Date.now()): number {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) {
    return 0;
  }
  return Math.floor((nowMs - from) / 86_400_000);
}
