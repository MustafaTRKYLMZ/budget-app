// apps/mobile/store/useSettingsStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type InitialBalance = {
  amount: number;
  date: string; // "YYYY-MM-DD"
  updatedAt?: string; // optional, useful if you later sync settings
};

interface SettingsStore {
  initialBalance: InitialBalance | null;
  isLoading: boolean;
  isHydrated: boolean;

  // called by screens (e.g. SettingsScreen useEffect)
  loadInitialBalance: () => Promise<void>;
  saveInitialBalance: (payload: {
    amount: number;
    date: string;
  }) => Promise<boolean>;
}

const STORAGE_KEY = "settings_v1";

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
// ------------------------------------------------------------------------

export const useSettingsStore = create(
  persist<SettingsStore>(
    (set, get) => ({
      initialBalance: null,
      isLoading: false,
      isHydrated: false,

      async loadInitialBalance() {
        // With Zustand persist, state is already rehydrated from storage.
        const { isHydrated } = get();

        if (!isHydrated) {
          set({ isLoading: true });
          // Rehydration bittikten sonra onRehydrateStorage flag'i set edecek.
          set({ isLoading: false, isHydrated: true });
          return;
        }

        // Already hydrated, simply ensure loading is false.
        set({ isLoading: false });
      },

      async saveInitialBalance(payload) {
        try {
          set({ isLoading: true });

          const now = new Date().toISOString();

          const normalizedDate =
            payload.date && payload.date.length >= 10
              ? payload.date.slice(0, 10)
              : payload.date;

          const next: InitialBalance = {
            amount: payload.amount,
            date: normalizedDate,
            updatedAt: now,
          };

          set({ initialBalance: next, isLoading: false });

          return true;
        } catch (e) {
          console.log("[useSettingsStore] saveInitialBalance error:", e);
          set({ isLoading: false });
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        isServer ? createMemoryStorage() : AsyncStorage
      ),
      onRehydrateStorage: () => (state) => {
        // When rehydration completes, mark the store as hydrated.
        if (state) {
          state.isHydrated = true;
          state.isLoading = false;
        }
      },
    }
  )
);
