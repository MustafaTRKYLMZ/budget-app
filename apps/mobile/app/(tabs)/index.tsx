// apps/mobile/app/(tabs)/index.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import TransactionList from "../../components/TransactionList";
import type { Transaction } from "@budget/core";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import SummaryCards from "../../components/SummaryCards";
import MonthFilter from "../../components/MonthFilter";

export default function HomeScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);

  const [month, setMonth] = useState("");

  const filtered = transactions.filter((t) =>
    month ? t.month === month : true
  );

  const income = filtered
    .filter((t) => t.type === "Income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = filtered
    .filter((t) => t.type === "Expense")
    .reduce((a, b) => a + b.amount, 0);

  const handleEdit = (t: Transaction) => {
    router.push({
      pathname: "/modal",
      params: { id: String(t.id), mode: "edit" },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerActions}>
        <Link href="/modal?mode=create" style={styles.addButton}>
          + Add
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MonthFilter month={month} onChange={setMonth} />
        <SummaryCards income={income} expense={expense} />
        <TransactionList
          transactions={filtered}
          onDelete={(t) => deleteTransaction(t.id as any)}
          onEdit={handleEdit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerActions: {
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22c55e",
    color: "#22c55e",
    fontSize: 13,
  },
  content: {
    paddingBottom: 24,
  },
});
