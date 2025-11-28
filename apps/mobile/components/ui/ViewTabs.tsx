import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export type ViewTab = "all" | "fixed" | "income" | "expense";

interface Props {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
}

interface TabChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabChip({ label, active, onPress }: TabChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabChip, active && styles.tabChipActive]}
    >
      <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ViewTabs({ active, onChange }: Props) {
  return (
    <View style={styles.tabsRow}>
      <TabChip
        label="All"
        active={active === "all"}
        onPress={() => onChange("all")}
      />
      <TabChip
        label="Fixed"
        active={active === "fixed"}
        onPress={() => onChange("fixed")}
      />
      <TabChip
        label="Income"
        active={active === "income"}
        onPress={() => onChange("income")}
      />
      <TabChip
        label="Expense"
        active={active === "expense"}
        onPress={() => onChange("expense")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 4,
    marginTop: 10,
    marginBottom: 12,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  tabChipActive: {
    backgroundColor: "#22c55e",
  },
  tabChipText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  tabChipTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
