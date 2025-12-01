// apps/mobile/components/TransactionForm.tsx

import React, { useState } from "react";
import dayjs from "dayjs";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTranslation, type LocalTransaction } from "@budget/core";
import { styles } from "../styles";
import { LocalizedDatePicker } from "@/components/ui/LocalizedDatePicker";

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

export default function TransactionForm({
  mode = "create",
  initialTransaction,
  initialFixedEndMonth,
  onSubmit,
}: TransactionFormProps) {
  const [date, setDate] = useState(
    initialTransaction?.date ?? dayjs().format("YYYY-MM-DD")
  );
  const { t } = useTranslation();
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

  const handleSubmit = () => {
    const parsed = Number(String(amount).replace(",", "."));

    if (!item || Number.isNaN(parsed)) {
      alert("Item and valid amount are required.");
      return;
    }

    const month = date.slice(0, 7);

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

  const titlePrefix = mode === "edit" ? t("update") : t("save");

  return (
    <View style={styles.form}>
      {/* DATE */}
      <LocalizedDatePicker value={date} onChange={setDate} label={t("date")} />

      {/* TYPE */}
      <View style={styles.field}>
        <Text style={styles.label}>{t("type")}</Text>
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
              {t("income")}
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
              {t("expense")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FIXED? */}
      <View style={styles.field}>
        <Text style={styles.label}>{t("fixed")}?</Text>
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
              {t("no")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segment, isFixed && styles.segmentActiveNeutral]}
            onPress={() => setIsFixed(true)}
          >
            <Text
              style={[styles.segmentText, isFixed && styles.segmentTextActive]}
            >
              {t("yes")} ({t("recurring")})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FIXED END MONTH */}
      {isFixed && (
        <LocalizedDatePicker
          value={fixedEndMonth ?? date.slice(0, 7)}
          onChange={(m) => setFixedEndMonth(m)}
          label={`${t("fixed")} ${t("end")} ${t("month")} (${t("optional")})`}
        />
      )}

      {/* ITEM */}
      <View style={styles.field}>
        <Text style={styles.label}>{t("item")}</Text>
        <TextInput
          value={item}
          onChangeText={setItem}
          placeholder={`${t("rent")}, ${t("insurance")}, ${t("salary")}...`}
          placeholderTextColor="#6b7280"
          style={styles.input}
        />
      </View>

      {/* CATEGORY */}
      <View style={styles.field}>
        <Text style={styles.label}>{t("category")}</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder={`${t("transport")}, ${t("food")}...`}
          placeholderTextColor="#6b7280"
          style={styles.input}
        />
      </View>

      {/* AMOUNT */}
      <View style={styles.field}>
        <Text style={styles.label}>{t("amount")} (€)</Text>
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
