import { useEffect, useState } from "react";
import { UI } from "../../constants/ui";
import {
  quickLookup,
  type DictionaryCacheEntry,
} from "../../features/quick-lookup";
import { saveUserStoryVocabulary } from "../../features/stories";

export interface StoryWordContext {
  storyId: number;
  chapterId: number;
  sentenceId: number;
  sentenceEn: string;
  sentenceVi: string;
}

export interface StoryWordSelection extends StoryWordContext {
  word: string;
  anchorX: number;
  anchorY: number;
}

interface WordPopoverProps {
  selection: StoryWordSelection;
  onClose: () => void;
  onSaved: (entry: DictionaryCacheEntry) => void;
}

export function buildStoryVocabularyInput(
  entry: DictionaryCacheEntry,
  context: StoryWordContext,
) {
  return {
    word: entry.word,
    lemma: entry.word.toLocaleLowerCase(),
    ipa: entry.phoneticIpa,
    meaningVi: entry.meaningVi,
    storyId: context.storyId,
    chapterId: context.chapterId,
    sentenceId: context.sentenceId,
    originalSentence: context.sentenceEn,
    contextTranslation: context.sentenceVi,
  };
}

export function WordPopover({ selection, onClose, onSaved }: WordPopoverProps) {
  const [entry, setEntry] = useState<DictionaryCacheEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setEntry(null);
    setError(false);
    setLoading(true);
    setSaved(false);
    void quickLookup(selection.word)
      .then((result) => {
        if (active) setEntry(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selection.word]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const save = async () => {
    if (!entry || saving) return;
    setSaving(true);
    setError(false);
    try {
      await saveUserStoryVocabulary(buildStoryVocabularyInput(entry, selection));
      setSaved(true);
      onSaved(entry);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="yume-word-popover"
      style={{ left: selection.anchorX, top: selection.anchorY }}
      aria-live="polite"
      aria-label={selection.word}
    >
      <button
        type="button"
        className="yume-word-popover__close"
        aria-label={UI.close}
        onClick={onClose}
      >
        ×
      </button>
      {loading ? <p className="yume-word-popover__status">{UI.quickLookupLoading}</p> : null}
      {error ? (
        <p className="yume-word-popover__status yume-word-popover__status--error" role="alert">
          {UI.storyDictError}
        </p>
      ) : null}
      {entry ? (
        <>
          <div className="yume-word-popover__title">
            <strong>{entry.word}</strong>
            {entry.phoneticIpa ? <span>{entry.phoneticIpa}</span> : null}
          </div>
          {entry.partOfSpeech ? (
            <span className="yume-word-popover__pos">{entry.partOfSpeech}</span>
          ) : null}
          <p className="yume-word-popover__meaning">{entry.meaningVi}</p>
          <button
            type="button"
            className="yume-story-cta yume-word-popover__save"
            disabled={saving || saved}
            onClick={() => void save()}
          >
            {saved ? UI.storyWordSaved : UI.storySaveWord}
          </button>
        </>
      ) : null}
    </aside>
  );
}
