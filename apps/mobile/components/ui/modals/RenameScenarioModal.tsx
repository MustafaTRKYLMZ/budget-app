import { useTranslation } from "@budget/core";
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { AppModal } from "@/components/ui/AppModal";

/**
 * rename modal – cross-platform, simple implementation
 */
interface RenameScenarioModalProps {
  visible: boolean;
  value: string;
  onChangeValue: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

function RenameScenarioModal({
  visible,
  value,
  onChangeValue,
  onCancel,
  onSave,
}: RenameScenarioModalProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <AppModal visible={visible} title={t("rename_scenario")} onClose={onCancel}>
      <View>
        <TextInput
          value={value}
          onChangeText={onChangeValue}
          style={styles.renameInput}
          placeholder={t("scenario_name")}
          placeholderTextColor="#6b7280"
        />
        <View style={styles.renameActions}>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.renameButton, styles.renameCancelButton]}
          >
            <Text style={styles.renameCancelText}>{t("cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            style={[styles.renameButton, styles.renameSaveButton]}
          >
            <Text style={styles.renameSaveText}>{t("save")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
}

export { RenameScenarioModal };

const styles = StyleSheet.create({
  renameInput: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#020617",
  },
  renameActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  renameButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  renameCancelButton: {
    backgroundColor: "transparent",
  },
  renameSaveButton: {
    backgroundColor: "#22c55e",
  },
  renameCancelText: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "500",
  },
  renameSaveText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
});
