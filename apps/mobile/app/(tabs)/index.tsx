import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import type { Transaction } from "@budget/core";

import TransactionList from "../../features/transactions/components/TransactionList";
import {
  useTransactionsStore,
  type DeleteScope,
} from "../../store/useTransactionsStore";
import { useSettingsStore } from "../../store/useSettingsStore";

import { HomeHeader } from "../../components/ui/HomeHeader";
import { DailyBalanceSection } from "../../features/transactions/components/DailyBalanceSection";
import { ViewTabs, type ViewTab } from "../../components/ui/ViewTabs";
import { MonthNavigator } from "../../features/transactions/components/MonthNavigator";
import { MonthlyBalanceBar } from "../../features/transactions/components/MonthlyBalanceBar";
import { SidebarMenu } from "../../components/ui/SidebarMenu";
import { DeleteTransactionSheet } from "../../features/transactions/components/DeleteTransactionSheet";
import { syncTransactions } from "../../services/syncTransactions";

const getCurrentMonth = () => dayjs().format("YYYY-MM");

export default function HomeScreen() {
  // raw local transactions (with deleted flag)
  const allTransactions = useTransactionsStore((s) => s.transactions);
  const loadFromStorage = useTransactionsStore((s) => s.loadFromStorage);
  const deleteScoped = useTransactionsStore((s) => s.deleteTransactionScoped);
  const getBalanceOnDate = useTransactionsStore((s) => s.getBalanceOnDate);

  const loadInitialBalance = useSettingsStore((s) => s.loadInitialBalance);

  const [month, setMonth] = useState(getCurrentMonth);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  useEffect(() => {
    void loadInitialBalance();
    void loadFromStorage();
  }, [loadInitialBalance, loadFromStorage]);

  // Only non-deleted transactions are visible in UI
  const transactions = useMemo(
    () => allTransactions.filter((t) => !t.deleted),
    [allTransactions]
  );

  const currentDate = dayjs(`${month}-01`);
  const monthName = currentDate.format("MMMM");
  const year = currentDate.format("YYYY");

  const filteredByMonth = useMemo(
    () => transactions.filter((t) => t.month === month),
    [transactions, month]
  );

  const filtered = useMemo(() => {
    if (viewTab === "fixed") {
      return filteredByMonth.filter((t) => t.isFixed);
    }
    if (viewTab === "income") {
      return filteredByMonth.filter((t) => t.type === "Income");
    }
    if (viewTab === "expense") {
      return filteredByMonth.filter((t) => t.type === "Expense");
    }
    return filteredByMonth;
  }, [filteredByMonth, viewTab]);

  const handleEdit = (t: Transaction) => {
    router.push({
      pathname: "/modal",
      params: { id: String(t.id), mode: "edit" },
    });
  };

  const handleDelete = (t: Transaction) => {
    setDeleteTarget(t);
  };

  const confirmDelete = (scope: DeleteScope) => {
    if (!deleteTarget) return;
    void deleteScoped(deleteTarget.id as any, scope);
    setDeleteTarget(null);
  };

  const closeDeleteSheet = () => setDeleteTarget(null);

  // monthly calculations (use filtered list which excludes deleted)
  const income = filtered.reduce(
    (sum, t) => (t.type === "Income" ? sum + t.amount : sum),
    0
  );
  const expense = filtered.reduce(
    (sum, t) => (t.type === "Expense" ? sum + t.amount : sum),
    0
  );
  const monthNet = income - expense;

  const dailySummary = getBalanceOnDate(selectedDate);

  const goPrevMonth = () => {
    const prevMoment = currentDate.subtract(1, "month");
    setMonth(prevMoment.format("YYYY-MM"));
    setSelectedDate(prevMoment.endOf("month").format("YYYY-MM-DD"));
  };

  const goNextMonth = () => {
    const nextMoment = currentDate.add(1, "month");
    setMonth(nextMoment.format("YYYY-MM"));
    setSelectedDate(nextMoment.endOf("month").format("YYYY-MM-DD"));
  };

  const handleOpenSimulation = () => {
    router.push("/simulation");
  };

  const isDeletePlanBased =
    !!deleteTarget && deleteTarget.isFixed && deleteTarget.planId != null;

  const handleRefresh = () => {
    // For a "refresh" action, it makes sense to sync with backend
    void syncTransactions();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenSimulation={handleOpenSimulation}
        />

        <DailyBalanceSection
          selectedDate={selectedDate}
          currentMonth={month}
          balance={dailySummary.balance}
          onChangeDate={setSelectedDate}
        />

        <ViewTabs active={viewTab} onChange={setViewTab} />

        <MonthNavigator
          monthName={monthName}
          year={year}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
        />

        <View style={styles.listWrapper}>
          <TransactionList
            transactions={filtered}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onPressRefresh={handleRefresh}
          />
        </View>

        <MonthlyBalanceBar income={income} expense={expense} net={monthNet} />
      </View>

      {/* FLOATING + BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/modal?mode=create")}
      >
        <Ionicons name="add" size={30} color="#020617" />
      </TouchableOpacity>

      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <DeleteTransactionSheet
        target={deleteTarget}
        isPlanBased={isDeletePlanBased ?? false}
        onConfirm={confirmDelete}
        onClose={closeDeleteSheet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  listWrapper: {
    flex: 1,
    marginBottom: 12,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 130,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
