import { LocalTransaction } from "../types/transaction";

type GenerateFutureOptions =
  | number
  | {
      monthsAhead?: number;
      endMonth?: string | null; // "YYYY-MM", inclusive
    };

export const generateFutureFixedTransactions = (
  template: LocalTransaction,
  existing: LocalTransaction[],
  options: GenerateFutureOptions = 11
): LocalTransaction[] => {
  const result: LocalTransaction[] = [];

  if (!template.date || !template.month) return result;

  // Normalize options
  let monthsAhead: number;
  let endMonth: string | null | undefined;

  if (typeof options === "number") {
    monthsAhead = options;
    endMonth = null;
  } else {
    monthsAhead = options.monthsAhead ?? 11;
    endMonth = options.endMonth ?? null;
  }

  const [yStr, mStr, dStr] = template.date.split("-");
  const baseYear = Number(yStr);
  const baseMonthIndex0 = Number(mStr) - 1; // 0-based
  const baseDay = Number(dStr);

  const nowIso = new Date().toISOString();

  for (let i = 1; i <= monthsAhead; i++) {
    const totalMonths = baseYear * 12 + baseMonthIndex0 + i;
    const year = Math.floor(totalMonths / 12);
    const monthIndex0 = totalMonths % 12;
    const month = monthIndex0 + 1;

    const lastDayOfMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const day = Math.min(baseDay, lastDayOfMonth);

    const yyyy = String(year);
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    const dateStr = `${yyyy}-${mm}-${dd}`;
    const monthStr = `${yyyy}-${mm}`;

    // Check endMonth limit
    if (endMonth && monthStr > endMonth) {
      break;
    }

    const exists = existing.some(
      (t) => t.isFixed && t.planId === template.planId && t.month === monthStr
    );

    if (exists) continue;

    result.push({
      ...template,
      id: Date.now() + Math.random(),
      date: dateStr,
      month: monthStr,
      updatedAt: nowIso,
      deleted: false,
    });
  }

  return result;
};
