import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  onOpenMenu: () => void;
}

export function HomeHeader({ onOpenMenu }: Props) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity
        onPress={onOpenMenu}
        style={styles.menuButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="menu" size={24} color="#e5e7eb" />
      </TouchableOpacity>

      <View style={styles.headerTextBlock}>
        <Text style={styles.screenTitle}>Budget</Text>
        <Text style={styles.screenSubtitle}>Personal finance overview</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  menuButton: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginRight: 10,
  },
  headerTextBlock: {
    flex: 1,
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
});
