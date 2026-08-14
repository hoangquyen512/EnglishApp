import { useRef, useState, type FormEvent } from "react";
import { UI } from "../../constants/ui";
import { errorMessage, validateDisplayName, validateEmail } from "../../features/auth";
import type { SessionDto } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { Field } from "../auth/field";
import { FormError } from "../auth/form-error";
import { PrimaryButton } from "../shared/primary-button";
import { ConfirmDialog } from "./confirm-dialog";
import { UserAvatar } from "./user-avatar";

interface EditAccountScreenProps {
  session: SessionDto;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditAccountScreen({ session, onCancel, onSaved }: EditAccountScreenProps) {
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const setAvatarBytes = useAuthStore((state) => state.setAvatarBytes);
  const clearAvatar = useAuthStore((state) => state.clearAvatar);
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(session.displayName ?? "");
  const [email, setEmail] = useState(session.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emptyEmailOpen, setEmptyEmailOpen] = useState(false);

  async function saveProfile() {
    setBusy(true);
    setError(null);
    try {
      await updateProfile(displayName, email);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setEmptyEmailOpen(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nameError = validateDisplayName(displayName);
    if (nameError) {
      setError(errorMessage(nameError));
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setError(errorMessage(emailError));
      return;
    }
    if (!email.trim() && session.email) {
      setEmptyEmailOpen(true);
      return;
    }
    await saveProfile();
  }

  async function onPickAvatar(file: File | undefined) {
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(errorMessage("avatar_too_large"));
      return;
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    setBusy(true);
    setError(null);
    try {
      await setAvatarBytes(Array.from(buffer));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-stone-25 px-7 py-4">
      <header className="mb-2 flex min-h-10 items-center gap-2">
        <PrimaryButton variant="text" onClick={onCancel}>
          ← {UI.cancel}
        </PrimaryButton>
        <h1 className="flex-1 text-xl font-bold">{UI.editAccountTitle}</h1>
      </header>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative">
            <UserAvatar session={session} size="lg" />
            <button
              type="button"
              className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-stone-800 text-white"
              aria-label={UI.changePhoto}
              onClick={() => fileRef.current?.click()}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void onPickAvatar(event.target.files?.[0])}
          />
          {session.avatarUrl ? (
            <PrimaryButton
              type="button"
              variant="text"
              disabled={busy}
              onClick={() => void clearAvatar().catch((err) => setError(errorMessage(err)))}
            >
              {UI.removePhoto}
            </PrimaryButton>
          ) : null}
        </div>
        <Field
          id="edit-display-name"
          label={UI.displayName}
          value={displayName}
          maxLength={40}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <Field
          id="edit-email"
          label={UI.email}
          type="email"
          hint={UI.forgotSubtitle}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Field id="edit-username" label={UI.loginId} value={session.username} disabled />
        <FormError message={error} />
        <PrimaryButton type="submit" disabled={busy}>
          {UI.save}
        </PrimaryButton>
      </form>
      {emptyEmailOpen ? (
        <ConfirmDialog
          title={UI.email}
          body={UI.emailEmptyConfirm}
          confirmLabel={UI.save}
          cancelLabel={UI.cancel}
          onCancel={() => setEmptyEmailOpen(false)}
          onConfirm={() => void saveProfile()}
        />
      ) : null}
    </main>
  );
}
