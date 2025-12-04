import { TransactionType } from "./transaction";

export interface FixedPlan {
    id: number | string;
    type: TransactionType;
    item: string;
    category?: string;
    amount: number;
    startMonth: string;       // "YYYY-MM" (inclusive)
    endMonth: string | null;  // "YYYY-MM" or null (infinite)
  }
  