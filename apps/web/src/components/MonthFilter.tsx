// src/components/MonthFilter.tsx
import dayjs from "dayjs";

interface MonthFilterProps {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthFilter({ month, onChange }: MonthFilterProps) {
  const currentMonth = dayjs().format("YYYY-MM");

  // current month + next 11 months
  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    dayjs().add(i, "month").format("YYYY-MM")
  );

  const isShowingAll = month === "";
  const selectedValue = isShowingAll ? currentMonth : month || currentMonth;

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  const handleToggleShowAll = () => {
    if (isShowingAll) {
      onChange(currentMonth);
    } else {
      onChange("");
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
            Month filter
          </h2>
          <p className="text-xs text-slate-400">
            View current month or all records
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={selectedValue}
          onChange={handleSelectChange}
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleToggleShowAll}
          className="px-3 py-2 rounded-lg border border-slate-700 text-slate-100 text-xs font-medium hover:bg-slate-800 transition whitespace-nowrap"
        >
          {isShowingAll ? "Back to current" : "Show all"}
        </button>
      </div>
    </div>
  );
}
