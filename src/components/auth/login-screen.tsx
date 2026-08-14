import { useState, type FormEvent } from "react";
import { UI } from "../../constants/ui";
import { errorMessage } from "../../features/auth";
import { validatePassword, validateUsername } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { PrimaryButton } from "../shared/primary-button";
import { AuthShell } from "./auth-shell";
import { Field } from "./field";
import { FormError } from "./form-error";
import { PasswordField } from "./password-field";

interface LoginScreenProps {
  onRegister: () => void;
  onForgot: () => void;
}

export function LoginScreen({ onRegister, onForgot }: LoginScreenProps) {
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={UI.loginTitle} subtitle={UI.loginSubtitle}>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <Field
          id="login-username"
          label={UI.username}
          value={username}
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <PasswordField
          id="login-password"
          label={UI.password}
          value={password}
          onChange={setPassword}
        />
        <FormError message={error} />
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {UI.login}
        </PrimaryButton>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PrimaryButton type="button" variant="text" onClick={onRegister}>
            {UI.createAccountLink}
          </PrimaryButton>
          <PrimaryButton type="button" variant="text" onClick={onForgot}>
            {UI.forgotPassword}
          </PrimaryButton>
        </div>
      </form>
    </AuthShell>
  );
}
