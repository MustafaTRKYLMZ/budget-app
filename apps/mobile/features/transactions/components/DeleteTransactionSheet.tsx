import React from "react";
import { useTranslation, type LocalTransaction } from "@budget/core";
import type { DeleteScope } from "../../../store/useTransactionsStore";
import { ScopeSheet, type Scope, type ScopeOption } from "./ScopeSheet";

interface Props {
  target: LocalTransaction | null;
  onConfirm: (scope: DeleteScope) => void;
  onClose: () => void;
}

export function DeleteTransactionSheet({ target, onConfirm, onClose }: Props) {
  const { t } = useTranslation();

  if (!target) return null;

  const isPlanBased = !!target.isFixed && target.planId != null;

  const options: ScopeOption[] = isPlanBased
    ? [
        { scope: "this", label: t("this_only") },
        { scope: "thisAndFuture", label: t("this_and_future") },
        {
          scope: "all",
          label: t("all_occurrences"),
          variant: "danger",
        },
      ]
    : [
        {
          scope: "this",
          label: t("delete"),
          variant: "danger",
        },
      ];

  const handleSelect = (scope: Scope) => {
    onConfirm(scope as DeleteScope);
  };

  return (
    <ScopeSheet
      visible={!!target}
      title={
        isPlanBased ? t("transaction_fixed_delete") : t("transaction.delete")
      }
      subtitle={`${target.item} · ${target.amount.toFixed(2)} €`}
      options={options}
      cancelLabel={t("cancel")}
      onSelect={handleSelect}
      onCancel={onClose}
    />
  );
}
