import { BalanceOnDate, BalanceType } from "./balance";

export type SimulationScenario = {
    id: string;
    name: string;
    createdAt: string;
    items: SimulationItem[];
    targetDate?: string;
  };

export type SimulationItem = {
    id: string;
    type: BalanceType;
    item: string;
    category?: string;
    amount: number;
    date: string;
    isFixed?: boolean;
    planId?: string | number;
  };
  
  export type SimulationStore ={
    scenarios: SimulationScenario[];
    activeScenarioId: string | null;
  
    loadFromStorage: () => Promise<void>;
    // scenario management
    addScenario: (name: string) => void;
    renameScenario: (id: string, name: string) => void;
    deleteScenario: (id: string) => void;
    duplicateScenario: (id: string) => void;
    setActiveScenario: (id: string | null) => void;
    setScenarioTargetDate: (id: string, date: string) => void;
  
    // helpers
    getActiveScenario: () => SimulationScenario | null;
    // item management for the active scenario
    addItemToActive: (payload: Omit<SimulationItem, "id">) => void;
    removeItemFromActive: (itemId: string) => void;
    clearActiveItems: () => void;
  
    // calculation
    getBalanceOnDateWithSimulation: (date: string) => BalanceOnDate;
  }
  export interface SimulationBalanceItem {
    type: BalanceType;
    amount: number;
    date: string; 
  }
  
  export type SimulationBalanceDelta = {
    incomeDelta: number;
    expenseDelta: number;
    netDelta: number;
  };
  