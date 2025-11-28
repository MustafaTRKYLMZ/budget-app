import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useSettingsStore } from "../../store/useSettingsStore";

export default function SettingsScreen() {
  const handleClose = () => router.back();

  const { initialBalance, loadInitialBalance, saveInitialBalance, isLoading } =
    useSettingsStore();

  const [amount, setAmount] = useState<string>("0");
  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadInitialBalance();
  }, []);

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

    // router.back();
  };

  const onChangeDate = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(dayjs(selected).format("YYYY-MM-DD"));
    }
  };

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
          <DateTimePicker
            value={dayjs(date).toDate()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
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
});
