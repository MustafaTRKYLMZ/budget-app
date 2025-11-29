// apps/mobile/components/ui/CashflowTotals.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CashflowTotalsProps {
  income: number;
  expense: number;
  incomeLabel?: string;
  expenseLabel?: string;
  netLabel?: string;
}

export const CashflowTotals: React.FC<CashflowTotalsProps> = ({
  income,
  expense,
  incomeLabel = "Income (all)",
  expenseLabel = "Expense (all)",
  netLabel = "Balance (all)",
}) => {
  const net = income - expense;

  const netColor = net > 0 ? "#4ade80" : net < 0 ? "#fb7185" : "#e5e7eb";

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.label}>{incomeLabel}</Text>
        <Text style={styles.incomeValue}>{income.toFixed(2)} €</Text>
      </View>

      <View style={styles.column}>
        <Text style={styles.label}>{expenseLabel}</Text>
        <Text style={styles.expenseValue}>{expense.toFixed(2)} €</Text>
      </View>

      <View style={styles.column}>
        <Text style={styles.label}>{netLabel}</Text>
        <Text style={[styles.netValue, { color: netColor }]}>
          {net >= 0 ? "+" : ""}
          {net.toFixed(2)} €
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#020819",
  },
  column: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 2,
  },
  incomeValue: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  expenseValue: {
    color: "#fb7185",
    fontSize: 14,
    fontWeight: "600",
  },
  netValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
