import type { ReactNode } from "react";
import { APP_NAME, UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import { UserAvatar } from "./user-avatar";

export type SettingsNavId =
  | "home"
  | "pet"
  | "missions"
  | "community"
  | "profile"
  | "settings"
  | "notifications"
  | "help";

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}

function IconPet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="13" r="5" />
      <circle cx="7" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMissions() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M8 4h8v3H8z" />
      <path d="M6 7h12v13H6z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  );
}

function IconCommunity() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M3.5 19c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4" />
      <path d="M13.5 19c.5-1.8 1.8-3 3.8-3 1.5 0 2.7.7 3.4 1.9" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 16h12l-1-2V10a5 5 0 0 0-10 0v4l-1 2z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2.9-1.2 1.8V14" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SidebarNavItem({
  id,
  label,
  icon,
  active,
  onClick,
}: {
  id: SettingsNavId;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: (id: SettingsNavId) => void;
}) {
  return (
    <button
      type="button"
      className={active ? "yume-settings-nav__item is-active" : "yume-settings-nav__item"}
      aria-current={active ? "page" : undefined}
      onClick={() => onClick(id)}
    >
      <span className="yume-settings-nav__icon" aria-hidden>
        {icon}
      </span>
      <span className="yume-settings-nav__label">{label}</span>
      {active ? <span className="yume-settings-nav__dot" aria-hidden /> : null}
    </button>
  );
}

interface SettingsShellProps {
  session: SessionDto;
  title: string;
  subtitle?: string;
  titleAccent?: boolean;
  activeNav: SettingsNavId;
  onHome: () => void;
  onNav: (id: SettingsNavId) => void;
  onPromo?: () => void;
  toast?: string | null;
  wide?: boolean;
  children: ReactNode;
}

export function SettingsShell({
  session,
  title,
  subtitle,
  titleAccent,
  activeNav,
  onHome,
  onNav,
  onPromo,
  toast,
  wide,
  children,
}: SettingsShellProps) {
  const name = session.displayName?.trim() || session.username;

  const handleNav = (id: SettingsNavId) => {
    if (id === "home") {
      onHome();
      return;
    }
    onNav(id);
  };

  return (
    <main className={`yume-shell yume-account${wide ? " yume-account--wide" : ""}`}>
      <div className="yume-shell__noise" aria-hidden />

      <aside className="yume-settings-nav" aria-label={UI.settingsBrand}>
        <div className="yume-settings-nav__brand">
          <img src={`${import.meta.env.BASE_URL}yume-icon-mark.png`} alt="" className="yume-settings-nav__logo" />
          <span>{UI.settingsBrand}</span>
        </div>

        <nav className="yume-settings-nav__group" aria-label={APP_NAME}>
          <SidebarNavItem id="home" label={UI.settingsNavHome} icon={<IconHome />} onClick={handleNav} />
          <SidebarNavItem
            id="pet"
            label={UI.settingsNavPet}
            icon={<IconPet />}
            active={activeNav === "pet"}
            onClick={handleNav}
          />
          <SidebarNavItem
            id="missions"
            label={UI.settingsNavMissions}
            icon={<IconMissions />}
            active={activeNav === "missions"}
            onClick={handleNav}
          />
          <SidebarNavItem
            id="community"
            label={UI.settingsNavCommunity}
            icon={<IconCommunity />}
            active={activeNav === "community"}
            onClick={handleNav}
          />
        </nav>

        <p className="yume-settings-nav__section">{UI.settingsNavSectionAccount}</p>
        <nav className="yume-settings-nav__group" aria-label={UI.settingsNavSectionAccount}>
          <SidebarNavItem
            id="profile"
            label={UI.settingsNavProfile}
            icon={<IconProfile />}
            active={activeNav === "profile"}
            onClick={handleNav}
          />
          <SidebarNavItem
            id="settings"
            label={UI.settingsNavSettings}
            icon={<IconSettings />}
            active={activeNav === "settings"}
            onClick={handleNav}
          />
          <SidebarNavItem
            id="notifications"
            label={UI.settingsNavNotifications}
            icon={<IconBell />}
            active={activeNav === "notifications"}
            onClick={handleNav}
          />
          <SidebarNavItem
            id="help"
            label={UI.settingsNavHelp}
            icon={<IconHelp />}
            active={activeNav === "help"}
            onClick={handleNav}
          />
        </nav>

        <div className="yume-settings-nav__promo">
          <div className="yume-settings-nav__promo-star" aria-hidden>
            ✦
          </div>
          <p className="yume-settings-nav__promo-title">{UI.settingsPromoTitle}</p>
          <p className="yume-settings-nav__promo-body">{UI.settingsPromoBody}</p>
          <button type="button" className="yume-btn yume-btn--primary yume-settings-nav__promo-cta" onClick={onPromo}>
            {UI.settingsPromoCta}
          </button>
        </div>
      </aside>

      <div className="yume-account__main">
        <div className={`yume-account__inner${wide ? " yume-account__inner--wide" : ""}`}>
          <header className="yume-account__header">
            <button type="button" className="yume-btn yume-btn--text yume-account__back" onClick={onHome}>
              ← {UI.backHome}
            </button>
            <div className="yume-account__heading">
              <h1>
                {title}
                {titleAccent ? (
                  <span className="yume-account__title-spark" aria-hidden>
                    ✦
                  </span>
                ) : null}
              </h1>
              {subtitle ? <p className="yume-account__subtitle">{subtitle}</p> : null}
            </div>
            <div className="yume-account__header-right">
              <div className="yume-account__profile-chip" title={name}>
                <UserAvatar session={session} size="sm" className="yume-account__chip-avatar" />
                <span>{name}</span>
              </div>
            </div>
          </header>

          {toast ? <p className="yume-account__toast">{toast}</p> : null}

          {children}
        </div>
      </div>
    </main>
  );
}
