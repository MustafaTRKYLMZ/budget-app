
export type SyncStatus = "synced" | "dirty";

export type TransactionType = "Income" | "Expense";

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
  storeId?: string;       
  storeName?: string;     
  subItems?: TransactionSubItem[];
}
export interface SyncedTransaction extends BaseTransaction {
  updatedAt: string;        
  deleted?: boolean;      
}
export interface LocalTransaction extends SyncedTransaction {
  syncStatus?: SyncStatus;  // Local flag used during sync operations
}

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


export type TransactionDraft = Omit<
  LocalTransaction,
  "id" | "month" | "updatedAt" | "deleted" | "syncStatus"
> & {
  id?: string | number;
  date?: string;
};