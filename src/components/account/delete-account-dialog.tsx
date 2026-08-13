import { useState } from "react";
import { UI } from "../../constants/ui";
import { errorMessage } from "../../features/auth";
import type { SessionDto } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { Field } from "../auth/field";
import { FormError } from "../auth/form-error";
import { PasswordField } from "../auth/password-field";
import { ConfirmDialog } from "./confirm-dialog";

interface DeleteAccountDialogProps {
  session: SessionDto;
  onClose: () => void;
}

export function DeleteAccountDialog({ session, onClose }: DeleteAccountDialogProps) {
  const removeAccount = useAuthStore((state) => state.removeAccount);
  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    if (typed.trim() !== session.username) {
      setError(errorMessage("auth_failed"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await removeAccount(password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      title={UI.deleteConfirmTitle}
      body={UI.deleteConfirmBody}
      confirmLabel={UI.deleteAccount}
      cancelLabel={UI.cancel}
      danger
      onCancel={onClose}
      onConfirm={() => {
        if (!busy) {
          void onConfirm();
        }
      }}
    >
      <div className="mt-4 flex flex-col gap-3">
        <PasswordField id="delete-password" label={UI.password} value={password} onChange={setPassword} />
        <Field
          id="delete-username"
          label={UI.typeUsername}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
        />
        <FormError message={error} />
      </div>
    </ConfirmDialog>
  );
}
