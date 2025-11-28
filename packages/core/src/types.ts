//
// packages/core/src/types.ts
//

export type TransactionType = "Income" | "Expense";

/**
 * A physical or online store / market.
 */
export interface Store {
  id: string;               // e.g. "migros_kadikoy"
  name: string;             // e.g. "Migros"
  branchName?: string;      // e.g. "Kadıköy"
  fullName?: string;        // e.g. "Migros Kadıköy"
  tags?: string[];          // e.g. ["grocery", "chain"]
}

/**
 * Represents a detailed item inside a transaction (e.g. a single product line).
 * Example: water, bread, milk, etc.
 */
export interface TransactionSubItem {
  id: number | string;        // Unique local id (uuid or Date.now)
  name: string;               // "Water 1.5L", "Bread", etc.
  quantity: number;           // Number of units (e.g. 6 bottles, 4 breads)
  unit?: string;              // "pcs", "kg", "L", etc.

  /**
   * Product identity for cross-transaction analytics.
   * If you keep productId stable, you can group all purchases
   * of the same product across different stores.
   */
  productId?: string;         // e.g. "water_1_5L_erikli"

  /**
   * Price information for this specific purchase line.
   */
  unitPrice?: number;         // Price per unit (e.g. 10 per bottle)
  totalAmount?: number;       // Optional total for this line (quantity * unitPrice)
  currency?: string;          // "TRY", "EUR", "USD", etc.

  /**
   * Additional metadata for comparisons and analytics.
   */
  brand?: string;             // e.g. "Erikli", "Sırma"
  category?: string;          // e.g. "Water", "Bread", "Dairy"
  tags?: string[];            // e.g. ["basic", "bulk", "promo"]

  /**
   * Optional normalized price per standard unit (e.g. per liter / per kg).
   * Useful when comparing 0.5L vs 1.5L vs 5L packages fairly.
   */
  pricePerStandardUnit?: number; // e.g. price per liter
  standardUnit?: string;         // e.g. "L", "kg"
}

/**
 * Base transaction model used across devices and backend.
 * Usually corresponds to a single store visit / shopping event.
 */
export interface BaseTransaction {
  id: number | string;
  date: string;            // "YYYY-MM-DD"
  month: string;           // "YYYY-MM"
  type: TransactionType;
  item: string;            // High-level description ("Groceries", "Rent")
  category?: string;       // Main category ("Groceries", "Bills", etc.)
  amount: number;          // Total amount of the transaction
  isFixed?: boolean;
  planId?: number | string;

  /**
   * Store where this transaction happened.
   * One transaction usually belongs to one store.
   */
  storeId?: string;        // Links to Store.id
  storeName?: string;      // Convenience name ("Migros", "BIM", ...)

  /**
   * Optional detailed sub-items inside a single transaction.
   * Example:
   *   - 6x Water
   *   - 4x Bread
   *   - 1x Cheese
   */
  subItems?: TransactionSubItem[];
}

/**
 * Transaction enriched with fields required for multi-device sync.
 */
export interface SyncedTransaction extends BaseTransaction {
  updatedAt: string;        // ISO timestamp of last modification
  deleted?: boolean;        // Soft delete flag
}

/**
 * Local-device-only transaction with sync metadata.
 */
export type SyncStatus = "synced" | "dirty";

export interface LocalTransaction extends SyncedTransaction {
  syncStatus?: SyncStatus;  // Local flag used during sync operations
}

/**
 * Monthly recurring fixed plan definition.
 * Used to generate upcoming fixed transactions automatically.
 */
export interface FixedPlan {
  id: number | string;
  type: TransactionType;
  item: string;
  category?: string;
  amount: number;
  startMonth: string;       // "YYYY-MM" (inclusive)
  endMonth: string | null;  // "YYYY-MM" or null (infinite)
}

/**
 * Product-level identity used to aggregate sub-items across transactions.
 * Example: "Water 1.5L Erikli" as a logical product.
 */
export interface Product {
  id: string;               // Same value referenced by subItem.productId
  name: string;             // "Water 1.5L"
  brand?: string;           // "Erikli"
  category?: string;        // "Water"
  defaultUnit?: string;     // "L", "pcs"
  defaultStandardUnit?: string; // e.g. "L"
}

/**
 * Single price observation for a product at a given time,
 * optionally at a specific store.
 */
export interface ProductPriceSample {
  productId: string;        // Links to Product.id
  date: string;             // "YYYY-MM-DD"
  unitPrice: number;        // Price per unit at that time
  currency?: string;        // "TRY", "EUR", "USD", etc.

  storeId?: string;         // Links to Store.id
  storeName?: string;       // "Migros", "BIM", etc.

  pricePerStandardUnit?: number; // Normalized price (e.g. per liter)
}

/**
 * Consumption / purchase event for a product.
 * Used to calculate average consumption interval (days between purchases),
 * total quantity over time, etc.
 */
export interface ProductConsumptionSample {
  productId: string;             // Links to Product.id
  transactionId: number | string; // Which transaction it belongs to
  date: string;                  // "YYYY-MM-DD"
  quantity: number;              // How much was purchased
  unit?: string;                 // "pcs", "kg", "L"
}
