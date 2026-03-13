export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalMidnightISO(date: Date = new Date()): string {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

export function isNewDay(lastDate: string | null | undefined): boolean {
  if (!lastDate) return true;
  return getLocalDateString() !== lastDate;
}

export function isMidnightExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date().getTime() >= new Date(expiresAt).getTime();
}

export function diffCalendarDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 86_400_000),
  );
}
