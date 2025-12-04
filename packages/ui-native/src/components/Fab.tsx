import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { colors, spacing, radii } from "../theme";

interface FABProps {
  onPress?: (e: GestureResponderEvent) => void;
  icon: ReactNode;
  style?: ViewStyle;
  placement?: "bottom-right" | "bottom-left";
  offsetBottom?: number;
  offsetHorizontal?: number;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  style,
  placement = "bottom-right",
  offsetBottom = spacing["2xl"] * 3,
  offsetHorizontal = spacing.xl,
}) => {
  const positionStyle: ViewStyle =
    placement === "bottom-right"
      ? { right: offsetHorizontal }
      : { left: offsetHorizontal };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.base, { bottom: offsetBottom }, positionStyle, style]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
