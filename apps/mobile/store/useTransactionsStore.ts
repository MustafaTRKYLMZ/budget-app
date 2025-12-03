// apps/mobile/store/useTransactionsStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  createTransactionWithSeries,
  updateTransactionSeries,
  deleteTransactionSeries,
  type LocalTransaction,
  type BalanceOnDate,
  type TransactionDraft,
  Scope,
  computeBalanceOnDate,
} from "@budget/core";

import { useSettingsStore } from "./useSettingsStore";
import { getZustandStorage } from "./store";

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
    body: Partial<LocalTransaction>,
    scope: Scope,
    options?: { fixedEndMonth?: string | null }
  ) => Promise<void>;

  deleteTransactionScoped: (
    id: number | string,
    scope: Scope
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

      async createTransaction(
        tx: TransactionDraft,
        options?: { fixedEndMonth?: string | null }
      ) {
        const now = new Date().toISOString();

        set((state) => ({
          ...state,
          transactions: createTransactionWithSeries(
            state.transactions,
            tx,
            now,
            options
          ),
        }));
      },

      async updateTransactionScoped(
        id: number | string,
        body: Partial<LocalTransaction>,
        scope: Scope,
        options?: { fixedEndMonth?: string | null }
      ) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const updated = updateTransactionSeries(
          all,
          id,
          body,
          scope,
          now,
          options
        );
        if (!updated) return;

        set({ transactions: updated });
      },

      async deleteTransactionScoped(
        id: number | string,
        scope: Scope
      ) {
        const now = new Date().toISOString();
        const all = get().transactions;

        const updated = deleteTransactionSeries(all, id, scope, now);
        if (!updated) return;

        set({ transactions: updated });
      },

      getBalanceOnDate(date: string): BalanceOnDate {
        const { transactions } = get();
        const { initialBalance } = useSettingsStore.getState();

        return computeBalanceOnDate(transactions, date, initialBalance);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => getZustandStorage()),
      onRehydrateStorage: () => () => {
        useTransactionsStore.setState({ isHydrated: true });
      },
    }
  )
);
