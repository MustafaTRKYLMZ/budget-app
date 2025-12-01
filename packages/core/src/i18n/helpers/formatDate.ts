import dayjs from "dayjs";
import { MONTH_KEYS } from "../constants/months";
import { translate, type LanguageCode } from "../translate";

export type LocalizedDateParts = {
  day: string;
  month: string;       // full month name (Ocak / January)
  monthShort: string;  // first 3 chars (Oca / Jan)
  year: string;
};

export function getLocalizedDateParts(
  dateStr: string,
  language: LanguageCode
): LocalizedDateParts {
  const d = dayjs(dateStr);

  if (!d.isValid()) {
    // fallback, istersen burada day'i boş da bırakabilirsin
    return {
      day: "",
      month: "",
      monthShort: "",
      year: "",
     
    };
  }

  const day = d.format("DD");
  const year = d.format("YYYY");
  const monthIndex = d.month(); // 0-11

  const monthKey = MONTH_KEYS[monthIndex];
  const month = translate(language, monthKey);
  const monthShort = month.slice(0, 3); // first 3 chars
   

  return {
    day,
    month,
    monthShort,
    year,
  };
}
