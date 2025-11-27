import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

interface QuickChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function QuickChip({ label, active, onPress }: QuickChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickChip, active && styles.quickChipActive]}
    >
      <Text
        style={[styles.quickChipText, active && styles.quickChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface Props {
  selectedDate: string | undefined; // "YYYY-MM-DD"
  currentMonth: string; // "YYYY-MM"
  balance: number;
  onChangeDate: (dateStr: string) => void;
}

export function DailyBalanceSection({
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

  const onChangeInternal = (event: any, selected?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }
    if (selected) {
      onChangeDate(dayjs(selected).format("YYYY-MM-DD"));
    }
  };

  return (
    <>
      <View style={styles.dailyRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dailyLabel}>Balance as of</Text>
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

      {showPicker && (
        <DateTimePicker
          value={dayjs(effectiveSelectedDate).toDate()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeInternal}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dailyLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 2,
  },
  dailyDateButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  dailyDateText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  dailyAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  quickRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },
  quickChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  quickChipText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  quickChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
});
