import { MISSION_TITLES, TOPIC_LABELS, UI } from "../../constants/ui";
import { speakWord } from "../../features/vocabulary";
import type { ContentType, DailyMission, PetState, PhraseTopic } from "../../types";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
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

function remainingLabel(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
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
  const player = useFlashcardPlayer({
    contentType,
    topic: contentType === "phrase" ? topic : null,
    autoSpeak: false,
  });

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-4 bg-cream p-6 md:grid-cols-[280px_1fr]">
      <Panel>
        <PetStatus pet={pet} />
      </Panel>
      <div className="flex flex-col gap-4">
        <Panel>
          <h1 className="text-2xl font-bold">{UI.homeTitle}</h1>
          <p className="mt-1 text-sm text-muted">{UI.cardIntervalHint}</p>
          {player.card ? (
            <div className="mt-4">
              <FlashcardFace
                card={player.card}
                progress={player.progress}
                paused={player.paused}
                remainingLabel={remainingLabel(player.remaining)}
                showActions={false}
                onPauseToggle={player.togglePause}
                onPrev={player.prev}
                onNext={() => player.next({ silent: true })}
                onSpeak={() => speakWord(player.card!.word)}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">{player.loading ? UI.loading : UI.noCard}</p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted">{UI.studyModeTitle}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
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
          <div className="mt-4 flex flex-wrap items-center gap-3">
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
              className="h-10 w-20 rounded-lg border border-line bg-paper px-2 tabular"
            />
            <PrimaryButton onClick={onStudyNow}>{UI.studyNow}</PrimaryButton>
          </div>
        </Panel>
        <Panel>
          <h2 className="font-bold">{UI.missionsToday}</h2>
          <ul className="mt-3 space-y-2">
            {missions.map((mission) => (
              <li
                key={mission.id}
                className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm"
              >
                <span>
                  {mission.isCompleted ? "☑ " : "☐ "}
                  {missionLabel(mission)}
                </span>
                <span className="font-semibold tabular">
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
