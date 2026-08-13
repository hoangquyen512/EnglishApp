import { useEffect, useState } from 'react'
import { SpeakButton } from '../components/SpeakButton'
import { VocabCard } from '../components/VocabCard'
import { getPhraseProgress } from '../lib/progress'
import { QUIZ_ROUND, buildQuizQuestion, samplePhrases, scorePercent } from '../lib/quiz'
import { navigate } from '../lib/router'
import type { Phrase, PracticeMode, ProgressState, QuizQuestion, Topic } from '../types'

type PracticePageProps = {
  topic: Topic
  mode: PracticeMode
  state: ProgressState
  onAnswer: (phraseId: string, correct: boolean) => void
  onSeen: (phraseId: string) => void
}

export function PracticePage({ topic, mode, state, onAnswer, onSeen }: PracticePageProps) {
  return (
    <section className="page">
      <button
        type="button"
        className="back"
        onClick={() => navigate({ name: 'topic', topicId: topic.id })}
      >
        ← {topic.titleVi}
      </button>
      <div className="mode-toggle" role="tablist" aria-label="Chế độ luyện tập">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'cards'}
          className={mode === 'cards' ? 'chip active' : 'chip'}
          onClick={() => navigate({ name: 'practice', topicId: topic.id, mode: 'cards' })}
        >
          Thẻ từ
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'quiz'}
          className={mode === 'quiz' ? 'chip active' : 'chip'}
          onClick={() => navigate({ name: 'practice', topicId: topic.id, mode: 'quiz' })}
        >
          Trắc nghiệm
        </button>
      </div>
      {mode === 'cards' ? (
        <CardPractice topic={topic} onSeen={onSeen} />
      ) : (
        <QuizPractice topic={topic} state={state} onAnswer={onAnswer} />
      )}
    </section>
  )
}

function CardPractice({ topic, onSeen }: { topic: Topic; onSeen: (id: string) => void }) {
  const [index, setIndex] = useState(0)
  const phrase = topic.phrases[index]

  useEffect(() => {
    onSeen(phrase.id)
  }, [phrase.id, onSeen])

  return (
    <div className="flash-page">
      <p className="meta">
        Thẻ {index + 1}/{topic.phrases.length}
      </p>
      <VocabCard phrase={phrase} accent={topic.accent} autoPlay />
      <div className="cta-row">
        <button
          type="button"
          className="btn ghost"
          onClick={() => setIndex((value) => (value - 1 + topic.phrases.length) % topic.phrases.length)}
        >
          Trước
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            onSeen(phrase.id)
            setIndex((value) => (value + 1) % topic.phrases.length)
          }}
        >
          Thẻ tiếp
        </button>
      </div>
    </div>
  )
}

function QuizPractice({
  topic,
  state,
  onAnswer,
}: {
  topic: Topic
  state: ProgressState
  onAnswer: (phraseId: string, correct: boolean) => void
}) {
  const [round, setRound] = useState(() => samplePhrases(topic.phrases, QUIZ_ROUND))
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    buildQuizQuestion(round[0] ?? topic.phrases[0], topic.phrases),
  )

  const finished = step >= round.length
  const current = round[Math.min(step, Math.max(round.length - 1, 0))]

  if (finished) {
    return (
      <div className="result">
        <h1>Xong một vòng</h1>
        <p className="lede">
          Bạn đúng {correctCount}/{round.length} câu (
          {scorePercent(correctCount, round.length)}%).
        </p>
        <p className="meta">
          Mỗi vòng lấy ngẫu nhiên {QUIZ_ROUND} câu trong chủ đề. Trả lời đúng 2 lần
          liên tiếp để đánh dấu đã thuộc.
        </p>
        <div className="cta-row">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              const nextRound = samplePhrases(topic.phrases, QUIZ_ROUND)
              setRound(nextRound)
              setStep(0)
              setCorrectCount(0)
              setPicked(null)
              setQuestion(buildQuizQuestion(nextRound[0] ?? topic.phrases[0], topic.phrases))
            }}
          >
            Luyện lại
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate({ name: 'topic', topicId: topic.id })}
          >
            Về chủ đề
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="meta">
        Câu {step + 1}/{round.length}
        {current && getPhraseProgress(state, current.id).mastered ? ' · đã thuộc' : ''}
      </p>
      <h2 className="prompt">{question.promptVi}</h2>
      <p className="hint">Chọn câu tiếng Anh đúng</p>
      <ul className="options">
        {question.options.map((option, optionIndex) => {
          const isPicked = picked === optionIndex
          const isCorrect = optionIndex === question.correctIndex
          const tone =
            picked === null ? '' : isCorrect ? 'correct' : isPicked ? 'wrong' : ''
          return (
            <li key={option}>
              <button
                type="button"
                className={`option ${tone}`}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(optionIndex)
                  const ok = optionIndex === question.correctIndex
                  if (ok) setCorrectCount((value) => value + 1)
                  onAnswer(question.phraseId, ok)
                }}
              >
                {option}
              </button>
            </li>
          )
        })}
      </ul>
      {picked !== null ? (
        <div className="feedback">
          <SpeakButton text={question.promptEn} />
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              const nextStep = step + 1
              setStep(nextStep)
              setPicked(null)
              if (nextStep < round.length) {
                setQuestion(buildQuizQuestion(round[nextStep], topic.phrases))
              }
            }}
          >
            Tiếp tục
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ReviewQuiz({
  phrases,
  onAnswer,
}: {
  phrases: Phrase[]
  onAnswer: (phraseId: string, correct: boolean) => void
}) {
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    buildQuizQuestion(phrases[0], phrases),
  )

  if (step >= phrases.length) {
    return (
      <div className="result">
        <h1>Ôn xong</h1>
        <p className="lede">
          Đúng {correctCount}/{phrases.length} (
          {scorePercent(correctCount, phrases.length)}%).
        </p>
        <button type="button" className="btn primary" onClick={() => navigate({ name: 'home' })}>
          Về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="meta">
        Ôn {step + 1}/{phrases.length}
      </p>
      <h2 className="prompt">{question.promptVi}</h2>
      <ul className="options">
        {question.options.map((option, optionIndex) => {
          const isPicked = picked === optionIndex
          const isCorrect = optionIndex === question.correctIndex
          const tone =
            picked === null ? '' : isCorrect ? 'correct' : isPicked ? 'wrong' : ''
          return (
            <li key={option}>
              <button
                type="button"
                className={`option ${tone}`}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(optionIndex)
                  const ok = optionIndex === question.correctIndex
                  if (ok) setCorrectCount((value) => value + 1)
                  onAnswer(question.phraseId, ok)
                }}
              >
                {option}
              </button>
            </li>
          )
        })}
      </ul>
      {picked !== null ? (
        <div className="feedback">
          <SpeakButton text={question.promptEn} />
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              const nextStep = step + 1
              setStep(nextStep)
              setPicked(null)
              if (nextStep < phrases.length) {
                setQuestion(buildQuizQuestion(phrases[nextStep], phrases))
              }
            }}
          >
            Tiếp tục
          </button>
        </div>
      ) : null}
    </div>
  )
}
