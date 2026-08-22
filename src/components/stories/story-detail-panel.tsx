import { UI } from "../../constants/ui";
import type { StoryChapter, StoryDetail, StorySummary } from "../../features/stories";
import { publicUrl } from "../../lib/public-url";

export interface StoryDetailPanelProps {
  story: StorySummary;
  detail: StoryDetail | null;
  chapters: StoryChapter[];
  selectedChapterId: number | null;
  onSelectChapter: (chapterId: number) => void;
  onToggleFavorite: (storyId: number) => void;
  onShare: (story: StorySummary) => void;
  onOpenReader: (storyId: number, chapterId: number) => void;
}

function format(template: string, values: Record<string, number>): string {
  return Object.entries(values).reduce(
    (copy, [key, value]) => copy.replace(`{${key}}`, String(value)),
    template,
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
    </svg>
  );
}

export function StoryDetailPanel({
  story,
  detail,
  chapters,
  selectedChapterId,
  onSelectChapter,
  onToggleFavorite,
  onShare,
  onOpenReader,
}: StoryDetailPanelProps) {
  const firstChapter = chapters[0] ?? null;
  const selectedChapter =
    chapters.find((chapter) => chapter.id === selectedChapterId) ?? firstChapter;

  return (
    <aside className="yume-story-surface yume-story-detail" aria-labelledby="story-detail-title">
      <img className="yume-story-detail__cover" src={publicUrl(story.coverUrl)} alt="" />
      <div className="yume-story-card__meta">
        <span>{story.cefrLevel}</span>
        <span>{format(UI.storyChapterCount, { n: story.chapterCount })}</span>
        <span>{format(UI.storyChapterMinutes, { n: story.estimatedReadMinutes })}</span>
      </div>
      <h2 id="story-detail-title" className="yume-story-detail__title">
        {story.titleEn}
      </h2>
      <p className="yume-story-library__subtitle">{story.titleVi}</p>
      <p className="yume-story-detail__desc">{story.descriptionVi}</p>
      <p className="yume-story-library__subtitle">
        {format(UI.storyProgressRead, {
          read: story.completedChapters,
          total: story.chapterCount,
        })}
      </p>

      <div className="yume-story-detail__actions">
        <button
          type="button"
          className="yume-story-chip"
          aria-label={story.isFavorite ? UI.storyFavoriteRemove : UI.storyFavoriteAdd}
          aria-pressed={story.isFavorite}
          onClick={() => onToggleFavorite(story.id)}
        >
          <IconHeart filled={story.isFavorite} />{" "}
          {story.isFavorite ? UI.storyFavoriteRemove : UI.storyFavoriteAdd}
        </button>
        <button
          type="button"
          className="yume-story-chip"
          aria-label={UI.storyShare}
          onClick={() => onShare(story)}
        >
          <IconShare /> {UI.storyShare}
        </button>
      </div>

      <strong className="yume-story-library__subtitle">{UI.storyChapters}</strong>
      <div className="yume-story-detail__chapters">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className={
              chapter.id === selectedChapter?.id
                ? "yume-story-chapter-row is-selected"
                : "yume-story-chapter-row"
            }
            aria-pressed={chapter.id === selectedChapter?.id}
            onClick={() => onSelectChapter(chapter.id)}
          >
            <span>
              <strong>{chapter.chapterNo}. {chapter.titleEn}</strong>
              <small>{chapter.titleVi}</small>
            </span>
            <small>
              {format(UI.storyChapterMinutes, { n: chapter.estimatedReadMinutes })}
            </small>
          </button>
        ))}
      </div>

      <div className="yume-story-detail__actions">
        <button
          type="button"
          className="yume-story-cta yume-story-cta--ghost"
          disabled={!firstChapter}
          onClick={() => firstChapter && onOpenReader(story.id, firstChapter.id)}
        >
          {UI.storyReadFromStart}
        </button>
        <button
          type="button"
          className="yume-story-cta"
          disabled={!selectedChapter}
          onClick={() => selectedChapter && onOpenReader(story.id, selectedChapter.id)}
        >
          {UI.storyReadSelectedChapter}
        </button>
      </div>

      {story.authorName ? (
        <p className="yume-story-library__subtitle">{story.authorName}</p>
      ) : null}
      {detail?.attributionRequired && detail.attributionText ? (
        <section className="yume-story-detail__attribution">
          <strong>{UI.storyAttribution}</strong>
          <p>{detail.attributionText}</p>
        </section>
      ) : null}
    </aside>
  );
}
