import { Scope } from "../../types/scope";
import { LocalTransaction } from "../../types/transaction";


export const  deleteTransactionSeries=(
    all: LocalTransaction[],
    id: number | string,
    scope: Scope,
    now: string
  ): LocalTransaction[] | null =>{
    const target = all.find((t) => String(t.id) === String(id));
    if (!target) return null;
  
    if (!target.isFixed || target.planId == null || scope === "this") {
      return all.map((tx) =>
        String(tx.id) === String(id)
          ? { ...tx, deleted: true, updatedAt: now, syncStatus: "dirty" }
          : tx
      );
    }
  
    const planId = target.planId;
    const targetMonth = target.month;
  
    if (scope === "thisAndFuture") {
      return all.map((tx) =>
        tx.planId === planId && tx.month >= targetMonth
          ? { ...tx, deleted: true, updatedAt: now, syncStatus: "dirty" }
          : tx
      );
    }
  
    return all.map((tx) =>
      tx.planId === planId
        ? { ...tx, deleted: true, updatedAt: now, syncStatus: "dirty" }
        : tx
    );
  }