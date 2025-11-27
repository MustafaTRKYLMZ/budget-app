// apps/mobile/components/TransactionList.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Transaction } from "@budget/core";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onPressRefresh?: () => void | Promise<void>;
}

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
  onPressRefresh,
}: TransactionListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onPressRefresh) return;
    try {
      setRefreshing(true);
      await onPressRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onPressRefresh]);

  const renderItem: ListRenderItem<Transaction> = ({ item }) => {
    const isIncome = item.type === "Income";
    const isExpense = item.type === "Expense";

    const amountColor = isIncome ? "#4ade80" : "#fb7185";
    const typeLabelColor = isIncome ? "#bbf7d0" : "#fecaca";
    const typePillBg = isIncome
      ? "rgba(34,197,94,0.12)"
      : "rgba(248,113,113,0.12)";

    const dateLabel = item.date || "";
    const monthLabel = item.month || "";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onEdit(item)}
        style={styles.rowCard}
      >
        <View style={styles.rowLeft}>
          <View style={styles.rowMainText}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.item}
            </Text>
            {item.category ? (
              <Text style={styles.itemCategory} numberOfLines={1}>
                {item.category}
              </Text>
            ) : null}
          </View>

          <View style={styles.rowMeta}>
            <View style={[styles.typePill, { backgroundColor: typePillBg }]}>
              <Text style={[styles.typePillText, { color: typeLabelColor }]}>
                {item.type}
              </Text>
            </View>

            {item.isFixed && (
              <View style={styles.fixedPill}>
                <Ionicons
                  name="repeat"
                  size={12}
                  color="#bfdbfe"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.fixedPillText}>Fixed</Text>
              </View>
            )}

            <View style={styles.dateBlock}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#6b7280"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.dateText} numberOfLines={1}>
                {dateLabel || monthLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rowRight}>
          <Text style={[styles.amountText, { color: amountColor }]}>
            {isExpense && "-"}
            {Math.abs(item.amount).toFixed(2)} €
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil" size={18} color="#e5e7eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item)}
              style={styles.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color="#fca5a5" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!transactions.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="wallet-outline" size={40} color="#4b5563" />
        <Text style={styles.emptyTitle}>No transactions yet</Text>

        {onPressRefresh && (
          <TouchableOpacity
            style={styles.emptyRefreshButton}
            onPress={() => void handleRefresh()}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#e5e7eb"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.emptyRefreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onPressRefresh ? handleRefresh : undefined}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 8,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowMainText: {
    marginBottom: 6,
  },
  itemTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
  },
  itemCategory: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  fixedPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  fixedPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#bfdbfe",
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 140,
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  rowRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  amountText: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: "row",
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 12,
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    marginTop: 4,
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
  },
  emptyRefreshButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
  },
  emptyRefreshText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
});
