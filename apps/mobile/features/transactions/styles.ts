import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    listContent: {
      paddingVertical: 4,
    },
  
    sectionHeader: {
      marginTop: 8,
      marginBottom: 4,
      paddingHorizontal: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      color: "#9ca3af",
      fontSize: 13,
      fontWeight: "600",
    },
    sectionBalance: {
      fontSize: 13,
      fontWeight: "600",
    },
  
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    emptyTitle: {
      marginTop: 12,
      color: "#e5e7eb",
      fontSize: 16,
      fontWeight: "600",
    },
    emptySubtitle: {
      marginTop: 4,
      color: "#9ca3af",
      fontSize: 13,
      textAlign: "center",
    },
    emptyRefreshButton: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#374151",
    },
    emptyRefreshText: {
      color: "#e5e7eb",
      fontSize: 13,
      fontWeight: "500",
    },

    //transaction row styles
    rowCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: "#020617",
      borderWidth: 1,
      borderColor: "#1f2937",
      marginBottom: 8,
    },
    rowCardPressed: {
      borderColor: "#22c55e33",
      backgroundColor: "#020819",
    },
  
    leftCol: {
      flex: 1,
      paddingRight: 8,
    },
    rightCol: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
  
    itemTitle: {
      color: "#f9fafb",
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
  
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    categoryText: {
      color: "#9ca3af",
      fontSize: 13,
      maxWidth: 160,
    },
  
    amountRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    amountText: {
      fontSize: 17,
      fontWeight: "700",
    },
  
    actionRow: {
      flexDirection: "row",
    },
    iconButton: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 999,
    },
    //transaction form styles
    smallLabel: {
      color: "#9ca3af",
      fontSize: 12,
      marginBottom: 4,
      marginTop: 6,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#1f2937",
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    dateButtonText: {
      color: "#e5e7eb",
      fontSize: 14,
      fontWeight: "500",
    },
    form: {
      gap: 12,
    },
    field: {
      gap: 4,
    },
    label: {
      color: "#e5e7eb",
      fontSize: 13,
      fontWeight: "500",
    },
    input: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#374151",
      backgroundColor: "#020617",
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: "#f9fafb",
      fontSize: 14,
    },
    segmentRow: {
      flexDirection: "row",
      gap: 8,
    },
    segment: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#374151",
      paddingVertical: 6,
      alignItems: "center",
      backgroundColor: "#020617",
    },
    segmentActiveIncome: {
      borderColor: "#16a34a",
      backgroundColor: "#022c22",
    },
    segmentActiveExpense: {
      borderColor: "#dc2626",
      backgroundColor: "#450a0a",
    },
    segmentActiveNeutral: {
      borderColor: "#0ea5e9",
      backgroundColor: "#082f49",
    },
    segmentText: {
      color: "#9ca3af",
      fontSize: 13,
      fontWeight: "500",
    },
    segmentTextActive: {
      color: "#f9fafb",
    },
    submitButton: {
      marginTop: 8,
      borderRadius: 999,
      backgroundColor: "#0ea5e9",
      paddingVertical: 10,
      alignItems: "center",
    },
    submitText: {
      color: "#f9fafb",
      fontSize: 15,
      fontWeight: "600",
    },

    // month navigator styles
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    monthTitleBlock: {
      alignItems: "center",
      justifyContent: "center",
    },
    monthTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#f3f4f6",
    },
    monthYear: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: "500",
      color: "#9ca3af",
    },
    monthNavIcon: {
      padding: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#1f2937",
    },
    // monthly balance bar styles
    balanceBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 18,
      backgroundColor: "#020617",
      borderWidth: 1,
      borderColor: "#1e293b",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    balanceColumn: {
      flex: 1,
    },
    balanceLabel: {
      color: "#9ca3af",
      fontSize: 13,
      marginBottom: 2,
    },
    balanceValue: {
      color: "#e5e7eb",
      fontSize: 17,
      fontWeight: "700",
    },

    // delete transaction sheet styles

    deleteOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
      zIndex: 40,
    },
    deleteBackdrop: {
      flex: 1,
      backgroundColor: "rgba(15,23,42,0.6)",
    },
    deleteSheet: {
      backgroundColor: "#020617",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderColor: "#1f2937",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
    },
    deleteHandle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 999,
      backgroundColor: "#4b5563",
      marginBottom: 8,
    },
    deleteTitle: {
      color: "#f9fafb",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    deleteSubtitle: {
      color: "#9ca3af",
      fontSize: 13,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 12,
    },
    deleteButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#4b5563",
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 8,
      alignItems: "center",
    },
    deleteButtonText: {
      color: "#e5e7eb",
      fontSize: 14,
      fontWeight: "600",
    },
    deleteDanger: {
      borderColor: "#b91c1c",
    },
    deleteDangerText: {
      color: "#fecaca",
    },
    cancelButton: {
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: "#111827",
      paddingVertical: 10,
      alignItems: "center",
    },
    cancelButtonText: {
      color: "#e5e7eb",
      fontSize: 14,
      fontWeight: "600",
    },

  
    // daily balance section styles
    dailyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 8,
    },
    dailyLabel: {
      color: "#9ca3af",
      fontSize: 12,
      marginBottom: 2,
    },
    dailyDateButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start", 
    },
    dailyDateText: {
      color: "#e5e7eb",
      fontSize: 14,
      fontWeight: "500",
    },
    dailyAmount: {
      fontSize: 18,
      fontWeight: "700",
    },

    quickRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    quickChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#1e293b",
      marginRight: 8,
    },
    quickChipActive: {
      backgroundColor: "#22c55e",
      borderColor: "#22c55e",
    },
    quickChipText: {
      color: "#9ca3af",
      fontSize: 12,
      fontWeight: "500",
    },
    quickChipTextActive: {
      color: "#0f172a",
      fontWeight: "600",
    },
  });