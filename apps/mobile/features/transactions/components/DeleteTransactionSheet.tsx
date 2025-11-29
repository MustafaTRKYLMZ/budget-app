import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Transaction } from "@budget/core";
import { styles } from "../styles";

interface Props {
  target: Transaction | null;
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
          {isPlanBased ? "Delete fixed transaction" : "Delete transaction"}
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
              <Text style={styles.deleteButtonText}>This only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onConfirm("thisAndFuture")}
            >
              <Text style={styles.deleteButtonText}>
                This and future months
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, styles.deleteDanger]}
              onPress={() => onConfirm("all")}
            >
              <Text style={[styles.deleteButtonText, styles.deleteDangerText]}>
                All occurrences
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.deleteButton, styles.deleteDanger]}
            onPress={() => onConfirm("this")}
          >
            <Text style={[styles.deleteButtonText, styles.deleteDangerText]}>
              Delete
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
