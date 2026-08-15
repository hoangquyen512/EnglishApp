import { useEffect, useState } from "react";
import { UI } from "../../constants/ui";
import {
  TOPIC_CATEGORY_LABELS,
  topicsByCategory,
  type CefrLevelPreference,
  type ContentTypePreference,
  type TopicCode,
} from "../../features/learning-program/catalog";
import {
  loadLearningProgram,
  previewContentCount,
  saveLearningProgram,
} from "../../features/learning-program";
import { toggleTopicSelection } from "../../features/learning-program/validate";
import { PrimaryButton } from "../shared/primary-button";

interface LearningProgramScreenProps {
  onBack: () => void;
  onSaved?: () => void;
}

export function LearningProgramScreen({ onBack, onSaved }: LearningProgramScreenProps) {
  const [programName, setProgramName] = useState("Chương trình học của tôi");
  const [level, setLevel] = useState<CefrLevelPreference>("A2");
  const [contentType, setContentType] = useState<ContentTypePreference>("both");
  const [selected, setSelected] = useState<TopicCode[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const grouped = topicsByCategory();

  useEffect(() => {
    let cancelled = false;
    void loadLearningProgram()
      .then((program) => {
        if (cancelled) {
          return;
        }
        setProgramName(program.programName);
        setLevel(program.levelPreference);
        setContentType(program.contentTypePreference);
        setSelected(program.topicCodes);
        setContentCount(program.contentCount);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    let cancelled = false;
    void previewContentCount(selected).then((count) => {
      if (!cancelled) {
        setContentCount(count);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selected, loading]);

  const lowContent = contentCount < 15;

  const onToggle = (code: TopicCode) => {
    const result = toggleTopicSelection(selected, code);
    if (result.blocked) {
      setHint(UI.learningProgramMinTopic);
      return;
    }
    setHint(null);
    setSelected(result.next);
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveLearningProgram({
        programName,
        levelPreference: level,
        contentTypePreference: contentType,
        topicCodes: selected,
      });
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : UI.learningProgramMinTopic);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">{UI.loading}</p>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-stone-25 px-7 py-4">
      <header className="mb-4 flex min-h-10 items-center gap-2">
        <PrimaryButton variant="text" onClick={onBack}>
          ← {UI.backHome}
        </PrimaryButton>
        <h1 className="flex-1 text-xl font-bold">{UI.learningProgramTitle}</h1>
      </header>

      <label className="mb-1 text-sm font-semibold text-stone-500" htmlFor="program-name">
        {UI.learningProgramName}
      </label>
      <input
        id="program-name"
        value={programName}
        onChange={(event) => setProgramName(event.target.value)}
        className="mb-4 h-11 rounded-xl border border-stone-100 bg-white px-3 text-sm text-stone-950"
      />

      <label className="mb-1 text-sm font-semibold text-stone-500" htmlFor="program-level">
        {UI.learningProgramLevel}
      </label>
      <select
        id="program-level"
        value={level}
        onChange={(event) => setLevel(event.target.value as CefrLevelPreference)}
        className="mb-4 h-11 rounded-xl border border-stone-100 bg-white px-3 text-sm"
      >
        {(["A1", "A2", "B1", "B2"] as CefrLevelPreference[]).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <p className="mb-1 text-sm font-semibold text-stone-500">{UI.learningProgramContent}</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["vocabulary", UI.contentPrefVocabulary],
            ["phrase", UI.contentPrefPhrase],
            ["both", UI.contentPrefBoth],
          ] as const
        ).map(([value, label]) => (
          <PrimaryButton
            key={value}
            variant={contentType === value ? "primary" : "ghost"}
            onClick={() => setContentType(value)}
          >
            {label}
          </PrimaryButton>
        ))}
      </div>

      <p className="mb-2 text-sm font-semibold text-stone-500">{UI.learningProgramTopics}</p>
      <div className="space-y-4">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
          <section key={category}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-stone-500">
              {TOPIC_CATEGORY_LABELS[category]}
            </h2>
            <div className="flex flex-wrap gap-2">
              {grouped[category].map((topic) => {
                const on = selected.includes(topic.code);
                return (
                  <button
                    key={topic.code}
                    type="button"
                    onClick={() => onToggle(topic.code)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      on
                        ? "border-terracotta-700 bg-terracotta-700 text-white"
                        : "border-stone-100 bg-white text-stone-800"
                    }`}
                  >
                    {topic.nameVi}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {lowContent ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {UI.learningProgramLowContent}
        </p>
      ) : null}
      {hint ? <p className="mt-3 text-sm text-stone-500">{hint}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <PrimaryButton onClick={() => void onSave()} disabled={saving}>
          {UI.learningProgramSave}
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={onBack}>
          {UI.cancel}
        </PrimaryButton>
      </div>
    </main>
  );
}
