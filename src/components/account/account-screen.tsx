import { useState, type ReactNode } from "react";
import {
  IconAt,
  IconChevronRight,
  IconEdit,
  IconLock,
  IconLogout,
  IconMail,
  IconPerson,
  IconStudy,
} from "../shared/yume-icons";
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
        <IconChevronRight size={16} />
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
                    icon={<IconPerson size={16} />}
                  />
                  <InfoRow
                    label={UI.email}
                    value={session.email || UI.emailNotSaved}
                    muted={!session.email}
                    icon={<IconMail size={16} />}
                  />
                  <InfoRow label={UI.loginId} value={session.username} icon={<IconAt size={16} />} />
                </dl>
              </section>

              <section className="yume-account__manage" aria-label={UI.accountManage}>
                <ActionCard
                  label={UI.learningProgram}
                  description={UI.accountActionLearningDesc}
                  icon={<IconStudy size={20} />}
                  tone="violet"
                  onClick={onLearningProgram}
                />
                <ActionCard
                  label={UI.editAccount}
                  description={UI.accountActionEditDesc}
                  icon={<IconEdit size={20} />}
                  tone="blue"
                  onClick={onEdit}
                />
                <ActionCard
                  label={UI.changePassword}
                  description={UI.accountActionPasswordDesc}
                  icon={<IconLock size={20} />}
                  tone="green"
                  onClick={() => setPasswordOpen(true)}
                />
                <ActionCard
                  label={UI.logout}
                  description={UI.accountActionLogoutDesc}
                  icon={<IconLogout size={20} />}
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
