import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import dayjs from "dayjs";

import {
  useSimulationStore,
  type SimulationScenario,
} from "../../store/useSimulationStore";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { SimulationItemModal } from "../../components/ui/modals/SimulationItemModal";
import { RenameScenarioModal } from "@/components/ui/modals/RenameScenarioModal";
import { CashflowRow } from "@/components/ui/CashflowRow";
import { DailyBalanceSection } from "@/features/transactions";
import { CashflowTotals } from "@/components/ui/CashflowTotals";
import { SimulationList } from "./components/SimulationList";

export default function SimulationScreen() {
  const {
    scenarios,
    activeScenarioId,
    addScenario,
    setActiveScenario,
    addItemToActive,
    removeItemFromActive,
    getActiveScenario,
    loadFromStorage,
    renameScenario,
    deleteScenario,
    setScenarioTargetDate,
  } = useSimulationStore();

  const getBalanceOnDate = useTransactionsStore((s) => s.getBalanceOnDate);

  const todayStr = dayjs().format("YYYY-MM-DD");
  const [targetDate, setTargetDate] = useState(todayStr);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showScenarioSidebar, setShowScenarioSidebar] = useState(false);

  // rename modal state
  const [renameTarget, setRenameTarget] = useState<SimulationScenario | null>(
    null
  );
  const [renameDraft, setRenameDraft] = useState("");

  const activeScenario = getActiveScenario();

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!scenarios.length) {
      addScenario("New furniture plan");
    }
  }, [scenarios.length, addScenario]);

  // 🔹 if scenario changed, take target date from active scenario
  useEffect(() => {
    if (activeScenario?.targetDate) {
      setTargetDate(activeScenario.targetDate);
    } else {
      setTargetDate(todayStr);
    }
  }, [activeScenario?.id, activeScenario?.targetDate, todayStr]);

  const handleGoBack = () => {
    router.back();
  };

  // base (real) balance for target date
  const baseBalance = getBalanceOnDate(targetDate);

  // tüm senaryodaki kalemlerin toplamı (genel özet)
  const allIncomeTotal =
    activeScenario?.items
      .filter((it) => it.type === "Income")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const allExpenseTotal =
    activeScenario?.items
      .filter((it) => it.type === "Expense")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const allNetTotal = allIncomeTotal - allExpenseTotal;

  // targetDate SONRASINDAKİ simülasyon kalemleri (plan ufku)
  const simIncomeTotalForDate =
    activeScenario?.items
      .filter((it) => it.type === "Income")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const simExpenseTotalForDate =
    activeScenario?.items
      .filter((it) => it.type === "Expense")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const simNetTotalForDate = simIncomeTotalForDate - simExpenseTotalForDate;

  const withSimulationBalance = baseBalance.balance + simNetTotalForDate;

  const openRename = (scenario: SimulationScenario) => {
    setRenameTarget(scenario);
    setRenameDraft(scenario.name);
  };

  const handleConfirmRename = () => {
    if (!renameTarget) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) {
      setRenameTarget(null);
      return;
    }
    renameScenario(renameTarget.id, trimmed);
    setRenameTarget(null);
  };

  const activeScenarioName = activeScenario?.name ?? "No scenario";
  const activeScenarioDisplayName =
    activeScenarioName.length > 7
      ? `${activeScenarioName.slice(0, 7)}…`
      : activeScenarioName;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simulation</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.description}>
          Pick a target date and see how planned expenses or incomes would
          change your balance on that day.
        </Text>

        {/* 🔹 Scenario header row (solda label, sağda aktif senaryo + ⋮) */}
        <View style={styles.futureSection}>
          <Text style={styles.sectionTitle}>Scenario</Text>

          <TouchableOpacity
            style={styles.activeScenarioButton}
            onPress={() => setShowScenarioSidebar(true)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="flask-outline"
              size={14}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />
            <Text
              style={styles.activeScenarioText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeScenarioDisplayName}
            </Text>
            <Ionicons
              name="ellipsis-vertical"
              size={16}
              color="#6b7280"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
        <DailyBalanceSection
          isTransaction={false}
          title="Real balance on"
          selectedDate={targetDate}
          currentMonth={dayjs().format("YYYY-MM")}
          balance={baseBalance.balance}
          onChangeDate={(dateStr) => {
            setTargetDate(dateStr);
            if (activeScenario) {
              setScenarioTargetDate(activeScenario.id, dateStr);
            }
          }}
        />

        {/* Items list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planned items</Text>
          {activeScenario && activeScenario.items.length > 0 ? (
            <>
              <View style={styles.simListCard}>
                <SimulationList
                  items={activeScenario.items}
                  onDelete={removeItemFromActive}
                />
              </View>

              {/* Planned items totals (ALL items of scenario) */}
              <CashflowTotals
                income={allIncomeTotal}
                expense={allExpenseTotal}
                incomeLabel="Income (all)"
                expenseLabel="Expense (all)"
                netLabel="Balance (all)"
              />
            </>
          ) : (
            <Text style={styles.emptySimText}>
              No simulated items yet. Use the + button to add one.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* WITH SIMULATION FOOTER  */}
      <View style={styles.withSimFooter}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="sparkles-outline"
            size={16}
            color="#9ca3af"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.withSimLabel}>
            With simulation on {dayjs(targetDate).format("DD MMM YYYY")}
          </Text>
        </View>

        <Text
          style={[
            styles.withSimAmount,
            {
              color:
                withSimulationBalance > 0
                  ? "#4ade80"
                  : withSimulationBalance < 0
                  ? "#fb7185"
                  : "#e5e7eb",
            },
          ]}
        >
          {withSimulationBalance.toFixed(2)} €
        </Text>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#020617" />
      </TouchableOpacity>

      {/* ADD ITEM MODAL */}
      <SimulationItemModal
        visible={showAddModal}
        initialDate={targetDate}
        onClose={() => setShowAddModal(false)}
        onSubmit={(payload) => {
          addItemToActive(payload);
        }}
      />

      {/* 🔹 Scenario sidebar (sağdan açılan) */}
      {showScenarioSidebar && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setShowScenarioSidebar(false)}
          />
          <View style={styles.sidebarPanel}>
            <View style={styles.sidebarHeaderRow}>
              <Text style={styles.sidebarTitle}>Scenarios</Text>
              <TouchableOpacity
                onPress={() => setShowScenarioSidebar(false)}
                style={styles.sidebarCloseButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#e5e7eb" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TouchableOpacity
                style={styles.sidebarNewScenarioRow}
                onPress={() => addScenario(`Plan ${scenarios.length + 1}`)}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#22c55e"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.sidebarNewScenarioText}>New scenario</Text>
              </TouchableOpacity>
              {scenarios.map((s) => {
                const isActive = s.id === activeScenarioId;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.sidebarScenarioRow,
                      isActive && styles.sidebarScenarioRowActive,
                    ]}
                    onPress={() => {
                      setActiveScenario(s.id);
                      setShowScenarioSidebar(false);
                    }}
                    onLongPress={() => openRename(s)}
                    delayLongPress={300}
                  >
                    <View style={styles.sidebarScenarioLeft}>
                      <Ionicons
                        name="flask-outline"
                        size={16}
                        color={isActive ? "#0f172a" : "#9ca3af"}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.sidebarScenarioName,
                            isActive && styles.sidebarScenarioNameActive,
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {s.name}
                        </Text>
                        <Text style={styles.sidebarScenarioMeta}>
                          {s.items.length} items
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => deleteScenario(s.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={"#6b7280"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* RENAME SCENARIO MODAL */}
      <RenameScenarioModal
        visible={!!renameTarget}
        value={renameDraft}
        onChangeValue={setRenameDraft}
        onCancel={() => setRenameTarget(null)}
        onSave={handleConfirmRename}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  description: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 12,
  },

  baseBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#020819",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },
  baseLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  baseDateButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  baseDateText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  baseAmount: {
    fontSize: 20,
    fontWeight: "700",
  },

  section: {
    marginTop: 12,
  },
  futureSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#020819",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: "#1f2937",
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "700",
  },

  activeScenarioButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 180,
  },
  activeScenarioText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },

  simListCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#020819",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  simRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  simItemTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  simItemMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  simItemAmount: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  simDeleteButton: {
    padding: 4,
    marginLeft: 4,
  },
  emptySimText: {
    color: "#6b7280",
    fontSize: 13,
  },

  simTotalsBox: {
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
  simTotalsColumn: {
    flex: 1,
    marginRight: 12,
  },
  simTotalsLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 2,
  },
  simTotalsIncome: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  simTotalsExpense: {
    color: "#fb7185",
    fontSize: 14,
    fontWeight: "600",
  },
  simTotalsBalance: {
    fontSize: 14,
    fontWeight: "700",
  },

  withSimFooter: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#020819",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  withSimLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  withSimAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // Sidebar
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 40,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  sidebarPanel: {
    width: 260,
    backgroundColor: "#020617",
    borderLeftWidth: 1,
    borderLeftColor: "#1f2937",
    paddingHorizontal: 16,
    marginTop: 40,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sidebarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  sidebarScenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  sidebarScenarioRowActive: {
    backgroundColor: "#22c55e22",
  },
  sidebarScenarioLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  sidebarScenarioName: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  sidebarScenarioNameActive: {
    color: "#22c55e",
    fontWeight: "600",
  },
  sidebarScenarioMeta: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
  sidebarNewScenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  sidebarNewScenarioText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "500",
  },
});
