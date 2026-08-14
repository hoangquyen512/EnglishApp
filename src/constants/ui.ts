import type { MissionType, PetMood, PhraseTopic } from "../types";

export const APP_NAME = "Yume";
export const DEFAULT_PET_NAME = "Sora";

export const UI = {
  openApp: "Mở app",
  studyNow: "Học ngay",
  quit: "Thoát",
  onboardingTitle: `Chào mừng đến ${APP_NAME}`,
  onboardingSubtitle: "Chọn người bạn đồng hành. Pet lớn lên mỗi khi bạn học flashcard TOEIC.",
  petNameLabel: "Tên pet",
  petNamePlaceholder: DEFAULT_PET_NAME,
  choosePet: "Chọn pet này",
  homeTitle: "Nhà của pet",
  studyModeTitle: "Chế độ học",
  vocabulary: "Từ vựng",
  phrases: "Câu giao tiếp",
  pickTopic: "Chủ đề",
  allTopics: "Tất cả chủ đề",
  pause: "Tạm dừng",
  resume: "Tiếp tục",
  known: "Đã nhớ",
  unknown: "Chưa nhớ",
  nextCard: "Thẻ tiếp",
  prevCard: "Thẻ trước",
  listen: "Nghe phát âm",
  close: "Đóng",
  level: "Cấp",
  xp: "XP",
  streak: "Streak",
  missionsToday: "Nhiệm vụ hôm nay",
  schedulerLabel: "Nhắc học mỗi (phút)",
  cardIntervalHint: "Pet đổi thẻ mỗi 30 giây",
  vocabBankSize: "{n} từ trong bộ học",
  loading: "Đang tải...",
  noCard: "Chưa có thẻ nào phù hợp.",
  popupTitle: APP_NAME,
  xpGained: "Pet vui lên · +{n} XP",
  levelUp: "Lên cấp {n}",
  missionComplete: "Hoàn thành nhiệm vụ",
  hungryHint: "Pet đang đói — một thẻ là đủ để pet vui lại.",
  sadHint: "Pet hơi buồn. Học một thẻ nhé.",
  dbUnavailable: "Không kết nối được dữ liệu. Hãy mở app bằng pnpm tauri dev.",
  exampleLabel: "Ví dụ",
  meaningLabel: "Nghĩa",
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
  review_wrong: "Ôn lại từ chưa nhớ",
  topic_practice: "Luyện chủ đề",
};

export const TOPICS: PhraseTopic[] = ["travel", "food", "office", "family"];
