import { LocalTransaction, SyncStatus, TransactionDraft } from "../../types/transaction";
import { normalizeDate, toMonthFromDate } from "../../utils/date";
import dayjs from "dayjs";
import { generateFutureFixedTransactions } from "./generateFutureFixedTransactions";

/**
 * CREATE + generate future fixed series.
 */
export function createTransactionWithSeries(
  existing: LocalTransaction[],
  draft: TransactionDraft,
  now: string,
  options?: { fixedEndMonth?: string | null }
): LocalTransaction[] {
  const date = draft.date ? normalizeDate(draft.date) : dayjs().format("YYYY-MM-DD");
  const month = toMonthFromDate(date) ?? dayjs().format("YYYY-MM");
  const isFixed = !!(draft as any).isFixed;
  const planId = isFixed ? (draft as any).planId ?? Date.now().toString() : undefined;

  const baseTx: LocalTransaction = {
    ...(draft as any),
    id: draft.id ?? Date.now().toString(),
    date,
    month,
    isFixed,
    planId,
    updatedAt: now,
    deleted: false,
    syncStatus: "dirty",
  };

  let next = [...existing, baseTx];

  if (baseTx.isFixed && baseTx.planId != null) {
    const clones = generateFutureFixedTransactions(
      baseTx,
      existing,
      options?.fixedEndMonth
        ? { endMonth: options.fixedEndMonth, monthsAhead: 60 }
        : 11
    ).map((c) => ({ ...c, syncStatus: "dirty" as SyncStatus }));

    next = [...next, ...clones];
  }

  return next;
}