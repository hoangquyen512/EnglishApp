import type { ConversationPhrase, ConversationTopic, ConversationTopicId } from "../../features/conversation/types";
import airport from "./banks/airport.json";
import cafe from "./banks/cafe.json";
import directions from "./banks/directions.json";
import emergency from "./banks/emergency.json";
import family from "./banks/family.json";
import greetings from "./banks/greetings.json";
import health from "./banks/health.json";
import hotel from "./banks/hotel.json";
import phone from "./banks/phone.json";
import restaurant from "./banks/restaurant.json";
import shopping from "./banks/shopping.json";
import work from "./banks/work.json";

const banks: Record<ConversationTopicId, ConversationPhrase[]> = {
  greetings: greetings as ConversationPhrase[],
  cafe: cafe as ConversationPhrase[],
  restaurant: restaurant as ConversationPhrase[],
  shopping: shopping as ConversationPhrase[],
  directions: directions as ConversationPhrase[],
  hotel: hotel as ConversationPhrase[],
  health: health as ConversationPhrase[],
  work: work as ConversationPhrase[],
  family: family as ConversationPhrase[],
  phone: phone as ConversationPhrase[],
  airport: airport as ConversationPhrase[],
  emergency: emergency as ConversationPhrase[],
};

const meta: Omit<ConversationTopic, "phrases">[] = [
  { id: "greetings", titleVi: "Chào hỏi", titleEn: "Greetings", blurb: "Mở lời, tự giới thiệu và kết thúc cuộc trò chuyện.", emoji: "👋", accent: "#c45c26" },
  { id: "cafe", titleVi: "Quán cà phê", titleEn: "Cafe", blurb: "Gọi đồ uống, hỏi thành phần và thanh toán.", emoji: "☕", accent: "#8b5a2b" },
  { id: "restaurant", titleVi: "Nhà hàng", titleEn: "Restaurant", blurb: "Đặt bàn, gọi món, dị ứng và xin hóa đơn.", emoji: "🍽️", accent: "#9a3f16" },
  { id: "shopping", titleVi: "Mua sắm", titleEn: "Shopping", blurb: "Hỏi size, giá, đổi trả và thanh toán.", emoji: "🛍️", accent: "#b4532a" },
  { id: "directions", titleVi: "Hỏi đường", titleEn: "Directions", blurb: "Hỏi vị trí, khoảng cách và cách đi.", emoji: "🗺️", accent: "#3d6b4f" },
  { id: "hotel", titleVi: "Khách sạn", titleEn: "Hotel", blurb: "Nhận phòng, hỏi tiện nghi và nhờ hỗ trợ.", emoji: "🏨", accent: "#2f5d50" },
  { id: "health", titleVi: "Sức khỏe", titleEn: "Health", blurb: "Mô tả triệu chứng, mua thuốc và đặt lịch.", emoji: "🩺", accent: "#a33b2b" },
  { id: "work", titleVi: "Công việc", titleEn: "Work", blurb: "Họp, email, xin phép và trao đổi tiến độ.", emoji: "💼", accent: "#3f4f6a" },
  { id: "family", titleVi: "Gia đình & bạn bè", titleEn: "Family", blurb: "Nói về người thân, kế hoạch và lời mời.", emoji: "👨‍👩‍👧", accent: "#7a4b8a" },
  { id: "phone", titleVi: "Điện thoại", titleEn: "Phone", blurb: "Gọi điện, nhắn tin, xin gặp và để lại lời nhắn.", emoji: "📱", accent: "#2b6cb0" },
  { id: "airport", titleVi: "Sân bay", titleEn: "Airport", blurb: "Check-in, an ninh, chuyến bay và hành lý.", emoji: "✈️", accent: "#1f4e79" },
  { id: "emergency", titleVi: "Khẩn cấp", titleEn: "Emergency", blurb: "Xin giúp đỡ, báo mất đồ và liên hệ khẩn.", emoji: "🚨", accent: "#9b2c2c" },
];

export const conversationTopics: ConversationTopic[] = meta.map((topic) => ({
  ...topic,
  phrases: banks[topic.id],
}));

export const conversationTopicById = new Map(conversationTopics.map((topic) => [topic.id, topic]));

export function isConversationTopicId(value: string): value is ConversationTopicId {
  return conversationTopicById.has(value as ConversationTopicId);
}

export function getConversationTopic(id: string): ConversationTopic | undefined {
  return conversationTopicById.get(id as ConversationTopicId);
}
