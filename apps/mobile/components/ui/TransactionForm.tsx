// apps/mobile/components/TransactionForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import dayjs from "dayjs";
import type { Transaction } from "@budget/core";

type TransactionType = "Income" | "Expense";

interface TransactionFormProps {
  mode?: "create" | "edit";
  initialTransaction?: Transaction;
  onSubmit: (tx: Transaction) => void | Promise<void>;
}

const today = dayjs().format("YYYY-MM-DD");

export default function TransactionForm({
  mode = "create",
  initialTransaction,
  onSubmit,
}: TransactionFormProps) {
  const [date, setDate] = useState(initialTransaction?.date ?? today);
  const [type, setType] = useState<TransactionType>(
    (initialTransaction?.type as TransactionType) ?? "Expense"
  );
  const [item, setItem] = useState(initialTransaction?.item ?? "");
  const [category, setCategory] = useState(initialTransaction?.category ?? "");
  const [isFixed, setIsFixed] = useState<boolean>(
    initialTransaction?.isFixed ?? false
  );
  const [amount, setAmount] = useState(
    initialTransaction ? String(initialTransaction.amount) : ""
  );

  const handleSubmit = () => {
    const parsed = Number(String(amount).replace(",", "."));

    if (!item || Number.isNaN(parsed)) {
      alert("Item and valid amount are required.");
      return;
    }

    const month =
      date && date.length >= 7 ? date.slice(0, 7) : dayjs().format("YYYY-MM");

    const tx: Transaction = {
      id: (initialTransaction?.id as any) ?? (Date.now() as any),
      date,
      month,
      type,
      item,
      category: category || undefined,
      amount: parsed,
      isFixed,
      // keep planId if editing a fixed plan row
      planId: initialTransaction?.planId,
    };

    void onSubmit(tx);
  };

  const titlePrefix = mode === "edit" ? "Update" : "Save";

  return (
    <View style={styles.form}>
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
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[
              styles.segment,
              type === "Income" && styles.segmentActiveIncome,
            ]}
            onPress={() => setType("Income")}
          >
            <Text
              style={[
                styles.segmentText,
                type === "Income" && styles.segmentTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              type === "Expense" && styles.segmentActiveExpense,
            ]}
            onPress={() => setType("Expense")}
          >
            <Text
              style={[
                styles.segmentText,
                type === "Expense" && styles.segmentTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FIXED? */}
      <View style={styles.field}>
        <Text style={styles.label}>Fixed?</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segment, !isFixed && styles.segmentActiveNeutral]}
            onPress={() => setIsFixed(false)}
          >
            <Text
              style={[styles.segmentText, !isFixed && styles.segmentTextActive]}
            >
              No
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, isFixed && styles.segmentActiveNeutral]}
            onPress={() => setIsFixed(true)}
          >
            <Text
              style={[styles.segmentText, isFixed && styles.segmentTextActive]}
            >
              Yes (recurring)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ITEM */}
      <View style={styles.field}>
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
      <View style={styles.field}>
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
      <View style={styles.field}>
        <Text style={styles.label}>Amount (€)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#6b7280"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{titlePrefix}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  field: {
    gap: 4,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 14,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#020617",
  },
  segmentActiveIncome: {
    borderColor: "#16a34a",
    backgroundColor: "#022c22",
  },
  segmentActiveExpense: {
    borderColor: "#dc2626",
    backgroundColor: "#450a0a",
  },
  segmentActiveNeutral: {
    borderColor: "#0ea5e9",
    backgroundColor: "#082f49",
  },
  segmentText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#f9fafb",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: "600",
  },
});
