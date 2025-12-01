// apps/mobile/components/modals/SimulationItemModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SimulationItemType } from "../../../store/useSimulationStore";
import { LocalizedDatePicker } from "@/components/ui/LocalizedDatePicker";

interface Props {
  visible: boolean;
  initialDate: string; // "YYYY-MM-DD"
  onClose: () => void;
  onSubmit: (payload: {
    type: SimulationItemType;
    item: string;
    amount: number;
    date: string; // "YYYY-MM-DD"
    isFixed: boolean;
  }) => void;
}

export function SimulationItemModal({
  visible,
  initialDate,
  onClose,
  onSubmit,
}: Props) {
  const [type, setType] = useState<SimulationItemType>("Expense");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(initialDate);
  const [isFixed, setIsFixed] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setType("Expense");
      setItem("");
      setAmount("");
      setDate(initialDate);
    }
  }, [visible, initialDate]);

  const handleSubmit = () => {
    const numericAmount = Number(amount);

    if (!item.trim() || !numericAmount || !date) {
      return;
    }

    onSubmit({
      type,
      item: item.trim(),
      amount: numericAmount,
      date,
      isFixed,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.backdrop}
        onPress={onClose}
      />

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Add simulation item</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color="#e5e7eb" />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.smallLabel}>Type</Text>
          <View style={styles.typeRow}>
            <TypeChip
              label="Expense"
              active={type === "Expense"}
              onPress={() => setType("Expense")}
            />
            <TypeChip
              label="Income"
              active={type === "Income"}
              onPress={() => setType("Income")}
            />
          </View>

          {/* FIXED? */}
          <View style={styles.field}>
            <Text style={styles.label}>Fixed?</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  !isFixed && styles.segmentActiveNeutral,
                ]}
                onPress={() => setIsFixed(false)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    !isFixed && styles.segmentTextActive,
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, isFixed && styles.segmentActiveNeutral]}
                onPress={() => setIsFixed(true)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isFixed && styles.segmentTextActive,
                  ]}
                >
                  Yes (recurring)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.smallLabel}>Item</Text>
          <TextInput
            placeholder="e.g. New sofa"
            placeholderTextColor="#6b7280"
            value={item}
            onChangeText={setItem}
            style={styles.input}
          />

          <Text style={styles.smallLabel}>Amount</Text>
          <TextInput
            placeholder="e.g. 1200"
            placeholderTextColor="#6b7280"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          {/* localized, reusable picker */}
          <LocalizedDatePicker value={date} onChange={setDate} label="Date" />
        </View>

        {/* BUTTONS */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              color="#0f172a"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addButtonText}>Add to scenario</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface TypeChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TypeChip({ label, active, onPress }: TypeChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.typeChip, active && styles.typeChipActive]}
    >
      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  segment: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#020617",
  },
  segmentActiveNeutral: {
    borderColor: "#0ea5e9",
    backgroundColor: "#082f49",
  },
  segmentText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#f9fafb",
  },
  field: {
    gap: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#4b5563",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginTop: 4,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  typeChipText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
  },
  typeChipTextActive: {
    color: "#0f172a",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 14,
  },
  smallLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 8,
  },
  cancelText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#22c55e",
  },
  addButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
});
