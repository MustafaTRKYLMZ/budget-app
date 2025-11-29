// apps/mobile/components/ui/TransactionItem.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Transaction } from "@budget/core";
import { styles } from "../styles";
import { CashflowRow } from "@/components/ui/CashflowRow";

interface Props {
  item: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionRow = ({ item, onEdit, onDelete }: Props) => {
  const isIncome = item.type === "Income";
  const isExpense = item.type === "Expense";

  // const amountColor = isIncome ? "#4ade80" : "#fb7185";

  // const arrowIconName: keyof typeof Ionicons.glyphMap | null = isIncome
  //   ? "arrow-up"
  //   : isExpense
  //   ? "arrow-down"
  //   : null;

  // const statusIconName: keyof typeof Ionicons.glyphMap = item.isFixed
  //   ? "repeat"
  //   : "ellipse-outline";

  // const statusIconColor = item.isFixed ? "#bfdbfe" : "#6b7280";

  return (
    <CashflowRow
      title={item.item}
      type={item.type}
      amount={item.amount}
      date={item.date}
      category={item.category}
      isFixed={item.isFixed}
      onPress={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    />
  );
};
