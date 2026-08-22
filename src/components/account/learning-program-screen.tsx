import { useEffect, useMemo, useState } from "react";
import { UI } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
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
  buildRoadmapSnapshot,
} from "../../features/learning-program";
import { toggleTopicSelection } from "../../features/learning-program/validate";
import { openStudyPopup } from "../../features/scheduler";
import { useSettingsStore } from "../../stores/settings-store";
import { SettingsShell, type SettingsNavId } from "./settings-shell";
import { GalaxySelect } from "../shared/galaxy-select";

interface LearningProgramScreenProps {
  session: SessionDto;
  onHome: () => void;
  onCancel: () => void;
  onSaved?: () => void;
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2 4 14h7l-1 8 10-14h-7l1-6z" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 13.8 9 20.5 10.8 13.8 12.6 12 19.5 10.2 12.6 3.5 10.8 10.2 9 12 2.5z" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 20.4 10.4 19C5.4 14.6 2 11.5 2 7.8A4.6 4.6 0 0 1 6.7 3.2 5 5 0 0 1 12 5.5a5 5 0 0 1 5.3-2.3A4.6 4.6 0 0 1 22 7.8c0 3.7-3.4 6.8-8.4 11.2L12 20.4z" />
    </svg>
  );
}

export function LearningProgramScreen({
  session,
  onHome,
  onCancel,
  onSaved,
}: LearningProgramScreenProps) {
  const [programName, setProgramName] = useState("Chương trình học của tôi");
  const [level, setLevel] = useState<CefrLevelPreference>("A2");
  const [contentType, setContentType] = useState<ContentTypePreference>("both");
  const [selected, setSelected] = useState<TopicCode[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [shellToast, setShellToast] = useState<string | null>(null);
  const grouped = topicsByCategory();
  const intervalMinutes = useSettingsStore((state) => state.intervalMinutes);
  const setIntervalMinutes = useSettingsStore((state) => state.setIntervalMinutes);

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

  const roadmap = useMemo(
    () =>
      buildRoadmapSnapshot({
        level,
        contentType,
        topicCount: selected.length,
        intervalMinutes,
        contentLabels: {
          vocabulary: UI.contentPrefVocabulary,
          phrase: UI.contentPrefPhrase,
          both: UI.contentPrefBoth,
        },
        topicCountTemplate: UI.learningProgramTopicCount,
        reminderTemplate: UI.learningProgramReminderValue,
      }),
    [level, contentType, selected.length, intervalMinutes],
  );

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

  const onNav = (id: SettingsNavId) => {
    if (id === "profile") {
      onCancel();
      return;
    }
    setShellToast(UI.settingsComingSoon);
  };

  if (loading) {
    return (
      <SettingsShell
        session={session}
        title={UI.learningProgramTitle}
        subtitle={UI.learningProgramSubtitle}
        activeNav="profile"
        onHome={onHome}
        onNav={onNav}
        wide
      >
        <p className="yume-lp__loading">{UI.loading}</p>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell
      session={session}
      title={UI.learningProgramTitle}
      subtitle={UI.learningProgramSubtitle}
      activeNav="profile"
      onHome={onHome}
      onNav={onNav}
      onPromo={() => setShellToast(UI.settingsComingSoon)}
      toast={shellToast}
      wide
    >
      <div className="yume-lp">
        <section className="yume-panel yume-lp__form" aria-labelledby="lp-form-title">
          <h2 id="lp-form-title" className="sr-only">
            {UI.learningProgramTitle}
          </h2>

          <div className="yume-lp__row yume-lp__row--split">
            <label className="yume-lp__field" htmlFor="program-name">
              <span>{UI.learningProgramName}</span>
              <input
                id="program-name"
                value={programName}
                onChange={(event) => setProgramName(event.target.value)}
                className="yume-lp__input"
              />
            </label>
            <label className="yume-lp__field" htmlFor="program-level">
              <span>{UI.learningProgramLevel}</span>
              <GalaxySelect
                id="program-level"
                aria-label={UI.learningProgramLevel}
                value={level}
                options={(["A1", "A2", "B1", "B2"] as CefrLevelPreference[]).map((item) => ({
                  value: item,
                  label: item,
                }))}
                onChange={setLevel}
              />
            </label>
          </div>

          <div className="yume-lp__field">
            <span>{UI.learningProgramContent}</span>
            <div className="yume-lp__pills" role="group" aria-label={UI.learningProgramContent}>
              {(
                [
                  ["vocabulary", UI.contentPrefVocabulary],
                  ["phrase", UI.contentPrefPhrase],
                  ["both", UI.contentPrefBoth],
                ] as const
              ).map(([value, label]) => {
                const on = contentType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={on ? "yume-lp__pill yume-galaxy-on" : "yume-lp__pill"}
                    aria-pressed={on}
                    onClick={() => setContentType(value)}
                  >
                    {on ? (
                      <span className="yume-lp__pill-check" aria-hidden>
                        <IconCheck />
                      </span>
                    ) : null}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="yume-lp__topics">
            <p className="yume-lp__topics-label">{UI.learningProgramTopics}</p>
            <div className="yume-lp__topic-groups">
              {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
                <section key={category} className="yume-lp__topic-group">
                  <h3>{TOPIC_CATEGORY_LABELS[category]}</h3>
                  <div className="yume-lp__chips">
                    {grouped[category].map((topic) => {
                      const on = selected.includes(topic.code);
                      return (
                        <button
                          key={topic.code}
                          type="button"
                          className={on ? "yume-lp__chip yume-galaxy-on" : "yume-lp__chip"}
                          aria-pressed={on}
                          onClick={() => onToggle(topic.code)}
                        >
                          {on ? (
                            <span className="yume-lp__chip-check" aria-hidden>
                              <IconCheck />
                            </span>
                          ) : null}
                          {topic.nameVi}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {lowContent ? <p className="yume-lp__warn">{UI.learningProgramLowContent}</p> : null}
          {hint ? <p className="yume-lp__hint">{hint}</p> : null}
          {error ? <p className="yume-lp__error">{error}</p> : null}

          <div className="yume-lp__footer">
            <label className="yume-lp__field yume-lp__field--inline" htmlFor="study-interval">
              <span>{UI.schedulerLabel}</span>
              <input
                id="study-interval"
                type="number"
                min={1}
                max={180}
                value={intervalMinutes}
                onChange={(event) => setIntervalMinutes(Number(event.target.value))}
                className="yume-lp__input yume-lp__input--narrow"
              />
            </label>

            <div className="yume-lp__actions">
              <button type="button" className="yume-btn yume-btn--ghost yume-lp__study" onClick={() => void openStudyPopup()}>
                <IconBolt />
                {UI.studyNow}
              </button>
              <button
                type="button"
                className="yume-btn yume-btn--primary yume-lp__save"
                disabled={saving}
                onClick={() => void onSave()}
              >
                <IconSparkle />
                {UI.learningProgramSave}
              </button>
              <button type="button" className="yume-btn yume-btn--text" onClick={onCancel}>
                {UI.cancel}
              </button>
            </div>
          </div>
        </section>

        <aside className="yume-panel yume-lp__roadmap" aria-labelledby="lp-roadmap-title">
          <div className="yume-lp__roadmap-art" aria-hidden>
            <div className="yume-lp__roadmap-moon" />
            <div className="yume-lp__roadmap-cabin" />
            <div className="yume-lp__roadmap-stars" />
          </div>
          <h2 id="lp-roadmap-title">{UI.learningProgramRoadmapTitle}</h2>
          <dl className="yume-lp__roadmap-list">
            <div>
              <dt>{UI.learningProgramLevel}</dt>
              <dd>{roadmap.level}</dd>
            </div>
            <div>
              <dt>{UI.learningProgramPriority}</dt>
              <dd>{roadmap.priorityLabel}</dd>
            </div>
            <div>
              <dt>{UI.learningProgramTopicsSelected}</dt>
              <dd>{roadmap.topicCountLabel}</dd>
            </div>
            <div>
              <dt>{UI.learningProgramDailyReminder}</dt>
              <dd>{roadmap.reminderLabel}</dd>
            </div>
          </dl>
          <p className="yume-lp__roadmap-note">
            <span className="yume-lp__roadmap-heart" aria-hidden>
              <IconHeart />
            </span>
            {UI.learningProgramRoadmapNote}
          </p>
        </aside>
      </div>
    </SettingsShell>
  );
}
