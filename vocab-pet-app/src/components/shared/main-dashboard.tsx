import { useEffect, useState } from "react";
import { usePetStore } from "../../stores/pet-store";
import { useSchedulerStore } from "../../stores/scheduler-store";
import { isTauri } from "../../lib/platform";
import { UI_STRINGS } from "../../constants/ui-strings";
import { LoadingSpinner } from "../shared/loading-spinner";
import { PetAvatar } from "../pet/pet-avatar";

function formatCountdown(nextTickAt: number | null): string {
  if (!nextTickAt) {
    return "—";
  }
  const remaining = Math.max(0, nextTickAt - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MainDashboard() {
  const { snapshot, isLoading, error, refresh } = usePetStore();
  const { isRunning, nextTickAt, start, triggerNow } = useSchedulerStore();
  const [countdown, setCountdown] = useState("—");

  useEffect(() => {
    void refresh();
    start();
  }, [refresh, start]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(nextTickAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextTickAt]);

  if (isLoading && !snapshot) {
    return <LoadingSpinner label={UI_STRINGS.app.loading} />;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!snapshot) {
    return null;
  }

  const { pet, xpProgressPercent, xpToNextLevel } = snapshot;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 to-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-indigo-800 sm:text-2xl">
          {UI_STRINGS.app.title}
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          {UI_STRINGS.main.subtitle}
        </p>
        {!isTauri() ? (
          <p className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            {UI_STRINGS.web.modeBadge}
          </p>
        ) : null}
      </header>

      <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
          {UI_STRINGS.main.petStatus}
        </h2>

        <div className="mb-6 flex justify-center">
          <PetAvatar mood={pet.mood} level={pet.level} />
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">{UI_STRINGS.main.level}</dt>
            <dd className="font-medium">{pet.level}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{UI_STRINGS.main.xp}</dt>
            <dd className="font-medium">
              {pet.xp} ({xpToNextLevel} to next)
            </dd>
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <dt className="text-gray-500">XP progress</dt>
              <dd className="font-medium">{xpProgressPercent}%</dd>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{UI_STRINGS.main.mood}</dt>
            <dd className="font-medium">{UI_STRINGS.mood[pet.mood]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">{UI_STRINGS.main.streak}</dt>
            <dd className="font-medium">{pet.streak_days}</dd>
          </div>
          {isRunning ? (
            <div className="flex justify-between">
              <dt className="text-gray-500">{UI_STRINGS.main.nextPopup}</dt>
              <dd className="font-medium">{countdown}</dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          onClick={() => void triggerNow()}
          className="mt-6 min-h-12 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          {UI_STRINGS.main.studyNow}
        </button>

        {!isTauri() ? (
          <p className="mt-4 text-center text-xs text-gray-500">
            {UI_STRINGS.web.addToHome}
          </p>
        ) : null}
      </div>
    </div>
  );
}
