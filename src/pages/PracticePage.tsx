import { useMemo, useState } from 'react'
import { SpeakButton } from '../components/SpeakButton'
import { allPhrases } from '../data/topics'
import { getPhraseProgress } from '../lib/progress'
import { buildQuizQuestion, scorePercent } from '../lib/quiz'
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
  const [flipped, setFlipped] = useState(false)
  const phrase = topic.phrases[index]

  return (
    <div>
      <p className="meta">
        Thẻ {index + 1}/{topic.phrases.length} · chạm để lật
      </p>
      <button
        type="button"
        className={flipped ? 'flip-card flipped' : 'flip-card'}
        onClick={() => {
          setFlipped((value) => !value)
          onSeen(phrase.id)
        }}
      >
        <span className="flip-face front">
          <strong>{phrase.en}</strong>
          <em>{phrase.ipa}</em>
        </span>
        <span className="flip-face back">
          <strong>{phrase.vi}</strong>
          <em>{phrase.note}</em>
        </span>
      </button>
      <div className="cta-row">
        <SpeakButton text={phrase.en} />
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setFlipped(false)
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
  const pool = useMemo(() => allPhrases, [])
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    buildQuizQuestion(topic.phrases[0], pool),
  )

  const finished = step >= topic.phrases.length
  const current = topic.phrases[Math.min(step, topic.phrases.length - 1)]

  if (finished) {
    return (
      <div className="result">
        <h1>Xong một vòng</h1>
        <p className="lede">
          Bạn đúng {correctCount}/{topic.phrases.length} câu (
          {scorePercent(correctCount, topic.phrases.length)}%).
        </p>
        <p className="meta">
          Trả lời đúng 2 lần liên tiếp để đánh dấu một câu là đã thuộc.
        </p>
        <div className="cta-row">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setStep(0)
              setCorrectCount(0)
              setPicked(null)
              setQuestion(buildQuizQuestion(topic.phrases[0], pool))
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
        Câu {step + 1}/{topic.phrases.length}
        {getPhraseProgress(state, current.id).mastered ? ' · đã thuộc' : ''}
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
              if (nextStep < topic.phrases.length) {
                setQuestion(buildQuizQuestion(topic.phrases[nextStep], pool))
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
  const pool = useMemo(() => allPhrases, [])
  const [step, setStep] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    buildQuizQuestion(phrases[0], pool),
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
                setQuestion(buildQuizQuestion(phrases[nextStep], pool))
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
