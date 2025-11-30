import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation, type LocalTransaction } from "@budget/core";
import { styles } from "../styles";

interface Props {
  target: LocalTransaction | null;
  isPlanBased: boolean;
  onConfirm: (scope: "this" | "thisAndFuture" | "all") => void;

  onClose: () => void;
}

export function DeleteTransactionSheet({
  target,
  isPlanBased,
  onConfirm,
  onClose,
}: Props) {
  if (!target) return null;
  const { t } = useTranslation();
  return (
    <View style={styles.deleteOverlay}>
      <TouchableOpacity
        style={styles.deleteBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.deleteSheet}>
        <View style={styles.deleteHandle} />
        <Text style={styles.deleteTitle}>
          {isPlanBased
            ? t("delete_fixed_transaction")
            : t("delete_transaction")}
        </Text>
        <Text style={styles.deleteSubtitle}>
          {target.item} · {target.amount.toFixed(2)} €
        </Text>
        {isPlanBased ? (
          <>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onConfirm("this")}
            >
              <Text style={styles.deleteButtonText}>{t("this_only")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onConfirm("thisAndFuture")}
            >
              <Text style={styles.deleteButtonText}>
                {t("this_and_future")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, styles.deleteDanger]}
              onPress={() => onConfirm("all")}
            >
              <Text style={[styles.deleteButtonText, styles.deleteDangerText]}>
                {t("all_occurrences")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.deleteButton, styles.deleteDanger]}
            onPress={() => onConfirm("this")}
          >
            <Text style={[styles.deleteButtonText, styles.deleteDangerText]}>
              {t("delete")}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
