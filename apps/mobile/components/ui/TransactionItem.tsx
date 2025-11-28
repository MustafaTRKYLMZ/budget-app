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

interface Props {
  item: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export function TransactionItem({ item, onEdit, onDelete }: Props) {
  const isIncome = item.type === "Income";
  const isExpense = item.type === "Expense";

  const amountColor = isIncome ? "#4ade80" : "#fb7185";

  const arrowIconName: keyof typeof Ionicons.glyphMap | null = isIncome
    ? "arrow-up"
    : isExpense
    ? "arrow-down"
    : null;

  // 🔁 sabit vs tek seferlik işlemler için ikon
  const statusIconName: keyof typeof Ionicons.glyphMap = item.isFixed
    ? "repeat" // sabit
    : "ellipse-outline"; // tek seferlik

  const statusIconColor = item.isFixed ? "#bfdbfe" : "#6b7280";

  return (
    <Pressable
      onPress={() => onEdit(item)}
      style={({ pressed }) => [
        styles.rowCard,
        pressed && styles.rowCardPressed,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      {/* LEFT */}
      <View style={styles.leftCol}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.item}
        </Text>

        <View style={styles.metaRow}>
          {/* sabit / tek seferlik durum ikonu */}
          <Ionicons
            name={statusIconName}
            size={13}
            color={statusIconColor}
            style={{ marginRight: 6 }}
          />

          {/* Category */}
          {item.category ? (
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category}
            </Text>
          ) : null}
        </View>
      </View>

      {/* RIGHT */}
      <View style={styles.rightCol}>
        <View style={styles.amountRow}>
          {arrowIconName && (
            <Ionicons
              name={arrowIconName}
              size={16}
              color={amountColor}
              style={{ marginRight: 4, marginTop: 1 }}
            />
          )}
          <Text style={[styles.amountText, { color: amountColor }]}>
            {isExpense && "-"}
            {Math.abs(item.amount).toFixed(2)} €
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#fca5a5" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 8,
  },
  rowCardPressed: {
    borderColor: "#22c55e33",
    backgroundColor: "#020819",
  },

  leftCol: {
    flex: 1,
    paddingRight: 8,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  itemTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryText: {
    color: "#9ca3af",
    fontSize: 13,
    maxWidth: 160,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  amountText: {
    fontSize: 17,
    fontWeight: "700",
  },

  actionRow: {
    flexDirection: "row",
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
