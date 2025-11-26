// apps/mobile/src/components/TransactionList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import type { Transaction } from "@budget/core";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
}: TransactionListProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>
            {transactions.length} record
            {transactions.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No records.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isIncome = item.type === "Income";
          const amountColor = isIncome
            ? styles.amountIncome
            : styles.amountExpense;
          const typeBadgeStyle = isIncome
            ? [styles.typeBadge, styles.typeBadgeIncome]
            : [styles.typeBadge, styles.typeBadgeExpense];

          const fixedBadgeStyle = item.isFixed
            ? [styles.fixedBadge, styles.fixedBadgeYes]
            : [styles.fixedBadge, styles.fixedBadgeNo];

          return (
            <View style={styles.card}>
              {/* Üst satır: tarih, ay, tip */}
              <View style={styles.rowBetween}>
                <View style={styles.leftBlock}>
                  <Text style={styles.date}>{item.date}</Text>
                  <Text style={styles.month}>{item.month}</Text>
                </View>
                <View style={styles.typeBlock}>
                  <Text style={typeBadgeStyle as any}>{item.type}</Text>
                </View>
              </View>

              {/* Orta satır: item, category, fixed */}
              <View style={[styles.rowBetween, styles.middleRow]}>
                <View style={styles.leftBlock}>
                  <Text style={styles.itemText}>{item.item}</Text>
                  {item.category ? (
                    <Text style={styles.categoryText}>{item.category}</Text>
                  ) : null}
                </View>
                <Text style={fixedBadgeStyle as any}>
                  {item.isFixed ? "Yes" : "No"}
                </Text>
              </View>

              {/* Alt satır: amount + actions */}
              <View style={styles.rowBetween}>
                <Text style={[styles.amount, amountColor]}>
                  {item.amount.toFixed(2)} €
                </Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => onEdit(item)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDelete(item)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Text style={styles.actionDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617", // slate-950
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb", // slate-100
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8", // slate-400
    marginTop: 2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280", // slate-500
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.9)", // slate-900/90
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.4)", // hafif mavi/slate karışımı
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftBlock: {
    flexDirection: "column",
  },
  date: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  month: {
    fontSize: 11,
    color: "#9ca3af",
  },
  typeBlock: {},
  typeBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  typeBadgeIncome: {
    backgroundColor: "rgba(16,185,129,0.12)", // emerald-500/10
    color: "#6ee7b7", // emerald-300
    borderColor: "rgba(16,185,129,0.4)",
  },
  typeBadgeExpense: {
    backgroundColor: "rgba(244,63,94,0.12)", // rose-500/10
    color: "#fda4af", // rose-300
    borderColor: "rgba(244,63,94,0.4)",
  },
  middleRow: {
    marginTop: 8,
  },
  itemText: {
    fontSize: 13,
    color: "#e5e7eb",
    fontWeight: "500",
  },
  categoryText: {
    fontSize: 12,
    color: "#cbd5f5",
    marginTop: 2,
  },
  fixedBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  fixedBadgeYes: {
    backgroundColor: "rgba(245,158,11,0.14)", // amber-500/10
    color: "#fbbf24", // amber-300
    borderColor: "rgba(245,158,11,0.5)",
  },
  fixedBadgeNo: {
    backgroundColor: "rgba(51,65,85,0.7)", // slate-700/60
    color: "#e5e7eb",
    borderColor: "#475569", // slate-600
  },
  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
  amountIncome: {
    color: "#4ade80", // emerald-400
  },
  amountExpense: {
    color: "#fb7185", // rose-400
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: "#475569", // slate-700
    backgroundColor: "rgba(15,23,42,0.7)",
  },
  deleteButton: {
    borderColor: "rgba(248,113,113,0.8)", // red-400-ish
    backgroundColor: "rgba(127,29,29,0.3)", // dark red/rose
  },
  actionText: {
    fontSize: 11,
    color: "#e5e7eb",
  },
  actionDeleteText: {
    fontSize: 11,
    color: "#fecaca", // red-200-ish
  },
});
