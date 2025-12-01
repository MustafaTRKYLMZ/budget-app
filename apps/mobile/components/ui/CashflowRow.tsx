// apps/mobile/components/ui/CashflowRow.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LocalizedDateText } from "@budget/core";

export interface CashflowRowProps {
  title: string;
  type: "Income" | "Expense";
  amount: number;
  date?: string;

  // Optional fields — simulation sometimes won't send them
  category?: string;
  isFixed?: boolean;
  planId?: string | number;

  onPress?: () => void;
  onDelete?: () => void;
  multiplier?: number;
}

export const CashflowRow: React.FC<CashflowRowProps> = ({
  title,
  type,
  amount,
  date,
  category,
  isFixed,
  onPress,
  onDelete,
  multiplier,
}) => {
  const isIncome = type === "Income";
  const isExpense = type === "Expense";
  const amountColor = isIncome ? "#4ade80" : "#fb7185";
  const arrowIconName = isIncome ? "arrow-up" : "arrow-down";

  const statusIconName = isFixed ? "repeat" : undefined;
  const statusIconColor = isFixed ? "#bfdbfe" : "#6b7280";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {/* LEFT */}
      <View style={styles.leftCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          {date ? (
            <LocalizedDateText
              date={date}
              style={styles.dateText}
              shortMonth={true}
            />
          ) : null}

          {statusIconName && (
            <Ionicons
              name={statusIconName}
              size={13}
              color={statusIconColor}
              style={{ marginRight: 6 }}
            />
          )}

          {category && (
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          )}
        </View>
      </View>

      {/* RIGHT */}
      <View style={styles.rightCol}>
        <View style={styles.amountRow}>
          <Ionicons
            name={arrowIconName}
            size={16}
            color={amountColor}
            style={{ marginRight: 4, marginTop: 1 }}
          />
          <Text style={[styles.amount, { color: amountColor }]}>
            {isExpense && "-"}
            {Math.abs(amount).toFixed(2)} €
          </Text>
          {multiplier && multiplier > 1 && (
            <View style={styles.multiplierPill}>
              <Text style={styles.multiplierText}>×{multiplier}</Text>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#fca5a5" />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  multiplierPill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  multiplierText: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "500",
  },
  dateText: {
    color: "#9ca3af",
    fontSize: 12,
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  rowPressed: {
    opacity: 0.8,
  },
  leftCol: {
    flex: 1,
  },
  title: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  categoryText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  rightCol: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },

  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  iconButton: {
    paddingHorizontal: 12,
  },
});
