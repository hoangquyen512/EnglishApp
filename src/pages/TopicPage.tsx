import type { CSSProperties } from 'react'
import { getPhraseProgress, topicStats } from '../lib/progress'
import { navigate } from '../lib/router'
import type { ProgressState, Topic } from '../types'

type TopicPageProps = {
  topic: Topic
  state: ProgressState
}

export function TopicPage({ topic, state }: TopicPageProps) {
  const stats = topicStats(state, topic)

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

      <ul className="phrase-list">
        {topic.phrases.map((phrase, index) => {
          const progress = getPhraseProgress(state, phrase.id)
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
