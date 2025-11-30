import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useTranslation, theme } from "@budget/core";

type Props = {
  onLanguageChange?: (msg: string) => void;
};

export default function LanguageSelector({ onLanguageChange }: Props) {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const flags = {
    en: "🇬🇧",
    tr: "🇹🇷",
  };

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: open ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const changeLanguage = (lng: "en" | "tr") => {
    setLanguage(lng);
    if (onLanguageChange) {
      onLanguageChange(
        lng === "en" ? "Language changed to English" : "Dil Türkçe yapıldı"
      );
    }

    setOpen(false);
  };

  const dropdownStyle = {
    opacity: dropdownAnim,
    transform: [
      {
        scale: dropdownAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.flagButton} onPress={toggleDropdown}>
        <Text style={styles.flagText}>{flags[language]}</Text>
      </TouchableOpacity>

      {open && (
        <Animated.View style={[styles.dropdown, dropdownStyle]}>
          {language !== "en" && (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => changeLanguage("en")}
            >
              <Text style={styles.dropdownFlag}>🇬🇧</Text>
            </TouchableOpacity>
          )}

          {language !== "tr" && (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => changeLanguage("tr")}
            >
              <Text style={styles.dropdownFlag}>🇹🇷</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 10,
    position: "relative",
  },

  flagButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  flagText: {
    fontSize: 22,
  },

  dropdown: {
    position: "absolute",
    top: 46,
    right: 0,
    paddingVertical: 6,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    zIndex: 20,
    minWidth: 48,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  dropdownFlag: {
    fontSize: 22,
  },
});
