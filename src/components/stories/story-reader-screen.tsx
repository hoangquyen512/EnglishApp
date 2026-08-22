import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import { APP_NAME, UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import type { DictionaryCacheEntry } from "../../features/quick-lookup";
import {
  READER_FONT_SIZES,
  addStoryBookmark,
  adjacentChapterId,
  chapterCompletedAt,
  createWebTts,
  ensureStoriesSeeded,
  getChapterContent,
  getStoryProgress,
  getStoryDetail,
  hasStoryBookmark,
  isChapterNearComplete,
  listChapters,
  listFeaturedVocabulary,
  persistReaderPreference,
  readReaderPreferences,
  removeStoryBookmark,
  saveStoryProgress,
  type ChapterContent,
  type FeaturedVocabulary,
  type ReaderFontSize,
  type ReaderLanguageMode,
  type ReaderTheme,
  type StoryChapter,
  type StoryDetail,
} from "../../features/stories";
import { UserAvatar } from "../account/user-avatar";
import {
  WordPopover,
  type StoryWordSelection,
} from "./word-popover";

interface StoryReaderScreenProps {
  storyId: number;
  chapterId: number;
  streakDays: number;
  session: SessionDto;
  onOpenAccount: () => void;
  onBack: () => void;
  onOpenChapter: (chapterId: number) => void;
}

interface ReaderData {
  story: StoryDetail;
  chapter: StoryChapter;
  chapters: StoryChapter[];
  content: ChapterContent;
  featured: FeaturedVocabulary[];
}

interface ProgressSnapshot {
  storyId: number;
  chapterId: number;
  contentUnitId: number | null;
  progressPercentage: number;
  completedAt: string | null;
}

export interface FeaturedTextPart {
  text: string;
  featured: boolean;
}

export interface EnglishWordPart {
  text: string;
  word: string | null;
}

const PROGRESS_SAVE_DELAY_MS = 5_000;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitFeaturedText(text: string, lemmas: string[]): FeaturedTextPart[] {
  const featured = [...new Set(lemmas.map((lemma) => lemma.trim().toLocaleLowerCase()))].filter(
    Boolean,
  );
  if (featured.length === 0) return [{ text, featured: false }];

  const pattern = new RegExp(`\\b(${featured.map(escapeRegExp).join("|")})\\b`, "giu");
  const parts: FeaturedTextPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ text: text.slice(cursor, index), featured: false });
    parts.push({ text: match[0], featured: true });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), featured: false });
  return parts;
}

export function splitEnglishWords(text: string): EnglishWordPart[] {
  const parts: EnglishWordPart[] = [];
  const pattern = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ text: text.slice(cursor, index), word: null });
    parts.push({ text: match[0], word: match[0] });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), word: null });
  return parts;
}

export function StoryReaderScreen({
  storyId,
  chapterId,
  streakDays,
  session,
  onOpenAccount,
  onBack,
  onOpenChapter,
}: StoryReaderScreenProps) {
  const [data, setData] = useState<ReaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [languageMode, setLanguageMode] = useState<ReaderLanguageMode>(
    () =>
      readReaderPreferences(
        typeof window === "undefined" ? null : window.localStorage,
      ).languageMode,
  );
  const [fontSize, setFontSize] = useState<ReaderFontSize>(
    () =>
      readReaderPreferences(
        typeof window === "undefined" ? null : window.localStorage,
      ).fontSize,
  );
  const [theme, setTheme] = useState<ReaderTheme>(
    () =>
      readReaderPreferences(
        typeof window === "undefined" ? null : window.localStorage,
      ).theme,
  );
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StoryWordSelection | null>(null);
  const [savedWords, setSavedWords] = useState<DictionaryCacheEntry[]>([]);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [tts] = useState(() => createWebTts());
  const progressSnapshotRef = useRef<ProgressSnapshot | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistProgressSnapshot = useCallback((snapshot: ProgressSnapshot | null) => {
    if (!snapshot) return Promise.resolve();
    return saveStoryProgress({
      storyId: snapshot.storyId,
      chapterId: snapshot.chapterId,
      contentUnitId: snapshot.contentUnitId,
      progressPercentage: snapshot.progressPercentage,
      lastReadAt: new Date().toISOString(),
      completedAt: snapshot.completedAt,
    });
  }, []);

  const flushProgress = useCallback(() => {
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void persistProgressSnapshot(progressSnapshotRef.current);
  }, [persistProgressSnapshot]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      await ensureStoriesSeeded();
      const [story, chapters, content, featured, savedProgress, savedBookmark] =
        await Promise.all([
          getStoryDetail(storyId),
          listChapters(storyId),
          getChapterContent(chapterId),
          listFeaturedVocabulary(chapterId),
          getStoryProgress(storyId),
          hasStoryBookmark(storyId, chapterId),
        ]);
      const chapter = chapters.find((item) => item.id === chapterId);
      if (!story || !chapter) throw new Error("Story chapter is unavailable");
      const chapterProgress =
        savedProgress?.chapterId === chapterId ? savedProgress.progressPercentage : 0;
      setData({ story, chapter, chapters, content, featured });
      setProgress(chapterProgress);
      setBookmarked(savedBookmark);
      progressSnapshotRef.current = {
        storyId,
        chapterId,
        contentUnitId:
          savedProgress?.chapterId === chapterId ? savedProgress.contentUnitId : null,
        progressPercentage: chapterProgress,
        completedAt:
          savedProgress?.chapterId === chapterId ? savedProgress.completedAt : null,
      };
    } catch {
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [chapterId, storyId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => () => tts.stop(), [chapterId, tts]);

  useEffect(() => {
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") flushProgress();
    };
    document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", saveWhenHidden);
      flushProgress();
    };
  }, [chapterId, flushProgress, storyId]);

  useEffect(() => {
    if (!showVocabularyModal) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowVocabularyModal(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showVocabularyModal]);

  const setMode = (mode: ReaderLanguageMode) => {
    setLanguageMode(mode);
    persistReaderPreference(
      typeof window === "undefined" ? null : window.localStorage,
      "languageMode",
      mode,
    );
  };

  const cycleFontSize = () => {
    const next =
      READER_FONT_SIZES[
        (READER_FONT_SIZES.indexOf(fontSize) + 1) % READER_FONT_SIZES.length
      ]!;
    setFontSize(next);
    persistReaderPreference(
      typeof window === "undefined" ? null : window.localStorage,
      "fontSize",
      next,
    );
  };

  const toggleTheme = () => {
    const next = theme === "galaxy" ? "dark" : "galaxy";
    setTheme(next);
    persistReaderPreference(
      typeof window === "undefined" ? null : window.localStorage,
      "theme",
      next,
    );
  };

  const updateProgress = (event: UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const available = element.scrollHeight - element.clientHeight;
    const nextProgress =
      available <= 0
        ? 100
        : Math.min(100, Math.round((element.scrollTop / available) * 100));
    let contentUnitId: number | null = null;
    const readingLine = element.scrollTop + element.clientHeight * 0.25;
    for (const unit of element.querySelectorAll<HTMLElement>("[data-content-unit-id]")) {
      if (unit.offsetTop > readingLine) break;
      contentUnitId = Number(unit.dataset.contentUnitId);
    }
    setProgress(nextProgress);
    progressSnapshotRef.current = {
      storyId,
      chapterId,
      contentUnitId,
      progressPercentage: nextProgress,
      completedAt: chapterCompletedAt(
        nextProgress,
        progressSnapshotRef.current?.completedAt ?? null,
        new Date().toISOString(),
      ),
    };
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void persistProgressSnapshot(progressSnapshotRef.current);
    }, PROGRESS_SAVE_DELAY_MS);
  };

  const toggleBookmark = async () => {
    if (bookmarkPending) return;
    setBookmarkPending(true);
    try {
      const input = { storyId, chapterId };
      if (bookmarked) await removeStoryBookmark(input);
      else await addStoryBookmark(input);
      setBookmarked((current) => !current);
    } catch {
      // Keep the current bookmark state when persistence is unavailable.
    } finally {
      setBookmarkPending(false);
    }
  };

  const openAdjacentChapter = (targetChapterId: number, completeWhenNear: boolean) => {
    if (
      completeWhenNear &&
      progressSnapshotRef.current &&
      isChapterNearComplete(progressSnapshotRef.current.progressPercentage)
    ) {
      progressSnapshotRef.current = {
        ...progressSnapshotRef.current,
        progressPercentage: 100,
        completedAt: new Date().toISOString(),
      };
      setProgress(100);
    }
    flushProgress();
    onOpenChapter(targetChapterId);
  };

  if (loading) {
    return (
      <main className="yume-shell yume-story-reader" aria-busy="true">
        <p className="yume-story-empty">{UI.storyLoading}</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="yume-shell yume-story-reader">
        <div className="yume-story-error" role="alert">
          <p>{UI.storyLoadError}</p>
          <button type="button" className="yume-story-chip" onClick={() => void load()}>
            {UI.storyRetry}
          </button>
          <button type="button" className="yume-story-chip" onClick={onBack}>
            {UI.storyReaderBreadcrumbLibrary}
          </button>
        </div>
      </main>
    );
  }

  const { story, chapter, chapters, content, featured } = data;
  const previousId = adjacentChapterId(chapters, chapterId, "prev");
  const nextId = adjacentChapterId(chapters, chapterId, "next");
  const featuredLemmas = featured.map((item) => item.lemma);
  const displayName = session.displayName?.trim() || session.username;
  const fontLabel = {
    sm: UI.storyReaderFontSmall,
    md: UI.storyReaderFontMedium,
    lg: UI.storyReaderFontLarge,
    xl: UI.storyReaderFontXl,
  }[fontSize];

  const openWord = (
    word: string,
    sentence: ChapterContent["units"][number]["sentences"][number],
    target: HTMLElement,
  ) => {
    const rect = target.getBoundingClientRect();
    const maxLeft = Math.max(12, window.innerWidth - 304);
    setSelectedWord({
      word,
      storyId,
      chapterId,
      sentenceId: sentence.id,
      sentenceEn: sentence.en,
      sentenceVi: sentence.vi,
      anchorX: Math.min(Math.max(12, rect.left), maxLeft),
      anchorY: Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - 280)),
    });
  };

  const openFeaturedWord = (item: FeaturedVocabulary, target: HTMLElement) => {
    const sentences = content.units.flatMap((unit) => unit.sentences);
    const matchingSentence =
      sentences.find((sentence) =>
        sentence.en.toLocaleLowerCase().includes(item.lemma.toLocaleLowerCase()),
      ) ?? sentences[0];
    if (matchingSentence) openWord(item.word, matchingSentence, target);
  };

  const renderEnglishSentence = (
    sentence: ChapterContent["units"][number]["sentences"][number],
  ): ReactNode =>
    splitEnglishWords(sentence.en).map((part, index) => {
      if (!part.word) return <span key={`${sentence.id}-text-${index}`}>{part.text}</span>;
      const isFeatured = featuredLemmas.some(
        (lemma) => lemma.toLocaleLowerCase() === part.word!.toLocaleLowerCase(),
      );
      return (
        <button
          type="button"
          className={
            isFeatured
              ? "yume-story-reader__word yume-story-reader__word--featured"
              : "yume-story-reader__word"
          }
          key={`${sentence.id}-word-${index}`}
          onClick={(event) => openWord(part.word!, sentence, event.currentTarget)}
        >
          {part.text}
        </button>
      );
    });

  const renderSentences = (): ReactNode =>
    content.units.map((unit) => (
      <article
        className={`yume-story-reader__unit yume-story-reader__unit--${languageMode}`}
        key={unit.id}
        data-content-unit-id={unit.id}
      >
        {languageMode !== "vi" ? (
          <p className="yume-story-reader__col-en">
            {unit.sentences.map((sentence, index) => (
              <span key={sentence.id}>
                {renderEnglishSentence(sentence)}
                <button
                  type="button"
                  className="yume-story-reader__word"
                  aria-label={`Nghe câu: ${sentence.en}`}
                  disabled={!tts.supported}
                  onClick={() => tts.speakSentence(sentence.en)}
                >
                  🔊
                </button>
                {index < unit.sentences.length - 1 ? " " : null}
              </span>
            ))}
          </p>
        ) : null}
        {languageMode !== "en" ? (
          <p className="yume-story-reader__col-vi">
            {unit.sentences.map((sentence, index) => (
              <span key={sentence.id}>
                {sentence.vi}
                {index < unit.sentences.length - 1 ? " " : null}
              </span>
            ))}
          </p>
        ) : null}
      </article>
    ));

  return (
    <main className={`yume-shell yume-story-reader yume-story-reader--${theme}`}>
      <header className="yume-story-reader__topbar">
        <div className="yume-home__brand" aria-label={APP_NAME}>
          <img
            src={`${import.meta.env.BASE_URL}yume-icon-mark.png`}
            alt=""
            className="yume-home__brand-icon"
          />
          <span>{APP_NAME}</span>
        </div>
        <p className="yume-story-reader__breadcrumb">
          <button type="button" onClick={onBack}>
            {UI.storyReaderBreadcrumbLibrary}
          </button>
          <span aria-hidden> / </span>
          <span>{story.titleEn}</span>
          <span aria-hidden> / </span>
          <span aria-current="page">{chapter.titleVi}</span>
        </p>
        <div className="yume-story-reader__account">
          <span className="yume-home__chip yume-home__chip--streak">
            {streakDays} {UI.homeStreakSuffix}
          </span>
          <button
            type="button"
            className="yume-home__chip yume-home__chip--profile"
            onClick={onOpenAccount}
            aria-label={displayName}
          >
            <UserAvatar session={session} size="sm" className="yume-home__avatar" />
            <span className="yume-home__profile-name">{displayName}</span>
          </button>
        </div>
      </header>

      <section className="yume-story-reader__heading" aria-labelledby="reader-title">
        <div className="yume-story-reader__titles">
          <h1 id="reader-title">{story.titleEn}</h1>
          <p>
            Chương {chapter.chapterNo}: {chapter.titleVi} · {chapter.titleEn}
          </p>
        </div>
        <div className="yume-story-reader__toolbar">
          <button
            type="button"
            className="yume-story-reader__toolbar-btn"
            disabled={!tts.supported}
            onClick={() =>
              tts.speakChapter(
                content.units.flatMap((unit) =>
                  unit.sentences.map((sentence) => sentence.en),
                ),
              )
            }
          >
            {UI.storyReaderListen}
          </button>
          <button
            type="button"
            className={
              bookmarked
                ? "yume-story-reader__toolbar-btn is-active"
                : "yume-story-reader__toolbar-btn"
            }
            aria-pressed={bookmarked}
            disabled={bookmarkPending}
            onClick={() => void toggleBookmark()}
          >
            {UI.storyReaderBookmark}
          </button>
          <button type="button" className="yume-story-reader__toolbar-btn" onClick={cycleFontSize}>
            {UI.storyReaderFontSize}: {fontLabel}
          </button>
          <button type="button" className="yume-story-reader__toolbar-btn" onClick={toggleTheme}>
            {UI.storyReaderTheme}:{" "}
            {theme === "galaxy" ? UI.storyReaderThemeGalaxy : UI.storyReaderThemeDark}
          </button>
          <div className="yume-story-reader__language" aria-label="Ngôn ngữ đọc">
            {(
              [
                ["bilingual", UI.storyReaderLangBilingual],
                ["en", UI.storyReaderLangEn],
                ["vi", UI.storyReaderLangVi],
              ] as const
            ).map(([mode, label]) => (
              <button
                type="button"
                className={
                  languageMode === mode
                    ? "yume-story-reader__toolbar-btn is-active"
                    : "yume-story-reader__toolbar-btn"
                }
                aria-pressed={languageMode === mode}
                key={mode}
                onClick={() => setMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          className="yume-story-reader__progress"
          role="progressbar"
          aria-label={UI.storyReaderChapterProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="yume-story-reader__main">
        <section
          className="yume-story-reader__content"
          data-font-size={fontSize}
          onScroll={updateProgress}
          aria-label={`${story.titleEn}, ${chapter.titleEn}`}
        >
          {renderSentences()}
        </section>
        <aside className="yume-story-reader__vocab-panel">
          <h2>{UI.storyReaderFeaturedVocab}</h2>
          <ul className="yume-story-reader__vocab-list">
            {featured.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="yume-story-reader__vocab-item"
                  onClick={(event) => openFeaturedWord(item, event.currentTarget)}
                >
                  <strong>{item.word}</strong>
                  {item.ipa ? <span>{item.ipa}</span> : null}
                  <p>{item.meaningVi}</p>
                </button>
                <button
                  type="button"
                  className="yume-story-reader__toolbar-btn"
                  aria-label={`Nghe từ ${item.word}`}
                  disabled={!tts.supported}
                  onClick={() => tts.speakText(item.word)}
                >
                  🔊
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="yume-story-reader__toolbar-btn"
            onClick={() => setShowVocabularyModal(true)}
          >
            {UI.storyReaderViewAllVocab}
          </button>
        </aside>
      </div>

      <nav className="yume-story-reader__nav" aria-label={UI.storyChapters}>
        <button
          type="button"
          className="yume-story-reader__nav-btn"
          disabled={previousId === null}
          onClick={() =>
            previousId !== null && openAdjacentChapter(previousId, false)
          }
        >
          ← {UI.storyReaderPrevChapter}
        </button>
        <span>
          {UI.storyReaderPickChapter} · {chapter.chapterNo}/{chapters.length}
        </span>
        <button
          type="button"
          className="yume-story-reader__nav-btn"
          disabled={nextId === null}
          onClick={() => nextId !== null && openAdjacentChapter(nextId, true)}
        >
          {UI.storyReaderNextChapter} →
        </button>
      </nav>

      {selectedWord ? (
        <WordPopover
          selection={selectedWord}
          onClose={() => setSelectedWord(null)}
          onSaved={(entry) =>
            setSavedWords((current) => [
              entry,
              ...current.filter((item) => item.word !== entry.word),
            ])
          }
        />
      ) : null}

      {showVocabularyModal ? (
        <div
          className="yume-story-vocab-modal__backdrop"
          role="presentation"
          onMouseDown={() => setShowVocabularyModal(false)}
        >
          <section
            className="yume-story-vocab-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-vocab-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <h2 id="story-vocab-modal-title">{UI.storyReaderFeaturedVocab}</h2>
              <button
                type="button"
                className="yume-word-popover__close"
                aria-label={UI.close}
                onClick={() => setShowVocabularyModal(false)}
              >
                ×
              </button>
            </header>
            <ul className="yume-story-reader__vocab-list">
              {featured.map((item) => (
                <li key={`featured-${item.id}`}>
                  <strong>{item.word}</strong>
                  {item.ipa ? <span>{item.ipa}</span> : null}
                  {item.partOfSpeech ? <span>· {item.partOfSpeech}</span> : null}
                  <p>{item.meaningVi}</p>
                  <button
                    type="button"
                    className="yume-story-reader__toolbar-btn"
                    aria-label={`Nghe từ ${item.word}`}
                    disabled={!tts.supported}
                    onClick={() => tts.speakText(item.word)}
                  >
                    🔊
                  </button>
                </li>
              ))}
              {savedWords.map((item) => (
                <li key={`saved-${item.word}`}>
                  <strong>{item.word}</strong>
                  {item.phoneticIpa ? <span>{item.phoneticIpa}</span> : null}
                  <p>{item.meaningVi}</p>
                  <button
                    type="button"
                    className="yume-story-reader__toolbar-btn"
                    aria-label={`Nghe từ ${item.word}`}
                    disabled={!tts.supported}
                    onClick={() => tts.speakText(item.word)}
                  >
                    🔊
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </main>
  );
}
