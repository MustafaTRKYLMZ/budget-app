import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@budget/core";
import LanguageSelector from "../LanguageSelector";
import { MText, colors, spacing, radii, iconSizes } from "@budget/ui-native";

interface Props {
  onOpenMenu: () => void;
  onOpenSimulation: () => void;
  onLanguageChange?: (msg: string) => void;
}

export function HomeHeader({
  onOpenMenu,
  onOpenSimulation,
  onLanguageChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={localStyles.headerRow}>
      {/* LEFT SIDE: hamburger + title / subtitle */}
      <View style={localStyles.leftContainer}>
        <TouchableOpacity
          onPress={onOpenMenu}
          style={localStyles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={22} color={colors.textInverse} />
        </TouchableOpacity>

        <View style={localStyles.headerTextBlock}>
          <MText
            variant="heading1"
            color="textPrimary"
            style={localStyles.screenTitle}
          >
            {t("budget")}
          </MText>
          <MText
            variant="body"
            color="textSecondary"
            style={localStyles.screenSubtitle}
          >
            {t("budget.desc")}
          </MText>
        </View>
      </View>

      {/* RIGHT SIDE: simulation + language */}
      <View style={localStyles.rightContainer}>
        <TouchableOpacity
          onPress={onOpenSimulation}
          style={localStyles.simButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="flask-outline"
            size={iconSizes.lg}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <LanguageSelector onLanguageChange={onLanguageChange} />
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing.sm,
  },
  headerTextBlock: {
    flexShrink: 1,
  },
  screenTitle: {},
  screenSubtitle: {
    marginTop: spacing.xs,
  },
  simButton: {
    padding: spacing.xs,
    borderRadius: radii.full,
    marginRight: spacing.xs,
  },
});
