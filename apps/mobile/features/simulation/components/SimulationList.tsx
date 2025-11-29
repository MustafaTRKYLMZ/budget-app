// apps/mobile/features/simulation/components/SimulationList.tsx
import React from "react";
import { View } from "react-native";
import { CashflowRow } from "@/components/ui/CashflowRow";
import { SimulationItem } from "@/store/useSimulationStore";

interface SimulationListProps {
  items: SimulationItem[];
  onDelete: (id: string) => void;
}

export const SimulationList: React.FC<SimulationListProps> = ({
  items,
  onDelete,
}) => {
  return (
    <>
      {items.map((it) => (
        <CashflowRow
          key={it.id}
          title={it.item}
          type={it.type}
          amount={it.amount}
          date={it.date}
          category={it.category}
          isFixed={it.isFixed}
          onDelete={() => onDelete(it.id)}
        />
      ))}
    </>
  );
};
