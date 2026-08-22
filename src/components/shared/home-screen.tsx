import { useEffect, useState, type ReactNode } from "react";
import { APP_NAME, HOME_MOOD_STATUS, UI } from "../../constants/ui";
import { homeRightPanel, type HomeQuickAction } from "../../features/companion";
import type { SessionDto } from "../../features/auth";
import type { ContentType, PetState } from "../../types";
import { UserAvatar } from "../account/user-avatar";
import { HomeCompanionChatPanel } from "../companion/home-companion-chat-panel";
import { FloatingPetOverlay } from "../pet/floating-pet-overlay";
import { PetAvatar } from "../pet/pet-avatar";
import { HomeQuickLookupPanel } from "../quick-lookup/home-quick-lookup-panel";
import { HomeStoryLibrary } from "../stories/home-story-library";

interface HomeScreenProps {
  pet: PetState;
  contentType: ContentType;
  onContentType: (contentType: ContentType) => void;
  session: SessionDto;
  onOpenAccount: () => void;
  onOpenReader?: (storyId: number, chapterId: number) => void;
  /** Increment to force the Tra từ nhanh panel open (tray / deep link). */
  openLookupSignal?: number;
  /** Increment to return from Reader with the story library selected. */
  openStorySignal?: number;
}

function welcomeGreeting(displayName: string, now = new Date()): string {
  const hour = now.getHours();
  const part =
    hour < 12
      ? UI.homeGreetingMorning
      : hour < 18
        ? UI.homeGreetingAfternoon
        : UI.homeGreetingEvening;
  return `${part}, ${displayName}.`;
}

function skyEyebrow(now = new Date()): string {
  const day = now.getDate();
  const month = now.getMonth() + 1;
  return UI.homeSkyDate
    .replace("{sky}", UI.homeSkyLabel)
    .replace("{day}", String(day))
    .replace("{month}", String(month))
    .toUpperCase();
}

function padDays(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6z" />
    </svg>
  );
}

function IconStory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M5 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z" />
      <path d="M17 6h2a2 2 0 0 1 2 2v12l-4-1.7" />
    </svg>
  );
}

export function HomeScreen({
  pet,
  contentType: _contentType,
  onContentType: _onContentType,
  session,
  onOpenAccount,
  onOpenReader = () => undefined,
  openLookupSignal = 0,
  openStorySignal = 0,
}: HomeScreenProps) {
  void _contentType;
  void _onContentType;
  const [floatPet, setFloatPet] = useState(false);
  const [activeAction, setActiveAction] = useState<HomeQuickAction | null>(null);
  const displayName = session.displayName?.trim() || session.username;
  const panel = homeRightPanel(activeAction);
  const compactRight = panel === "lookup" || panel === "chat";
  const homeClassName =
    panel === "story"
      ? "yume-shell yume-home yume-home--stories"
      : compactRight
        ? "yume-shell yume-home yume-home--panel"
        : "yume-shell yume-home";

  useEffect(() => {
    if (openLookupSignal > 0) {
      setActiveAction("lookup");
    }
  }, [openLookupSignal]);

  useEffect(() => {
    if (openStorySignal > 0) {
      setActiveAction("story");
    }
  }, [openStorySignal]);

  const startStudy = () => setFloatPet(true);

  const runQuickAction = (id: HomeQuickAction) => {
    setActiveAction(id);
  };

  const quickActions: Array<{ id: HomeQuickAction; icon: ReactNode; label: string; hint: string }> = [
    { id: "chat", icon: <IconChat />, label: UI.companion, hint: UI.homeChatShortHint },
    { id: "story", icon: <IconStory />, label: UI.homeDailyStory, hint: UI.homeStoryShortHint },
    { id: "lookup", icon: <IconBook />, label: UI.quickLookupTitle, hint: UI.homeLookupShortHint },
  ];

  const startStudy = () => setFloatPet(true);

  const runQuickAction = (id: HomeQuickAction) => {
    setActiveAction(id);
    if (id === "story") {
      onContentType("phrase");
    }
  };

  const quickActions: Array<{ id: HomeQuickAction; icon: ReactNode; label: string; hint: string }> = [
    { id: "chat", icon: <IconChat />, label: UI.companion, hint: UI.homeChatShortHint },
    { id: "story", icon: <IconStory />, label: UI.homeDailyStory, hint: UI.homeStoryShortHint },
    { id: "lookup", icon: <IconBook />, label: UI.quickLookupTitle, hint: UI.homeLookupShortHint },
  ];

  return (
    <>
      <main className={homeClassName}>
        <div className="yume-shell__noise" aria-hidden />

        <header className="yume-home__topbar">
          <div className="yume-home__brand" aria-label={APP_NAME}>
            <img
              src={`${import.meta.env.BASE_URL}yume-icon-mark.png`}
              alt=""
              className="yume-home__brand-icon"
            />
            <span>{APP_NAME}</span>
          </div>

          <section className="yume-home__welcome" aria-labelledby="home-title">
            <p className="yume-home__eyebrow">{skyEyebrow()}</p>
            <h1 id="home-title">{welcomeGreeting(displayName)}</h1>
            <p>{UI.homeWelcomeSub}</p>
          </section>

          <div className="yume-home__topbar-actions">
            <div className="yume-home__chip yume-home__chip--streak">
              <span aria-hidden>🔥</span>
              {pet.streakDays} {UI.homeStreakSuffix}
            </div>
            <button
              type="button"
              className="yume-home__chip yume-home__chip--profile"
              onClick={onOpenAccount}
              aria-label={displayName}
            >
              <UserAvatar session={session} size="sm" className="yume-home__avatar" />
              <span className="yume-home__profile-name">{displayName}</span>
              <span className="yume-home__chevron" aria-hidden>
                ⌄
              </span>
            </button>
          </div>
        </header>

        <section className="yume-home__grid" aria-label={UI.homeSkyMapLabel}>
          <aside className="yume-home__companion">
            <div className={`yume-home__pet-status is-${pet.mood}`}>
              <span className="yume-home__status-dot" aria-hidden />
              {HOME_MOOD_STATUS[pet.mood]}
            </div>

            <button
              type="button"
              className="yume-home__orbit"
              onClick={startStudy}
              aria-label={`${UI.homeStartStudy} ${pet.petName}`}
            >
              <span className="yume-home__spark yume-home__spark--one" aria-hidden>
                ✦
              </span>
              <span className="yume-home__spark yume-home__spark--two" aria-hidden>
                ·
              </span>
              <span className="yume-home__spark yume-home__spark--three" aria-hidden>
                ✦
              </span>
              <span className="yume-home__pet-shell">
                <PetAvatar pet={pet} size="md" variant="float" />
              </span>
            </button>

            <div className="yume-home__pet-copy">
              <h2>{pet.petName}</h2>
              <p>“{UI.homePetQuote}”</p>
            </div>

            <blockquote className="yume-home__whisper-card">
              <span>↳ {UI.homeWhisperLabel}</span>
              <em>“{UI.homeWhisperQuote}”</em>
            </blockquote>

            <div
              className="yume-home__meter"
              aria-label={`${UI.homeCompanionLabel} ${pet.streakDays} ${UI.homeCompanionDaysUnit}`}
            >
              <span>🗓️ {UI.homeCompanionLabel}</span>
              <strong>
                {padDays(pet.streakDays)} {UI.homeCompanionDaysUnit}
              </strong>
            </div>

            <nav className="yume-home__quick-actions" aria-label={UI.homeQuickActionsLabel}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={
                    activeAction === action.id || (activeAction === null && action.id === "story")
                      ? "yume-home__quick-action yume-home__quick-action--active"
                      : "yume-home__quick-action"
                  }
                  onClick={() => runQuickAction(action.id)}
                >
                  <span className="yume-home__quick-icon" aria-hidden>
                    {action.icon}
                  </span>
                  <span>
                    <strong>{action.label}</strong>
                    <small>{action.hint}</small>
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {panel === "lookup" ? (
            <section className="yume-home__study yume-home__study--lookup" aria-label={UI.quickLookupTitle}>
              <HomeQuickLookupPanel />
            </section>
          ) : null}

          {panel === "chat" ? (
            <section className="yume-home__study yume-home__study--chat" aria-label={UI.companionChatTitle}>
              <HomeCompanionChatPanel pet={pet} session={session} />
            </section>
          ) : null}

          {panel === "story" ? <HomeStoryLibrary onOpenReader={onOpenReader} /> : null}
        </section>
      </main>

      {floatPet ? <FloatingPetOverlay pet={pet} onDismiss={() => setFloatPet(false)} /> : null}
    </>
  );
}
