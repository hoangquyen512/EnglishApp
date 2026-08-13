import { useMemo, useState, type CSSProperties } from 'react'
import { firstMatchingPhrase, searchTopics } from '../data/topics'
import { overallStats, topicStats } from '../lib/progress'
import { navigate } from '../lib/router'
import type { ProgressState } from '../types'

type HomePageProps = {
  state: ProgressState
}

export function HomePage({ state }: HomePageProps) {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => searchTopics(query), [query])
  const overall = overallStats(state, searchTopics(''))

  return (
    <section className="page">
      <header className="hero">
        <p className="eyebrow">EnglishApp</p>
        <h1>Câu giao tiếp theo chủ đề</h1>
        <p className="lede">
          Mỗi chủ đề có 1.000 câu giao tiếp thông dụng. Học từng thẻ: tiếng Anh, phiên
          âm, nghĩa, hình và audio.
        </p>
        <div className="overall">
          <strong>
            {overall.mastered}/{overall.total}
          </strong>
          <span>câu đã thuộc</span>
        </div>
      </header>

      <label className="search">
        <span className="sr-only">Tìm chủ đề hoặc câu</span>
        <input
          type="search"
          placeholder="Tìm chủ đề hoặc câu..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <ul className="topic-grid">
        {visible.map((topic) => {
          const stats = topicStats(state, topic)
          const percent = Math.round((stats.mastered / stats.total) * 100)
          return (
            <li key={topic.id}>
              <button
                type="button"
                className="topic-card"
                style={{ '--accent': topic.accent } as CSSProperties}
                onClick={() =>
                  navigate({
                    name: 'phrase',
                    topicId: topic.id,
                    phraseId: firstMatchingPhrase(topic, query).id,
                  })
                }
              >
                <span className="topic-emoji" aria-hidden="true">
                  {topic.emoji}
                </span>
                <span className="topic-titles">
                  <strong>{topic.titleVi}</strong>
                  <em>{topic.titleEn}</em>
                </span>
                <span className="topic-progress">
                  <span className="bar">
                    <span className="bar-fill" style={{ width: `${percent}%` }} />
                  </span>
                  {stats.mastered}/{stats.total}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {visible.length === 0 ? (
        <p className="empty">Không tìm thấy chủ đề nào khớp.</p>
      ) : null}
    </section>
  )
}
