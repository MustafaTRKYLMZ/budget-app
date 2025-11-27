// apps/mobile/app/simulation.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useSimulationStore } from "../../store/useSimulationStore";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { SimulationItemModal } from "../../components/ui/SimulationItemModal";

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
  } = useSimulationStore();

  const getBalanceOnDate = useTransactionsStore((s) => s.getBalanceOnDate);

  const [targetDate, setTargetDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeScenario = getActiveScenario();

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!scenarios.length) {
      addScenario("New furniture plan");
    }
  }, [scenarios.length, addScenario]);

  const handleGoBack = () => {
    router.back();
  };

  const baseBalance = getBalanceOnDate(targetDate);

  const allIncomeTotal =
    activeScenario?.items
      .filter((it) => it.type === "Income")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const allExpenseTotal =
    activeScenario?.items
      .filter((it) => it.type === "Expense")
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const allNetTotal = allIncomeTotal - allExpenseTotal;

  const simIncomeTotalForDate =
    activeScenario?.items
      .filter(
        (it) =>
          it.type === "Income" &&
          dayjs(it.date).valueOf() >= dayjs(targetDate).valueOf()
      )
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const simExpenseTotalForDate =
    activeScenario?.items
      .filter(
        (it) =>
          it.type === "Expense" &&
          dayjs(it.date).valueOf() >= dayjs(targetDate).valueOf()
      )
      .reduce((sum, it) => sum + it.amount, 0) ?? 0;

  const simNetTotalForDate = simIncomeTotalForDate - simExpenseTotalForDate;

  const withSimulationBalance = baseBalance.balance + simNetTotalForDate;

  const onChangeTargetDate = (event: any, selected?: Date) => {
    if (Platform.OS !== "ios") {
      setShowTargetDatePicker(false);
    }
    if (selected) {
      const next = dayjs(selected).format("YYYY-MM-DD");
      setTargetDate(next);
    }
  };

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
        {/* Scenario selector */}
        {/* <View style={styles.futureSection}>
          <Text style={styles.sectionTitle}>Scenario</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {scenarios.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.scenarioChip,
                  s.id === activeScenarioId && styles.scenarioChipActive,
                ]}
                onPress={() => setActiveScenario(s.id)}
              >
                <Ionicons
                  name="flask-outline"
                  size={14}
                  color={s.id === activeScenarioId ? "#0f172a" : "#9ca3af"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.scenarioChipText,
                    s.id === activeScenarioId && styles.scenarioChipTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}
        {/* 🔹 TARGET DATE + REAL BALANCE (HEADER CARD) */}
        <View style={styles.baseBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.baseLabel}>Real balance on</Text>
            <TouchableOpacity
              style={styles.baseDateButton}
              onPress={() => setShowTargetDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#9ca3af"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.baseDateText}>
                {dayjs(targetDate).format("DD MMM YYYY")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.baseAmount,
              {
                color:
                  baseBalance.balance > 0
                    ? "#4ade80"
                    : baseBalance.balance < 0
                    ? "#fb7185"
                    : "#e5e7eb",
              },
            ]}
          >
            {baseBalance.balance.toFixed(2)} €
          </Text>
        </View>

        {/* Date picker */}
        {showTargetDatePicker && (
          <DateTimePicker
            value={dayjs(targetDate).toDate()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeTargetDate}
          />
        )}

        {/* Items list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planned items</Text>
          {activeScenario && activeScenario.items.length > 0 ? (
            <>
              <View style={styles.simListCard}>
                {activeScenario.items.map((it) => (
                  <View key={it.id} style={styles.simRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simItemTitle}>{it.item}</Text>
                      <Text style={styles.simItemMeta}>
                        {it.type} · {dayjs(it.date).format("DD MMM YYYY")}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.simItemAmount,
                        {
                          color: it.type === "Income" ? "#4ade80" : "#fb7185",
                        },
                      ]}
                    >
                      {it.type === "Expense" && "-"}
                      {it.amount.toFixed(2)} €
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeItemFromActive(it.id)}
                      style={styles.simDeleteButton}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons
                        name="close-outline"
                        size={16}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Planned items totals*/}
              <View style={styles.simTotalsBox}>
                <View style={styles.simTotalsColumn}>
                  <Text style={styles.simTotalsLabel}>Income (all)</Text>
                  <Text style={styles.simTotalsIncome}>
                    {allIncomeTotal.toFixed(2)} €
                  </Text>
                </View>
                <View style={styles.simTotalsColumn}>
                  <Text style={styles.simTotalsLabel}>Expense (all)</Text>
                  <Text style={styles.simTotalsExpense}>
                    {allExpenseTotal.toFixed(2)} €
                  </Text>
                </View>
                <View style={styles.simTotalsColumn}>
                  <Text style={styles.simTotalsLabel}>Balance (all)</Text>
                  <Text
                    style={[
                      styles.simTotalsBalance,
                      {
                        color:
                          allNetTotal > 0
                            ? "#4ade80"
                            : allNetTotal < 0
                            ? "#fb7185"
                            : "#e5e7eb",
                      },
                    ]}
                  >
                    {allNetTotal >= 0 ? "+" : ""}
                    {allNetTotal.toFixed(2)} €
                  </Text>
                </View>
              </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    marginTop: Platform.OS === "android" ? 25 : 0,
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

  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  smallLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 6,
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },

  scenarioChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginRight: 8,
    backgroundColor: "#020617",
  },
  scenarioChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  scenarioChipText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  scenarioChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
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
});
