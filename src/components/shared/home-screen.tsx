import { useEffect, useState, type ReactNode } from "react";
import { APP_NAME, HOME_MOOD_STATUS, UI } from "../../constants/ui";
import { cycleIndex, homeRightPanel, type HomeQuickAction } from "../../features/companion";
import { getStudyDeck, partOfSpeechLabel, speakWord } from "../../features/vocabulary";
import type { SessionDto } from "../../features/auth";
import type { ContentType, PetState, StudyFlashcard } from "../../types";
import { publicUrl } from "../../lib/public-url";
import { UserAvatar } from "../account/user-avatar";
import { HomeCompanionChatPanel } from "../companion/home-companion-chat-panel";
import { artSrc } from "../flashcard/vocab-illustration";
import { FloatingPetOverlay } from "../pet/floating-pet-overlay";
import { PetAvatar } from "../pet/pet-avatar";
import { HomeQuickLookupPanel } from "../quick-lookup/home-quick-lookup-panel";

interface HomeScreenProps {
  pet: PetState;
  contentType: ContentType;
  onContentType: (contentType: ContentType) => void;
  session: SessionDto;
  onOpenAccount: () => void;
  /** Increment to force the Tra từ nhanh panel open (tray / deep link). */
  openLookupSignal?: number;
}

const HOME_FEED_LIMIT = 10;

function welcomeGreeting(displayName: string, now = new Date()): string {
  const hour = now.getHours();
  const part =
    hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  return `${part}, ${displayName}.`;
}

function skyEyebrow(now = new Date()): string {
  const day = now.getDate();
  const month = now.getMonth() + 1;
  return `+ ${UI.homeSkyLabel} · ${day} tháng ${month} +`.toUpperCase();
}

function padDays(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function formatVocabMeaning(card: StudyFlashcard): string {
  const pos = partOfSpeechLabel(card.partOfSpeech);
  if (pos) {
    return `(${pos}) ${card.meaning}`;
  }
  return card.meaning;
}

function IconSpeaker() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" />
    </svg>
  );
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

function FeedCardHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <header className="yume-home-feed__head">
      <span className="yume-home-feed__badge" aria-hidden>
        {icon}
      </span>
      <h2>{title}</h2>
    </header>
  );
}

function FeedNav({
  prevLabel,
  nextLabel,
  counter,
  onPrev,
  onNext,
}: {
  prevLabel: string;
  nextLabel: string;
  counter: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="yume-home-feed__nav">
      <button type="button" className="yume-home-feed__nav-btn" onClick={onPrev}>
        ← {prevLabel}
      </button>
      <span className="yume-home-feed__counter">{counter}</span>
      <button type="button" className="yume-home-feed__nav-btn yume-home-feed__nav-btn--primary" onClick={onNext}>
        {nextLabel} →
      </button>
    </footer>
  );
}

function FeedArt({
  imageKey,
  topic,
  variant,
}: {
  imageKey: string;
  topic?: string | null;
  variant: "vocab" | "phrase";
}) {
  return (
    <div className={`yume-home-feed__art yume-home-feed__art--${variant}`} aria-hidden>
      <img
        src={artSrc(imageKey, topic)}
        alt=""
        onError={(event) => {
          if (event.currentTarget.dataset.fallback === "1") {
            return;
          }
          event.currentTarget.dataset.fallback = "1";
          event.currentTarget.src = publicUrl("/illustrations/fam-1.jpg");
        }}
      />
    </div>
  );
}

export function HomeScreen({
  pet,
  contentType: _contentType,
  onContentType,
  session,
  onOpenAccount,
  openLookupSignal = 0,
}: HomeScreenProps) {
  void _contentType;
  const [floatPet, setFloatPet] = useState(false);
  const [activeAction, setActiveAction] = useState<HomeQuickAction | null>(null);
  const [vocabDeck, setVocabDeck] = useState<StudyFlashcard[]>([]);
  const [phraseDeck, setPhraseDeck] = useState<StudyFlashcard[]>([]);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const displayName = session.displayName?.trim() || session.username;
  const panel = homeRightPanel(activeAction);
  const compactRight = panel === "lookup" || panel === "chat";
  const vocab = vocabDeck[vocabIndex] ?? null;
  const phrase = phraseDeck[phraseIndex] ?? null;

  useEffect(() => {
    if (openLookupSignal > 0) {
      setActiveAction("lookup");
    }
  }, [openLookupSignal]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [vocabCards, phraseCards] = await Promise.all([
        getStudyDeck("vocabulary"),
        getStudyDeck("phrase"),
      ]);
      if (cancelled) {
        return;
      }
      setVocabDeck(vocabCards.slice(0, HOME_FEED_LIMIT));
      setPhraseDeck(phraseCards.slice(0, HOME_FEED_LIMIT));
      setVocabIndex(0);
      setPhraseIndex(0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      <main className={compactRight ? "yume-shell yume-home yume-home--panel" : "yume-shell yume-home"}>
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

            <nav className="yume-home__quick-actions" aria-label="Lối tắt">
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

          {panel === "story" ? (
            <div className="yume-home__feed" aria-label="Bài học đề xuất">
              <article className="yume-home-feed-card yume-home-feed-card--vocab">
                <FeedCardHead icon={<IconBook />} title={UI.homeFeedVocabTitle} />
                {vocab ? (
                  <>
                    <div className="yume-home-feed__body">
                      <div className="yume-home-feed__copy">
                        <div className="yume-home-feed__term">
                          <h3>{vocab.word}</h3>
                          <button
                            type="button"
                            className="yume-home-feed__speak"
                            aria-label={UI.listen}
                            onClick={() => speakWord(vocab.word)}
                          >
                            <IconSpeaker />
                          </button>
                        </div>
                        {vocab.phonetic ? <p className="yume-home-feed__ipa">{vocab.phonetic}</p> : null}
                        <p className="yume-home-feed__meaning">{formatVocabMeaning(vocab)}</p>
                        {vocab.example || vocab.exampleVi ? (
                          <div className="yume-home-feed__example">
                            {vocab.example ? <p>{vocab.example}</p> : null}
                            {vocab.exampleVi ? <p>{vocab.exampleVi}</p> : null}
                          </div>
                        ) : null}
                      </div>
                      <FeedArt imageKey={vocab.imageKey} topic={vocab.topic} variant="vocab" />
                    </div>
                    <FeedNav
                      prevLabel={UI.homeFeedPrevWord}
                      nextLabel={UI.homeFeedNextWord}
                      counter={`${vocabIndex + 1} / ${vocabDeck.length}`}
                      onPrev={() => setVocabIndex((i) => cycleIndex(i, -1, vocabDeck.length))}
                      onNext={() => setVocabIndex((i) => cycleIndex(i, 1, vocabDeck.length))}
                    />
                  </>
                ) : (
                  <p className="yume-home-feed__empty">{UI.loading}</p>
                )}
              </article>

              <article className="yume-home-feed-card yume-home-feed-card--phrase">
                <FeedCardHead icon={<IconChat />} title={UI.homeFeedPhraseTitle} />
                {phrase ? (
                  <>
                    <div className="yume-home-feed__body">
                      <div className="yume-home-feed__copy">
                        <div className="yume-home-feed__term">
                          <h3>{phrase.word}</h3>
                          <button
                            type="button"
                            className="yume-home-feed__speak"
                            aria-label={UI.listen}
                            onClick={() => speakWord(phrase.word)}
                          >
                            <IconSpeaker />
                          </button>
                        </div>
                        {phrase.phonetic ? <p className="yume-home-feed__ipa">{phrase.phonetic}</p> : null}
                        <p className="yume-home-feed__meaning">{phrase.meaning}</p>
                        {phrase.example || phrase.exampleVi ? (
                          <div className="yume-home-feed__example">
                            <p className="yume-home-feed__hint">{UI.homeFeedSuggestedAnswer}</p>
                            {phrase.example ? <p>{phrase.example}</p> : null}
                            {phrase.exampleVi ? <p>{phrase.exampleVi}</p> : null}
                          </div>
                        ) : null}
                      </div>
                      <FeedArt imageKey={phrase.imageKey} topic={phrase.topic} variant="phrase" />
                    </div>
                    <FeedNav
                      prevLabel={UI.homeFeedPrevPhrase}
                      nextLabel={UI.homeFeedNextPhrase}
                      counter={`${phraseIndex + 1} / ${phraseDeck.length}`}
                      onPrev={() => setPhraseIndex((i) => cycleIndex(i, -1, phraseDeck.length))}
                      onNext={() => setPhraseIndex((i) => cycleIndex(i, 1, phraseDeck.length))}
                    />
                  </>
                ) : (
                  <p className="yume-home-feed__empty">{UI.loading}</p>
                )}
              </article>

              <article className="yume-home-feed-card yume-home-feed-card--story">
                <FeedCardHead icon={<IconStory />} title={UI.homeFeedStoryTitle} />
                <div className="yume-home-feed__story">
                  <div className="yume-home-feed__art yume-home-feed__art--story" aria-hidden />
                  <div className="yume-home-feed__story-copy">
                    <div className="yume-home-feed__story-title-row">
                      <h3>The Little Star</h3>
                      <div className="yume-home-feed__tags">
                        <span className="yume-home-feed__tag yume-home-feed__tag--purple">{UI.homeFeedTagBilingual}</span>
                        <span className="yume-home-feed__tag yume-home-feed__tag--green">{UI.homeFeedTagEasy}</span>
                      </div>
                    </div>
                    <p>
                      A tiny star wanted to shine a little brighter each night — and learned that small steps still
                      light the sky.
                    </p>
                    <p>Một ngôi sao bé muốn sáng hơn mỗi đêm — và học rằng bước nhỏ vẫn thắp sáng bầu trời.</p>
                    <button type="button" className="yume-home-feed__read" onClick={startStudy}>
                      <span aria-hidden>📖</span> {UI.homeFeedReadNow}
                    </button>
                  </div>
                  <div className="yume-home-feed__art yume-home-feed__art--story-side" aria-hidden />
                </div>
                <div className="yume-home-feed__story-foot">
                  <button type="button" className="yume-home-feed__more" onClick={() => runQuickAction("story")}>
                    {UI.homeFeedMoreStories} →
                  </button>
                </div>
              </article>
            </div>
          ) : null}
        </section>
      </main>

      {floatPet ? <FloatingPetOverlay pet={pet} onDismiss={() => setFloatPet(false)} /> : null}
    </>
  );
}
