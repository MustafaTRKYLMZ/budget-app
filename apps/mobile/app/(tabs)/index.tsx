// apps/mobile/app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import TransactionList from "../../components/TransactionList";
import type { Transaction } from "@budget/core";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import SummaryCards from "../../components/SummaryCards";
import MonthFilter from "../../components/MonthFilter";

export default function HomeScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const deleteById = useTransactionsStore((s) => s.deleteById);
  const loadFromApi = useTransactionsStore((s) => s.loadFromApi);
  const loading = useTransactionsStore((s) => s.loading);
  const error = useTransactionsStore((s) => s.error);

  const [month, setMonth] = useState("");

  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

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

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerActions}>
        <Link href="/modal?mode=create" style={styles.addButton}>
          + Add
        </Link>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.content}>
        <MonthFilter month={month} onChange={setMonth} />
        <SummaryCards income={income} expense={expense} />
        <View style={styles.listWrapper}>
          <TransactionList
            transactions={filtered}
            onDelete={(t) => deleteById(t.id as any)}
            onEdit={handleEdit}
          />
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listWrapper: {
    flex: 1,
    marginTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#e5e7eb",
    fontSize: 14,
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b91c1c",
    backgroundColor: "rgba(127,29,29,0.6)",
  },
  errorText: {
    color: "#fee2e2",
    fontSize: 12,
  },
});
