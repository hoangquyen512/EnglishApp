import { useMemo, useState, type CSSProperties } from 'react'
import { filterPhrases } from '../data/topics'
import { getPhraseProgress, topicStats } from '../lib/progress'
import { navigate } from '../lib/router'
import type { ProgressState, Topic } from '../types'

const LIST_LIMIT = 40

type TopicPageProps = {
  topic: Topic
  state: ProgressState
}

export function TopicPage({ topic, state }: TopicPageProps) {
  const stats = topicStats(state, topic)
  const [query, setQuery] = useState('')
  const [jump, setJump] = useState('1')
  const filtered = useMemo(() => filterPhrases(topic.phrases, query), [topic, query])
  const visible = filtered.slice(0, LIST_LIMIT)

  function goToNumber(raw: string) {
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 1 || n > topic.phrases.length) return
    navigate({ name: 'phrase', topicId: topic.id, phraseId: topic.phrases[n - 1].id })
  }

  return (
    <section className="page">
      <button type="button" className="back" onClick={() => navigate({ name: 'home' })}>
        ← Chủ đề
      </button>
      <header className="topic-hero" style={{ '--accent': topic.accent } as CSSProperties}>
        <span className="topic-emoji lg" aria-hidden="true">
          {topic.emoji}
        </span>
        <h1>{topic.titleVi}</h1>
        <p className="lede">{topic.blurb}</p>
        <p className="meta">
          {stats.mastered}/{stats.total} câu đã thuộc · {stats.seen} đã xem
        </p>
      </header>

      <div className="cta-row">
        <button
          type="button"
          className="btn primary"
          onClick={() =>
            navigate({
              name: 'phrase',
              topicId: topic.id,
              phraseId: topic.phrases[0].id,
            })
          }
        >
          Học flashcard
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => navigate({ name: 'practice', topicId: topic.id, mode: 'quiz' })}
        >
          Luyện tập
        </button>
      </div>

      <form
        className="jump-bar"
        onSubmit={(event) => {
          event.preventDefault()
          goToNumber(jump)
        }}
      >
        <label>
          <span className="sr-only">Nhảy tới câu số</span>
          <input
            type="number"
            min={1}
            max={topic.phrases.length}
            value={jump}
            onChange={(event) => setJump(event.target.value)}
          />
        </label>
        <button type="submit" className="btn ghost">
          Tới câu
        </button>
        <label className="jump-search">
          <span className="sr-only">Tìm câu trong chủ đề</span>
          <input
            type="search"
            placeholder="Tìm trong 1000 câu..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </form>

      <p className="meta">
        {query.trim()
          ? `Hiển thị ${visible.length}/${filtered.length} câu khớp`
          : `Hiển thị ${visible.length}/${topic.phrases.length} câu đầu. Dùng ô tìm hoặc số thứ tự để mở câu khác.`}
      </p>

      <ul className="phrase-list">
        {visible.map((phrase) => {
          const progress = getPhraseProgress(state, phrase.id)
          const index = topic.phrases.findIndex((item) => item.id === phrase.id)
          return (
            <li key={phrase.id}>
              <button
                type="button"
                className="phrase-row"
                onClick={() =>
                  navigate({ name: 'phrase', topicId: topic.id, phraseId: phrase.id })
                }
              >
                <span className="index">{index + 1}</span>
                <span className="phrase-copy">
                  <strong>{phrase.en}</strong>
                  <em>{phrase.vi}</em>
                </span>
                <span className="status" data-state={statusOf(progress.seen, progress.mastered)}>
                  {progress.mastered ? 'Thuộc' : progress.seen ? 'Đang học' : 'Mới'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function statusOf(seen: boolean, mastered: boolean): 'new' | 'learning' | 'done' {
  if (mastered) return 'done'
  if (seen) return 'learning'
  return 'new'
}
