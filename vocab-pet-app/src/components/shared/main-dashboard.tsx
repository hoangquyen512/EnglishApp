import { useEffect, useState } from "react";
import { usePetStore } from "../../stores/pet-store";
import { useSchedulerStore } from "../../stores/scheduler-store";
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-800">
          {UI_STRINGS.app.title}
        </h1>
        <p className="text-gray-600">{UI_STRINGS.main.subtitle}</p>
      </header>

      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
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
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {UI_STRINGS.main.studyNow}
        </button>
      </div>
    </div>
  );
}
