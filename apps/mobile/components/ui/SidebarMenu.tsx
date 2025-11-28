import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function SidebarMenu({
  open,
  onClose,
  onOpenSettings,
  onOpenAbout,
}: Props) {
  if (!open) return null;

  return (
    <View style={styles.sidebarOverlay}>
      {/* LEFT PANEL */}
      <View style={styles.sidebarPanel}>
        {/* HEADER */}
        <View style={styles.sidebarHeaderRow}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.sidebarCloseButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* CONTENT – grows automatically */}
        <View style={styles.sidebarContent}>
          {/* Extra menu items can be added here later */}
        </View>

        {/* FOOTER – pinned bottom */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.versionText}>Version 1.0.0</Text>

          <TouchableOpacity style={styles.sidebarItem} onPress={onOpenSettings}>
            <Ionicons
              name="settings-outline"
              size={22}
              color="#e5e7eb"
              style={styles.sidebarItemIcon}
            />
            <Text style={styles.sidebarItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarItem} onPress={onOpenAbout}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#e5e7eb"
              style={styles.sidebarItemIcon}
            />
            <Text style={styles.sidebarItemText}>About</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BACKDROP */}
      <TouchableOpacity
        style={styles.sidebarBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 30,
  },
  sidebarPanel: {
    width: 260,
    backgroundColor: "#020617",
    paddingTop: 56,
    paddingBottom: 32,
    borderRightWidth: 1,
    borderRightColor: "#1f2937",

    flexDirection: "column",
    justifyContent: "space-between", // Keep items at top & bottom
  },

  sidebarContent: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  sidebarFooter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  versionText: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 10,
  },

  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },

  sidebarHeaderRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  sidebarTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
  },

  sidebarCloseButton: {
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
  },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  sidebarItemIcon: {
    marginRight: 10,
  },

  sidebarItemText: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "500",
  },
});
