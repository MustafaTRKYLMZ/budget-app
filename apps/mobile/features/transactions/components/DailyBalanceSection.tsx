import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { styles } from "../styles";
import { QuickChip } from "./QuickChip";

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
  const [showPicker, setShowPicker] = useState(false);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const effectiveSelectedDate = selectedDate || todayStr;

  const endOfMonthStr = dayjs(`${currentMonth}-01`)
    .endOf("month")
    .format("YYYY-MM-DD");

  return (
    <>
      <View style={styles.dailyRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dailyLabel}>{title}</Text>
          <TouchableOpacity
            style={styles.dailyDateButton}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dailyDateText}>
              {dayjs(effectiveSelectedDate).format("DD MMM YYYY")}
            </Text>
          </TouchableOpacity>
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
            label="Today"
            active={effectiveSelectedDate === todayStr}
            onPress={() => onChangeDate(todayStr)}
          />
          <QuickChip
            label="End of month"
            active={effectiveSelectedDate === endOfMonthStr}
            onPress={() => onChangeDate(endOfMonthStr)}
          />
        </View>
      )}

      {showPicker && (
        <DateTimePickerModal
          isVisible={showPicker}
          date={dayjs(effectiveSelectedDate).toDate()}
          mode="date"
          onConfirm={(date) => {
            onChangeDate(dayjs(date).format("YYYY-MM-DD"));
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
