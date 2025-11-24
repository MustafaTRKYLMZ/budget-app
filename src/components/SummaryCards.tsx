// src/components/SummaryCards.tsx

interface SummaryCardsProps {
  income: number;
  expense: number;
}

export default function SummaryCards({ income, expense }: SummaryCardsProps) {
  const remaining = income - expense;

  const remainingColor = remaining >= 0 ? "text-emerald-400" : "text-rose-400";
  const remainingLabel =
    remaining >= 0 ? "Remaining (surplus)" : "Remaining (deficit)";

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
          Monthly summary
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          Overview
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Income */}
        <div className="flex flex-col rounded-lg bg-emerald-500/5 border border-emerald-500/25 px-3 py-2">
          <span className="text-xs text-emerald-200/80 font-medium">
            Total income
          </span>
          <span className="mt-1 text-lg font-semibold text-emerald-300">
            {income.toFixed(2)} €
          </span>
        </div>

        {/* Expenses */}
        <div className="flex flex-col rounded-lg bg-rose-500/5 border border-rose-500/25 px-3 py-2">
          <span className="text-xs text-rose-200/80 font-medium">
            Total expenses
          </span>
          <span className="mt-1 text-lg font-semibold text-rose-300">
            {expense.toFixed(2)} €
          </span>
        </div>

        {/* Remaining */}
        <div className="flex flex-col rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2">
          <span className="text-xs text-slate-300 font-medium">
            {remainingLabel}
          </span>
          <span className={`mt-1 text-lg font-semibold ${remainingColor}`}>
            {remaining.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
