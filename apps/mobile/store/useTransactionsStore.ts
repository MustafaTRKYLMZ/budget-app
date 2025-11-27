// apps/mobile/store/useTransactionsStore.ts
import { create } from "zustand";
import type { Transaction } from "@budget/core";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api";

type TransactionId = Transaction["id"] extends infer T
  ? T
  : string | number;

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  loadFromApi: () => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateExisting: (tx: Transaction) => Promise<void>;
  deleteById: (id: TransactionId) => Promise<void>;
  getById: (id: string | number) => Transaction | undefined;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  async loadFromApi() {
    try {
      set({ loading: true, error: null });
      const data = await fetchTransactions();
      set({ transactions: data, loading: false });
    } catch (err) {
      console.error(err);
      set({
        loading: false,
        error: "Failed to load transactions from API.",
      });
    }
  },

  async addTransaction(tx: Transaction) {
    try {
      const created = await createTransaction(tx);
      set((state) => ({
        transactions: [...state.transactions, created],
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to create transaction." });
      throw err;
    }
  },

  async updateExisting(tx: Transaction) {
    try {
      const updated = await updateTransaction(tx);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          String(t.id) === String(updated.id) ? updated : t
        ),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to update transaction." });
      throw err;
    }
  },

  async deleteById(id: TransactionId) {
    try {
      await deleteTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter(
          (t) => String(t.id) !== String(id)
        ),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to delete transaction." });
      throw err;
    }
  },

  getById(id: string | number) {
    return get().transactions.find((t) => String(t.id) === String(id));
  },
}));
