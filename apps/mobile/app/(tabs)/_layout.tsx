import React from "react";
import { Tabs } from "expo-router";

export default function TabLayout() {
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
          title: "Home",
        }}
      />

      {/* Settings screen is part of the tabs tree, but tab bar is hidden globally */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: "About",
        }}
      />
      <Tabs.Screen
        name="simulation"
        options={{
          title: "Simulation",
        }}
      />
    </Tabs>
  );
}
