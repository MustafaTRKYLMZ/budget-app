// packages/ui/src/components/Screen.tsx
import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ style, children, ...rest }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: spacing.lg,
  },
});
