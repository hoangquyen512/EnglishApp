import { useEffect, useRef } from 'react'
import { VocabCard } from '../components/VocabCard'
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
  const index = topic.phrases.findIndex((item) => item.id === phraseId)
  const phrase = topic.phrases[index]
  const startX = useRef<number | null>(null)

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
    <section
      className="page flash-page"
      onTouchStart={(event) => {
        startX.current = event.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (startX.current == null) return
        const dx = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current
        if (dx < -48 && next) {
          navigate({ name: 'phrase', topicId: topic.id, phraseId: next.id })
        } else if (dx > 48 && prev) {
          navigate({ name: 'phrase', topicId: topic.id, phraseId: prev.id })
        }
        startX.current = null
      }}
    >
      <header className="flash-top">
        <button type="button" className="back" onClick={() => navigate({ name: 'home' })}>
          ← Chủ đề
        </button>
        <p className="flash-count">
          {topic.titleVi} · {index + 1}/{topic.phrases.length}
        </p>
      </header>

      <VocabCard phrase={phrase} accent={topic.accent} autoPlay />

      <div className="dots" aria-hidden="true">
        {topic.phrases.map((item, itemIndex) => (
          <span key={item.id} className={itemIndex === index ? 'dot on' : 'dot'} />
        ))}
      </div>

      <div className="card-actions">
        <button type="button" className="btn ghost" onClick={() => onToggleSaved(phrase.id)}>
          {isSaved ? '★ Đã lưu' : '☆ Lưu'}
        </button>
        <span className="status" data-state={progress.mastered ? 'done' : 'learning'}>
          {progress.mastered ? 'Đã thuộc' : 'Đang học'}
        </span>
        <button
          type="button"
          className="btn ghost"
          onClick={() => navigate({ name: 'practice', topicId: topic.id, mode: 'quiz' })}
        >
          Quiz
        </button>
      </div>

      <div className="cta-row">
        <button
          type="button"
          className="btn ghost"
          disabled={!prev}
          onClick={() =>
            prev && navigate({ name: 'phrase', topicId: topic.id, phraseId: prev.id })
          }
        >
          Trước
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (next) navigate({ name: 'phrase', topicId: topic.id, phraseId: next.id })
            else navigate({ name: 'practice', topicId: topic.id, mode: 'quiz' })
          }}
        >
          {next ? 'Thẻ tiếp' : 'Luyện tập'}
        </button>
      </div>
    </section>
  )
}
