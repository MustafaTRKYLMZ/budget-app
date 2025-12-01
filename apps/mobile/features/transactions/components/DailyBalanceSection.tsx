// apps/mobile/features/transactions/components/DailyBalanceSection.tsx

import React from "react";
import { View, Text } from "react-native";
import dayjs from "dayjs";
import { styles } from "../styles";
import { QuickChip } from "./QuickChip";
import { useTranslation } from "@budget/core";
import { LocalizedDatePicker } from "@/components/ui/LocalizedDatePicker";

interface Props {
  selectedDate: string | undefined; // "YYYY-MM-DD"
  currentMonth: string; // "YYYY-MM"
  balance: number;
  onChangeDate: (dateStr: string) => void;
  title: string;
  isTransaction?: boolean;
}

export function DailyBalanceSection({
  isTransaction = true,
  title,
  selectedDate,
  currentMonth,
  balance,
  onChangeDate,
}: Props) {
  const { t } = useTranslation();

  const todayStr = dayjs().format("YYYY-MM-DD");
  const effectiveSelectedDate = selectedDate || todayStr;

  const endOfMonthStr = dayjs(`${currentMonth}-01`)
    .endOf("month")
    .endOf("month")
    .format("YYYY-MM-DD");

  return (
    <>
      <View style={styles.dailyRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dailyLabel}>{title}</Text>

          {/* lokalize date picker */}
          <LocalizedDatePicker
            value={effectiveSelectedDate}
            onChange={onChangeDate}
          />
        </View>

        <Text
          style={[
            styles.dailyAmount,
            {
              color:
                balance > 0 ? "#4ade80" : balance < 0 ? "#fb7185" : "#e5e7eb",
            },
          ]}
        >
          {balance.toFixed(2)} €
        </Text>
      </View>

      {isTransaction && (
        <View style={styles.quickRow}>
          <QuickChip
            label={t("today")}
            active={effectiveSelectedDate === todayStr}
            onPress={() => onChangeDate(todayStr)}
          />
          <QuickChip
            label={t("end_of_month")}
            active={effectiveSelectedDate === endOfMonthStr}
            onPress={() => onChangeDate(endOfMonthStr)}
          />
        </View>
      )}
    </>
  );
}
