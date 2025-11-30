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
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@budget/core";

const PRIMARY = "#0A1A4F";
const PRIMARY_DARK = "#050C2C";
const PRIMARY_LIGHT = "#132868";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#D1D5DB";
const BORDER = "rgba(255,255,255,0.22)";

export default function SettingsScreen() {
  const handleClose = () => router.back();

  const { initialBalance, loadInitialBalance, saveInitialBalance, isLoading } =
    useSettingsStore();

  const { lastSyncAt } = useTransactionsStore();

  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation();

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
          <Ionicons name="close" size={22} color={TEXT_MUTED} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECTION: Opening Balance */}
        <View>
          <Text style={styles.sectionTitle}>Starting Balance</Text>
          {/* Amount Input */}
          <Text style={styles.itemLabel}>Initial Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={TEXT_MUTED}
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        {/*initial balance date*/}
        {/* Date Picker */}
        <Text style={styles.itemLabel}>Starting from Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {dayjs(date).format("DD MMM YYYY")}
          </Text>
          <Ionicons name="calendar" size={18} color={TEXT_MUTED} />
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
              color={TEXT_PRIMARY}
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
    backgroundColor: PRIMARY,
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
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 16,
  },
  itemLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 4,
    marginTop: 8,
  },

  // inputs
  input: {
    backgroundColor: PRIMARY_DARK,
    color: TEXT_PRIMARY,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  // date button
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_DARK,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
  },

  // save button
  saveButton: {
    backgroundColor: PRIMARY_LIGHT,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "600",
  },

  // sync section
  syncInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PRIMARY_DARK,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  syncLabel: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 4,
  },
  syncValue: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "500",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  syncButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
});
