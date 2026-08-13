import type { PracticeMode, Route } from '../types'

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '')
  const parts = path.split('/').filter(Boolean)

  if (parts.length === 0) return { name: 'home' }
  if (parts[0] === 'review') return { name: 'review' }
  if (parts[0] === 'saved') return { name: 'saved' }

  if (parts[0] === 'topic' && parts[1]) {
    const topicId = parts[1]
    if (parts[2] === 'phrase' && parts[3]) {
      return { name: 'phrase', topicId, phraseId: parts[3] }
    }
    if (parts[2] === 'practice') {
      const mode: PracticeMode = parts[3] === 'cards' ? 'cards' : 'quiz'
      return { name: 'practice', topicId, mode }
    }
    return { name: 'topic', topicId }
  }

  return { name: 'home' }
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'review':
      return '#/review'
    case 'saved':
      return '#/saved'
    case 'topic':
      return `#/topic/${route.topicId}`
    case 'phrase':
      return `#/topic/${route.topicId}/phrase/${route.phraseId}`
    case 'practice':
      return `#/topic/${route.topicId}/practice/${route.mode}`
  }
}

export function navigate(route: Route): void {
  window.location.hash = toHash(route)
}
