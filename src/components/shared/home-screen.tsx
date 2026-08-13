import { MISSION_TITLES, TOPIC_LABELS, UI } from "../../constants/ui";
import type { ContentType, DailyMission, PetState, PhraseTopic } from "../../types";
import { PetStatus } from "../pet/pet-status";
import { Panel } from "./panel";
import { PrimaryButton } from "./primary-button";

interface HomeScreenProps {
  pet: PetState;
  missions: DailyMission[];
  contentType: ContentType;
  topic: PhraseTopic | null;
  intervalMinutes: number;
  onContentType: (contentType: ContentType) => void;
  onTopic: (topic: PhraseTopic | null) => void;
  onInterval: (minutes: number) => void;
  onStudyNow: () => void;
}

function missionLabel(mission: DailyMission): string {
  if (mission.missionType === "topic_practice" && mission.topic) {
    return `${MISSION_TITLES.topic_practice} ${TOPIC_LABELS[mission.topic]} (${mission.targetCount})`;
  }
  if (mission.missionType === "learn_new") {
    return `${MISSION_TITLES.learn_new} (${mission.targetCount})`;
  }
  return `${MISSION_TITLES.review_wrong} (${mission.targetCount})`;
}

export function HomeScreen({
  pet,
  missions,
  contentType,
  topic,
  intervalMinutes,
  onContentType,
  onTopic,
  onInterval,
  onStudyNow,
}: HomeScreenProps) {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-4 p-6 md:grid-cols-[280px_1fr]">
      <Panel>
        <PetStatus pet={pet} />
      </Panel>
      <div className="flex flex-col gap-4">
        <Panel>
          <h1 className="text-2xl font-black">{UI.homeTitle}</h1>
          <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-orange-700">
            {UI.studyModeTitle}
          </h2>
          <div className="mt-2 flex gap-2">
            <PrimaryButton
              variant={contentType === "vocabulary" ? "primary" : "ghost"}
              onClick={() => onContentType("vocabulary")}
            >
              {UI.vocabulary}
            </PrimaryButton>
            <PrimaryButton
              variant={contentType === "phrase" ? "primary" : "ghost"}
              onClick={() => onContentType("phrase")}
            >
              {UI.phrases}
            </PrimaryButton>
          </div>
          {contentType === "phrase" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton variant={topic === null ? "primary" : "ghost"} onClick={() => onTopic(null)}>
                {UI.allTopics}
              </PrimaryButton>
              {(Object.keys(TOPIC_LABELS) as PhraseTopic[]).map((key) => (
                <PrimaryButton
                  key={key}
                  variant={topic === key ? "primary" : "ghost"}
                  onClick={() => onTopic(key)}
                >
                  {TOPIC_LABELS[key]}
                </PrimaryButton>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm" htmlFor="interval">
              {UI.schedulerLabel}
            </label>
            <input
              id="interval"
              type="number"
              min={1}
              max={180}
              value={intervalMinutes}
              onChange={(event) => onInterval(Number(event.target.value))}
              className="w-20 rounded-lg border border-orange-200 px-2 py-1"
            />
            <PrimaryButton onClick={onStudyNow}>{UI.studyNow}</PrimaryButton>
          </div>
        </Panel>
        <Panel>
          <h2 className="font-bold">{UI.missionsToday}</h2>
          <ul className="mt-3 space-y-2">
            {missions.map((mission) => (
              <li key={mission.id} className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-sm">
                <span>
                  {mission.isCompleted ? "✅ " : "⬜️ "}
                  {missionLabel(mission)}
                </span>
                <span className="font-semibold">
                  {mission.currentCount}/{mission.targetCount} · +{mission.xpReward} XP
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </main>
  );
}
