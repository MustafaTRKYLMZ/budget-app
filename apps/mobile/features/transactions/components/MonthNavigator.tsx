import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MText, colors, spacing, radii } from "@budget/ui-native";

interface Props {
  monthName: string;
  year: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({ monthName, year, onPrev, onNext }: Props) {
  return (
    <View style={styles.monthHeader}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.monthTitleBlock}>
        <MText variant="heading3" color="textPrimary">
          {monthName}
        </MText>
        <MText
          variant="caption"
          color="textSecondary"
          style={styles.yearSpacing}
        >
          {year}
        </MText>
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  monthTitleBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  yearSpacing: {
    marginTop: spacing["xs"],
  },
  monthNavIcon: {
    padding: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
