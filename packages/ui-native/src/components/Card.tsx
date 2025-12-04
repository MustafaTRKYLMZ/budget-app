// packages/ui/src/components/Card.tsx
import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { colors, spacing, radii, shadows } from "../theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ style, children, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg, // kartlar arası 16 px
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
});
