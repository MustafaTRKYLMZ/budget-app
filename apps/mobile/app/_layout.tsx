import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTransactionsStore } from "../store/useTransactionsStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useEffect } from "react";
export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  "use no memo";
  const colorScheme = useColorScheme();

  const loadFromApi = useTransactionsStore((s) => s.loadFromApi);
  const loadInitialBalance = useSettingsStore((s) => s.loadInitialBalance);

  useEffect(() => {
    loadInitialBalance();
    loadFromApi();
  }, [loadInitialBalance, loadFromApi]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
