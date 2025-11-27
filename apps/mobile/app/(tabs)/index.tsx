// apps/mobile/app/(tabs)/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import type { Transaction } from "@budget/core";

import TransactionList from "../../components/TransactionList";
import {
  useTransactionsStore,
  type DeleteScope,
} from "../../store/useTransactionsStore";

const getCurrentMonth = () => dayjs().format("YYYY-MM");

type ViewTab = "all" | "fixed" | "income";

export default function HomeScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const loadFromApi = useTransactionsStore((s) => s.loadFromApi);
  const deleteScoped = useTransactionsStore((s) => s.deleteTransactionScoped);

  const [month, setMonth] = useState(getCurrentMonth);
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

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

  const closeDeleteSheet = () => {
    setDeleteTarget(null);
  };

  const income = filtered.reduce(
    (sum, t) => (t.type === "Income" ? sum + t.amount : sum),
    0
  );
  const expense = filtered.reduce(
    (sum, t) => (t.type === "Expense" ? sum + t.amount : sum),
    0
  );
  const balance = income - expense;

  const goPrevMonth = () => {
    const prev = currentDate.subtract(1, "month").format("YYYY-MM");
    setMonth(prev);
  };

  const goNextMonth = () => {
    const next = currentDate.add(1, "month").format("YYYY-MM");
    setMonth(next);
  };

  const balanceColor =
    balance > 0 ? "#4ade80" : balance < 0 ? "#fb7185" : "#e5e7eb";

  const closeSidebar = () => setSidebarOpen(false);

  const handleOpenSettings = () => {
    closeSidebar();
    router.push("/settings");
  };

  const handleOpenAbout = () => {
    closeSidebar();
    router.push("/about");
  };

  const isDeletePlanBased =
    deleteTarget && deleteTarget.isFixed && deleteTarget.planId != null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* HEADER + HAMBURGER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={24} color="#e5e7eb" />
          </TouchableOpacity>

          <View style={styles.headerTextBlock}>
            <Text style={styles.screenTitle}>Budget</Text>
            <Text style={styles.screenSubtitle}>Personal finance overview</Text>
          </View>
        </View>

        {/* VIEW TABS */}
        <View style={styles.tabsRow}>
          <TabChip
            label="All"
            active={viewTab === "all"}
            onPress={() => setViewTab("all")}
          />
          <TabChip
            label="Fixed"
            active={viewTab === "fixed"}
            onPress={() => setViewTab("fixed")}
          />
          <TabChip
            label="Income"
            active={viewTab === "income"}
            onPress={() => setViewTab("income")}
          />
        </View>

        {/* MONTH HEADER */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={goPrevMonth}
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
            onPress={goNextMonth}
            style={styles.monthNavIcon}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-forward" size={28} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <View style={styles.listWrapper}>
          <TransactionList
            transactions={filtered}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onPressRefresh={() => void loadFromApi()}
          />
        </View>

        {/* CURRENT BALANCE BAR */}
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
            <Text style={styles.balanceLabel}>Current balance</Text>
            <Text style={[styles.balanceValue, { color: balanceColor }]}>
              {balance.toFixed(2)} €
            </Text>
          </View>
        </View>
      </View>

      {/* FLOATING + BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/modal?mode=create")}
      >
        <Ionicons name="add" size={30} color="#020617" />
      </TouchableOpacity>

      {/* SIDEBAR FROM LEFT */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebarPanel}>
            <View style={styles.sidebarHeaderRow}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity
                onPress={closeSidebar}
                style={styles.sidebarCloseButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color="#e5e7eb" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={handleOpenSettings}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color="#e5e7eb"
                style={styles.sidebarItemIcon}
              />
              <Text style={styles.sidebarItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={handleOpenAbout}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#e5e7eb"
                style={styles.sidebarItemIcon}
              />
              <Text style={styles.sidebarItemText}>About</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        </View>
      )}

      {/* DELETE BOTTOM SHEET */}
      {deleteTarget && (
        <View style={styles.deleteOverlay}>
          <TouchableOpacity
            style={styles.deleteBackdrop}
            activeOpacity={1}
            onPress={closeDeleteSheet}
          />
          <View style={styles.deleteSheet}>
            <View style={styles.deleteHandle} />
            <Text style={styles.deleteTitle}>
              {isDeletePlanBased
                ? "Delete fixed transaction"
                : "Delete transaction"}
            </Text>
            <Text style={styles.deleteSubtitle}>
              {deleteTarget.item} · {deleteTarget.amount.toFixed(2)} €
            </Text>
            {isDeletePlanBased ? (
              <>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete("this")}
                >
                  <Text style={styles.deleteButtonText}>This only</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete("thisAndFuture")}
                >
                  <Text style={styles.deleteButtonText}>
                    This and future months
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.deleteDanger]}
                  onPress={() => confirmDelete("all")}
                >
                  <Text
                    style={[styles.deleteButtonText, styles.deleteDangerText]}
                  >
                    All occurrences
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.deleteButton, styles.deleteDanger]}
                onPress={() => confirmDelete("this")}
              >
                <Text
                  style={[styles.deleteButtonText, styles.deleteDangerText]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeDeleteSheet}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24, // header biraz aşağı
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // altındaki tablara boşluk
  },
  menuButton: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginRight: 10,
  },
  headerTextBlock: {
    flex: 1,
  },
  screenTitle: {
    color: "#f9fafb",
    fontSize: 24,
    fontWeight: "800",
  },
  screenSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
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

  listWrapper: {
    flex: 1,
    marginBottom: 12,
  },
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
  fab: {
    position: "absolute",
    right: 24,
    bottom: 130, // balance bar’ın üstünde kalacak
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

  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 30,
  },
  sidebarPanel: {
    width: 260,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 56, // menu başlığını biraz aşağı aldık
    paddingBottom: 32,
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  sidebarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sidebarTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
  },
  sidebarCloseButton: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  sidebarItemIcon: {
    marginRight: 10,
  },
  sidebarItemText: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "500",
  },

  deleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 40,
  },
  deleteBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  deleteSheet: {
    backgroundColor: "#020617",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  deleteHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#4b5563",
    marginBottom: 8,
  },
  deleteTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  deleteSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  deleteButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteDanger: {
    borderColor: "#b91c1c",
  },
  deleteDangerText: {
    color: "#fecaca",
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
});
