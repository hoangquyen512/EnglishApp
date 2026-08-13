import type { ReactNode } from "react";
import { PrimaryButton } from "../shared/primary-button";

interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-stone-950/40 p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-lg">
        <h2 id="dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-stone-500">{body}</p>
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <PrimaryButton type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </PrimaryButton>
          <PrimaryButton type="button" variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
