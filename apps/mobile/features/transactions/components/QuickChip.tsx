import { TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";

interface QuickChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const QuickChip = ({ label, active, onPress }: QuickChipProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickChip, active && styles.quickChipActive]}
    >
      <Text
        style={[styles.quickChipText, active && styles.quickChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
