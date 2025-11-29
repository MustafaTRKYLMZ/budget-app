
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { nanoid } from "nanoid/non-secure";

dayjs.extend(isSameOrBefore);

import {
  generateFutureFixedTransactions,
  type LocalTransaction,
} from "@budget/core";

import { useSettingsStore } from "./useSettingsStore";

export type DeleteScope = "this" | "thisAndFuture" | "all";
export type UpdateScope = "this" | "thisAndFuture" | "all";
type Transaction = LocalTransaction;

export type BalanceOnDate = {
  income: number;
  expense: number;
  balance: number;
};

type TransactionDraft = Omit<
  Transaction,
  "id" | "month" | "updatedAt" | "deleted" | "syncStatus"
> & {
  id?: string | number;
  date?: string;
};

interface TransactionsStore {
  transactions: LocalTransaction[];
  lastSyncAt: string | null;
  isHydrated: boolean;

  loadFromStorage: () => Promise<void>;

  createTransaction: (
    tx: TransactionDraft,
    options?: { fixedEndMonth?: string | null }
  ) => Promise<void>;
  updateTransactionScoped: (
    id: number | string,
    body: Partial<Transaction>,
    scope: UpdateScope,
    options?: { fixedEndMonth?: string | null }
  ) => Promise<void>;
  deleteTransactionScoped: (
    id: number | string,
    scope: DeleteScope
  ) => Promise<void>;

  getBalanceOnDate: (date: string) => BalanceOnDate;
}

const STORAGE_KEY = "transactions_v1";

const isServer = typeof window === "undefined";

const createMemoryStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: async (name: string) => {
      return store[name] ?? null;
    },
    setItem: async (name: string, value: string) => {
      store[name] = value;
    },
    removeItem: async (name: string) => {
      delete store[name];
    },
  };
};

export const useTransactionsStore = create(
  persist<TransactionsStore>(
    (set, get) => ({
      transactions: [],
      lastSyncAt: null,
      isHydrated: false,

      async loadFromStorage() {
        if (!get().isHydrated) {
          set({ isHydrated: true });
        }
      },

      async createTransaction(tx, options) {
        const now = new Date().toISOString();

        const date =
          tx.date && tx.date.length >= 10
            ? tx.date.slice(0, 10)
            : dayjs().format("YYYY-MM-DD");

        const month = date.slice(0, 7) ?? dayjs().format("YYYY-MM");

        const isFixed = !!(tx as any).isFixed;

        const planId =
          isFixed ? (tx as any).planId ?? nanoid() : undefined;

        const baseTx: LocalTransaction = {
          ...(tx as any),
          id: tx.id ?? Date.now().toString(),
          date,
          month,
          isFixed,
          planId,
          updatedAt: now,
          deleted: false,
          syncStatus: "dirty",
        };

        set((state) => {
          const existing = state.transactions;

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

          return { ...state, transactions: next };
        });
      },

      async updateTransactionScoped(
        id: number | string,
        body: Partial<Transaction>,
        scope: UpdateScope,
        options?: { fixedEndMonth?: string | null }
      ) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const idx = all.findIndex((t) => String(t.id) === String(id));
        if (idx === -1) {
          return;
        }

        const target = all[idx];

        const applyCoreFields = (
          original: LocalTransaction
        ): LocalTransaction => {
          const nextDate = body.date ?? original.date;
          const nextMonth =
            body.month ??
            (body.date ? body.date.slice(0, 7) : original.month);

          return {
            ...original,
            ...(body as any),
            date: nextDate,
            month: nextMonth,
            updatedAt: now,
            syncStatus: "dirty",
          };
        };

        const newDayFromBody =
          body.date != null ? Number(body.date.split("-")[2]) : null;

        const computeSeriesDate = (
          tx: LocalTransaction
        ): { date: string; month: string } => {
          if (!newDayFromBody || !tx.month) {
            return { date: tx.date, month: tx.month };
          }

          const [yStr, mStr] = tx.month.split("-");
          const year = Number(yStr);
          const monthIndex0 = Number(mStr) - 1;

          const lastDayOfMonth = new Date(
            year,
            monthIndex0 + 1,
            0
          ).getDate();
          const day = Math.min(newDayFromBody, lastDayOfMonth);

          const yyyy = String(year);
          const mm = String(monthIndex0 + 1).padStart(2, "0");
          const dd = String(day).padStart(2, "0");

          return {
            date: `${yyyy}-${mm}-${dd}`,
            month: `${yyyy}-${mm}`,
          };
        };

        if (!target.isFixed || target.planId == null || scope === "this") {
          const updated = applyCoreFields(target);
          const nextAll = [...all];
          nextAll[idx] = updated;
          set({ transactions: nextAll });
          return;
        }

        const planId = target.planId;
        const targetMonth = target.month;

        let updatedRows: LocalTransaction[] = all.map((tx) => {
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
                amount:
                  typeof body.amount === "number"
                    ? body.amount
                    : tx.amount,
                isFixed:
                  typeof body.isFixed === "boolean"
                    ? body.isFixed
                    : tx.isFixed,
                date: seriesDate.date,
                month: seriesDate.month,
                updatedAt: now,
                syncStatus: "dirty",
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
                typeof body.amount === "number"
                  ? body.amount
                  : tx.amount,
              isFixed:
                typeof body.isFixed === "boolean"
                  ? body.isFixed
                  : tx.isFixed,
              date: seriesDate.date,
              month: seriesDate.month,
              updatedAt: now,
              syncStatus: "dirty",
            };
          }

          return tx;
        });

        const newEndMonth = options?.fixedEndMonth ?? null;

        if (newEndMonth && target.isFixed && target.planId != null) {
          const planTxs = updatedRows.filter(
            (tx) => tx.planId === planId && !tx.deleted
          );

          if (planTxs.length > 0) {
            const currentMaxMonth = planTxs
              .map((tx) => tx.month)
              .sort()
              .at(-1)!;

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

            if (newEndMonth > currentMaxMonth) {
              const template = planTxs.find(
                (tx) => tx.month === currentMaxMonth
              ) as LocalTransaction;

              const clones: LocalTransaction[] =
                generateFutureFixedTransactions(
                  template,
                  updatedRows,
                  {
                    endMonth: newEndMonth,
                    monthsAhead: 120,
                  }
                ).map(
                  (c): LocalTransaction => ({
                    ...c,
                    syncStatus: "dirty",
                  })
                );

              updatedRows = [...updatedRows, ...clones];
            }
          }
        }

        set({ transactions: updatedRows });
      },

      async deleteTransactionScoped(id, scope) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const target = all.find((t) => String(t.id) === String(id));
        if (!target) return;

        if (!target.isFixed || target.planId == null || scope === "this") {
          const next = all.map((tx) =>
            String(tx.id) === String(id)
              ? {
                  ...tx,
                  deleted: true,
                  updatedAt: now,
                  syncStatus: "dirty",
                }
              : tx
          );
          set({ transactions: next as LocalTransaction[] });
          return;
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
                  updatedAt: now,
                  syncStatus: "dirty",
                }
              : tx
          );
        } else {
          next = all.map((tx) =>
            tx.planId === planId
              ? {
                  ...tx,
                  deleted: true,
                  updatedAt: now,
                  syncStatus: "dirty",
                }
              : tx
          );
        }

        set({ transactions: next });
      },

      getBalanceOnDate(date) {
        const target = dayjs(date);
        const { transactions } = get();
        const { initialBalance } = useSettingsStore.getState();

        let base = 0;
        let originDate: dayjs.Dayjs | null = null;

        if (initialBalance) {
          base = initialBalance.amount;
          originDate = dayjs(initialBalance.date);
        }

        const active = transactions.filter((tx) => !tx.deleted);

        const filtered = active.filter((tx) => {
          const d = dayjs(tx.date);

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
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        isServer ? createMemoryStorage() : AsyncStorage
      ),
      onRehydrateStorage: () => () => {
        useTransactionsStore.setState({ isHydrated: true });
      },
    }
  )
);
