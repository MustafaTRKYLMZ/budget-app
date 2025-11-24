// src/components/Modal.tsx
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition"
          >
            ×
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
