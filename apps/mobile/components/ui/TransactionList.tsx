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
import type { Transaction } from "@budget/core";

import { TransactionItem } from "./TransactionItem";
import { useTransactionsStore } from "../../store/useTransactionsStore";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onPressRefresh?: () => void | Promise<void>;
}

type TxSection = {
  title: string; // header label (formatlı tarih)
  key: string; // normalize tarih: "YYYY-MM-DD" veya "other"
  data: Transaction[];
  cumulativeBalance: number; // o tarihe kadar olan toplam bakiye
};

function getTxDate(tx: Transaction): dayjs.Dayjs | null {
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

    // Zustand store'daki global hesaplama fonksiyonu
    const getBalanceOnDate = useTransactionsStore.getState().getBalanceOnDate;

    // 1) Önce tüm transaction'ları tarihe göre sırala
    const sorted = [...transactions].sort((a, b) => {
      const da = getTxDate(a);
      const db = getTxDate(b);

      // tarih yoksa en alta at
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      // Şu an senin kodunda bu şekildeydi:
      // küçük tarih önce, büyük tarih sonra (eski → yeni)
      return da.valueOf() - db.valueOf();
    });

    // 2) Sıralı listeden grupları üret (order'ı koruyarak)
    const groups: Record<string, Transaction[]> = {};
    const order: string[] = [];

    for (const tx of sorted) {
      const d = getTxDate(tx);

      let key = "other";
      if (d) {
        key = d.format("YYYY-MM-DD");
      }

      if (!groups[key]) {
        groups[key] = [];
        order.push(key); // ilk defa gördüğümüz key → order listesine ekle
      }
      groups[key].push(tx);
    }

    // 3) Section array: key'leri order'a göre dön (bir daha sort YOK)
    const result: TxSection[] = order.map((key) => {
      const groupTxs = groups[key];
      let title = "Other";
      let cumulativeBalance = 0;

      if (key !== "other") {
        const d = dayjs(key);
        title = d.format("DD MMM YYYY");

        // 🔥 Asıl sihir burada: o tarihe kadar olan toplam bakiye
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
      renderItem={({ item }) => (
        <TransactionItem item={item} onEdit={onEdit} onDelete={onDelete} />
      )}
      renderSectionHeader={({ section }) =>
        section.key === "other" ? null : (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text
              style={[
                styles.sectionBalance,
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
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onPressRefresh ? handleRefresh : undefined}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },

  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionBalance: {
    fontSize: 13,
    fontWeight: "600",
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
