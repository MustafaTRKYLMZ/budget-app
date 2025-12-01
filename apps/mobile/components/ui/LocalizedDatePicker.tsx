import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { getLocalizedDateParts, useTranslation } from "@budget/core";

interface Props {
  value: string; // "YYYY-MM-DD"
  label?: string;
  onChange: (dateStr: string) => void;
}

export function LocalizedDatePicker({ value, label, onChange }: Props) {
  const [isOpen, setOpen] = useState(false);
  const { language, t } = useTranslation();

  const { day, monthShort, year } = getLocalizedDateParts(value, language);

  return (
    <>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* MAIN BUTTON */}
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#94a3b8"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.buttonText}>
          {day} {monthShort} {year}
        </Text>
      </TouchableOpacity>

      {/* CUSTOM HEADER + PICKER */}
      <Modal visible={isOpen} transparent animationType="fade">
        {/* BACKDROP */}
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        />

        {/* BOTTOM SHEET */}
        <View style={styles.sheet}>
          <DateTimePickerModal
            isVisible={true}
            date={dayjs(value).toDate()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onCancel={() => setOpen(false)}
            onConfirm={(d) => {
              onChange(dayjs(d).format("YYYY-MM-DD"));
              setOpen(false);
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0f172a",
  },
  buttonText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "500",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.65)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  sheetTitle: {
    color: "#f1f5f9",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
