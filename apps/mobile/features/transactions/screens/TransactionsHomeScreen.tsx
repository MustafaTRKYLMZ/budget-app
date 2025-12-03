// apps/mobile/features/transactions/screens/TransactionsHomeScreen.tsx

import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import {
  getLocalizedDateParts,
  useTranslation,
  type LocalTransaction,
} from "@budget/core";

import TransactionList from "../components/TransactionList";
import {
  useTransactionsStore,
  type DeleteScope,
} from "../../../store/useTransactionsStore";
import { useSettingsStore } from "../../../store/useSettingsStore";

import { HomeHeader } from "../../../components/ui/HomeHeader";
import { DailyBalanceSection } from "../components/DailyBalanceSection";
import { ViewTabs, type ViewTab } from "../../../components/ui/ViewTabs";
import { MonthNavigator } from "../components/MonthNavigator";
import { MonthlyBalanceBar } from "../components/MonthlyBalanceBar";
import { SidebarMenu } from "../../../components/ui/SidebarMenu";
import { DeleteTransactionSheet } from "../components/DeleteTransactionSheet";
import { syncTransactions } from "../../../services/syncTransactions";
import { CustomAlert } from "@/components/CustomAlert";

const getCurrentMonth = () => dayjs().format("YYYY-MM");

export function TransactionsHomeScreen() {
  const allTransactions = useTransactionsStore((s) => s.transactions);
  const loadFromStorage = useTransactionsStore((s) => s.loadFromStorage);
  const deleteScoped = useTransactionsStore((s) => s.deleteTransactionScoped);
  const getBalanceOnDate = useTransactionsStore((s) => s.getBalanceOnDate);
  const [alertMessage, setAlertMessage] = useState("");

  const loadInitialBalance = useSettingsStore((s) => s.loadInitialBalance);

  const [month, setMonth] = useState(getCurrentMonth);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalTransaction | null>(
    null
  );
  const { t, language } = useTranslation();

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
  const { month: monthName, year } = getLocalizedDateParts(month, language);

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

  const handleEdit = (t: LocalTransaction) => {
    router.push({
      pathname: "/(modals)/transaction",
      params: { id: String(t.id), mode: "edit" },
    });
  };

  const handleDelete = (t: LocalTransaction) => {
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

  const handleRefresh = () => {
    void syncTransactions();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HomeHeader
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenSimulation={handleOpenSimulation}
          onLanguageChange={setAlertMessage}
        />

        <DailyBalanceSection
          title={t("balance_as")}
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
        onPress={() =>
          router.push({
            pathname: "/(modals)/transaction",
            params: { mode: "create" },
          })
        }
      >
        <Ionicons name="add" size={30} color="#020617" />
      </TouchableOpacity>

      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <DeleteTransactionSheet
        target={deleteTarget}
        onConfirm={confirmDelete}
        onClose={closeDeleteSheet}
      />

      <CustomAlert
        visible={!!alertMessage}
        message={alertMessage}
        onHide={() => setAlertMessage("")}
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
    paddingTop: 28,
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
