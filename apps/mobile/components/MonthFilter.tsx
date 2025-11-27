import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import dayjs from "dayjs";

interface MonthFilterProps {
  month: string; // "YYYY-MM" or ""
  onChange: (month: string) => void;
}

export default function MonthFilter({ month, onChange }: MonthFilterProps) {
  const currentMonth = dayjs().format("YYYY-MM");

  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    dayjs().add(i, "month").format("YYYY-MM")
  );

  const isShowingAll = month === "";
  const selectedMonth = isShowingAll ? currentMonth : month || currentMonth;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (m: string) => {
    onChange(m);
    setIsModalVisible(false);
  };

  const handleToggleShowAll = () => {
    if (isShowingAll) {
      onChange(currentMonth);
    } else {
      onChange("");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Month filter</Text>
        <Text style={styles.subtitle}>View current month or all records</Text>
      </View>

      {/* Filter Controls */}
      <View style={styles.row}>
        {/* Month select button */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.selectButton}
        >
          <Text style={styles.selectButtonText}>{selectedMonth}</Text>
        </TouchableOpacity>

        {/* Toggle show all */}
        <TouchableOpacity
          onPress={handleToggleShowAll}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isShowingAll ? "Back to current" : "Show all"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month list modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay} />

        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select month</Text>

          <FlatList
            data={monthOptions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.monthItem,
                  item === selectedMonth && styles.monthItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.monthText,
                    item === selectedMonth && styles.monthTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15,23,42,0.8)", // slate-900/80
    borderWidth: 1,
    borderColor: "#1e293b", // slate-800
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  header: {},
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  selectButton: {
    flex: 1,
    backgroundColor: "#020617",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  selectButtonText: {
    color: "#f1f5f9",
    fontSize: 14,
  },

  toggleButton: {
    borderWidth: 1,
    borderColor: "#475569",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 12,
    color: "#e2e8f0",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#1e293b", // slate-800
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    fontSize: 16,
    color: "#e2e8f0",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  monthItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  monthItemActive: {
    backgroundColor: "rgba(59,130,246,0.2)", // sky-500/20
  },
  monthText: {
    fontSize: 14,
    color: "#e2e8f0",
    textAlign: "center",
  },
  monthTextActive: {
    fontWeight: "600",
  },

  closeButton: {
    marginTop: 12,
    backgroundColor: "#334155",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#f1f5f9",
  },
});
