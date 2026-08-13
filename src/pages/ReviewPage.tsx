import { allPhrases, topics } from '../data/topics'
import { reviewPhraseIds } from '../lib/progress'
import { ReviewQuiz } from './PracticePage'
import type { ProgressState } from '../types'

type ReviewPageProps = {
  state: ProgressState
  onAnswer: (phraseId: string, correct: boolean) => void
}

export function ReviewPage({ state, onAnswer }: ReviewPageProps) {
  const ids = reviewPhraseIds(state, topics)
  const phrases = allPhrases.filter((phrase) => ids.includes(phrase.id))

  return (
    <section className="page">
      <header className="hero compact">
        <p className="eyebrow">Ôn tập</p>
        <h1>Câu đang học dở</h1>
        <p className="lede">
          Những câu đã xem nhưng chưa thuộc. Trả lời đúng 2 lần liên tiếp để hoàn thành.
        </p>
      </header>
      {phrases.length === 0 ? (
        <p className="empty">
          Chưa có câu nào cần ôn. Hãy mở một chủ đề, học vài câu, rồi quay lại đây.
        </p>
      ) : (
        <ReviewQuiz phrases={phrases} onAnswer={onAnswer} />
      )}
    </section>
  )
}
