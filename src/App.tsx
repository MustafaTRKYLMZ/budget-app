// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Transaction, FixedPlan } from "./types";
import TransactionForm from "./components/TransactionForm";
import MonthFilter from "./components/MonthFilter";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import Modal from "./components/Modal";

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "budget_transactions",
    []
  );

  const [fixedPlans, setFixedPlans] = useLocalStorage<FixedPlan[]>(
    "budget_fixed_plans",
    []
  );

  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    dayjs().format("YYYY-MM")
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Delete modal state (for fixed/plan-based items)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Update-scope modal state (for fixed/plan-based items)
  const [isUpdateScopeModalOpen, setIsUpdateScopeModalOpen] =
    useState<boolean>(false);
  const [pendingUpdateOriginal, setPendingUpdateOriginal] =
    useState<Transaction | null>(null);
  const [pendingUpdateNew, setPendingUpdateNew] = useState<Transaction | null>(
    null
  );

  /**
   * Given current transactions + fixedPlans and a target month,
   * ensure that for each active FixedPlan we have exactly ONE
   * transaction row for that month.
   */
  const applyFixedPlansForMonth = (
    baseTransactions: Transaction[],
    plans: FixedPlan[],
    targetMonth: string
  ): Transaction[] => {
    if (!targetMonth) return baseTransactions;

    const result = [...baseTransactions];

    for (const plan of plans) {
      // Is this plan active in targetMonth?
      const isAfterStart = targetMonth >= plan.startMonth;
      const isBeforeEnd =
        plan.endMonth === null || targetMonth <= plan.endMonth;

      if (!isAfterStart || !isBeforeEnd) continue;

      // Already have a transaction for this plan & month?
      const alreadyExists = result.some(
        (t) => t.planId === plan.id && t.month === targetMonth
      );
      if (alreadyExists) continue;

      const dateForMonth = dayjs(`${targetMonth}-01`).format("YYYY-MM-DD");

      result.push({
        id: Date.now() + Math.random(),
        date: dateForMonth,
        month: targetMonth,
        type: plan.type,
        item: plan.item,
        category: plan.category,
        amount: plan.amount,
        isFixed: true,
        planId: plan.id,
      });
    }

    return result;
  };

  /**
   * Add transaction from form.
   * If it is "fixed", create/use a FixedPlan and attach planId.
   */
  const handleAddTransaction = (transaction: Transaction) => {
    // Normalize month from date, just in case
    const monthFromDate =
      transaction.date && transaction.date.length >= 7
        ? transaction.date.slice(0, 7)
        : dayjs().format("YYYY-MM");

    const baseTx: Transaction = {
      ...transaction,
      month: monthFromDate,
    };

    if (baseTx.isFixed) {
      const startMonth = baseTx.month;

      // Try to find an existing plan with same item+type+amount+category
      const existingPlan = fixedPlans.find(
        (p) =>
          p.item === baseTx.item &&
          p.type === baseTx.type &&
          p.amount === baseTx.amount &&
          (p.category ?? "") === (baseTx.category ?? "")
      );

      let planId = existingPlan?.id;

      if (!existingPlan) {
        const newPlan: FixedPlan = {
          id: Date.now() + Math.random(),
          type: baseTx.type,
          item: baseTx.item,
          category: baseTx.category,
          amount: baseTx.amount,
          startMonth,
          endMonth: null, // "forever" for now
        };

        planId = newPlan.id;
        setFixedPlans((prev) => [...prev, newPlan]);
      }

      const txWithPlan: Transaction = {
        ...baseTx,
        isFixed: true,
        planId,
      };

      setTransactions((previous) => [...previous, txWithPlan]);
    } else {
      const tx: Transaction = {
        ...baseTx,
        isFixed: false,
        planId: undefined,
      };
      setTransactions((previous) => [...previous, tx]);
    }
  };

  /**
   * Simple "update by id" helper.
   */
  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...updated } : t))
    );
  };

  /**
   * Non-fixed or old style transactions: just delete this one.
   */
  const deleteSingleTransaction = (transaction: Transaction) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
  };

  /**
   * User clicked "Delete" on a row.
   * - If not plan-based: simple confirm & delete
   * - If plan-based (fixed): open 3-option delete modal
   */
  const handleRequestDelete = (transaction: Transaction) => {
    const isPlanBased = Boolean(transaction.planId);

    if (!isPlanBased) {
      const ok = window.confirm("Delete this record?");
      if (ok) {
        deleteSingleTransaction(transaction);
      }
      return;
    }

    setDeleteTarget(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleClearAll = () => {
    if (!window.confirm("This will delete ALL transactions. Continue?")) return;
    setTransactions([]);
  };

  const handleChangeMonth = (month: string) => {
    setSelectedMonth(month);
  };

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(
      (transaction) => transaction.month === selectedMonth
    );
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "Income") {
        income += transaction.amount;
      } else if (transaction.type === "Expense") {
        expense += transaction.amount;
      }
    });

    return { income, expense };
  }, [filteredTransactions]);

  // Load from JSON on startup (Electron only)
  useEffect(() => {
    if (!window.electronAPI) return;

    (async () => {
      const result = await window.electronAPI?.loadBudgetData();
      if (result?.ok && result.data) {
        setTransactions(result.data);
      }
    })();
  }, []);

  // Apply fixed plans whenever selectedMonth or fixedPlans change
  useEffect(() => {
    if (!selectedMonth) return;
    setTransactions((prev) =>
      applyFixedPlansForMonth(prev, fixedPlans, selectedMonth)
    );
  }, [selectedMonth, fixedPlans]);

  // Auto-save JSON + Excel on every change (Electron only)
  useEffect(() => {
    if (!window.electronAPI) return;

    (async () => {
      const result = await window.electronAPI?.saveBudgetData(transactions);
      if (!result?.ok) {
        console.error("Failed to save budget data:", result?.error);
      }
    })();
  }, [transactions]);

  const handleExportToExcel = async () => {
    if (!window.electronAPI) {
      alert("Excel export is only available in the desktop app (Electron).");
      return;
    }

    const result = await window.electronAPI.saveBudgetData(transactions);
    if (!result.ok) {
      alert("Export failed: " + result.error);
    } else {
      alert("Exported to Excel:\n" + result.excelPath);
    }
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // ===========
  // UPDATE FLOW
  // ===========

  /**
   * Called when edit form is submitted.
   * - If not fixed/plan-based => update only this row.
   * - If plan-based & fixed => open "update scope" modal (3 options).
   */
  const handleUpdateFromForm = (
    original: Transaction,
    updated: Transaction
  ) => {
    const isPlanBased = Boolean(original.planId && original.isFixed);

    if (!isPlanBased) {
      // simple row update
      handleUpdateTransaction(updated);
      handleCloseModal();
      return;
    }

    // store pending update and open scope modal
    setPendingUpdateOriginal(original);
    setPendingUpdateNew(updated);
    handleCloseModal();
    setIsUpdateScopeModalOpen(true);
  };

  const closeUpdateScopeModal = () => {
    setIsUpdateScopeModalOpen(false);
    setPendingUpdateOriginal(null);
    setPendingUpdateNew(null);
  };

  // 1) Update this only
  const handleUpdateThisOnly = () => {
    if (!pendingUpdateNew) return;
    handleUpdateTransaction(pendingUpdateNew);
    closeUpdateScopeModal();
  };

  // 2) Update this and future months
  const handleUpdateThisAndFuture = () => {
    if (!pendingUpdateOriginal || !pendingUpdateNew) return;

    const original = pendingUpdateOriginal;
    const updated = pendingUpdateNew;

    if (!original.planId) {
      handleUpdateThisOnly();
      return;
    }

    const planId = original.planId;
    const originalMonth = original.month;

    setTransactions((prev) =>
      prev.map((t) => {
        // exact row being edited -> full update
        if (t.id === original.id) {
          return { ...updated };
        }

        // same plan, future months -> propagate core fields
        if (t.planId === planId && t.month > originalMonth) {
          return {
            ...t,
            type: updated.type,
            item: updated.item,
            category: updated.category,
            amount: updated.amount,
            isFixed: true,
          };
        }

        return t;
      })
    );

    // update plan definition for future auto-generated months
    setFixedPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              type: updated.type,
              item: updated.item,
              category: updated.category,
              amount: updated.amount,
            }
          : p
      )
    );

    closeUpdateScopeModal();
  };

  // 3) Update all occurrences (all months for this plan)
  const handleUpdateAllOccurrences = () => {
    if (!pendingUpdateOriginal || !pendingUpdateNew) return;

    const original = pendingUpdateOriginal;
    const updated = pendingUpdateNew;

    if (!original.planId) {
      handleUpdateThisOnly();
      return;
    }

    const planId = original.planId;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.planId !== planId) return t;

        // edited row -> full update
        if (t.id === original.id) {
          return { ...updated };
        }

        // other occurrences -> propagate core fields but keep their own date/month
        return {
          ...t,
          type: updated.type,
          item: updated.item,
          category: updated.category,
          amount: updated.amount,
          isFixed: true,
        };
      })
    );

    // update plan definition globally
    setFixedPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              type: updated.type,
              item: updated.item,
              category: updated.category,
              amount: updated.amount,
            }
          : p
      )
    );

    closeUpdateScopeModal();
  };

  // -------------
  // DELETE LOGIC
  // -------------

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // 1) Only this row / this month
  const handleDeleteCurrentOnly = () => {
    if (!deleteTarget) return;
    deleteSingleTransaction(deleteTarget);
    closeDeleteModal();
  };

  // Helper to get previous month string
  const getPreviousMonth = (month: string): string => {
    const d = dayjs(`${month}-01`).subtract(1, "month");
    return d.format("YYYY-MM");
  };

  // 2) This and future months (for this plan)
  const handleDeleteThisAndFuture = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;

    if (!target.planId) {
      // Fallback: just delete this row
      handleDeleteCurrentOnly();
      return;
    }

    const planId = target.planId;
    const targetMonth = target.month;

    // Remove all transactions for this plan from this month onwards
    setTransactions((prev) =>
      prev.filter((t) => !(t.planId === planId && t.month >= targetMonth))
    );

    // Update plan endMonth so it stops producing future months
    setFixedPlans((prev) => {
      const updatedPlans: FixedPlan[] = [];

      for (const plan of prev) {
        if (plan.id !== planId) {
          updatedPlans.push(plan);
          continue;
        }

        const newEnd = getPreviousMonth(targetMonth);

        // If new end is before start, we can drop the plan entirely
        if (newEnd < plan.startMonth) {
          continue;
        }

        updatedPlans.push({
          ...plan,
          endMonth: newEnd,
        });
      }

      return updatedPlans;
    });

    closeDeleteModal();
  };

  // 3) All occurrences (whole plan)
  const handleDeleteAllOccurrences = () => {
    if (!deleteTarget) return;

    const target = deleteTarget;

    if (!target.planId) {
      // Fallback: just delete this row
      handleDeleteCurrentOnly();
      return;
    }

    const planId = target.planId;

    // Remove all transactions tied to this plan
    setTransactions((prev) => prev.filter((t) => t.planId !== planId));

    // Remove the plan itself
    setFixedPlans((prev) => prev.filter((p) => p.id !== planId));

    closeDeleteModal();
  };

  const isDeleteTargetPlanBased = Boolean(deleteTarget?.planId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Budget Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your income, expenses and monthly balance. Recurring items
              are managed through fixed plans.
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-red-700/70 text-xs sm:text-sm font-medium text-red-300 hover:bg-red-900/30 transition"
              type="button"
              onClick={handleClearAll}
            >
              🗑 Clear all
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-slate-700 text-xs sm:text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
              type="button"
              onClick={handleExportToExcel}
            >
              📊 Export to Excel
            </button>

            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-xs sm:text-sm font-medium text-white shadow-lg transition"
              type="button"
              onClick={openCreateModal}
            >
              <span className="text-lg leading-none">＋</span>
              <span>Add transaction</span>
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: TABLE */}
          <section className="lg:col-span-2">
            <TransactionTable
              transactions={filteredTransactions}
              onDelete={handleRequestDelete}
              onEdit={openEditModal}
            />
          </section>

          {/* RIGHT: FILTER + SUMMARY */}
          <section className="flex flex-col gap-4">
            <MonthFilter month={selectedMonth} onChange={handleChangeMonth} />
            <SummaryCards income={summary.income} expense={summary.expense} />
          </section>
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        title={editingTransaction ? "Edit transaction" : "Add transaction"}
        onClose={handleCloseModal}
      >
        <TransactionForm
          mode={editingTransaction ? "edit" : "create"}
          initialTransaction={editingTransaction ?? undefined}
          onSubmit={(txn) => {
            if (editingTransaction) {
              // New update flow with scope selection for fixed plan items
              handleUpdateFromForm(editingTransaction, txn);
            } else {
              handleAddTransaction(txn);
              handleCloseModal();
            }
          }}
        />
      </Modal>

      {/* DELETE MODAL (for plan-based / fixed items) */}
      <Modal
        isOpen={isDeleteModalOpen}
        title={
          isDeleteTargetPlanBased
            ? "Delete fixed transaction"
            : "Delete transaction"
        }
        onClose={closeDeleteModal}
      >
        {deleteTarget && isDeleteTargetPlanBased ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p>How would you like to delete this fixed item?</p>
            <div className="rounded-md bg-slate-800/70 border border-slate-700 px-3 py-2 text-xs text-slate-300">
              <div>
                <strong>Item:</strong> {deleteTarget.item}
              </div>
              <div>
                <strong>Type:</strong> {deleteTarget.type}
              </div>
              <div>
                <strong>Month:</strong> {deleteTarget.month}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                onClick={handleDeleteCurrentOnly}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium"
              >
                Delete this only
              </button>
              <button
                type="button"
                onClick={handleDeleteThisAndFuture}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-600/80 text-xs font-medium text-amber-200"
              >
                Delete this and future months
              </button>
              <button
                type="button"
                onClick={handleDeleteAllOccurrences}
                className="w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-medium text-white"
              >
                Delete all occurrences (whole plan)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-200">
            <p>Delete this record?</p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentOnly}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* UPDATE SCOPE MODAL (for fixed / plan-based items) */}
      <Modal
        isOpen={isUpdateScopeModalOpen}
        title="Update fixed transaction"
        onClose={closeUpdateScopeModal}
      >
        {pendingUpdateOriginal && pendingUpdateNew ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p>How would you like to apply this change?</p>
            <div className="rounded-md bg-slate-800/70 border border-slate-700 px-3 py-2 text-xs text-slate-300">
              <div>
                <strong>Item:</strong> {pendingUpdateOriginal.item} →{" "}
                {pendingUpdateNew.item}
              </div>
              <div>
                <strong>Amount:</strong>{" "}
                {pendingUpdateOriginal.amount.toFixed(2)} € →{" "}
                {pendingUpdateNew.amount.toFixed(2)} €
              </div>
              <div>
                <strong>Month:</strong> {pendingUpdateOriginal.month}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                onClick={handleUpdateThisOnly}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium"
              >
                Update this only
              </button>
              <button
                type="button"
                onClick={handleUpdateThisAndFuture}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-600/80 text-xs font-medium text-amber-200"
              >
                Update this and future months
              </button>
              <button
                type="button"
                onClick={handleUpdateAllOccurrences}
                className="w-full px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-medium text-white"
              >
                Update all occurrences
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default App;
