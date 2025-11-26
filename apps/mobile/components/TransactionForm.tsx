import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import dayjs from "dayjs";
import type { Transaction, TransactionType } from "@budget/core";

const today = dayjs().format("YYYY-MM-DD");

interface TransactionFormProps {
  mode?: "create" | "edit";
  initialTransaction?: Transaction;
  onSubmit: (transaction: Transaction) => void;
}

export default function TransactionForm({
  mode = "create",
  initialTransaction,
  onSubmit,
}: TransactionFormProps) {
  const [date, setDate] = useState<string>(initialTransaction?.date ?? today);
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? "Expense"
  );
  const [item, setItem] = useState<string>(initialTransaction?.item ?? "");
  const [category, setCategory] = useState<string>(
    initialTransaction?.category ?? ""
  );
  const [isFixed, setIsFixed] = useState<"yes" | "no">(
    initialTransaction?.isFixed ? "yes" : "no"
  );
  const [amount, setAmount] = useState<string>(
    initialTransaction ? String(initialTransaction.amount) : ""
  );

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);

    if (!item || !amount || Number.isNaN(parsedAmount)) {
      Alert.alert("Validation", "Item and amount are required.");
      return;
    }

    const monthFromDate =
      date && date.length >= 7 ? date.slice(0, 7) : dayjs().format("YYYY-MM");

    const transaction: Transaction = {
      id: (initialTransaction?.id as any) ?? (Date.now() as any),
      date,
      month: monthFromDate,
      type,
      item,
      category: category || undefined,
      amount: parsedAmount,
      isFixed: isFixed === "yes",
      // web'deki gibi mevcut planId korunuyor
      planId: (initialTransaction as any)?.planId,
    };

    onSubmit(transaction);
  };

  const titlePrefix = mode === "edit" ? "Update" : "Save";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* DATE + TYPE + FIXED */}
        <View style={styles.row}>
          {/* DATE */}
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          </View>

          {/* TYPE */}
          <View style={styles.field}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  type === "Income" && styles.chipIncomeActive,
                ]}
                onPress={() => setType("Income")}
              >
                <Text
                  style={[
                    styles.chipText,
                    type === "Income" && styles.chipTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  type === "Expense" && styles.chipExpenseActive,
                ]}
                onPress={() => setType("Expense")}
              >
                <Text
                  style={[
                    styles.chipText,
                    type === "Expense" && styles.chipTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FIXED */}
          <View style={styles.field}>
            <Text style={styles.label}>Fixed?</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  isFixed === "no" && styles.chipFixedNoActive,
                ]}
                onPress={() => setIsFixed("no")}
              >
                <Text
                  style={[
                    styles.chipText,
                    isFixed === "no" && styles.chipTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  isFixed === "yes" && styles.chipFixedYesActive,
                ]}
                onPress={() => setIsFixed("yes")}
              >
                <Text
                  style={[
                    styles.chipText,
                    isFixed === "yes" && styles.chipTextActive,
                  ]}
                >
                  Yes (recurring)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ITEM */}
        <View style={styles.fieldFull}>
          <Text style={styles.label}>Item</Text>
          <TextInput
            value={item}
            onChangeText={setItem}
            placeholder="Rent, Insurance, Salary..."
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* CATEGORY */}
        <View style={styles.fieldFull}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Housing, Food, Transport..."
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* AMOUNT */}
        <View style={styles.fieldFull}>
          <Text style={styles.label}>Amount (€)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>{titlePrefix}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#020617", // slate-950
  },
  row: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
  },
  field: {
    flex: 1,
  },
  fieldFull: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#cbd5f5",
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    backgroundColor: "#020617",
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#020617",
  },
  chipIncomeActive: {
    borderColor: "rgba(16,185,129,0.8)",
    backgroundColor: "rgba(16,185,129,0.16)",
  },
  chipExpenseActive: {
    borderColor: "rgba(248,113,113,0.8)",
    backgroundColor: "rgba(248,113,113,0.16)",
  },
  chipFixedYesActive: {
    borderColor: "rgba(245,158,11,0.8)",
    backgroundColor: "rgba(245,158,11,0.18)",
  },
  chipFixedNoActive: {
    borderColor: "#475569",
    backgroundColor: "rgba(30,41,59,0.9)",
  },
  chipText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  chipTextActive: {
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: "#0ea5e9", // sky-500
    paddingVertical: 10,
    alignItems: "center",
  },
  submitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f9fafb",
  },
});
