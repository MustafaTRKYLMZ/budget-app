// apps/mobile/store/useSimulationStore.ts
import { create } from "zustand";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { SimulationItem, SimulationScenario, SimulationStore } from "@budget/core";
import { useTransactionsStore } from "./useTransactionsStore";



const STORAGE_KEY = "simulationStore_v1";

export type SimulationItemType = "Income" | "Expense";

// Only scenarios + activeScenarioId are persisted
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
    const todayStr = dayjs().format("YYYY-MM-DD");

    const scenario: SimulationScenario = {
      id,
      name,
      createdAt: dayjs().toISOString(),
      items: [],
      targetDate: todayStr, // default target date for new scenario
    };

    set((state) => {
      const next = {
        ...state,
        scenarios: [...state.scenarios, scenario],
        // make the newly created scenario active
        activeScenarioId: id,
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

  // Duplicate a scenario (e.g. "Plan 1" -> "Plan 1 copy")
  duplicateScenario(id) {
    set((state) => {
      const original = state.scenarios.find((s) => s.id === id);
      if (!original) return state;

      const newId = nanoid();
      const now = dayjs().toISOString();

      const copyName = original.name.endsWith(" copy")
        ? `${original.name} 2`
        : `${original.name} copy`;

      const clonedItems: SimulationItem[] = original.items.map((it) => ({
        ...it,
        id: nanoid(),
      }));

      const copyScenario: SimulationScenario = {
        id: newId,
        name: copyName,
        createdAt: now,
        items: clonedItems,
        targetDate: original.targetDate ?? dayjs().format("YYYY-MM-DD"),
      };

      const next = {
        ...state,
        scenarios: [...state.scenarios, copyScenario],
        activeScenarioId: newId,
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

  // Update the scenario target date
  setScenarioTargetDate(id, date) {
    set((state) => {
      const nextScenarios = state.scenarios.map((s) =>
        s.id === id ? { ...s, targetDate: date } : s
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

  getActiveScenario() {
    const { scenarios, activeScenarioId } = get();
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.id === activeScenarioId) ?? null;
  },

  addItemToActive(payload) {
    const { activeScenarioId, scenarios } = get();

    // If there is no scenario yet, create one implicitly
    if (!activeScenarioId) {
      const id = nanoid();
      const todayStr = dayjs().format("YYYY-MM-DD");

      const newScenario: SimulationScenario = {
        id,
        name: "New scenario",
        createdAt: dayjs().toISOString(),
        items: [],
        targetDate: todayStr,
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

    return computeBalanceOnDateWithSimulation(base, active.items, date);
  },
}));
