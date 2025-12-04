// packages/ui/src/components/Header.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { MText } from "./MText";
import { colors, spacing } from "../theme";

interface HeaderProps {
  title: string;
  right?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, right }) => {
  return (
    <View style={styles.container}>
      <MText variant="heading2" color="textPrimary">
        {title}
      </MText>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  right: {
    marginLeft: "auto",
  },
});
