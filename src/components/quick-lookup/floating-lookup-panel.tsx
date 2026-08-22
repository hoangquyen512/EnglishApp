import { type FormEvent, useRef, useState } from "react";
import { UI } from "../../constants/ui";
import { partOfSpeechLabel, speakWord } from "../../features/vocabulary";
import {
  NETWORK_LOOKUP_ERROR,
  NOT_FOUND_LOOKUP_ERROR,
  exampleSentence,
  formatLookupPhonetic,
  quickLookup,
  submitLookupQuery,
  type DictionaryCacheEntry,
} from "../../features/quick-lookup";
import { IconButton, IconClose, IconSearch, IconSpeaker } from "../shared/icon-button";

interface FloatingLookupPanelProps {
  onClose: () => void;
}

export function FloatingLookupPanel({ onClose }: FloatingLookupPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryCacheEntry | null>(null);
  const requestId = useRef(0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const submitted = submitLookupQuery(query);
    if (submitted.type === "clear") {
      requestId.current += 1;
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    void quickLookup(submitted.query)
      .then((entry) => {
        if (requestId.current !== id) return;
        setResult(entry);
        setError(null);
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return;
        setResult(null);
        const message =
          err instanceof Error &&
          (err.message === NETWORK_LOOKUP_ERROR || err.message === NOT_FOUND_LOOKUP_ERROR)
            ? err.message
            : NETWORK_LOOKUP_ERROR;
        setError(message);
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });
  }

  const posLabel = partOfSpeechLabel(result?.partOfSpeech);
  const phonetic = formatLookupPhonetic(result?.phoneticIpa);

  return (
    <section className="yume-panel relative box-border h-[190px] w-[min(300px,calc(100vw-88px))] overflow-hidden p-2.5">
      <div className="absolute right-1.5 top-1.5 z-10">
        <IconButton label={UI.close} onClick={onClose} className="h-5 w-5">
          <IconClose />
        </IconButton>
      </div>
      <div className="flex h-full min-h-0 flex-col gap-1.5 pr-5">
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-line bg-paper px-2"
        >
          <IconSearch className="shrink-0 text-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={UI.quickLookupPlaceholder}
            className="no-focus-ring h-8 w-full appearance-none bg-transparent text-xs text-ink outline-none ring-0 placeholder:text-muted"
          />
        </form>
        {loading ? <p className="text-[11px] text-muted">{UI.quickLookupLoading}</p> : null}
        {error ? <p className="text-[11px] text-rose">{error}</p> : null}
        {result && !loading ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <p className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-specimen text-base font-semibold text-ink">{result.word}</span>
              {phonetic ? <span className="font-mono text-[10px] text-muted">{phonetic}</span> : null}
              {posLabel ? <span className="text-[10px] text-muted">{posLabel}</span> : null}
              <IconButton
                label={UI.listen}
                className="h-5 w-5"
                onClick={() => speakWord(result.word)}
              >
                <IconSpeaker />
              </IconButton>
            </p>
            <p className="text-sm font-semibold leading-snug text-clay-dark">{result.meaningVi}</p>
            <p lang="en" className="mt-1 line-clamp-2 border-l-2 border-clay pl-1.5 text-[11px] leading-snug text-ink">
              {exampleSentence(result.word, result.exampleEn)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
