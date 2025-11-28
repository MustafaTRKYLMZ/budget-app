import { create } from "zustand";

export type InitialBalance = {
  amount: number;
  date: string; // "YYYY-MM-DD"
};

interface SettingsStore {
  initialBalance: InitialBalance | null;
  isLoading: boolean;
  error: string | null;
  loadInitialBalance: () => Promise<void>;
  saveInitialBalance: (payload: InitialBalance) => Promise<boolean>;
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "3001";

export const useSettingsStore = create<SettingsStore>((set) => ({
  initialBalance: null,
  isLoading: false,
  error: null,

  async loadInitialBalance() {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/settings/initial-balance`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load initial balance: ${res.status} ${text}`
        );
      }

      const data = (await res.json()) as InitialBalance | null;
      set({ initialBalance: data, isLoading: false });
    } catch (err: any) {
      console.error("loadInitialBalance error:", err);
      set({
        error: err?.message ?? "Unknown error",
        isLoading: false,
      });
    }
  },

  async saveInitialBalance(payload) {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`${API_URL}/settings/initial-balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to save initial balance: ${res.status} ${text}`
        );
      }

      const data = (await res.json()) as InitialBalance;
      set({ initialBalance: data, isLoading: false });
      return true;
    } catch (err: any) {
      console.error("saveInitialBalance error:", err);
      set({
        error: err?.message ?? "Unknown error",
        isLoading: false,
      });
      return false;
    }
  },
}));
