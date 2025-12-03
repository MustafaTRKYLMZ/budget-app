import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { LocalTransaction } from "../types/transaction";
import { BalanceOnDate, InitialBalance } from "../types/balance";
dayjs.extend(isSameOrBefore);

/**
 * Computes the balance up to a given date.
 * Matches the original logic from the mobile store.
 */
export function computeBalanceOnDate(
  transactions: LocalTransaction[],
  date: string,
  initialBalance?: InitialBalance | null
): BalanceOnDate {
  const target = dayjs(date);

  let base = 0;
  let originDate: dayjs.Dayjs | null = null;

  if (initialBalance) {
    base = initialBalance.amount;
    originDate = dayjs(initialBalance.date);
  }

  // Non-deleted transactions
  const active = transactions.filter((tx) => !tx.deleted);

  const filtered = active.filter((tx) => {
    const d = dayjs(tx.date);

    // Ignore anything before the initial balance origin date
    if (originDate && d.isBefore(originDate, "day")) {
      return false;
    }

    return d.isSameOrBefore(target, "day");
  });

  const income = filtered
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = filtered
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    income,
    expense,
    balance: base + income - expense,
  };
}
