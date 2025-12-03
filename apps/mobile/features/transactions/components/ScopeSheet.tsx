import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

export type Scope = "this" | "thisAndFuture" | "all";

export type ScopeOption = {
  scope: Scope;
  label: string;
  variant?: "default" | "danger";
};

interface ScopeSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: ScopeOption[];
  cancelLabel: string;
  onSelect: (scope: Scope) => void;
  onCancel: () => void;
}

export function ScopeSheet({
  visible,
  title,
  subtitle,
  options,
  cancelLabel,
  onSelect,
  onCancel,
}: ScopeSheetProps) {
  if (!visible) return null;

  return (
    <View style={styles.deleteOverlay}>
      <TouchableOpacity
        style={styles.deleteBackdrop}
        activeOpacity={1}
        onPress={onCancel}
      />

      <View style={styles.deleteSheet}>
        <View style={styles.deleteHandle} />
        <Text style={styles.deleteTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.deleteSubtitle}>{subtitle}</Text>
        ) : null}

        {options.map((opt) => (
          <TouchableOpacity
            key={opt.scope}
            style={[
              styles.deleteButton,
              opt.variant === "danger" && styles.deleteDanger,
            ]}
            onPress={() => onSelect(opt.scope)}
          >
            <Text
              style={[
                styles.deleteButtonText,
                opt.variant === "danger" && styles.deleteDangerText,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
