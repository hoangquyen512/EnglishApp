import { useState, type FormEvent } from "react";
import { UI } from "../../constants/ui";
import { errorMessage, validatePassword, validateUsername } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { PrimaryButton } from "../shared/primary-button";
import { AuthShell } from "./auth-shell";
import { Field } from "./field";
import { FormError } from "./form-error";
import { PasswordField } from "./password-field";

interface RegisterScreenProps {
  onLogin: () => void;
}

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const register = useAuthStore((state) => state.register);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(errorMessage(usernameError));
      return;
    }
    const passwordError = validatePassword(password, username);
    if (passwordError) {
      setError(errorMessage(passwordError));
      return;
    }
    if (password !== confirm) {
      setError(errorMessage("confirm_mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(username, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={UI.registerTitle} subtitle={UI.registerSubtitle}>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <Field
          id="register-username"
          label={UI.username}
          value={username}
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <PasswordField
          id="register-password"
          label={UI.password}
          value={password}
          hint={UI.passwordHint}
          autoComplete="new-password"
          onChange={setPassword}
        />
        <PasswordField
          id="register-confirm"
          label={UI.confirmPassword}
          value={confirm}
          autoComplete="new-password"
          onChange={setConfirm}
        />
        <FormError message={error} />
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {UI.createAccount}
        </PrimaryButton>
        <div className="flex justify-center">
          <PrimaryButton type="button" variant="text" onClick={onLogin}>
            {UI.alreadyHaveAccount}
          </PrimaryButton>
        </div>
      </form>
    </AuthShell>
  );
}
