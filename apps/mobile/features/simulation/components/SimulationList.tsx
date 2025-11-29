import React from "react";
import { View } from "react-native";
import type { SimulationItem } from "../../../store/useSimulationStore";
import { CashflowRow } from "@/components/ui/CashflowRow";
import { getOccurrencesUntilDate } from "@/helper/getOccurrencesUntilDate";

interface SimulationListProps {
  items: SimulationItem[];
  onDelete: (id: string) => void;
  targetDate: string;
}

export const SimulationList: React.FC<SimulationListProps> = ({
  items,
  onDelete,
  targetDate,
}) => {
  return (
    <View>
      {items.map((it) => {
        const occurrences = getOccurrencesUntilDate(it, targetDate);
        return (
          <CashflowRow
            key={it.id}
            title={it.item}
            type={it.type}
            amount={it.amount}
            date={it.date}
            category={it.category}
            isFixed={it.isFixed}
            multiplier={occurrences > 1 ? occurrences : undefined}
            onDelete={() => onDelete(it.id)}
          />
        );
      })}
    </View>
  );
};
