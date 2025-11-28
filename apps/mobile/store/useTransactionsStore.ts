// apps/mobile/store/useTransactionsStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

import type { Transaction } from "@budget/core";
import type { LocalTransaction } from "../types";
import { useSettingsStore } from "./useSettingsStore";

export type DeleteScope = "this" | "thisAndFuture" | "all";
export type UpdateScope = "this" | "thisAndFuture" | "all";

export type BalanceOnDate = {
  income: number;
  expense: number;
  balance: number;
};

interface TransactionsStore {
  transactions: LocalTransaction[];
  lastSyncAt: string | null;
  isHydrated: boolean;

  loadFromStorage: () => Promise<void>;

  createTransaction: (tx: Transaction) => Promise<void>;
  updateTransactionScoped: (
    id: number | string,
    body: Transaction,
    scope: UpdateScope
  ) => Promise<void>;
  deleteTransactionScoped: (
    id: number | string,
    scope: DeleteScope
  ) => Promise<void>;

  getBalanceOnDate: (date: string) => BalanceOnDate;
}

const STORAGE_KEY = "transactions_v1";

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

      async createTransaction(tx) {
        const now = new Date().toISOString();

        const date =
          tx.date && tx.date.length >= 10
            ? tx.date.slice(0, 10)
            : dayjs().format("YYYY-MM-DD");

        const month = date.slice(0, 7) ?? dayjs().format("YYYY-MM");

        const newTx: LocalTransaction = {
          ...(tx as any),
          id: tx.id ?? Date.now().toString(),
          date,
          month,
          updatedAt: now,
          deleted: false,
          syncStatus: "dirty" as "dirty",
        };

        set((state) => ({
          transactions: [...state.transactions, newTx],
        }));
      },

      async updateTransactionScoped(id, body, scope) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const idx = all.findIndex((t) => String(t.id) === String(id));
        if (idx === -1) {
          return;
        }

        const target = all[idx];

        const applyCoreFields = (original: LocalTransaction): LocalTransaction => {
          const nextDate = body.date ?? original.date;
          const nextMonth =
            body.month ??
            (body.date
              ? body.date.slice(0, 7)
              : original.month);

          return {
            ...original,
            ...(body as any),
            date: nextDate,
            month: nextMonth,
            updatedAt: now,
            syncStatus: "dirty",
          };
        };

        // Non-fixed or no planId or scope === "this" → only update this row
        if (!target.isFixed || target.planId == null || scope === "this") {
          const updated = applyCoreFields(target);
          const nextAll = [...all];
          nextAll[idx] = updated;
          set({ transactions: nextAll });
          return;
        }

        const planId = target.planId;
        const targetMonth = target.month;

        const updatedRows: LocalTransaction[] = all.map((tx) => {
          // Always update the target itself with full body
          if (tx.id === target.id) {
            return applyCoreFields(tx);
          }

          if (scope === "thisAndFuture") {
            // Same plan and strictly after target month
            if (tx.planId === planId && tx.month > targetMonth) {
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
                updatedAt: now,
                syncStatus: "dirty",
              };
            }
            return tx;
          }

          // scope === "all"
          if (scope === "all" && tx.planId === planId) {
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
              updatedAt: now,
              syncStatus: "dirty",
            };
          }

          return tx;
        });

        set({ transactions: updatedRows });
      },

      async deleteTransactionScoped(id, scope) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const target = all.find((t) => String(t.id) === String(id));
        if (!target) return;

        // Non-fixed or no planId or scope === "this" → mark only this row as deleted
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
          // Mark this and all future months in the same plan as deleted
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
          // scope === "all": mark all rows in this plan as deleted
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

        // ignore deleted in calculations
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
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useTransactionsStore.setState({ isHydrated: true });
      },
    }
  )
);
