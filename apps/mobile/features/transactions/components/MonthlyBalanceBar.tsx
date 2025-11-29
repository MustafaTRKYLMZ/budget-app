import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { styles } from "../styles";

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
