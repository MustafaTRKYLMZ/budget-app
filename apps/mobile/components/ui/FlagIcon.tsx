// apps/mobile/components/ui/FlagIcon.tsx
import React from "react";
import { View, Image, ImageSourcePropType } from "react-native";
import { colors } from "@budget/ui-native";

export type LangCode = "en" | "tr";

const FLAG_SOURCES: Record<LangCode, ImageSourcePropType> = {
  en: require("../../assets/flags/en.png"),
  tr: require("../../assets/flags/tr.png"),
};

interface FlagIconProps {
  code: LangCode;
  size?: number;
}

export function FlagIcon({ code, size = 34 }: FlagIconProps) {
  const src = FLAG_SOURCES[code];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.borderSubtle,
      }}
    >
      <Image
        source={src}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}
