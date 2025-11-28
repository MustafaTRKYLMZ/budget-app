import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Transaction } from "@budget/core";

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

const styles = StyleSheet.create({
  deleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 40,
  },
  deleteBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  deleteSheet: {
    backgroundColor: "#020617",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  deleteHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#4b5563",
    marginBottom: 8,
  },
  deleteTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  deleteSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  deleteButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteDanger: {
    borderColor: "#b91c1c",
  },
  deleteDangerText: {
    color: "#fecaca",
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
});
