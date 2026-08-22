import { useState, type ReactNode } from "react";
import { APP_NAME, UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import { useAuthStore } from "../../stores/auth-store";
import { ChangePasswordDialog } from "./change-password-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { SettingsShell, type SettingsNavId } from "./settings-shell";
import { UserAvatar } from "./user-avatar";

interface AccountScreenProps {
  session: SessionDto;
  toast: string | null;
  onBack: () => void;
  onEdit: () => void;
  onLearningProgram: () => void;
}

function IconCap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5z" />
      <path d="M7 12.2v3.3c0 .9 2.2 2.5 5 2.5s5-1.6 5-2.5v-3.3" />
      <path d="M21 10v5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H4" />
      <path d="M14 19h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconAt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M16 12v1.2a2.3 2.3 0 0 0 4.2 1.2A7.5 7.5 0 1 1 18.5 7" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function InfoRow({
  label,
  value,
  muted,
  icon,
}: {
  label: string;
  value: string;
  muted?: boolean;
  icon: ReactNode;
}) {
  return (
    <div className="yume-account__row">
      <span className="yume-account__row-icon" aria-hidden>
        {icon}
      </span>
      <dt>{label}</dt>
      <dd className={muted ? "is-muted" : undefined}>{value}</dd>
    </div>
  );
}

function ActionCard({
  label,
  description,
  icon,
  tone,
  onClick,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  tone: "violet" | "blue" | "green" | "rose";
  onClick: () => void;
}) {
  return (
    <button type="button" className={`yume-account__action yume-account__action--${tone}`} onClick={onClick}>
      <span className="yume-account__action-icon" aria-hidden>
        {icon}
      </span>
      <span className="yume-account__action-copy">
        <span className="yume-account__action-label">{label}</span>
        <span className="yume-account__action-desc">{description}</span>
      </span>
      <span className="yume-account__action-arrow" aria-hidden>
        <IconChevron />
      </span>
    </button>
  );
}

export function AccountScreen({ session, toast, onBack, onEdit, onLearningProgram }: AccountScreenProps) {
  const logout = useAuthStore((state) => state.logout);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [localToast, setLocalToast] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<SettingsNavId>("profile");
  const name = session.displayName?.trim() || session.username;

  const onNav = (id: SettingsNavId) => {
    if (id === "profile") {
      setActiveNav("profile");
      setComingSoon(null);
      return;
    }
    setActiveNav(id);
    setComingSoon(UI.settingsComingSoon);
  };

  return (
    <>
      <SettingsShell
        session={session}
        title={UI.accountTitle}
        titleAccent
        activeNav={activeNav}
        onHome={onBack}
        onNav={onNav}
        onPromo={() => setComingSoon(UI.settingsComingSoon)}
        toast={toast || localToast || comingSoon}
        wide
      >
        {activeNav === "profile" ? (
          <div className="yume-account__profile">
            <section className="yume-panel yume-account__hero" aria-label={APP_NAME}>
              <div className="yume-account__hero-avatar-wrap">
                <span className="yume-account__hero-ring" aria-hidden />
                <UserAvatar session={session} size="lg" className="yume-account__avatar" />
              </div>
              <div className="yume-account__hero-copy">
                <div className="yume-account__hero-top">
                  <div>
                    <p className="yume-account__hero-name">{name}</p>
                    <p className="yume-account__hero-user">@{session.username}</p>
                  </div>
                  <span className="yume-account__badge">{UI.accountMemberBadge}</span>
                </div>
                <p className="yume-account__hero-welcome">{UI.accountWelcome}</p>
              </div>
            </section>

            <div className="yume-account__body">
              <section className="yume-panel yume-account__info" aria-labelledby="account-personal-title">
                <header className="yume-account__info-head">
                  <h2 id="account-personal-title">{UI.accountPersonalTitle}</h2>
                  <p>{UI.accountPersonalSubtitle}</p>
                </header>
                <dl>
                  <InfoRow
                    label={UI.displayName}
                    value={session.displayName?.trim() || UI.emailNotSaved}
                    muted={!session.displayName}
                    icon={<IconPerson />}
                  />
                  <InfoRow
                    label={UI.email}
                    value={session.email || UI.emailNotSaved}
                    muted={!session.email}
                    icon={<IconMail />}
                  />
                  <InfoRow label={UI.loginId} value={session.username} icon={<IconAt />} />
                </dl>
              </section>

              <section className="yume-account__manage" aria-label={UI.accountManage}>
                <ActionCard
                  label={UI.learningProgram}
                  description={UI.accountActionLearningDesc}
                  icon={<IconCap />}
                  tone="violet"
                  onClick={onLearningProgram}
                />
                <ActionCard
                  label={UI.editAccount}
                  description={UI.accountActionEditDesc}
                  icon={<IconEdit />}
                  tone="blue"
                  onClick={onEdit}
                />
                <ActionCard
                  label={UI.changePassword}
                  description={UI.accountActionPasswordDesc}
                  icon={<IconLock />}
                  tone="green"
                  onClick={() => setPasswordOpen(true)}
                />
                <ActionCard
                  label={UI.logout}
                  description={UI.accountActionLogoutDesc}
                  icon={<IconLogout />}
                  tone="rose"
                  onClick={() => setLogoutOpen(true)}
                />
              </section>
            </div>
          </div>
        ) : (
          <section className="yume-panel yume-account__placeholder">
            <p className="yume-account__placeholder-title">{UI.settingsComingSoon}</p>
            <p className="yume-account__placeholder-body">{UI.settingsPromoBody}</p>
          </section>
        )}
      </SettingsShell>

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
    </>
  );
}
