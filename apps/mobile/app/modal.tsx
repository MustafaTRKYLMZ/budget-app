// apps/mobile/app/modal.tsx
import React from "react";
import { StatusBar, Alert } from "react-native";
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
  const updateExisting = useTransactionsStore((s) => s.updateExisting);

  const initialTransaction: Transaction | undefined =
    mode === "edit" && params.id ? getById(params.id) : undefined;

  const handleSubmit = async (tx: Transaction) => {
    try {
      if (mode === "edit") {
        await updateExisting(tx);
      } else {
        await addTransaction(tx);
      }
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save transaction.");
    }
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
