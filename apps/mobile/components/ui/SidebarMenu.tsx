import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: Props) {
  if (!open) return null;

  const go = (path: string) => {
    onClose();
    router.push(path as any);
  };

  return (
    <View style={styles.sidebarOverlay}>
      <View style={styles.sidebarPanel}>
        <View style={styles.sidebarHeaderRow}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.sidebarCloseButton}>
            <Ionicons name="close" size={22} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* MONEY */}
        <Text style={styles.sectionLabel}>Money</Text>

        <TouchableOpacity style={styles.sidebarItem} onPress={() => go("/")}>
          <Ionicons
            name="wallet-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="repeat-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Fixed Expenses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/simulation")}
        >
          <Ionicons
            name="flask-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Simulation</Text>
        </TouchableOpacity>

        {/* GROCERIES */}
        <Text style={styles.sectionLabel}>Groceries & Products</Text>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="storefront-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Markets</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="list-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Shopping Lists</Text>
        </TouchableOpacity>

        {/* INSIGHTS */}
        <Text style={styles.sectionLabel}>Insights</Text>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="analytics-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Analytics / Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="pricetags-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Price History</Text>
        </TouchableOpacity>

        {/* SYSTEM */}
        <Text style={styles.sectionLabel}>Data & System</Text>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="cloudy-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/coming-soon")}
        >
          <Ionicons
            name="download-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Import / Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/settings")}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => go("/about")}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#e5e7eb"
            style={styles.sidebarItemIcon}
          />
          <Text style={styles.sidebarItemText}>About</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sidebarBackdrop} onPress={onClose} />
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
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  sidebarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  sectionLabel: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 20,
    marginBottom: 6,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
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
