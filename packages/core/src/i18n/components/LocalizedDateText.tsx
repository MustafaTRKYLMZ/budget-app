import React from "react";
import { Text, TextStyle } from "react-native";
import { getLocalizedDateParts, useTranslation } from "..";
import type { LanguageCode } from "../translate";

interface Props {
  date: string; // "YYYY-MM-DD"
  style?: TextStyle | TextStyle[];
  shortMonth?: boolean; // default: true → Jan/Oca
}

export function LocalizedDateText({ date, style, shortMonth = true }: Props) {
  const { language } = useTranslation();

  const { day, monthShort, month, year } = getLocalizedDateParts(
    date,
    language as LanguageCode
  );

  const currentMonth = shortMonth ? monthShort : month;

  return <Text style={style}>{`${day} ${currentMonth} ${year}`}</Text>;
}
