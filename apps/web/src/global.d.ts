// src/global.d.ts
import type { Transaction } from "./types";

interface SaveResult {
  ok: boolean;
  jsonPath?: string;
  excelPath?: string;
  error?: string;
}

interface LoadResult {
  ok: boolean;
  data: Transaction[] | null;
  error?: string;
}

interface ElectronAPI {
  ping: () => Promise<string>;
  saveBudgetData: (data: Transaction[]) => Promise<SaveResult>;
  loadBudgetData: () => Promise<LoadResult>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
