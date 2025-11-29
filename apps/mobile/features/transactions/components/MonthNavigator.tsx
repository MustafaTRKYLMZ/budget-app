import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";

interface Props {
  monthName: string;
  year: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({ monthName, year, onPrev, onNext }: Props) {
  return (
    <View style={styles.monthHeader}>
      <TouchableOpacity
        onPress={onPrev}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={28} color="#e5e7eb" />
      </TouchableOpacity>

      <View style={styles.monthTitleBlock}>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <Text style={styles.monthYear}>{year}</Text>
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={styles.monthNavIcon}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-forward" size={28} color="#e5e7eb" />
      </TouchableOpacity>
    </View>
  );
}
