"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { WorkoutProgressBar } from "@/components/workout/WorkoutProgressBar";
import { ExerciseVideoPlayer } from "@/components/workout/ExerciseVideoPlayer";
import { StrengthSetLoggingRows } from "@/components/workout/StrengthSetLoggingRows";
import { CardioLoggingBlock } from "@/components/workout/CardioLoggingBlock";
import { RestTimer } from "@/components/workout/RestTimer";
import { WaterReminder } from "@/components/workout/WaterReminder";
import { useWorkoutNavigation } from "@/hooks/useWorkoutNavigation";
import { useEndWorkout } from "@/hooks/useEndWorkout";

const REST_DURATION_SECONDS = 60;

interface RoutineDayItem {
  id: string;
  exercise: {
    id: string;
    name: string;
    type: "STRENGTH" | "CARDIO";
    muscleGroup: string;
    youtubeVideoId: string;
  };
}

interface PersistedSetLog {
  routineDayItemId: string | null;
  exerciseId: string;
  setNumber: number | null;
  actualWeightKg: number | null;
  actualReps: number | null;
}

interface WorkoutSessionData {
  routineDayId: string;
  startedAt: string;
  waterReminderIntervalMinutes: number | null;
  setLogs: PersistedSetLog[];
}

interface RoutineDay {
  id: string;
  name: string;
  items: RoutineDayItem[];
}

export default function ActiveWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [routineDay, setRoutineDay] = useState<RoutineDay | null>(null);
  const [persistedSetLogs, setPersistedSetLogs] = useState<PersistedSetLog[]>([]);
  const [waterReminderIntervalMinutes, setWaterReminderIntervalMinutes] =
    useState<number | null>(null);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestActive, setIsRestActive] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadSessionData() {
      try {
        const sessionRes = await fetch(`/api/workout-sessions/${sessionId}`);
        if (!sessionRes.ok) throw new Error("Failed to load workout session");
        const session: WorkoutSessionData = await sessionRes.json();

        const dayRes = await fetch(`/api/routine-days/${session.routineDayId}`);
        if (!dayRes.ok) throw new Error("Failed to load routine day");
        const dayData: RoutineDay = await dayRes.json();

        if (!isCancelled) {
          setRoutineDay(dayData);
          setPersistedSetLogs(session.setLogs);
          setWaterReminderIntervalMinutes(
            session.waterReminderIntervalMinutes
          );
          setWorkoutStartedAt(session.startedAt);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadSessionData();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  const items = routineDay?.items ?? [];

  const {
    currentIndex,
    completedExercises,
    isCurrentExerciseComplete,
    isLastExercise,
    resetProgressForExercise,
    registerSetCompleted,
    setCurrentExerciseIndex,
    goToNextExercise,
  } = useWorkoutNavigation(items.length);

  const {
    isEnding,
    showConfirm,
    error: endError,
    requestEndWorkout,
    cancelEndWorkout,
    confirmEndWorkout,
  } = useEndWorkout(sessionId);

  const currentItem = items[currentIndex];

  const getSetLogsForItem = (item: RoutineDayItem) => {
    const matchingExerciseItemCount = items.filter(
      (routineItem) => routineItem.exercise.id === item.exercise.id
    ).length;

    return persistedSetLogs.filter((setLog) => {
      if (setLog.routineDayItemId !== null) {
        return setLog.routineDayItemId === item.id;
      }

      return (
        matchingExerciseItemCount === 1 &&
        setLog.exerciseId === item.exercise.id
      );
    });
  };

  useEffect(() => {
    if (!currentItem) return;

    const completedSetCount = getSetLogsForItem(currentItem).length;

    resetProgressForExercise(completedSetCount);
  }, [currentIndex, currentItem, persistedSetLogs, resetProgressForExercise]);

  const handleSetLogged = (setLog: PersistedSetLog) => {
    setPersistedSetLogs((previousLogs) => [
      ...previousLogs.filter(
        (existingLog) =>
          !(
            existingLog.routineDayItemId === setLog.routineDayItemId &&
            existingLog.setNumber === setLog.setNumber
          )
      ),
      setLog,
    ]);
  };

  const handleSetCompleted = () => {
    registerSetCompleted();
    setIsRestActive(true);
  };

  if (isLoading) {
    return <div className="p-[16px] text-label-primary text-text-secondary">Loading...</div>;
  }

  if (error || !routineDay || !currentItem) {
    return (
      <div className="p-[16px] text-label-primary text-tag-cardio">
        {error || "Workout data not found"}
      </div>
    );
  }

  const completionPercent = Math.round((completedExercises / items.length) * 100);
  const currentExerciseSetLogs = getSetLogsForItem(currentItem);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 bg-background/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex h-[56px] items-center gap-[12px] px-[16px]">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-[8px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-container-low"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-headline-sm font-semibold text-text-primary">
            Routine Builder
          </h1>

          <div className="-mr-[8px] h-[44px] w-[44px]" aria-hidden="true" />
        </div>
      </header>

      <main className="min-h-screen bg-background px-[16px] pb-[32px] pt-[64px]">
        <div className="flex flex-col gap-[20px]">
          <section className="flex flex-col gap-[12px]">
            <div className="flex items-center justify-between gap-[12px]">
              <div className="flex min-w-0 items-center gap-[8px]">
                <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-surface-container-high text-text-secondary">
                  <Dumbbell size={15} strokeWidth={2} />
                </span>
                <span className="truncate text-label-primary font-medium text-text-secondary">
                  {routineDay.name}
                </span>
              </div>

              <button
                type="button"
                onClick={requestEndWorkout}
                className="shrink-0 rounded-full px-[8px] py-[4px] text-label-primary font-semibold text-tag-cardio transition-opacity hover:opacity-80"
              >
                End Workout
              </button>
            </div>

            <div className="flex flex-col gap-[4px]">
              <div className="flex items-center justify-between font-mono text-numeric-caption text-text-secondary">
                <span className="font-semibold text-text-primary">
                  Exercise {currentIndex + 1} of {items.length}
                </span>
                <span>{completionPercent}% Completed</span>
              </div>
              <span className="text-label-primary text-text-secondary">
                {completedExercises} of {items.length} exercises complete
              </span>
              <WorkoutProgressBar
                activeIndex={currentIndex}
                completedCount={completedExercises}
                totalCount={items.length}
              />
            </div>
          </section>

          <section className="flex flex-col gap-[8px]">
            <div className="flex items-center justify-between gap-[12px]">
              <h2 className="min-w-0 text-headline-lg font-bold text-text-primary">
                {currentItem.exercise.name}
              </h2>
              <Badge
                type={
                  currentItem.exercise.type === "STRENGTH"
                    ? "strength"
                    : "cardio"
                }
              >
                {currentItem.exercise.type === "STRENGTH"
                  ? "Strength"
                  : "Cardio"}
              </Badge>
            </div>
          </section>

          <ExerciseVideoPlayer youtubeVideoId={currentItem.exercise.youtubeVideoId} />

          <WaterReminder intervalMinutes={waterReminderIntervalMinutes} />

          {currentItem.exercise.type === "STRENGTH" ? (
            <StrengthSetLoggingRows
              key={currentItem.id}
              workoutSessionId={sessionId}
              routineDayItemId={currentItem.id}
              exerciseId={currentItem.exercise.id}
              persistedSetLogs={currentExerciseSetLogs}
              workoutStartedAt={workoutStartedAt}
              onSetLogged={handleSetLogged}
              onSetCompleted={handleSetCompleted}
            />
          ) : (
            <CardioLoggingBlock
              key={currentItem.id}
              workoutSessionId={sessionId}
              exerciseId={currentItem.exercise.id}
              onCompleted={handleSetCompleted}
            />
          )}

          {endError && (
            <p className="text-label-primary text-tag-cardio">{endError}</p>
          )}

              <RestTimer
                isActive={isRestActive}
                durationSeconds={REST_DURATION_SECONDS}
                onComplete={() => setIsRestActive(false)}
                onSkip={() => setIsRestActive(false)}
              />

          <Button
            variant="primary"
            onClick={() => {
              if (isRestActive) {
                window.alert("Wait for timer to 0:00 or click Skip to move to the next exercise");
                return;
              }
              goToNextExercise();
            }}
            disabled={!isCurrentExerciseComplete || isLastExercise}
            className="flex min-h-[52px] w-full items-center justify-center text-headline-sm"
          >
            Next Exercise
          </Button>

          {isLastExercise && isCurrentExerciseComplete && (
            <p className="text-center text-label-primary text-accent-action">
              All exercises complete. Tap End Workout to finish.
            </p>
          )}
        </div>
      </main>

      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-[16px]">
          <div className="w-full max-w-sm rounded-[16px] bg-surface p-[24px] shadow-level-3">
            <p className="mb-[16px] text-body-regular text-text-primary">
              End this workout session?
            </p>
            <div className="flex justify-end gap-[12px]">
              <Button variant="secondary" onClick={cancelEndWorkout}>
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={confirmEndWorkout}
                disabled={isEnding}
              >
                {isEnding ? "Ending..." : "End Workout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
