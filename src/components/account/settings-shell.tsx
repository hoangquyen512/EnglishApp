import type { ReactNode } from "react";
import { APP_NAME, UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import {
  IconBell,
  IconCommunity,
  IconHelp,
  IconHome,
  IconMissions,
  IconPet,
  IconProfile,
  IconSettings,
} from "../shared/yume-icons";
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
