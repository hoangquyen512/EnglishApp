import type { TopicCode } from "./catalog";

/** Exact lemmas tagged for the four default program topics (hybrid MVP). */
const WORD_TOPIC: Record<string, TopicCode> = {
  appliance: "family",
  linen: "family",
  landlord: "family",
  tenant: "family",
  lease: "family",
  catering: "food_dining",
  buffet: "food_dining",
  beverage: "food_dining",
  appetizer: "food_dining",
  chef: "food_dining",
  cuisine: "food_dining",
  refill: "food_dining",
  "a-la-carte": "food_dining",
  vegetarian: "food_dining",
  recipe: "food_dining",
  portion: "food_dining",
  invoice: "office_work",
  deadline: "office_work",
  conference: "office_work",
  memo: "office_work",
  payroll: "office_work",
  appraisal: "office_work",
  colleague: "office_work",
  personnel: "office_work",
  overtime: "office_work",
  downsize: "office_work",
  teamwork: "office_work",
  delegate: "office_work",
  agenda: "office_work",
  minutes: "office_work",
  report: "office_work",
  archive: "office_work",
  workplace: "office_work",
  manager: "office_work",
  reservation: "travel",
  itinerary: "travel",
  destination: "travel",
  luggage: "travel",
  hospitality: "travel",
  concierge: "travel",
  boarding: "travel",
  gate: "travel",
  terminal: "travel",
  flight: "travel",
  departure: "travel",
  arrival: "travel",
  fare: "travel",
  ticket: "travel",
  passport: "travel",
  layover: "travel",
  excursion: "travel",
  nonstop: "travel",
};

export function assignVocabTopicCode(word: string): TopicCode | null {
  return WORD_TOPIC[word.trim().toLowerCase()] ?? null;
}

export function vocabWordsForTopic(code: TopicCode): string[] {
  return Object.entries(WORD_TOPIC)
    .filter(([, topic]) => topic === code)
    .map(([word]) => word)
    .sort();
}
