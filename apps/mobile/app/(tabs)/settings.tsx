// apps/mobile/app/(tabs)/settings.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { useSettingsStore } from "../../store/useSettingsStore";
import { useTransactionsStore } from "../../store/useTransactionsStore";
import { syncTransactions } from "../../services/syncTransactions";

export default function SettingsScreen() {
  const handleClose = () => router.back();

  const { initialBalance, loadInitialBalance, saveInitialBalance, isLoading } =
    useSettingsStore();

  const { lastSyncAt } = useTransactionsStore();

  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadInitialBalance();
  }, [loadInitialBalance]);

  useEffect(() => {
    if (initialBalance) {
      setAmount(String(initialBalance.amount));
      setDate(initialBalance.date);
    }
  }, [initialBalance]);

  const handleSave = async () => {
    const payload = {
      amount: Number(amount),
      date,
    };

    if (Number.isNaN(payload.amount)) {
      Alert.alert("Error", "Amount must be a number");
      return;
    }

    const ok = await saveInitialBalance(payload);

    if (!ok) {
      Alert.alert("Error", "Failed to save initial balance (see console log)");
      return;
    }

    Alert.alert("Saved", "Initial balance updated");
  };

  const onChangeDate = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(dayjs(selected).format("YYYY-MM-DD"));
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      await syncTransactions();
      setIsSyncing(false);
      Alert.alert("Sync", "Sync completed successfully.");
    } catch (e) {
      setIsSyncing(false);
      Alert.alert("Sync", "Sync failed. Please try again.");
    }
  };

  const lastSyncLabel = lastSyncAt
    ? dayjs(lastSyncAt).format("DD MMM YYYY HH:mm")
    : "Never";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={22} color="#e5e7eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECTION: Opening Balance */}
        <Text style={styles.sectionTitle}>Starting Balance</Text>

        {/* Amount Input */}
        <Text style={styles.itemLabel}>Initial Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#6b7280"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Date Picker */}
        <Text style={styles.itemLabel}>Starting from Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {dayjs(date).format("DD MMM YYYY")}
          </Text>
          <Ionicons name="calendar" size={18} color="#9ca3af" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePickerModal
            isVisible={showDatePicker}
            date={dayjs(date).toDate()}
            mode="date"
            onConfirm={onChangeDate}
            onCancel={() => setShowDatePicker(false)}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* SECTION: Sync */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sync</Text>

        <View style={styles.syncInfoBox}>
          <View>
            <Text style={styles.syncLabel}>Last sync</Text>
            <Text style={styles.syncValue}>{lastSyncLabel}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.syncButton,
              (isSyncing || isLoading) && { opacity: 0.6 },
            ]}
            onPress={handleSyncNow}
            disabled={isSyncing || isLoading}
          >
            <Ionicons
              name={isSyncing ? "sync" : "cloud-upload-outline"}
              size={16}
              color="#f9fafb"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.syncButtonText}>
              {isSyncing ? "Syncing..." : "Sync now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeButton: {
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 16,
  },
  itemLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 4,
    marginTop: 8,
  },

  // inputs
  input: {
    backgroundColor: "#111827",
    color: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  // date button
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateText: {
    color: "#e5e7eb",
    fontSize: 16,
  },

  // save button
  saveButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
  },

  // sync section
  syncInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#020819",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  syncLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 4,
  },
  syncValue: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  syncButtonText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "600",
  },
});
