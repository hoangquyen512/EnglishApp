import { useCallback, useEffect, useState } from 'react'
import {
  isSaved,
  loadState,
  markAnswer as markAnswerFn,
  markSeen as markSeenFn,
  saveState,
  toggleSaved as toggleSavedFn,
} from '../lib/progress'
import type { ProgressState } from '../types'

export function useProgress() {
  const [state, setState] = useState<ProgressState>({ phrases: {}, saved: [] })

  useEffect(() => {
    setState(loadState())
  }, [])

  const markSeen = useCallback((phraseId: string) => {
    setState((prev) => persist(markSeenFn(prev, phraseId)))
  }, [])

  const markAnswer = useCallback((phraseId: string, correct: boolean) => {
    setState((prev) => persist(markAnswerFn(prev, phraseId, correct)))
  }, [])

  const toggleSaved = useCallback((phraseId: string) => {
    setState((prev) => persist(toggleSavedFn(prev, phraseId)))
  }, [])

  return {
    state,
    markSeen,
    markAnswer,
    toggleSaved,
    isSaved: (phraseId: string) => isSaved(state, phraseId),
  }
}

function persist(next: ProgressState): ProgressState {
  saveState(next)
  return next
}
