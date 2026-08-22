import { describe, expect, it } from "vitest";
import { buildRoadmapSnapshot } from "./roadmap-summary";

describe("buildRoadmapSnapshot", () => {
  it("maps live form values onto roadmap card labels", () => {
    expect(
      buildRoadmapSnapshot({
        level: "A2",
        contentType: "both",
        topicCount: 4,
        intervalMinutes: 2,
        contentLabels: {
          vocabulary: "Từ vựng",
          phrase: "Giao tiếp",
          both: "Cả hai",
        },
        topicCountTemplate: "{n} chủ đề",
        reminderTemplate: "{n} phút",
      }),
    ).toEqual({
      level: "A2",
      priorityLabel: "Cả hai",
      topicCountLabel: "4 chủ đề",
      reminderLabel: "2 phút",
    });
  });
});
