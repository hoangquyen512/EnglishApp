import { useEffect, type CSSProperties } from 'react'
import { SpeakButton } from '../components/SpeakButton'
import { getPhraseProgress } from '../lib/progress'
import { navigate } from '../lib/router'
import type { ProgressState, Topic } from '../types'

type PhrasePageProps = {
  topic: Topic
  phraseId: string
  state: ProgressState
  onSeen: (phraseId: string) => void
  onToggleSaved: (phraseId: string) => void
  isSaved: boolean
}

export function PhrasePage({
  topic,
  phraseId,
  state,
  onSeen,
  onToggleSaved,
  isSaved,
}: PhrasePageProps) {
  const index = topic.phrases.findIndex((phrase) => phrase.id === phraseId)
  const phrase = topic.phrases[index]

  useEffect(() => {
    if (phrase) onSeen(phrase.id)
  }, [phrase, onSeen])

  if (!phrase) {
    return (
      <section className="page">
        <p>Không tìm thấy câu này.</p>
      </section>
    )
  }

  const prev = topic.phrases[index - 1]
  const next = topic.phrases[index + 1]
  const progress = getPhraseProgress(state, phrase.id)

  return (
    <section className="page">
      <button
        type="button"
        className="back"
        onClick={() => navigate({ name: 'topic', topicId: topic.id })}
      >
        ← {topic.titleVi}
      </button>

      <article className="phrase-card" style={{ '--accent': topic.accent } as CSSProperties}>
        <p className="eyebrow">
          Câu {index + 1}/{topic.phrases.length}
        </p>
        <h1>{phrase.en}</h1>
        <p className="ipa">{phrase.ipa}</p>
        <SpeakButton text={phrase.en} large />
        <p className="vi">{phrase.vi}</p>
        <p className="note">{phrase.note}</p>
        <div className="card-actions">
          <button type="button" className="btn ghost" onClick={() => onToggleSaved(phrase.id)}>
            {isSaved ? '★ Đã lưu' : '☆ Lưu câu'}
          </button>
          <span className="status" data-state={progress.mastered ? 'done' : 'learning'}>
            {progress.mastered ? 'Đã thuộc' : 'Đang học'}
          </span>
        </div>
      </article>

      <div className="cta-row">
        <button
          type="button"
          className="btn ghost"
          disabled={!prev}
          onClick={() =>
            prev && navigate({ name: 'phrase', topicId: topic.id, phraseId: prev.id })
          }
        >
          Câu trước
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (next) navigate({ name: 'phrase', topicId: topic.id, phraseId: next.id })
            else navigate({ name: 'practice', topicId: topic.id, mode: 'quiz' })
          }}
        >
          {next ? 'Câu tiếp' : 'Luyện tập'}
        </button>
      </div>
    </section>
  )
}
