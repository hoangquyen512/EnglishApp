import { BottomNav } from './components/BottomNav'
import { getTopic } from './data/topics'
import { useProgress } from './hooks/useProgress'
import { useRoute } from './hooks/useRoute'
import { HomePage } from './pages/HomePage'
import { PhrasePage } from './pages/PhrasePage'
import { PracticePage } from './pages/PracticePage'
import { ReviewPage } from './pages/ReviewPage'
import { SavedPage } from './pages/SavedPage'
import { TopicPage } from './pages/TopicPage'

export default function App() {
  const route = useRoute()
  const progress = useProgress()

  return (
    <div className="app-shell">
      <main className="app-main">{renderPage(route, progress)}</main>
      <BottomNav route={route} />
    </div>
  )
}

function renderPage(
  route: ReturnType<typeof useRoute>,
  progress: ReturnType<typeof useProgress>,
) {
  if (route.name === 'review') {
    return <ReviewPage state={progress.state} onAnswer={progress.markAnswer} />
  }
  if (route.name === 'saved') {
    return <SavedPage state={progress.state} />
  }
  if (route.name === 'topic') {
    const topic = getTopic(route.topicId)
    if (!topic) return <HomePage state={progress.state} />
    return <TopicPage topic={topic} state={progress.state} />
  }
  if (route.name === 'phrase') {
    const topic = getTopic(route.topicId)
    if (!topic) return <HomePage state={progress.state} />
    return (
      <PhrasePage
        topic={topic}
        phraseId={route.phraseId}
        state={progress.state}
        onSeen={progress.markSeen}
        onToggleSaved={progress.toggleSaved}
        isSaved={progress.isSaved(route.phraseId)}
      />
    )
  }
  if (route.name === 'practice') {
    const topic = getTopic(route.topicId)
    if (!topic) return <HomePage state={progress.state} />
    return (
      <PracticePage
        topic={topic}
        mode={route.mode}
        state={progress.state}
        onAnswer={progress.markAnswer}
        onSeen={progress.markSeen}
      />
    )
  }
  return <HomePage state={progress.state} />
}
