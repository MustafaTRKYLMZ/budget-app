import { TransactionType } from "./transaction";

export type CashflowLike = {
    id: string | number;
    type: TransactionType; // "Income" | "Expense"
    item: string;
    category?: string;
    amount: number;
    date: string; // "YYYY-MM-DD"
  };
  