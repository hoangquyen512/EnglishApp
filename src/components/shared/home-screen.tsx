import { useEffect, useState } from "react";
import { MISSION_TITLES, UI, topicLabel } from "../../constants/ui";
import type { SessionDto } from "../../features/auth";
import {
  TOPIC_BY_CODE,
  type TopicCode,
} from "../../features/learning-program/catalog";
import { ensureLearningProgram } from "../../features/learning-program";
import { speakWord } from "../../features/vocabulary";
import type { ContentType, DailyMission, PetState } from "../../types";
import { HomeAccountChip } from "../account/home-account-chip";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
import { FloatingPetOverlay } from "../pet/floating-pet-overlay";
import { PetStatus } from "../pet/pet-status";
import { Panel } from "./panel";
import { PrimaryButton } from "./primary-button";

interface HomeScreenProps {
  pet: PetState;
  missions: DailyMission[];
  contentType: ContentType;
  intervalMinutes: number;
  onContentType: (contentType: ContentType) => void;
  onInterval: (minutes: number) => void;
  onStudyNow: () => void;
  session: SessionDto;
  onOpenAccount: () => void;
  onOpenChat: () => void;
  onOpenLearningProgram: () => void;
}

function missionLabel(mission: DailyMission): string {
  if (mission.missionType === "topic_practice" && mission.topic) {
    return `${MISSION_TITLES.topic_practice} ${topicLabel(mission.topic)} (${mission.targetCount})`;
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
  intervalMinutes,
  onContentType,
  onInterval,
  onStudyNow,
  session,
  onOpenAccount,
  onOpenChat,
  onOpenLearningProgram,
}: HomeScreenProps) {
  const [activeTopics, setActiveTopics] = useState<TopicCode[]>([]);
  const [floatPet, setFloatPet] = useState(false);
  const player = useFlashcardPlayer({
    contentType,
    autoSpeak: false,
  });

  useEffect(() => {
    let cancelled = false;
    void ensureLearningProgram().then((program) => {
      if (!cancelled) {
        setActiveTopics(program.topicCodes);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
    <main className="mx-auto grid min-h-screen max-w-5xl gap-4 bg-cream p-6 md:grid-cols-[280px_1fr]">
      <Panel>
        <PetStatus
          pet={pet}
          onFloatPet={() => setFloatPet(true)}
        />
      </Panel>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <HomeAccountChip session={session} onOpen={onOpenAccount} />
        </div>
        <Panel>
          <h1 className="text-2xl font-bold">{UI.homeTitle}</h1>
          <p className="mt-1 text-sm text-muted">{UI.cardIntervalHint}</p>
          {contentType === "vocabulary" && player.deck.length > 0 ? (
            <p className="mt-1 text-sm text-muted">
              {UI.vocabBankSize.replace("{n}", String(player.deck.length))}
            </p>
          ) : null}
          {player.card ? (
            <div className="mt-4">
              <FlashcardFace
                card={player.card}
                paused={player.paused}
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
            <PrimaryButton
              variant={contentType === "conversation" ? "primary" : "ghost"}
              onClick={() => onContentType("conversation")}
            >
              {UI.conversation}
            </PrimaryButton>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">
              {UI.learningProgramActive}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeTopics.map((code) => (
                <span
                  key={code}
                  className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink"
                >
                  {TOPIC_BY_CODE.get(code)?.nameVi ?? code}
                </span>
              ))}
            </div>
            <PrimaryButton variant="text" className="mt-2" onClick={onOpenLearningProgram}>
              {UI.learningProgramEdit}
            </PrimaryButton>
          </div>
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
            <PrimaryButton variant="ghost" onClick={onOpenChat}>
              {UI.companion}
            </PrimaryButton>
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
                <span>{missionLabel(mission)}</span>
                <span className="tabular text-muted">
                  {mission.currentCount}/{mission.targetCount}
                  {mission.isCompleted ? " ✓" : ""}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </main>
    {floatPet ? (
      <FloatingPetOverlay pet={pet} onDismiss={() => setFloatPet(false)} />
    ) : null}
    </>
  );
}
