// apps/mobile/app/modal.tsx
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import TransactionForm from "../components/TransactionForm";
import type { Transaction } from "@budget/core";
import { useTransactionsStore } from "../store/useTransactionsStore";

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; mode?: string }>();

  const mode: "create" | "edit" = params.mode === "edit" ? "edit" : "create";

  const getById = useTransactionsStore((s) => s.getById);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);

  const initialTransaction: Transaction | undefined =
    mode === "edit" && params.id ? getById(params.id) : undefined;

  const handleSubmit = (tx: Transaction) => {
    if (mode === "edit") {
      updateTransaction(tx);
    } else {
      addTransaction(tx);
    }
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <StatusBar />
      <TransactionForm
        mode={mode}
        initialTransaction={initialTransaction}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
