// src/types.ts

export type TransactionType = "Income" | "Expense";

/**
 * A single actual record (row in your table, Excel sheet, etc.)
 */
export interface Transaction {
  id: number;
  date: string; // "YYYY-MM-DD"
  month: string; // "YYYY-MM"
  type: TransactionType;
  item: string;
  category?: string;
  amount: number;

  /**
   * For UI / Excel: whether this row is considered "fixed" (from a plan).
   * For new data, this is usually true if planId is set.
   */
  isFixed?: boolean;

  /**
   * If this transaction was generated from a fixed plan,
   * link it to that plan. If it's a one-off, this is undefined.
   */
  planId?: number;
}

/**
 * A fixed recurring rule (the "plan" or "contract").
 * From this, monthly transactions are generated.
 */
export interface FixedPlan {
  id: number;
  type: TransactionType;
  item: string;
  category?: string;
  amount: number;

  /**
   * First month when this plan is active (inclusive), "YYYY-MM"
   */
  startMonth: string;

  /**
   * Last month when this plan is active (inclusive), "YYYY-MM"
   * If null, it is "forever" (no end).
   */
  endMonth: string | null;
}
