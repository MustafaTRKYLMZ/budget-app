// apps/mobile/app/(tabs)/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Transaction } from "@budget/core";

import TransactionList from "../../components/TransactionList";
import {
  useTransactionsStore,
  type DeleteScope,
} from "../../store/useTransactionsStore";
import { useSettingsStore } from "../../store/useSettingsStore";

const getCurrentMonth = () => dayjs().format("YYYY-MM");

type ViewTab = "all" | "fixed" | "income";

export default function HomeScreen() {
  const transactions = useTransactionsStore((s) => s.transactions);
  const loadFromApi = useTransactionsStore((s) => s.loadFromApi);
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    void loadInitialBalance();
    void loadFromApi();
  }, [loadInitialBalance, loadFromApi]);

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

  // AYLIK ÖZET (sadece o ayın gelir/gider toplamı)
  const income = filtered.reduce(
    (sum, t) => (t.type === "Income" ? sum + t.amount : sum),
    0
  );
  const expense = filtered.reduce(
    (sum, t) => (t.type === "Expense" ? sum + t.amount : sum),
    0
  );
  const monthNet = income - expense;

  const balanceColor =
    monthNet > 0 ? "#4ade80" : monthNet < 0 ? "#fb7185" : "#e5e7eb";

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

  // Opening balance + seçilen güne kadar tüm işlemler
  const dailySummary = getBalanceOnDate(selectedDate);

  const goPrevMonth = () => {
    const prevMoment = currentDate.subtract(1, "month");
    setMonth(prevMoment.format("YYYY-MM"));
    // Ay değişince o ayın son gününe atla
    setSelectedDate(prevMoment.endOf("month").format("YYYY-MM-DD"));
  };

  const goNextMonth = () => {
    const nextMoment = currentDate.add(1, "month");
    setMonth(nextMoment.format("YYYY-MM"));
    // Ay değişince o ayın son gününe atla
    setSelectedDate(nextMoment.endOf("month").format("YYYY-MM-DD"));
  };

  const onChangeDate = (event: any, selected?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (selected) {
      setSelectedDate(dayjs(selected).format("YYYY-MM-DD"));
    }
  };

  const handleJumpToday = () => {
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  };

  const handleJumpEndOfMonth = () => {
    setSelectedDate(currentDate.endOf("month").format("YYYY-MM-DD"));
  };

  const todayStr = dayjs().format("YYYY-MM-DD");
  const endOfMonthStr = currentDate.endOf("month").format("YYYY-MM-DD");

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

        {/* DAILY BALANCE (OPENING + ALL UNTIL SELECTED DATE) */}
        <View style={styles.dailyRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dailyLabel}>Balance as of</Text>
            <TouchableOpacity
              style={styles.dailyDateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#9ca3af"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dailyDateText}>
                {dayjs(selectedDate).format("DD MMM YYYY")}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.dailyAmount,
              {
                color:
                  dailySummary.balance > 0
                    ? "#4ade80"
                    : dailySummary.balance < 0
                    ? "#fb7185"
                    : "#e5e7eb",
              },
            ]}
          >
            {dailySummary.balance.toFixed(2)} €
          </Text>
        </View>

        {/* QUICK DATE SHORTCUTS */}
        <View style={styles.quickRow}>
          <QuickChip
            label="Today"
            active={selectedDate === todayStr}
            onPress={handleJumpToday}
          />
          <QuickChip
            label="End of month"
            active={selectedDate === endOfMonthStr}
            onPress={handleJumpEndOfMonth}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dayjs(selectedDate).toDate()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}

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

        {/* CURRENT BALANCE BAR (AYLIK) */}
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
              {monthNet} €
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

interface QuickChipProps {
  label: string;
  onPress: () => void;
  active: boolean;
}

function QuickChip({ label, onPress, active }: QuickChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickChip, active && styles.quickChipActive]}
    >
      <Text
        style={[styles.quickChipText, active && styles.quickChipTextActive]}
      >
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
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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

  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dailyLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 2,
  },
  dailyDateButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  dailyDateText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  dailyAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  quickRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginRight: 8,
  },
  quickChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  quickChipText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  quickChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
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
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 30,
  },
  sidebarPanel: {
    width: 260,
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingTop: 56,
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
