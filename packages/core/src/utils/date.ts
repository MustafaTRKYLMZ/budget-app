import dayjs from "dayjs";

/**
 * Normalize input into "YYYY-MM-DD".
 */
export function normalizeDate(input: string): string {
  if (!input) return dayjs().format("YYYY-MM-DD");

  // Already normalized
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const d = dayjs(input);
  if (!d.isValid()) return dayjs().format("YYYY-MM-DD");

  return d.format("YYYY-MM-DD");
}

/**
 * Return "YYYY-MM" from a "YYYY-MM-DD" date string.
 */
export function toMonthFromDate(
  date: string | null | undefined
): string | null {
  if (!date) return null;

  const normalized = normalizeDate(date);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;

  return normalized.slice(0, 7);
}
