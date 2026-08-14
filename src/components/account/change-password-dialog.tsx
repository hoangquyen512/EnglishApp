import { useState, type FormEvent } from "react";
import { UI } from "../../constants/ui";
import { errorMessage, validatePassword } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { FormError } from "../auth/form-error";
import { PasswordField } from "../auth/password-field";
import { PrimaryButton } from "../shared/primary-button";

interface ChangePasswordDialogProps {
  username: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ChangePasswordDialog({ username, onClose, onSaved }: ChangePasswordDialogProps) {
  const changePassword = useAuthStore((state) => state.changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const passwordError = validatePassword(newPassword, username);
    if (passwordError) {
      setError(errorMessage(passwordError));
      return;
    }
    if (newPassword !== confirm) {
      setError(errorMessage("confirm_mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassword(currentPassword, newPassword);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-stone-950/40 p-6">
      <form
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-md flex-col gap-4 rounded-[20px] bg-white p-6 shadow-lg"
        onSubmit={(event) => void onSubmit(event)}
      >
        <h2 className="text-xl font-bold">{UI.changePassword}</h2>
        <PasswordField
          id="current-password"
          label={UI.currentPassword}
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordField
          id="new-password"
          label={UI.newPassword}
          value={newPassword}
          hint={UI.passwordHint}
          autoComplete="new-password"
          onChange={setNewPassword}
        />
        <PasswordField
          id="confirm-new-password"
          label={UI.confirmNewPassword}
          value={confirm}
          autoComplete="new-password"
          onChange={setConfirm}
        />
        <FormError message={error} />
        <div className="flex justify-end gap-2">
          <PrimaryButton type="button" variant="ghost" onClick={onClose}>
            {UI.cancel}
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={busy}>
            {UI.changePassword}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
