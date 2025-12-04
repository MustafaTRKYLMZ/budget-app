// apps/mobile/components/ui/CashflowRow.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LocalizedDateText } from "@budget/core";
import { MText, colors, spacing, radii } from "@budget/ui-native";

export interface CashflowRowProps {
  title: string;
  type: "Income" | "Expense";
  amount: number;
  date?: string;
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

  const amountColor = isIncome ? colors.success : colors.danger;
  const arrowIconName = isIncome ? "arrow-up" : "arrow-down";

  const statusIconName = isFixed ? "repeat" : undefined;
  const statusIconColor = isFixed ? colors.primaryLight : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        localStyles.row,
        pressed && localStyles.rowPressed,
      ]}
    >
      {/* LEFT */}
      <View style={localStyles.leftCol}>
        <MText variant="bodyStrong" color="textPrimary" numberOfLines={1}>
          {title}
        </MText>

        <View style={localStyles.metaRow}>
          {date ? (
            <LocalizedDateText
              date={date}
              shortMonth
              style={localStyles.dateText}
            />
          ) : null}

          {statusIconName && (
            <Ionicons
              name={statusIconName}
              size={13}
              color={statusIconColor}
              style={{ marginRight: 4 }}
            />
          )}

          {category && (
            <MText variant="caption" color="textMuted" numberOfLines={1}>
              {category}
            </MText>
          )}
        </View>
      </View>

      {/* RIGHT */}
      <View style={localStyles.rightCol}>
        <View style={localStyles.amountRow}>
          <Ionicons
            name={arrowIconName}
            size={16}
            color={amountColor}
            style={{ marginRight: 4, marginTop: 1 }}
          />

          <MText
            variant="bodyStrong"
            color={isIncome ? "success" : "danger"}
            style={localStyles.amount}
          >
            {isExpense && "-"}
            {Math.abs(amount).toFixed(2)} €
          </MText>

          {multiplier && multiplier > 1 && (
            <View style={localStyles.multiplierPill}>
              <MText variant="caption" color="textMuted">
                ×{multiplier}
              </MText>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={localStyles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  rowPressed: {
    opacity: 0.8,
  },
  leftCol: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 6,
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  rightCol: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  multiplierPill: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  iconButton: {
    paddingHorizontal: spacing.md,
  },
});
