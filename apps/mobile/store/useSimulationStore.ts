// apps/mobile/store/useSimulationStore.ts
import { create } from "zustand";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";

import {
  useTransactionsStore,
  type BalanceOnDate,
} from "./useTransactionsStore";

const STORAGE_KEY = "simulationStore_v1";

export type SimulationItemType = "Income" | "Expense";

export type SimulationItem = {
  id: string;
  type: SimulationItemType;
  item: string;
  category?: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
};

export type SimulationScenario = {
  id: string;
  name: string;
  createdAt: string;
  items: SimulationItem[];
};

interface SimulationStore {
  scenarios: SimulationScenario[];
  activeScenarioId: string | null;

  // kalıcılık
  loadFromStorage: () => Promise<void>;

  // scenario yönetimi
  addScenario: (name: string) => void;
  renameScenario: (id: string, name: string) => void;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string | null) => void;

  // helper
  getActiveScenario: () => SimulationScenario | null;

  // item yönetimi (aktif senaryo)
  addItemToActive: (payload: Omit<SimulationItem, "id">) => void;
  removeItemFromActive: (itemId: string) => void;
  clearActiveItems: () => void;

  // hesaplama
  getBalanceOnDateWithSimulation: (date: string) => BalanceOnDate;
}

// sadece scenarios + activeScenarioId'yi saklayacağız
async function persistState(partial: {
  scenarios: SimulationScenario[];
  activeScenarioId: string | null;
}) {
  try {
    const json = JSON.stringify(partial);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.log("Failed to persist simulation store", e);
  }
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenarios: [],
  activeScenarioId: null,

  async loadFromStorage() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        scenarios?: SimulationScenario[];
        activeScenarioId?: string | null;
      };

      set({
        scenarios: parsed.scenarios ?? [],
        activeScenarioId: parsed.activeScenarioId ?? null,
      });
    } catch (e) {
      console.log("Failed to load simulation store", e);
    }
  },

  addScenario(name) {
    const id = nanoid();
    const scenario: SimulationScenario = {
      id,
      name,
      createdAt: dayjs().toISOString(),
      items: [],
    };

    set((state) => {
      const next = {
        ...state,
        scenarios: [...state.scenarios, scenario],
        activeScenarioId: state.activeScenarioId ?? id,
      };
      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  renameScenario(id, name) {
    set((state) => {
      const next = {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === id ? { ...s, name } : s
        ),
      };
      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  deleteScenario(id) {
    set((state) => {
      const filtered = state.scenarios.filter((s) => s.id !== id);
      const wasActive = state.activeScenarioId === id;

      const next: SimulationStore = {
        ...state,
        scenarios: filtered,
        activeScenarioId: wasActive
          ? filtered.length > 0
            ? filtered[0].id
            : null
          : state.activeScenarioId,
      };

      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  setActiveScenario(id) {
    set((state) => {
      const next = { ...state, activeScenarioId: id };
      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  getActiveScenario() {
    const { scenarios, activeScenarioId } = get();
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.id === activeScenarioId) ?? null;
  },

  addItemToActive(payload) {
    const { activeScenarioId, scenarios } = get();

    // hiç senaryo yoksa otomatik bir tane aç
    if (!activeScenarioId) {
      const id = nanoid();
      const newScenario: SimulationScenario = {
        id,
        name: "New scenario",
        createdAt: dayjs().toISOString(),
        items: [],
      };
      const newItem: SimulationItem = {
        id: nanoid(),
        ...payload,
      };
      newScenario.items.push(newItem);

      const next = {
        scenarios: [...scenarios, newScenario],
        activeScenarioId: id,
      };
      set((state) => ({
        ...state,
        ...next,
      }));
      void persistState(next);
      return;
    }

    set((state) => {
      const nextScenarios = state.scenarios.map((s) =>
        s.id === activeScenarioId
          ? {
              ...s,
              items: [
                ...s.items,
                {
                  id: nanoid(),
                  ...payload,
                },
              ],
            }
          : s
      );

      const next = {
        ...state,
        scenarios: nextScenarios,
      };
      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  removeItemFromActive(itemId) {
    const { activeScenarioId } = get();
    if (!activeScenarioId) return;

    set((state) => {
      const nextScenarios = state.scenarios.map((s) =>
        s.id === activeScenarioId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      );

      const next = {
        ...state,
        scenarios: nextScenarios,
      };

      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  clearActiveItems() {
    const { activeScenarioId } = get();
    if (!activeScenarioId) return;

    set((state) => {
      const nextScenarios = state.scenarios.map((s) =>
        s.id === activeScenarioId ? { ...s, items: [] } : s
      );

      const next = {
        ...state,
        scenarios: nextScenarios,
      };

      void persistState({
        scenarios: next.scenarios,
        activeScenarioId: next.activeScenarioId,
      });
      return next;
    });
  },

  getBalanceOnDateWithSimulation(date) {
    const base = useTransactionsStore.getState().getBalanceOnDate(date);
    const active = get().getActiveScenario();

    if (!active) {
      return base;
    }

    const target = dayjs(date);

    const relevantItems = active.items.filter((it) =>
      dayjs(it.date).isSameOrBefore(target, "day")
    );

    const simIncome = relevantItems
      .filter((it) => it.type === "Income")
      .reduce((sum, it) => sum + it.amount, 0);

    const simExpense = relevantItems
      .filter((it) => it.type === "Expense")
      .reduce((sum, it) => sum + it.amount, 0);

    return {
      income: base.income + simIncome,
      expense: base.expense + simExpense,
      balance: base.balance + simIncome - simExpense,
    };
  },
}));
