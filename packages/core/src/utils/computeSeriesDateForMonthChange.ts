import { LocalTransaction } from "../types/transaction";

export function computeSeriesDateForMonthChange(
    tx: LocalTransaction,
    newDayFromBody: number | null
  ): { date: string; month: string } {
    if (!newDayFromBody || !tx.month) {
      return { date: tx.date, month: tx.month };
    }
  
    const [yStr, mStr] = tx.month.split("-");
    const year = Number(yStr);
    const monthIndex0 = Number(mStr) - 1;
  
    const lastDayOfMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const day = Math.min(newDayFromBody, lastDayOfMonth);
  
    const yyyy = String(year);
    const mm = String(monthIndex0 + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
  
    return {
      date: `${yyyy}-${mm}-${dd}`,
      month: `${yyyy}-${mm}`,
    };
  }
  