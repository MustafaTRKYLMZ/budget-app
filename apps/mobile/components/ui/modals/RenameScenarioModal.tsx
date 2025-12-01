import { useTranslation } from "@budget/core";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

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
  if (!visible) return null;
  const { t } = useTranslation();

  return (
    <View style={styles.renameOverlay}>
      <View style={styles.renameCard}>
        <Text style={styles.renameTitle}>{t("rename_scenario")}</Text>
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
    </View>
  );
}

export { RenameScenarioModal };

const styles = StyleSheet.create({
  // Rename modal
  renameOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  renameCard: {
    width: "80%",
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  renameTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 12,
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
