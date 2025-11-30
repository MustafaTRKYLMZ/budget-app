import React from "react";
import { Tabs } from "expo-router";
import { useTranslation } from "@budget/core";

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
          height: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
        }}
      />

      {/* Settings screen is part of the tabs tree, but tab bar is hidden globally */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: t("nav.about"),
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: t("nav.simulation"),
        }}
      />
    </Tabs>
  );
}
