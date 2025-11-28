// apps/mobile/app/modal.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Transaction } from "@budget/core";
import {
  useTransactionsStore,
  type UpdateScope,
} from "../store/useTransactionsStore";
import TransactionForm from "../components/ui/TransactionForm";

export default function TransactionModal() {
  const router = useRouter();
  const { mode = "create", id } = useLocalSearchParams<{
    mode?: string;
    id?: string;
  }>();

  const transactions = useTransactionsStore((s) => s.transactions);
  const createTransaction = useTransactionsStore((s) => s.createTransaction);
  const updateTransactionScoped = useTransactionsStore(
    (s) => s.updateTransactionScoped
  );

  const [scopeSheetOpen, setScopeSheetOpen] = useState(false);
  const [draftUpdate, setDraftUpdate] = useState<Transaction | null>(null);

  const existing = useMemo(
    () =>
      mode === "edit" && id
        ? transactions.find((t) => String(t.id) === id)
        : undefined,
    [mode, id, transactions]
  );

  const title = existing ? "Edit transaction" : "Add transaction";

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = async (tx: Transaction) => {
    // CREATE
    if (!existing) {
      await createTransaction(tx);
      router.back();
      return;
    }

    // EDIT
    const isPlanBased = Boolean(existing.isFixed && existing.planId);

    if (!isPlanBased) {
      await updateTransactionScoped(existing.id as any, tx, "this");
      router.back();
      return;
    }

    // Fixed + planId → scope sheet
    setDraftUpdate(tx);
    setScopeSheetOpen(true);
  };

  const closeScopeSheet = () => {
    setScopeSheetOpen(false);
    setDraftUpdate(null);
  };

  const applyScope = async (scope: UpdateScope) => {
    if (!existing || !draftUpdate) return;
    await updateTransactionScoped(existing.id as any, draftUpdate, scope);
    closeScopeSheet();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.cardWrapper}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <TransactionForm
                mode={existing ? "edit" : "create"}
                initialTransaction={existing}
                onSubmit={handleSubmit}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* UPDATE SCOPE BOTTOM SHEET */}
      {scopeSheetOpen && existing && draftUpdate && (
        <View style={styles.scopeOverlay}>
          {/* backdrop – dışa tıklayınca iptal */}
          <TouchableOpacity
            style={styles.scopeBackdrop}
            activeOpacity={1}
            onPress={closeScopeSheet}
          />

          <View style={styles.scopeSheet}>
            <View style={styles.scopeHandle} />

            <Text style={styles.scopeTitle}>Update fixed transaction</Text>
            <Text style={styles.scopeSubtitle}>
              {existing.item} · {existing.amount.toFixed(2)} €
            </Text>

            <TouchableOpacity
              style={styles.scopeButton}
              onPress={() => void applyScope("this")}
            >
              <Text style={styles.scopeButtonText}>This only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scopeButton}
              onPress={() => void applyScope("thisAndFuture")}
            >
              <Text style={styles.scopeButtonText}>This and future months</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scopeButton, styles.scopeDanger]}
              onPress={() => void applyScope("all")}
            >
              <Text style={[styles.scopeButtonText, styles.scopeDangerText]}>
                All occurrences
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scopeCancel}
              onPress={closeScopeSheet}
            >
              <Text style={styles.scopeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  cardWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
  },
  closeText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  body: {
    marginTop: 4,
  },

  // bottom sheet
  scopeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  scopeBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  scopeSheet: {
    backgroundColor: "#020617",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  scopeHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#4b5563",
    marginBottom: 8,
  },
  scopeTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  scopeSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  scopeButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: "center",
  },
  scopeButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  scopeDanger: {
    borderColor: "#0369a1",
  },
  scopeDangerText: {
    color: "#bae6fd",
  },
  scopeCancel: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center",
  },
  scopeCancelText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
});
