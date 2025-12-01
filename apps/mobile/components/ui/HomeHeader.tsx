import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@budget/core";
import LanguageSelector from "../LanguageSelector";

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
    <View style={styles.headerRow}>
      {/* LEFT SIDE: hamburger + title / subtitle */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={onOpenMenu}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={24} color="#e5e7eb" />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.screenTitle}>{t("budget")}</Text>
          <Text style={styles.screenSubtitle}>{t("budget.desc")}</Text>
        </View>
      </View>
      {/* RIGHT SIDE: simulation + language */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          onPress={onOpenSimulation}
          style={styles.simButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="flask-outline" size={22} color="#a5b4fc" />
        </TouchableOpacity>
        <LanguageSelector onLanguageChange={onLanguageChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  leftContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    flexShrink: 1,
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuButton: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginRight: 10,
  },

  headerTextBlock: {
    flexShrink: 1,
  },

  screenTitle: {
    color: "#f9fafb",
    fontSize: 24,
    fontWeight: "800",
  },

  screenSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },

  simButton: {
    padding: 6,
    borderRadius: 999,
    marginRight: 6,
  },
});
