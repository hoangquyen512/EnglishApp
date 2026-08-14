import type { CefrLevel, PhraseTopic } from "../types";

export const SEED_PHRASES: {
  id: number;
  phraseEn: string;
  meaningVi: string;
  topic: PhraseTopic;
  level: CefrLevel;
}[] = [
  { id: 1, phraseEn: "Where is the nearest station?", meaningVi: "Nhà ga gần nhất ở đâu?", topic: "travel", level: "A2" },
  { id: 2, phraseEn: "I would like a round-trip ticket.", meaningVi: "Tôi muốn mua vé khứ hồi.", topic: "travel", level: "A2" },
  { id: 3, phraseEn: "How long does the flight take?", meaningVi: "Chuyến bay mất bao lâu?", topic: "travel", level: "A2" },
  { id: 4, phraseEn: "Can I see the menu, please?", meaningVi: "Cho tôi xem thực đơn được không?", topic: "food", level: "A1" },
  { id: 5, phraseEn: "This dish is delicious!", meaningVi: "Món này ngon quá!", topic: "food", level: "A1" },
  { id: 6, phraseEn: "Could you send me the report?", meaningVi: "Bạn có thể gửi báo cáo cho tôi không?", topic: "office", level: "B1" },
  { id: 7, phraseEn: "Let us schedule a meeting.", meaningVi: "Chúng ta hãy lên lịch họp.", topic: "office", level: "A2" },
  { id: 8, phraseEn: "I will follow up by email.", meaningVi: "Tôi sẽ gửi email theo dõi.", topic: "office", level: "B1" },
  { id: 9, phraseEn: "How is your family?", meaningVi: "Gia đình bạn thế nào?", topic: "family", level: "A1" },
  { id: 10, phraseEn: "This is my younger sister.", meaningVi: "Đây là em gái tôi.", topic: "family", level: "A1" },
];
