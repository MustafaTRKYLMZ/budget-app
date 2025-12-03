export type BalanceType = "Income" | "Expense";

export type InitialBalance = {
  amount: number;
  date: string; 
} | null | undefined;

export type BalanceOnDate = {
  income: number;
  expense: number;
  balance: number;
};
