import dayjs from "dayjs";
import { SimulationItem } from "../types/simulation";
import { BalanceOnDate } from "../types/balance";

export const computeBalanceOnDateWithSimulation=(
  base: BalanceOnDate,
  items: SimulationItem[],
  date: string
): BalanceOnDate =>{
  const target = dayjs(date);

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
