import type { Phrase, Topic, TopicId } from '../types'
import airport from './banks/airport.json' with { type: 'json' }
import cafe from './banks/cafe.json' with { type: 'json' }
import directions from './banks/directions.json' with { type: 'json' }
import emergency from './banks/emergency.json' with { type: 'json' }
import family from './banks/family.json' with { type: 'json' }
import greetings from './banks/greetings.json' with { type: 'json' }
import health from './banks/health.json' with { type: 'json' }
import hotel from './banks/hotel.json' with { type: 'json' }
import phone from './banks/phone.json' with { type: 'json' }
import restaurant from './banks/restaurant.json' with { type: 'json' }
import shopping from './banks/shopping.json' with { type: 'json' }
import work from './banks/work.json' with { type: 'json' }

const banks: Record<TopicId, Phrase[]> = {
  greetings: greetings as Phrase[],
  cafe: cafe as Phrase[],
  restaurant: restaurant as Phrase[],
  shopping: shopping as Phrase[],
  directions: directions as Phrase[],
  hotel: hotel as Phrase[],
  health: health as Phrase[],
  work: work as Phrase[],
  family: family as Phrase[],
  phone: phone as Phrase[],
  airport: airport as Phrase[],
  emergency: emergency as Phrase[],
}

const meta: Omit<Topic, 'phrases'>[] = [
  {
    id: 'greetings',
    titleVi: 'Chào hỏi',
    titleEn: 'Greetings',
    blurb: 'Mở lời, tự giới thiệu và kết thúc cuộc trò chuyện.',
    emoji: '👋',
    accent: '#c45c26',
  },
  {
    id: 'cafe',
    titleVi: 'Quán cà phê',
    titleEn: 'Cafe',
    blurb: 'Gọi đồ uống, hỏi thành phần và thanh toán.',
    emoji: '☕',
    accent: '#8b5a2b',
  },
  {
    id: 'restaurant',
    titleVi: 'Nhà hàng',
    titleEn: 'Restaurant',
    blurb: 'Đặt bàn, gọi món, dị ứng và xin hóa đơn.',
    emoji: '🍽️',
    accent: '#9a3f16',
  },
  {
    id: 'shopping',
    titleVi: 'Mua sắm',
    titleEn: 'Shopping',
    blurb: 'Hỏi size, giá, đổi trả và thanh toán.',
    emoji: '🛍️',
    accent: '#b4532a',
  },
  {
    id: 'directions',
    titleVi: 'Hỏi đường',
    titleEn: 'Directions',
    blurb: 'Hỏi vị trí, khoảng cách và cách đi.',
    emoji: '🗺️',
    accent: '#3d6b4f',
  },
  {
    id: 'hotel',
    titleVi: 'Khách sạn',
    titleEn: 'Hotel',
    blurb: 'Nhận phòng, hỏi tiện nghi và nhờ hỗ trợ.',
    emoji: '🏨',
    accent: '#2f5d50',
  },
  {
    id: 'health',
    titleVi: 'Sức khỏe',
    titleEn: 'Health',
    blurb: 'Mô tả triệu chứng, mua thuốc và đặt lịch.',
    emoji: '🩺',
    accent: '#a33b2b',
  },
  {
    id: 'work',
    titleVi: 'Công việc',
    titleEn: 'Work',
    blurb: 'Họp, email, xin phép và trao đổi tiến độ.',
    emoji: '💼',
    accent: '#3f4f6a',
  },
  {
    id: 'family',
    titleVi: 'Gia đình & bạn bè',
    titleEn: 'Family',
    blurb: 'Nói về người thân, kế hoạch và lời mời.',
    emoji: '👨‍👩‍👧',
    accent: '#7a4b8a',
  },
  {
    id: 'phone',
    titleVi: 'Điện thoại',
    titleEn: 'Phone',
    blurb: 'Gọi điện, nhắn tin, xin gặp và để lại lời nhắn.',
    emoji: '📱',
    accent: '#2b6cb0',
  },
  {
    id: 'airport',
    titleVi: 'Sân bay',
    titleEn: 'Airport',
    blurb: 'Check-in, an ninh, chuyến bay và hành lý.',
    emoji: '✈️',
    accent: '#1f4e79',
  },
  {
    id: 'emergency',
    titleVi: 'Khẩn cấp',
    titleEn: 'Emergency',
    blurb: 'Xin giúp đỡ, báo mất đồ và liên hệ khẩn.',
    emoji: '🚨',
    accent: '#9b2c2c',
  },
]

export const topics: Topic[] = meta.map((topic) => ({
  ...topic,
  phrases: banks[topic.id],
}))

export const topicById = new Map(topics.map((topic) => [topic.id, topic]))

export const allPhrases = topics.flatMap((topic) =>
  topic.phrases.map((phrase) => ({ ...phrase, topicId: topic.id })),
)

export function isTopicId(value: string): value is TopicId {
  return topicById.has(value as TopicId)
}

export function getTopic(id: string): Topic | undefined {
  return topicById.get(id as TopicId)
}

export function getPhrase(topicId: string, phraseId: string) {
  return getTopic(topicId)?.phrases.find((phrase) => phrase.id === phraseId)
}

export function filterPhrases<T extends { en: string; vi: string }>(
  phrases: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return phrases
  return phrases.filter(
    (phrase) => phrase.en.toLowerCase().includes(q) || phrase.vi.toLowerCase().includes(q),
  )
}

export function searchTopics(query: string): Topic[] {
  const q = query.trim().toLowerCase()
  if (!q) return topics
  return topics.filter((topic) => {
    if (topic.titleVi.toLowerCase().includes(q)) return true
    if (topic.titleEn.toLowerCase().includes(q)) return true
    return topic.phrases.some(
      (phrase) =>
        phrase.en.toLowerCase().includes(q) || phrase.vi.toLowerCase().includes(q),
    )
  })
}

export function firstMatchingPhrase(topic: Topic, query: string) {
  return filterPhrases(topic.phrases, query)[0] ?? topic.phrases[0]
}
