// packages/core/src/transactions/series.ts

import dayjs from "dayjs";
import { nanoid } from "nanoid/non-secure";

import { generateFutureFixedTransactions } from "../utils/generateFutureFixedTransactions";
import { LocalTransaction, TransactionDraft } from "../types/transaction";
import { Scope } from "../types/scope";
import { computeSeriesDateForMonthChange } from "../utils/computeSeriesDateForMonthChange";

export const normalizeDate = (date: string): string => {
  if (!date) return date;
  return date.length >= 10 ? date.slice(0, 10) : date;
};

export const toMonthFromDate = (date: string): string => {
  const d = normalizeDate(date);
  return d.slice(0, 7);
};


// -----------------------------------------------------
// CREATE + series generation
// -----------------------------------------------------

export function createTransactionWithSeries(
  existing: LocalTransaction[],
  draft: TransactionDraft,
  nowISO: string,
  options?: { fixedEndMonth?: string | null }
): LocalTransaction[] {
  const date = draft.date
    ? normalizeDate(draft.date)
    : dayjs().format("YYYY-MM-DD");

  const month = toMonthFromDate(date) || dayjs().format("YYYY-MM");

  const isFixed = !!(draft as any).isFixed;
  const planId = isFixed ? (draft as any).planId ?? nanoid() : undefined;

  const baseTx: LocalTransaction = {
    ...(draft as any),
    id: draft.id ?? Date.now().toString(),
    date,
    month,
    isFixed,
    planId,
    updatedAt: nowISO,
    deleted: false,
    syncStatus: "dirty",
  };

  let next: LocalTransaction[] = [...existing, baseTx];

  if (baseTx.isFixed && baseTx.planId != null) {
    const clones = generateFutureFixedTransactions(
      baseTx,
      existing,
      options?.fixedEndMonth
        ? {
            endMonth: options.fixedEndMonth,
            monthsAhead: 60,
          }
        : 11
    );

    const clonesWithSyncStatus: LocalTransaction[] = clones.map(
      (c): LocalTransaction => ({
        ...c,
        syncStatus: "dirty",
      })
    );

    next = [...next, ...clonesWithSyncStatus];
  }

  return next;
}

// -----------------------------------------------------
// UPDATE (scoped, series logic)
// -----------------------------------------------------

export function updateTransactionSeries(
  all: LocalTransaction[],
  id: number | string,
  body: Partial<LocalTransaction>,
  scope: Scope,
  nowISO: string,
  options?: { fixedEndMonth?: string | null }
): LocalTransaction[] | null {
  const idx = all.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) {
    return null;
  }

  const target = all[idx];

  const applyCoreFields = (original: LocalTransaction): LocalTransaction => {
    const nextDate = body.date ? normalizeDate(body.date) : original.date;

    const nextMonth =
      body.month ??
      (body.date ? toMonthFromDate(body.date) : original.month);

    return {
      ...original,
      ...(body as any),
      date: nextDate,
      month: nextMonth,
      updatedAt: nowISO,
      syncStatus: "dirty",
    };
  };

  const newDayFromBody =
    body.date != null ? Number(normalizeDate(body.date).split("-")[2]) : null;

  // Non-fixed, non-plan-based, or "this" scope only updates a single row.
  if (!target.isFixed || target.planId == null || scope === "this") {
    const updated = applyCoreFields(target);
    const nextAll = [...all];
    nextAll[idx] = updated;
    return nextAll;
  }

  const planId = target.planId;
  const targetMonth = target.month;

  let updatedRows: LocalTransaction[] = all.map((tx) => {
    if (tx.id === target.id) {
      return applyCoreFields(tx);
    }

    if (scope === "thisAndFuture") {
      if (tx.planId === planId && tx.month > targetMonth) {
        const seriesDate = computeSeriesDateForMonthChange(
          tx,
          newDayFromBody
        );
        return patchSeriesTx(tx, body, seriesDate, nowISO);
      }
      return tx;
    }

    if (scope === "all" && tx.planId === planId) {
      const seriesDate = computeSeriesDateForMonthChange(tx, newDayFromBody);
      return patchSeriesTx(tx, body, seriesDate, nowISO);
    }

    return tx;
  });

  const newEndMonth = options?.fixedEndMonth ?? null;

  // Handle extending or shrinking the fixed series based on newEndMonth
  if (newEndMonth && target.isFixed && target.planId != null) {
    const planTxs = updatedRows.filter(
      (tx) => tx.planId === planId && !tx.deleted
    );

    if (planTxs.length > 0) {
      const currentMaxMonth = planTxs
        .map((tx) => tx.month)
        .sort()
        [planTxs.map((tx) => tx.month).length - 1];

      // If newEndMonth is before the current max, soft-delete months after it
      if (newEndMonth < currentMaxMonth) {
        updatedRows = updatedRows.map((tx) =>
          tx.planId === planId && tx.month > newEndMonth
            ? {
                ...tx,
                deleted: true,
                updatedAt: nowISO,
                syncStatus: "dirty",
              }
            : tx
        );
      }

      // If newEndMonth is after the current max, generate new clones
      if (newEndMonth > currentMaxMonth) {
        const template = planTxs.find(
          (tx) => tx.month === currentMaxMonth
        ) as LocalTransaction;

        const clones: LocalTransaction[] =
          generateFutureFixedTransactions(template, updatedRows, {
            endMonth: newEndMonth,
            monthsAhead: 120,
          }).map(
            (c): LocalTransaction => ({
              ...c,
              syncStatus: "dirty",
            })
          );

        updatedRows = [...updatedRows, ...clones];
      }
    }
  }

  return updatedRows;
}

function patchSeriesTx(
  tx: LocalTransaction,
  body: Partial<LocalTransaction>,
  seriesDate: { date: string; month: string },
  nowISO: string
): LocalTransaction {
  return {
    ...tx,
    type: body.type ?? tx.type,
    item: body.item ?? tx.item,
    category: body.category ?? tx.category,
    amount:
      typeof body.amount === "number" ? body.amount : tx.amount,
    isFixed:
      typeof body.isFixed === "boolean"
        ? body.isFixed
        : tx.isFixed,
    date: seriesDate.date,
    month: seriesDate.month,
    updatedAt: nowISO,
    syncStatus: "dirty",
  };
}

// -----------------------------------------------------
// DELETE (scoped, series logic)
// -----------------------------------------------------

export function deleteTransactionSeries(
  all: LocalTransaction[],
  id: number | string,
  scope: Scope,
  nowISO: string
): LocalTransaction[] | null {
  const target = all.find((t) => String(t.id) === String(id));
  if (!target) return null;

  // Non-fixed, non-plan-based, or "this" scope only deletes a single row.
  if (!target.isFixed || target.planId == null || scope === "this") {
    const next = all.map((tx) =>
      String(tx.id) === String(id)
        ? {
            ...tx,
            deleted: true,
            updatedAt: nowISO,
            syncStatus: "dirty",
          }
        : tx
    );
    return next as LocalTransaction[];
  }

  const planId = target.planId;
  const targetMonth = target.month;

  let next: LocalTransaction[];

  if (scope === "thisAndFuture") {
    next = all.map((tx) =>
      tx.planId === planId && tx.month >= targetMonth
        ? {
            ...tx,
            deleted: true,
            updatedAt: nowISO,
            syncStatus: "dirty",
          }
        : tx
    );
  } else {
    // scope === "all"
    next = all.map((tx) =>
      tx.planId === planId
        ? {
            ...tx,
            deleted: true,
            updatedAt: nowISO,
            syncStatus: "dirty",
          }
        : tx
    );
  }

  return next;
}
