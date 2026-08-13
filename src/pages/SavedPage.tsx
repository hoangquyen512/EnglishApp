import { allPhrases, getTopic } from '../data/topics'
import { navigate } from '../lib/router'
import type { ProgressState } from '../types'

type SavedPageProps = {
  state: ProgressState
}

export function SavedPage({ state }: SavedPageProps) {
  const saved = allPhrases.filter((phrase) => state.saved.includes(phrase.id))

  return (
    <section className="page">
      <header className="hero compact">
        <p className="eyebrow">Đã lưu</p>
        <h1>Câu muốn học lại</h1>
        <p className="lede">Ghim những câu hay dùng để mở lại nhanh.</p>
      </header>
      {saved.length === 0 ? (
        <p className="empty">Chưa lưu câu nào. Trong thẻ câu, bấm “Lưu câu”.</p>
      ) : (
        <ul className="phrase-list">
          {saved.map((phrase) => {
            const topic = getTopic(phrase.topicId)
            return (
              <li key={phrase.id}>
                <button
                  type="button"
                  className="phrase-row"
                  onClick={() =>
                    navigate({
                      name: 'phrase',
                      topicId: phrase.topicId,
                      phraseId: phrase.id,
                    })
                  }
                >
                  <span className="index" aria-hidden="true">
                    ★
                  </span>
                  <span className="phrase-copy">
                    <strong>{phrase.en}</strong>
                    <em>
                      {phrase.vi}
                      {topic ? ` · ${topic.titleVi}` : ''}
                    </em>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
