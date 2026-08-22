import { useCallback, useEffect, useState, type ReactNode, type UIEvent } from "react";
import { APP_NAME, UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import {
  READER_PREF_KEYS,
  adjacentChapterId,
  ensureStoriesSeeded,
  getChapterContent,
  getStoryDetail,
  listChapters,
  listFeaturedVocabulary,
  normalizeLanguageMode,
  type ChapterContent,
  type FeaturedVocabulary,
  type ReaderLanguageMode,
  type StoryChapter,
  type StoryDetail,
} from "../../features/stories";
import { UserAvatar } from "../account/user-avatar";

type ReaderFontSize = "sm" | "md" | "lg" | "xl";
type ReaderTheme = "galaxy" | "dark";

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

export interface FeaturedTextPart {
  text: string;
  featured: boolean;
}

const FONT_SIZES: ReaderFontSize[] = ["sm", "md", "lg", "xl"];

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

function readPreference<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Reader preferences remain available for the current session.
  }
}

function HighlightedText({ text, lemmas }: { text: string; lemmas: string[] }) {
  return splitFeaturedText(text, lemmas).map((part, index) =>
    part.featured ? (
      <mark className="yume-story-reader__featured" key={`${part.text}-${index}`}>
        {part.text}
      </mark>
    ) : (
      <span key={`${part.text}-${index}`}>{part.text}</span>
    ),
  );
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
  const [languageMode, setLanguageMode] = useState<ReaderLanguageMode>(() =>
    normalizeLanguageMode(
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(READER_PREF_KEYS.languageMode),
    ),
  );
  const [fontSize, setFontSize] = useState<ReaderFontSize>(() =>
    readPreference(READER_PREF_KEYS.fontSize, FONT_SIZES, "md"),
  );
  const [theme, setTheme] = useState<ReaderTheme>(() =>
    readPreference(READER_PREF_KEYS.theme, ["galaxy", "dark"] as const, "galaxy"),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      await ensureStoriesSeeded();
      const [story, chapters, content, featured] = await Promise.all([
        getStoryDetail(storyId),
        listChapters(storyId),
        getChapterContent(chapterId),
        listFeaturedVocabulary(chapterId),
      ]);
      const chapter = chapters.find((item) => item.id === chapterId);
      if (!story || !chapter) throw new Error("Story chapter is unavailable");
      setData({ story, chapter, chapters, content, featured });
      setProgress(0);
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

  const setMode = (mode: ReaderLanguageMode) => {
    setLanguageMode(mode);
    savePreference(READER_PREF_KEYS.languageMode, mode);
  };

  const cycleFontSize = () => {
    const next = FONT_SIZES[(FONT_SIZES.indexOf(fontSize) + 1) % FONT_SIZES.length]!;
    setFontSize(next);
    savePreference(READER_PREF_KEYS.fontSize, next);
  };

  const toggleTheme = () => {
    const next = theme === "galaxy" ? "dark" : "galaxy";
    setTheme(next);
    savePreference(READER_PREF_KEYS.theme, next);
  };

  const updateProgress = (event: UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const available = element.scrollHeight - element.clientHeight;
    setProgress(available <= 0 ? 100 : Math.min(100, Math.round((element.scrollTop / available) * 100)));
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
                <HighlightedText text={sentence.en} lemmas={featuredLemmas} />
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
          <button type="button" className="yume-story-reader__toolbar-btn" disabled>
            {UI.storyReaderListen}
          </button>
          <button type="button" className="yume-story-reader__toolbar-btn" disabled>
            {UI.storyReaderSave}
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
                <strong>{item.word}</strong>
                {item.ipa ? <span>{item.ipa}</span> : null}
                <p>{item.meaningVi}</p>
              </li>
            ))}
          </ul>
          <button type="button" className="yume-story-reader__toolbar-btn" disabled>
            {UI.storyReaderViewAllVocab}
          </button>
        </aside>
      </div>

      <nav className="yume-story-reader__nav" aria-label={UI.storyChapters}>
        <button
          type="button"
          className="yume-story-reader__nav-btn"
          disabled={previousId === null}
          onClick={() => previousId !== null && onOpenChapter(previousId)}
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
          onClick={() => nextId !== null && onOpenChapter(nextId)}
        >
          {UI.storyReaderNextChapter} →
        </button>
      </nav>
    </main>
  );
}
