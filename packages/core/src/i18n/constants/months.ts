export const MONTH_KEYS = [
    "months.january",
    "months.february",
    "months.march",
    "months.april",
    "months.may",
    "months.june",
    "months.july",
    "months.august",
    "months.september",
    "months.october",
    "months.november",
    "months.december",
  ] as const;
  
  export type MonthKey = (typeof MONTH_KEYS)[number];
  