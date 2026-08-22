import { type FormEvent, useEffect, useRef, useState } from "react";
import { UI, topicLabel } from "../../constants/ui";
import { insertVocabulary } from "../../db/vocabulary";
import { getTopicIdByCode } from "../../db/learning-program";
import {
  ensureLearningProgram,
  type TopicCode,
} from "../../features/learning-program";
import { TOPIC_BY_CODE } from "../../features/learning-program/catalog";
import { speakWord } from "../../features/vocabulary";
import {
  NETWORK_LOOKUP_ERROR,
  NOT_FOUND_LOOKUP_ERROR,
  clearRecentQueries,
  exampleSentence,
  formatLookupPhonetic,
  pushRecentQuery,
  quickLookup,
  readRecentLookups,
  removeRecentQuery,
  submitLookupQuery,
  translateToVietnamese,
  writeRecentLookups,
  type DictionaryCacheEntry,
} from "../../features/quick-lookup";
import { isTauri } from "../../lib/tauri";
import { IconSearch, IconSpeaker } from "../shared/icon-button";

function displayPos(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function IconTrash({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 7l1 12h6l1-12" />
    </svg>
  );
}

function IconBookmark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M7 4h10v16l-5-3.5L7 20V4z" />
    </svg>
  );
}

export function HomeQuickLookupPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryCacheEntry | null>(null);
  const [exampleVi, setExampleVi] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(() => readRecentLookups());
  const [topicId, setTopicId] = useState<number | null>(null);
  const [topicOptions, setTopicOptions] = useState<Array<{ code: TopicCode; id: number }>>([]);
  const [topicCodes, setTopicCodes] = useState<TopicCode[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const requestId = useRef(0);
  const exampleRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void ensureLearningProgram().then(async (program) => {
      if (cancelled) return;
      setTopicCodes(program.topicCodes);
      if (!isTauri()) {
        const options = program.topicCodes.map((code, index) => ({ code, id: index + 1 }));
        setTopicOptions(options);
        setTopicId(options[0]?.id ?? null);
        return;
      }
      const options: Array<{ code: TopicCode; id: number }> = [];
      for (const code of program.topicCodes) {
        const id = await getTopicIdByCode(code);
        if (id != null) {
          options.push({ code, id });
        }
      }
      if (cancelled) return;
      setTopicOptions(options);
      setTopicId(options[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function rememberQuery(value: string) {
    const next = pushRecentQuery(recent, value);
    setRecent(next);
    writeRecentLookups(next);
  }

  function runLookup(raw: string) {
    const submitted = submitLookupQuery(raw);
    if (submitted.type === "clear") {
      requestId.current += 1;
      exampleRequestId.current += 1;
      setResult(null);
      setExampleVi(null);
      setError(null);
      setLoading(false);
      return;
    }

    setQuery(submitted.query);
    rememberQuery(submitted.query);
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    setExampleVi(null);
    void quickLookup(submitted.query)
      .then((entry) => {
        if (requestId.current !== id) return;
        setResult(entry);
        setError(null);
        const example = exampleSentence(entry.word, entry.exampleEn);
        const exId = ++exampleRequestId.current;
        void translateToVietnamese(example)
          .then((vi) => {
            if (exampleRequestId.current !== exId) return;
            if (vi.trim() && vi.trim().toLowerCase() !== example.toLowerCase()) {
              setExampleVi(vi.trim());
            }
          })
          .catch(() => {
            /* optional VI example */
          });
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return;
        setResult(null);
        const message =
          err instanceof Error &&
          (err.message === NETWORK_LOOKUP_ERROR || err.message === NOT_FOUND_LOOKUP_ERROR)
            ? err.message
            : err instanceof Error
              ? err.message
              : NETWORK_LOOKUP_ERROR;
        setError(message);
      })
      .finally(() => {
        if (requestId.current === id) {
          setLoading(false);
        }
      });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runLookup(query);
  }

  async function handleSave() {
    if (!result) return;
    if (!isTauri()) {
      setToast(UI.quickLookupNeedDesktop);
      return;
    }
    if (topicId == null) {
      setToast(UI.quickLookupPickTopic);
      return;
    }
    setAdding(true);
    setToast(null);
    try {
      await insertVocabulary({
        word: result.word,
        meaning: result.meaningVi,
        example: result.exampleEn,
        phonetic: result.phoneticIpa,
        partOfSpeech: result.partOfSpeech,
        topicId,
      });
      setToast(UI.quickLookupAdded);
    } catch {
      setToast(UI.quickLookupAddFailed);
    } finally {
      setAdding(false);
    }
  }

  function clearAllRecent() {
    const next = clearRecentQueries();
    setRecent(next);
    writeRecentLookups(next);
  }

  function removeOneRecent(word: string) {
    const next = removeRecentQuery(recent, word);
    setRecent(next);
    writeRecentLookups(next);
  }

  const phonetic = formatLookupPhonetic(result?.phoneticIpa);
  const pos = displayPos(result?.partOfSpeech);
  const exampleEn = result ? exampleSentence(result.word, result.exampleEn) : "";

  return (
    <section className="yume-lookup" aria-label={UI.quickLookupTitle}>
      <header className="yume-lookup__head">
        <p className="yume-lookup__eyebrow">{UI.quickLookupEyebrow}</p>
        <h2>{UI.quickLookupTitle}</h2>
        <p className="yume-lookup__desc">{UI.quickLookupDescription}</p>
      </header>

      <form className="yume-lookup__search" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="home-quick-lookup-input">
          {UI.quickLookupPlaceholder}
        </label>
        <div className="yume-lookup__search-field">
          <IconSearch className="yume-lookup__search-icon" />
          <input
            id="home-quick-lookup-input"
            type="text"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={UI.quickLookupPlaceholder}
          />
        </div>
        <p className="yume-lookup__hint">{UI.quickLookupHint}</p>
      </form>

      <div className="yume-lookup__body">
        {recent.length > 0 ? (
          <div className="yume-lookup__recent">
            <div className="yume-lookup__recent-head">
              <span>
                <IconClock className="yume-lookup__inline-icon" /> {UI.quickLookupRecent}
              </span>
              <button type="button" className="yume-lookup__clear" onClick={clearAllRecent}>
                <IconTrash className="yume-lookup__inline-icon" /> {UI.quickLookupClearRecent}
              </button>
            </div>
            <ul className="yume-lookup__chips">
              {recent.map((word) => (
                <li key={word}>
                  <button
                    type="button"
                    className="yume-lookup__chip"
                    onClick={() => runLookup(word)}
                  >
                    {word}
                  </button>
                  <button
                    type="button"
                    className="yume-lookup__chip-x"
                    aria-label={`${UI.quickLookupRemoveRecent}: ${word}`}
                    onClick={() => removeOneRecent(word)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {loading ? <p className="yume-lookup__status">{UI.quickLookupLoading}</p> : null}
        {error ? <p className="yume-lookup__status yume-lookup__status--error">{error}</p> : null}

        {result && !loading ? (
          <article className="yume-lookup__result">
            <div className="yume-lookup__result-left">
              <span className="yume-lookup__spark" aria-hidden>
                ✦
              </span>
              <div className="yume-lookup__word-row">
                <h3>{result.word}</h3>
                <span className="yume-lookup__star" aria-hidden>
                  ★
                </span>
              </div>
              {phonetic ? (
                <div className="yume-lookup__phonetic">
                  <span>{phonetic}</span>
                  <button
                    type="button"
                    className="yume-lookup__icon-btn"
                    aria-label={UI.quickLookupSpeak}
                    onClick={() => speakWord(result.word)}
                  >
                    <IconSpeaker />
                  </button>
                </div>
              ) : null}
              {pos ? <span className="yume-lookup__pos">{pos}</span> : null}
              <div className="yume-lookup__meaning">
                <span>{UI.meaningLabel}</span>
                <strong>{result.meaningVi}</strong>
              </div>
            </div>

            <div className="yume-lookup__result-right">
              <div className="yume-lookup__actions">
                <button
                  type="button"
                  className="yume-lookup__save"
                  disabled={adding || topicOptions.length === 0}
                  onClick={() => void handleSave()}
                >
                  <IconBookmark className="yume-lookup__inline-icon" /> {UI.quickLookupSaveWord}
                </button>
                <button
                  type="button"
                  className="yume-lookup__icon-btn"
                  aria-label={UI.quickLookupSpeak}
                  onClick={() => speakWord(result.word)}
                >
                  <IconSpeaker />
                </button>
              </div>

              {result.definitionEn ? (
                <div className="yume-lookup__block">
                  <span>{UI.quickLookupDefinition}</span>
                  <p>{result.definitionEn}</p>
                </div>
              ) : null}

              <div className="yume-lookup__block">
                <span>{UI.exampleLabel}</span>
                <p>{exampleEn}</p>
                {exampleVi ? <p className="yume-lookup__example-vi">{exampleVi}</p> : null}
              </div>

              {topicOptions.length > 1 ? (
                <label className="yume-lookup__topic">
                  <span>{UI.quickLookupTopic}</span>
                  <select
                    value={topicId ?? ""}
                    onChange={(event) => setTopicId(Number(event.target.value) || null)}
                  >
                    {topicOptions.map((option) => (
                      <option key={option.code} value={option.id}>
                        {TOPIC_BY_CODE.get(option.code)?.nameVi ?? topicLabel(option.code)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              {topicCodes.length === 0 ? (
                <p className="yume-lookup__status">{UI.quickLookupNoTopics}</p>
              ) : null}
              {toast ? <p className="yume-lookup__toast">{toast}</p> : null}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
