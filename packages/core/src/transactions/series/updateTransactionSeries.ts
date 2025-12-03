
import { Scope } from "../../types/scope";
import { LocalTransaction, SyncStatus } from "../../types/transaction";
import { normalizeDate, toMonthFromDate } from "../../utils/date";
import { generateFutureFixedTransactions } from "./generateFutureFixedTransactions";

export function updateTransactionSeries(
  all: LocalTransaction[],
  id: number | string,
  body: Partial<LocalTransaction>,
  scope: Scope,
  now: string,
  options?: { fixedEndMonth?: string | null }
): LocalTransaction[] | null {
  const idx = all.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) return null;

  const target = all[idx];

  const applyCoreFields = (original: LocalTransaction): LocalTransaction => {
    const nextDate = body.date ? normalizeDate(body.date) : original.date;
    const nextMonth =
      body.month ?? (body.date ? toMonthFromDate(body.date) : original.month);

    return {
      ...original,
      ...(body as any),
      date: nextDate,
      month: nextMonth,
      updatedAt: now,
      syncStatus: "dirty" as SyncStatus,
    };
  };

  const newDayFromBody =
    body.date != null ? Number(normalizeDate(body.date).split("-")[2]) : null;

  const computeSeriesDate = (
    tx: LocalTransaction
  ): { date: string; month: string } => {
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
  };

  // Single update (not fixed or scope="this")
  if (!target.isFixed || target.planId == null || scope === "this") {
    const nextAll = [...all];
    nextAll[idx] = applyCoreFields(target);
    return nextAll;
  }

  // Series update
  const planId = target.planId;
  const targetMonth = target.month;

  let updatedRows = all.map((tx) => {
    if (tx.id === target.id) {
      return applyCoreFields(tx);
    }

    if (scope === "thisAndFuture") {
      if (tx.planId === planId && tx.month > targetMonth) {
        const seriesDate = computeSeriesDate(tx);

        return {
          ...tx,
          type: body.type ?? tx.type,
          item: body.item ?? tx.item,
          category: body.category ?? tx.category,
          amount: typeof body.amount === "number" ? body.amount : tx.amount,
          isFixed:
            typeof body.isFixed === "boolean" ? body.isFixed : tx.isFixed,
          date: seriesDate.date,
          month: seriesDate.month,
          updatedAt: now,
          syncStatus: "dirty" as SyncStatus,
        };
      }
      return tx;
    }

    if (scope === "all" && tx.planId === planId) {
      const seriesDate = computeSeriesDate(tx);

      return {
        ...tx,
        type: body.type ?? tx.type,
        item: body.item ?? tx.item,
        category: body.category ?? tx.category,
        amount:
          typeof body.amount === "number" ? body.amount : tx.amount,
        isFixed:
          typeof body.isFixed === "boolean" ? body.isFixed : tx.isFixed,
        date: seriesDate.date,
        month: seriesDate.month,
        updatedAt: now,
        syncStatus: "dirty" as SyncStatus,
      };
    }

    return tx;
  });

  // Handle fixedEndMonth expansion/reduction
  const newEndMonth = options?.fixedEndMonth ?? null;

  if (newEndMonth && target.isFixed && target.planId != null) {
    const planTxs = updatedRows.filter(
      (tx) => tx.planId === planId && !tx.deleted
    );

    if (planTxs.length > 0) {
      const sortedMonths = planTxs.map((tx) => tx.month).sort();
      const currentMaxMonth = sortedMonths[sortedMonths.length - 1]!;

      // Reduce
      if (newEndMonth < currentMaxMonth) {
        updatedRows = updatedRows.map((tx) =>
          tx.planId === planId && tx.month > newEndMonth
            ? {
                ...tx,
                deleted: true,
                updatedAt: now,
                syncStatus: "dirty",
              }
            : tx
        );
      }

      // Expand
      if (newEndMonth > currentMaxMonth) {
        const template = planTxs.find(
          (tx) => tx.month === currentMaxMonth
        ) as LocalTransaction;

        const clones = generateFutureFixedTransactions(
          template,
          updatedRows,
          { endMonth: newEndMonth, monthsAhead: 120 }
        ).map((c) => ({ ...c, syncStatus: "dirty" as SyncStatus }));

        updatedRows = [...updatedRows, ...clones];
      }
    }
  }

  return updatedRows;
}
