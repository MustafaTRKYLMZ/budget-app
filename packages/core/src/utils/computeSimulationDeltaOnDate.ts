// packages/core/src/simulation/balance.ts

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { SimulationBalanceDelta, SimulationBalanceItem } from "../types/simulation";

dayjs.extend(isSameOrBefore);

export function computeSimulationDeltaOnDate(
  items: SimulationBalanceItem[],
  date: string
): SimulationBalanceDelta {
  const target = dayjs(date);

  const relevantItems = items.filter((it) =>
    dayjs(it.date).isSameOrBefore(target, "day")
  );

  const incomeDelta = relevantItems
    .filter((it) => it.type === "Income")
    .reduce((sum, it) => sum + it.amount, 0);

  const expenseDelta = relevantItems
    .filter((it) => it.type === "Expense")
    .reduce((sum, it) => sum + it.amount, 0);

  return {
    incomeDelta,
    expenseDelta,
    netDelta: incomeDelta - expenseDelta,
  };
}
