import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  monthName: string;
  year: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({ monthName, year, onPrev, onNext }: Props) {
  return (
    <View style={styles.monthHeader}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <View style={styles.monthTitleBlock}>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <Text style={styles.monthYear}>{year}</Text>
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-forward" size={28} color="#e5e7eb" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  monthTitleBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f3f4f6",
  },
  monthYear: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
  },
  monthNavIcon: {
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
});
