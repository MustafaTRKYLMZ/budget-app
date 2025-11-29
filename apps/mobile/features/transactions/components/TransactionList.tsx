import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import type { LocalTransaction } from "@budget/core";

import { useTransactionsStore } from "../../../store/useTransactionsStore";
import { styles } from "../styles";
import { CashflowRow } from "@/components/ui/CashflowRow";

interface TransactionListProps {
  transactions: LocalTransaction[];
  onDelete: (tx: LocalTransaction) => void;
  onEdit: (tx: LocalTransaction) => void;
  onPressRefresh?: () => void | Promise<void>;
}

type TxSection = {
  title: string;
  key: string;
  data: LocalTransaction[];
  cumulativeBalance: number;
};

function getTxDate(tx: LocalTransaction): dayjs.Dayjs | null {
  if (tx.date) {
    return dayjs(tx.date);
  }
  if (tx.month) {
    return dayjs(`${tx.month}-01`);
  }
  return null;
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

  const sections: TxSection[] = useMemo(() => {
    if (!transactions.length) return [];

    const getBalanceOnDate = useTransactionsStore.getState().getBalanceOnDate;

    const sorted = [...transactions].sort((a, b) => {
      const da = getTxDate(a);
      const db = getTxDate(b);

      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      return da.valueOf() - db.valueOf();
    });

    const groups: Record<string, LocalTransaction[]> = {};
    const order: string[] = [];

    for (const tx of sorted) {
      const d = getTxDate(tx);
      let key = "other";
      if (d) {
        key = d.format("YYYY-MM-DD");
      }

      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(tx);
    }

    const result: TxSection[] = order.map((key) => {
      const groupTxs = groups[key];
      let title = "Other";
      let cumulativeBalance = 0;

      if (key !== "other") {
        const d = dayjs(key);
        title = d.format("DD MMM YYYY");

        const balanceResult = getBalanceOnDate(key);
        cumulativeBalance = balanceResult.balance;
      }

      return {
        key,
        title,
        data: groupTxs,
        cumulativeBalance,
      };
    });

    return result;
  }, [transactions]);

  if (!transactions.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="wallet-outline" size={40} color="#4b5563" />
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySubtitle}>
          Add a new one with the + button or refresh.
        </Text>

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
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderSectionHeader={({ section }) =>
        section.key === "other" ? null : (
          <View style={localStyles.dateHeader}>
            <Text style={localStyles.dateHeaderTitle}>{section.title}</Text>
            <Text
              style={[
                localStyles.dateHeaderBalance,
                {
                  color:
                    section.cumulativeBalance > 0
                      ? "#4ade80"
                      : section.cumulativeBalance < 0
                      ? "#fb7185"
                      : "#9ca3af",
                },
              ]}
            >
              {section.cumulativeBalance.toFixed(2)} €
            </Text>
          </View>
        )
      }
      renderItem={({ item, index, section }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        return (
          <View
            style={[
              localStyles.cardRow,
              isFirst && localStyles.cardFirst,
              isLast && localStyles.cardLast,
            ]}
          >
            <CashflowRow
              title={item.item}
              type={item.type}
              amount={item.amount}
              date={item.date}
              category={item.category}
              isFixed={item.isFixed}
              onPress={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          </View>
        );
      }}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onPressRefresh ? handleRefresh : undefined}
      stickySectionHeadersEnabled={false}
    />
  );
}

const localStyles = StyleSheet.create({
  dateHeader: {
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateHeaderTitle: {
    color: "#f3f4f6",
    fontSize: 15,
    fontWeight: "700",
  },
  dateHeaderBalance: {
    fontSize: 15,
    fontWeight: "600",
  },

  cardRow: {
    backgroundColor: "#020819",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 12,
  },

  cardFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },

  cardLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 14,
  },
});
