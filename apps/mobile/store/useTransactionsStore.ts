import { create } from "zustand";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
import type { Transaction } from "@budget/core";
import { useSettingsStore } from "./useSettingsStore";

export type DeleteScope = "this" | "thisAndFuture" | "all";
export type UpdateScope = "this" | "thisAndFuture" | "all";

export type BalanceOnDate = {
  income: number;
  expense: number;
  balance: number;
};

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "3001";

interface TransactionsStore {
  transactions: Transaction[];
  loadFromApi: () => Promise<void>;
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

  // 🔥 yeni ekledik
  getBalanceOnDate: (date: string) => BalanceOnDate;
}

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  transactions: [],

  async loadFromApi() {
    const res = await fetch(`${API_URL}/transactions`);
    if (!res.ok) return;
    const data = (await res.json()) as Transaction[];
    set({ transactions: data });
  },

  async createTransaction(tx) {
    await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
    await get().loadFromApi();
  },

  async updateTransactionScoped(id, body, scope) {
    await fetch(`${API_URL}/transactions/${id}?scope=${scope}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await get().loadFromApi();
  },

  async deleteTransactionScoped(id, scope) {
    await fetch(`${API_URL}/transactions/${id}?scope=${scope}`, {
      method: "DELETE",
    });
    await get().loadFromApi();
  },

  // 🔥 asıl sihir burada
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

    const filtered = transactions.filter((tx) => {
      const d = dayjs((tx as any).date);

      // opening date'ten önceki işlemler dahil olmasın
      if (originDate && d.isBefore(originDate, "day")) {
        return false;
      }

      return d.isSameOrBefore(target, "day");
    });

    const income = filtered
    .filter((tx) => (tx as any).type === "Income")
    .reduce((sum, tx) => sum + (tx as any).amount, 0);
  
  const expense = filtered
    .filter((tx) => (tx as any).type === "Expense")
    .reduce((sum, tx) => sum + (tx as any).amount, 0);

    return {
      income,
      expense,
      balance: base + income - expense,
    };
  },
}));
