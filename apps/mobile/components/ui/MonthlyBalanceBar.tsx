import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  income: number;
  expense: number;
  net: number;
}

export function MonthlyBalanceBar({ income, expense, net }: Props) {
  const balanceColor = net > 0 ? "#4ade80" : net < 0 ? "#fb7185" : "#e5e7eb";

  return (
    <View style={styles.balanceBar}>
      <View style={styles.balanceColumn}>
        <Text style={styles.balanceLabel}>Income</Text>
        <Text style={[styles.balanceValue, { color: "#4ade80" }]}>
          {income.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.balanceColumn}>
        <Text style={styles.balanceLabel}>Expense</Text>
        <Text style={[styles.balanceValue, { color: "#fb7185" }]}>
          {expense.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.balanceColumn}>
        <Text style={styles.balanceLabel}>Balance end of month</Text>
        <Text style={[styles.balanceValue, { color: balanceColor }]}>
          {net} €
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  balanceColumn: {
    flex: 1,
  },
  balanceLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 2,
  },
  balanceValue: {
    color: "#e5e7eb",
    fontSize: 17,
    fontWeight: "700",
  },
});
