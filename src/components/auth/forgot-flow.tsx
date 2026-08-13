import { useState, type FormEvent } from "react";
import { UI } from "../../constants/ui";
import { errorMessage, normalizeEmail, validateEmail, validatePassword, validateUsername } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { PrimaryButton } from "../shared/primary-button";
import { AuthShell } from "./auth-shell";
import { Field } from "./field";
import { FormError } from "./form-error";
import { PasswordField } from "./password-field";

interface ForgotFlowProps {
  onLogin: () => void;
}

export function ForgotFlow({ onLogin }: ForgotFlowProps) {
  const requestReset = useAuthStore((state) => state.requestReset);
  const confirmReset = useAuthStore((state) => state.confirmReset);
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [defaultPassword, setDefaultPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sentTo = normalizeEmail(email);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(errorMessage(usernameError));
      return;
    }
    if (!email.trim() || validateEmail(email)) {
      setError(errorMessage("invalid_email"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestReset(username, email);
      setStep(2);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(event: FormEvent) {
    event.preventDefault();
    if (newPassword === defaultPassword) {
      setError(errorMessage("password_same_as_default"));
      return;
    }
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
      await confirmReset(username, defaultPassword, newPassword);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (step === 2) {
    return (
      <AuthShell title={UI.forgot2Title} subtitle={`${UI.sentDefaultPassword} ${sentTo ?? email}.`}>
        <form className="flex flex-col gap-4" onSubmit={(event) => void onConfirm(event)}>
          <PasswordField
            id="default-password"
            label={UI.defaultPassword}
            value={defaultPassword}
            autoComplete="one-time-code"
            onChange={setDefaultPassword}
          />
          <PasswordField
            id="forgot-new"
            label={UI.newPassword}
            value={newPassword}
            hint={UI.passwordHint}
            autoComplete="new-password"
            onChange={setNewPassword}
          />
          <PasswordField
            id="forgot-confirm"
            label={UI.confirmNewPassword}
            value={confirm}
            autoComplete="new-password"
            onChange={setConfirm}
          />
          <FormError message={error} />
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {UI.changePassword}
          </PrimaryButton>
          <div className="flex justify-center">
            <PrimaryButton type="button" variant="text" onClick={onLogin}>
              {UI.login}
            </PrimaryButton>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={UI.forgotTitle} subtitle={UI.forgotSubtitle}>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSend(event)}>
        <Field
          id="forgot-username"
          label={UI.username}
          value={username}
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <Field
          id="forgot-email"
          label={UI.email}
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormError message={error} />
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {UI.sendMail}
        </PrimaryButton>
        <div className="flex justify-center">
          <PrimaryButton type="button" variant="text" onClick={onLogin}>
            {UI.backToLogin}
          </PrimaryButton>
        </div>
      </form>
    </AuthShell>
  );
}
