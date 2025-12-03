
import { create } from "zustand";
import { addItemToActiveAction } from "./simulation/addItemToActive";
import { addScenarioAction } from "./simulation/addScenario";
import { clearActiveItemsAction } from "./simulation/clearActiveItems";
import { deleteScenarioAction } from "./simulation/deleteScenario";
import { duplicateScenarioAction } from "./simulation/duplicateScenario";
import { getActiveScenarioSelector } from "./simulation/getActiveScenario";
import { loadFromStorageAction } from "./simulation/loadFromStorage";
import { removeItemFromActiveAction } from "./simulation/removeItemFromActive";
import { renameScenarioAction } from "./simulation/renameScenario";
import { setActiveScenarioAction } from "./simulation/setActiveScenario";
import { setScenarioTargetDateAction } from "./simulation/setScenarioTargetDate";
import { useTransactionsStore } from "./useTransactionsStore";
import { computeBalanceOnDateWithSimulation, SimulationStore } from "@budget/core";

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenarios: [],
  activeScenarioId: null,

  async loadFromStorage() {
    await loadFromStorageAction(set);
  },

  addScenario(name) {
    addScenarioAction(set, name);
  },

  renameScenario(id, name) {
    renameScenarioAction(set, id, name);
  },

  deleteScenario(id) {
    deleteScenarioAction(set, get, id);
  },

  duplicateScenario(id) {
    duplicateScenarioAction(set, get, id);
  },

  setActiveScenario(id) {
    setActiveScenarioAction(set, id);
  },

  setScenarioTargetDate(id, date) {
    setScenarioTargetDateAction(set, id, date);
  },

  getActiveScenario() {
    return getActiveScenarioSelector(get);
  },

  addItemToActive(payload) {
    addItemToActiveAction(set, get, payload);
  },

  removeItemFromActive(itemId) {
    removeItemFromActiveAction(set, get, itemId);
  },

  clearActiveItems() {
    clearActiveItemsAction(set, get);
  },

  getBalanceOnDateWithSimulation(date) {
    const base = useTransactionsStore.getState().getBalanceOnDate(date);
    const active = get().getActiveScenario();
  
    if (!active) return base;
  
    return computeBalanceOnDateWithSimulation(
      base,
      active.items,
      date
    );
  }
  
}));
