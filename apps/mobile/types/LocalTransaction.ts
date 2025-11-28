// apps/mobile/types/LocalTransaction.ts
import type { Transaction } from "@budget/core";

/**
 * A Transaction with local-only sync metadata.
 * Stored only on device in Zustand (not in backend).
 */
export interface LocalTransaction extends Transaction {
  updatedAt: string;                 // last local update timestamp
  deleted?: boolean;                 // soft delete
  syncStatus?: "dirty" | "synced";   // pending changes
}
