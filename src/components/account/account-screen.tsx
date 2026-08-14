import { useState } from "react";
import { UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { PrimaryButton } from "../shared/primary-button";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { UserAvatar } from "./user-avatar";

interface AccountScreenProps {
  session: SessionDto;
  toast: string | null;
  onBack: () => void;
  onEdit: () => void;
}

function InfoRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 border-b border-stone-100 px-4 py-3 last:border-b-0">
      <dt className="text-sm font-semibold text-stone-500">{label}</dt>
      <dd className={`text-sm ${muted ? "text-stone-500" : "text-stone-950"}`}>{value}</dd>
    </div>
  );
}

export function AccountScreen({ session, toast, onBack, onEdit }: AccountScreenProps) {
  const logout = useAuthStore((state) => state.logout);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [localToast, setLocalToast] = useState<string | null>(null);
  const name = session.displayName?.trim() || session.username;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-stone-25 px-7 py-4">
      <header className="mb-2 flex min-h-10 items-center gap-2">
        <PrimaryButton variant="text" onClick={onBack}>
          ← {UI.backHome}
        </PrimaryButton>
        <h1 className="flex-1 text-xl font-bold">{UI.accountTitle}</h1>
      </header>
      {toast || localToast ? (
        <p className="mb-3 rounded-xl bg-lime-50 px-3 py-2 text-sm text-lime-800">{toast || localToast}</p>
      ) : null}
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <UserAvatar session={session} size="lg" />
        <p className="text-xl font-bold">{name}</p>
        <p className="text-sm text-stone-500">@{session.username}</p>
      </div>
      <dl className="overflow-hidden rounded-[20px] border border-stone-100 bg-white">
        <InfoRow label={UI.displayName} value={session.displayName?.trim() || UI.emailNotSaved} muted={!session.displayName} />
        <InfoRow label={UI.email} value={session.email || UI.emailNotSaved} muted={!session.email} />
        <InfoRow label={UI.loginId} value={session.username} />
      </dl>
      <div className="mt-5 flex flex-col gap-2">
        <PrimaryButton onClick={onEdit}>{UI.editAccount}</PrimaryButton>
        <PrimaryButton variant="ghost" onClick={() => setPasswordOpen(true)}>
          {UI.changePassword}
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={() => setLogoutOpen(true)}>
          {UI.logout}
        </PrimaryButton>
        <PrimaryButton variant="danger" onClick={() => setDeleteOpen(true)}>
          {UI.deleteAccount}
        </PrimaryButton>
      </div>
      {logoutOpen ? (
        <ConfirmDialog
          title={UI.logoutConfirmTitle}
          body={UI.logoutConfirmBody}
          confirmLabel={UI.logout}
          cancelLabel={UI.cancel}
          onCancel={() => setLogoutOpen(false)}
          onConfirm={() => void logout()}
        />
      ) : null}
      {passwordOpen ? (
        <ChangePasswordDialog
          username={session.username}
          onClose={() => setPasswordOpen(false)}
          onSaved={() => {
            setPasswordOpen(false);
            setLocalToast(UI.changedPassword);
          }}
        />
      ) : null}
      {deleteOpen ? <DeleteAccountDialog session={session} onClose={() => setDeleteOpen(false)} /> : null}
    </main>
  );
}
