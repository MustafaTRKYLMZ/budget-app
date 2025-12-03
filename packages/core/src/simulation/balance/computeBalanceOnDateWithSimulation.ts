import dayjs from "dayjs";
import { BalanceOnDate } from "../../types/balance";
import { SimulationItem } from "../../types/simulation";

/**
 * Merges base balance with simulated items up to a given date.
 */
export function computeBalanceOnDateWithSimulation(
  base: BalanceOnDate,
  items: SimulationItem[],
  date: string
): BalanceOnDate {
  const target = dayjs(date);

  // Only include items up to the selected date
  const relevantItems = items.filter((it) =>
    dayjs(it.date).isSameOrBefore(target, "day")
  );

  const simIncome = relevantItems
    .filter((it) => it.type === "Income")
    .reduce((sum, it) => sum + it.amount, 0);

  const simExpense = relevantItems
    .filter((it) => it.type === "Expense")
    .reduce((sum, it) => sum + it.amount, 0);

  return {
    income: base.income + simIncome,
    expense: base.expense + simExpense,
    balance: base.balance + simIncome - simExpense,
  };
}
