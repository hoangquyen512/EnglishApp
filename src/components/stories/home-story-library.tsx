import { useCallback, useEffect, useMemo, useState } from "react";
import { UI } from "../../constants/ui";
import {
  ensureStoriesSeeded,
  filterAndSortStories,
  getStoryDetail,
  getStoryProgress,
  listChapters,
  listStorySummaries,
  toggleStoryFavorite,
  type StoryChapter,
  type StoryFilter,
  type StoryDetail,
  type StorySort,
  type StorySummary,
} from "../../features/stories";
import { publicUrl } from "../../lib/public-url";
import { StoryDetailPanel } from "./story-detail-panel";

export interface HomeStoryLibraryProps {
  onOpenReader: (storyId: number, chapterId: number) => void;
}

const FILTERS: Array<{ value: StoryFilter; label: string }> = [
  { value: "all", label: UI.storyFilterAll },
  { value: "new", label: UI.storyFilterNew },
  { value: "reading", label: UI.storyFilterReading },
  { value: "favorite", label: UI.storyFilterFavorite },
  { value: "children", label: UI.storyFilterChildren },
  { value: "communication", label: UI.storyFilterCommunication },
];

const SORTS: Array<{ value: StorySort; label: string }> = [
  { value: "newest", label: UI.storySortNewest },
  { value: "popular", label: UI.storySortPopular },
  { value: "az", label: UI.storySortAz },
  { value: "level", label: UI.storySortLevel },
  { value: "duration", label: UI.storySortDuration },
];

function format(template: string, values: Record<string, number>): string {
  return Object.entries(values).reduce(
    (copy, [key, value]) => copy.replace(`{${key}}`, String(value)),
    template,
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function HomeStoryLibrary({ onOpenReader }: HomeStoryLibraryProps) {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [storyDetail, setStoryDetail] = useState<StoryDetail | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<StoryFilter>("all");
  const [sort, setSort] = useState<StorySort>("newest");
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      await ensureStoriesSeeded();
      const summaries = await listStorySummaries();
      setStories(summaries);
      setSelectedStoryId((current) =>
        current && summaries.some((story) => story.id === current)
          ? current
          : summaries[0]?.id ?? null,
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!selectedStoryId) {
      setChapters([]);
      setStoryDetail(null);
      setSelectedChapterId(null);
      return;
    }
    let cancelled = false;
    setStoryDetail(null);
    void Promise.all([listChapters(selectedStoryId), getStoryDetail(selectedStoryId)])
      .then(([nextChapters, nextDetail]) => {
        if (cancelled) return;
        setChapters(nextChapters);
        setStoryDetail(nextDetail);
        setSelectedChapterId(nextChapters[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setChapters([]);
          setStoryDetail(null);
          setSelectedChapterId(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStoryId]);

  const visibleStories = useMemo(
    () =>
      filterAndSortStories(stories, {
        search: debouncedSearch,
        filter,
        sort,
      }),
    [debouncedSearch, filter, sort, stories],
  );
  useEffect(() => {
    if (
      visibleStories.length > 0 &&
      !visibleStories.some((story) => story.id === selectedStoryId)
    ) {
      setSelectedStoryId(visibleStories[0]!.id);
    }
  }, [selectedStoryId, visibleStories]);
  const selectedStory =
    visibleStories.find((story) => story.id === selectedStoryId) ??
    visibleStories[0] ??
    null;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilter("all");
    setSort("newest");
  };

  const toggleFavorite = async (storyId: number) => {
    const isFavorite = await toggleStoryFavorite(storyId);
    setStories((current) =>
      current.map((story) => (story.id === storyId ? { ...story, isFavorite } : story)),
    );
  };

  const shareStory = async (story: StorySummary) => {
    const text = `yume://stories/${story.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.titleEn, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Native share cancellation and clipboard denial do not block reading.
    }
  };

  const openOrSelect = async (story: StorySummary) => {
    if (story.hasProgress) {
      const progress = await getStoryProgress(story.id);
      if (progress?.chapterId) {
        onOpenReader(story.id, progress.chapterId);
        return;
      }
    }
    setSelectedStoryId(story.id);
  };

  return (
    <>
      <section className="yume-story-surface yume-story-library" aria-labelledby="story-library-title">
        <header className="yume-story-library__head">
          <p className="yume-story-library__eyebrow">{UI.storyLibraryEyebrow}</p>
          <h2 id="story-library-title">{UI.storyLibraryTitle}</h2>
          <p className="yume-story-library__subtitle">{UI.storyLibrarySubtitle}</p>
        </header>

        <div className="yume-story-library__toolbar">
          <label className="yume-story-library__search">
            <IconSearch />
            <input
              type="search"
              value={search}
              aria-label={UI.storySearchPlaceholder}
              placeholder={UI.storySearchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="yume-story-library__filters" aria-label={UI.storyFilterLabel}>
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? "yume-story-chip is-active" : "yume-story-chip"}
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="yume-story-library__sort-row" aria-label={UI.storySortLabel}>
            {SORTS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={sort === item.value ? "yume-story-chip is-active" : "yume-story-chip"}
                aria-pressed={sort === item.value}
                onClick={() => setSort(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="yume-story-library__list" aria-live="polite">
          {loading ? <p className="yume-story-empty">{UI.storyLoading}</p> : null}
          {error ? (
            <div className="yume-story-error">
              <p>{UI.storyLoadError}</p>
              <button type="button" className="yume-story-chip" onClick={() => void loadStories()}>
                {UI.storyRetry}
              </button>
            </div>
          ) : null}
          {!loading && !error && visibleStories.length === 0 ? (
            <div className="yume-story-empty">
              <p>{search || filter !== "all" ? UI.storyEmptySearch : UI.storyEmptyLibrary}</p>
              <button type="button" className="yume-story-chip" onClick={clearFilters}>
                {UI.storyClearFilters}
              </button>
            </div>
          ) : null}
          {!loading && !error
            ? visibleStories.map((story) => (
                <article
                  key={story.id}
                  className={
                    story.id === selectedStoryId
                      ? "yume-story-card is-selected"
                      : "yume-story-card"
                  }
                >
                  <img className="yume-story-card__cover" src={publicUrl(story.coverUrl)} alt="" />
                  <div className="yume-story-card__body">
                    <h3>{story.titleEn}</h3>
                    <p>{story.titleVi}</p>
                    <p>{story.descriptionVi}</p>
                    <div className="yume-story-card__meta">
                      <span>{story.cefrLevel}</span>
                      <span>{format(UI.storyChapterCount, { n: story.chapterCount })}</span>
                      <span>{format(UI.storyChapterMinutes, { n: story.estimatedReadMinutes })}</span>
                      <span>
                        {format(UI.storyProgressRead, {
                          read: story.completedChapters,
                          total: story.chapterCount,
                        })}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="yume-story-card__open"
                      onClick={() => void openOrSelect(story)}
                    >
                      {story.hasProgress
                        ? UI.storyContinueReading
                        : UI.storyViewStory}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="yume-story-card__favorite"
                    aria-label={story.isFavorite ? UI.storyFavoriteRemove : UI.storyFavoriteAdd}
                    aria-pressed={story.isFavorite}
                    onClick={() => void toggleFavorite(story.id)}
                  >
                    <IconHeart filled={story.isFavorite} />
                  </button>
                </article>
              ))
            : null}
        </div>
      </section>

      {selectedStory ? (
        <StoryDetailPanel
          story={selectedStory}
          detail={storyDetail}
          chapters={chapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          onToggleFavorite={(storyId) => void toggleFavorite(storyId)}
          onShare={(story) => void shareStory(story)}
          onOpenReader={onOpenReader}
        />
      ) : (
        <aside className="yume-story-surface yume-story-detail">
          <p className="yume-story-empty">{loading ? UI.storyLoading : UI.storyEmptyLibrary}</p>
        </aside>
      )}
    </>
  );
}
