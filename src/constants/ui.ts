import type { MissionType, PetMood, PhraseTopic } from "../types";

export const APP_NAME = "Vocab Pet";

export const UI = {
  openApp: "Mở app",
  studyNow: "Học ngay",
  quit: "Thoát",
  onboardingTitle: "Chọn người bạn đồng hành",
  onboardingSubtitle: "Pet sẽ lớn lên mỗi khi bạn học từ vựng đúng.",
  choosePet: "Chọn pet này",
  homeTitle: "Nhà của pet",
  studyModeTitle: "Chọn chế độ học",
  vocabulary: "Từ vựng",
  phrases: "Câu giao tiếp",
  pickTopic: "Chọn chủ đề",
  allTopics: "Tất cả chủ đề",
  submit: "Submit",
  nextCard: "Thẻ tiếp theo",
  close: "Đóng",
  correct: "Đúng rồi!",
  incorrect: "Chưa đúng",
  level: "Cấp",
  xp: "XP",
  streak: "Streak",
  missionsToday: "Nhiệm vụ hôm nay",
  schedulerLabel: "Popup mỗi (phút)",
  loading: "Đang tải...",
  noCard: "Chưa có thẻ nào phù hợp.",
  needChoice: "Hãy chọn một đáp án.",
  popupTitle: "Học ngay",
  xpGained: "pet vui lên và nhận XP",
  missionComplete: "Hoàn thành nhiệm vụ",
  dbUnavailable: "Không kết nối được SQLite. Hãy chạy bằng pnpm tauri dev.",
} as const;

export const TOPIC_LABELS: Record<PhraseTopic, string> = {
  travel: "Du lịch",
  food: "Ẩm thực",
  office: "Công việc",
  family: "Gia đình",
};

export const MOOD_LABELS: Record<PetMood, string> = {
  happy: "Vui",
  neutral: "Bình thường",
  sad: "Buồn",
  hungry: "Đói",
};

export const MISSION_TITLES: Record<MissionType, string> = {
  learn_new: "Học từ/câu mới hôm nay",
  review_wrong: "Ôn lại từ/câu đã trả lời sai",
  topic_practice: "Luyện chủ đề",
};

export const TOPICS: PhraseTopic[] = ["travel", "food", "office", "family"];
