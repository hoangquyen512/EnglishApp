import { UI } from "../../constants/ui";
import type { StoryChapter, StoryDetail, StorySummary } from "../../features/stories";
import { IconHeart, IconShare } from "../shared/yume-icons";

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
      <div className="yume-story-detail__head">
        <div className="yume-story-card__meta">
          <span className="yume-story-card__level">{story.cefrLevel}</span>
          <span>{format(UI.storyChapterCount, { n: story.chapterCount })}</span>
          <span>{format(UI.storyChapterMinutes, { n: story.estimatedReadMinutes })}</span>
          <span>
            {format(UI.storyProgressRead, {
              read: story.completedChapters,
              total: story.chapterCount,
            })}
          </span>
        </div>
        <h2 id="story-detail-title" className="yume-story-detail__title">
          {story.titleEn}
        </h2>
        <p className="yume-story-library__subtitle">{story.titleVi}</p>
        <p className="yume-story-detail__desc">{story.descriptionVi}</p>

        <div className="yume-story-detail__actions">
          <button
            type="button"
            className="yume-story-chip"
            aria-label={story.isFavorite ? UI.storyFavoriteRemove : UI.storyFavoriteAdd}
            aria-pressed={story.isFavorite}
            onClick={() => onToggleFavorite(story.id)}
          >
            <IconHeart size={15} filled={story.isFavorite} />
            {story.isFavorite ? UI.storyFavoriteRemove : UI.storyFavoriteAdd}
          </button>
          <button
            type="button"
            className="yume-story-chip"
            aria-label={UI.storyShare}
            onClick={() => onShare(story)}
          >
            <IconShare />
            {UI.storyShare}
          </button>
        </div>
      </div>

        <div className="yume-story-detail__body">
        <p className="yume-story-detail__section-label">{UI.storyChapters}</p>
        <div className="yume-story-scroll-panel yume-story-detail__chapters">
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

          {story.authorName ? (
            <p className="yume-story-detail__author">{story.authorName}</p>
          ) : null}
          {detail?.attributionRequired && detail.attributionText ? (
            <section className="yume-story-detail__attribution">
              <strong>{UI.storyAttribution}</strong>
              <p>{detail.attributionText}</p>
            </section>
          ) : null}
        </div>
      </div>

      <div className="yume-story-detail__footer">
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
          {story.hasProgress ? UI.storyContinueReading : UI.storyReadSelectedChapter}
        </button>
      </div>
    </aside>
  );
}
