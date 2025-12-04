import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { colors, typography } from "../theme";

export type TextVariant =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "body"
  | "bodyStrong"
  | "caption";

type ColorKey = keyof typeof colors;

interface MTextProps extends TextProps {
  variant?: TextVariant;
  color?: ColorKey;
  style?: TextStyle | TextStyle[];
}

export const MText: React.FC<MTextProps> = ({
  variant = "body",
  color = "textPrimary",
  style,
  children,
  ...rest
}) => {
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: colors[color] }, style]}
    >
      {children}
    </Text>
  );
};
