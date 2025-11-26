import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SummaryCardsProps {
  income: number;
  expense: number;
}

export default function SummaryCards({ income, expense }: SummaryCardsProps) {
  const remaining = income - expense;

  const remainingColor =
    remaining >= 0 ? styles.remainingPositive : styles.remainingNegative;
  const remainingLabel =
    remaining >= 0 ? "Remaining (surplus)" : "Remaining (deficit)";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Monthly summary</Text>
        <Text style={styles.overview}>Overview</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsRow}>
        {/* Income */}
        <View style={[styles.card, styles.incomeCard]}>
          <Text style={styles.cardLabel}>Total income</Text>
          <Text style={styles.incomeValue}>{income.toFixed(2)} €</Text>
        </View>

        {/* Expenses */}
        <View style={[styles.card, styles.expenseCard]}>
          <Text style={styles.cardLabel}>Total expenses</Text>
          <Text style={styles.expenseValue}>{expense.toFixed(2)} €</Text>
        </View>

        {/* Remaining */}
        <View style={[styles.card, styles.remainingCard]}>
          <Text style={styles.cardLabel}>{remainingLabel}</Text>
          <Text style={[styles.remainingValue, remainingColor]}>
            {remaining.toFixed(2)} €
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15,23,42,0.8)", // slate-900/80
    borderColor: "rgba(30,41,59,0.9)", // slate-800
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: "#f1f5f9", // slate-100
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  overview: {
    color: "#64748b", // slate-500
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  cardsRow: {
    flexDirection: "column",
    gap: 12,
  },

  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: "#cbd5e1", // slate-300
  },

  // Income
  incomeCard: {
    backgroundColor: "rgba(16,185,129,0.05)", // emerald-500/5
    borderColor: "rgba(16,185,129,0.25)",
  },
  incomeValue: {
    marginTop: 6,
    color: "#6ee7b7", // emerald-300
    fontSize: 18,
    fontWeight: "600",
  },

  // Expense
  expenseCard: {
    backgroundColor: "rgba(244,63,94,0.05)", // rose-500/5
    borderColor: "rgba(244,63,94,0.25)",
  },
  expenseValue: {
    marginTop: 6,
    color: "#fda4af", // rose-300
    fontSize: 18,
    fontWeight: "600",
  },

  // Remaining
  remainingCard: {
    backgroundColor: "rgba(30,41,59,0.8)", // slate-800/70
    borderColor: "#475569", // slate-600
  },
  remainingValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "600",
  },
  remainingPositive: {
    color: "#4ade80", // emerald-400
  },
  remainingNegative: {
    color: "#fb7185", // rose-400
  },
});
