// apps/mobile/components/TransactionForm.tsx

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import type { LocalTransaction } from "@budget/core";
import { styles } from "../styles";
import { Ionicons } from "@expo/vector-icons";

type TransactionType = "Income" | "Expense";

type Transaction = LocalTransaction;

interface TransactionFormProps {
  mode?: "create" | "edit";
  initialTransaction?: Transaction;
  initialFixedEndMonth?: string | null;
  onSubmit: (
    tx: Transaction,
    options?: { fixedEndMonth?: string | null }
  ) => void | Promise<void>;
}

const today = dayjs().format("YYYY-MM-DD");

export default function TransactionForm({
  mode = "create",
  initialTransaction,
  initialFixedEndMonth,
  onSubmit,
}: TransactionFormProps) {
  const [date, setDate] = useState(initialTransaction?.date ?? today);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const [fixedEndMonth, setFixedEndMonth] = useState<string | null>(
    initialFixedEndMonth ?? null
  );
  const [showEndMonthPicker, setShowEndMonthPicker] = useState(false);

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
      planId: initialTransaction?.planId,
      updatedAt: initialTransaction?.updatedAt ?? new Date().toISOString(),
    };

    void onSubmit(tx, isFixed ? { fixedEndMonth } : undefined);
  };

  const titlePrefix = mode === "edit" ? "Update" : "Save";

  return (
    <View style={styles.form}>
      {/* DATE */}
      <Text style={styles.smallLabel}>Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={16}
          color="#9ca3af"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.dateButtonText}>
          {dayjs(date).format("DD MMM YYYY")}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePickerModal
          isVisible={showDatePicker}
          date={dayjs(date).toDate()}
          mode="date"
          onCancel={() => setShowDatePicker(false)}
          onConfirm={(selectedDate) => {
            setDate(dayjs(selectedDate).format("YYYY-MM-DD"));
            setShowDatePicker(false);
          }}
        />
      )}

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
            onPress={() => {
              setIsFixed(false);
              setFixedEndMonth(null);
            }}
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

      {/* FIXED END MONTH */}
      {isFixed && (
        <View style={styles.field}>
          <Text style={styles.label}>Fixed end month (optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndMonthPicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.dateButtonText}>
              {fixedEndMonth
                ? dayjs(fixedEndMonth + "-01").format("DD MMM YYYY")
                : "No end (infinite)"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={showEndMonthPicker}
            date={
              fixedEndMonth
                ? dayjs(fixedEndMonth + "-01").toDate()
                : dayjs(date).toDate()
            }
            mode="date"
            onCancel={() => setShowEndMonthPicker(false)}
            onConfirm={(selectedDate) => {
              const m = dayjs(selectedDate).format("YYYY-MM");
              setFixedEndMonth(m);
              setShowEndMonthPicker(false);
            }}
          />
        </View>
      )}

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
