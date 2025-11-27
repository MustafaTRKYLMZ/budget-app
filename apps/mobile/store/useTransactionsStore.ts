import { create } from "zustand";
import type { Transaction } from "@budget/core";

export type DeleteScope = "this" | "thisAndFuture" | "all";
export type UpdateScope = "this" | "thisAndFuture" | "all";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "http://192.168.2.33:3001";

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
}));
