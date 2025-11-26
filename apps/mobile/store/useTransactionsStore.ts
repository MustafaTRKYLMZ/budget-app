// apps/mobile/store/useTransactionsStore.ts
import { create } from "zustand";
import type { Transaction } from "@budget/core";

type TransactionId = Transaction["id"] extends infer T ? T : string | number;

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: TransactionId) => void;
  getById: (id: string | number) => Transaction | undefined;
}

// Basit bir demo başlangıç datası istersen:
const initialTransactions: Transaction[] = [
  {
    id: 1 as any,
    date: "2025-11-25",
    month: "2025-11",
    type: "Expense",
    item: "Market",
    category: "Food",
    isFixed: false,
    amount: 42.5,
    planId: undefined as any,
  },
];

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: initialTransactions,

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [...state.transactions, tx],
    })),

  updateTransaction: (tx) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        String(t.id) === String(tx.id) ? tx : t
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter(
        (t) => String(t.id) !== String(id)
      ),
    })),

  getById: (id) => {
    return get().transactions.find((t) => String(t.id) === String(id));
  },
}));
