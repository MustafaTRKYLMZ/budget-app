import { colors } from "../theme";

export function getBalanceColor(value: number): string {
  if (value > 0) return colors.success;
  if (value < 0) return colors.danger;
  return colors.textMuted;
}
