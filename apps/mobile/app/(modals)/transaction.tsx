// apps/mobile/app/(modals)/transaction.tsx
import React from "react";
import { Stack } from "expo-router";
import { TransactionModalScreen } from "@/features/transactions/screens/TranslationModalScreen";

export default function TransactionRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <TransactionModalScreen />
    </>
  );
}
