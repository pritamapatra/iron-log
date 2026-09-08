"use client";

import { useRouter } from "next/navigation";
import { Dumbbell, Clock, Play } from "lucide-react";
import Card from "@/components/Card";

interface RoutineItem {
  id: string;
  exercise: {
    name: string;
    type: "STRENGTH" | "CARDIO";
  };
}

interface TodayRoutineCardProps {
  routineDayId: string;
  routineDayName: string;
  items: RoutineItem[];
}

export function TodayRoutineCard({
  routineDayId,
  routineDayName,
  items,
}: TodayRoutineCardProps) {
  const router = useRouter();

  const strengthCount = items.filter((i) => i.exercise.type === "STRENGTH").length;
  const cardioCount = items.length - strengthCount;
  const primaryType = cardioCount > strengthCount ? "CARDIO" : "STRENGTH";
  const estimatedMinutes = items.length * 8;

  return (
    <Card className="relative flex flex-col gap-4 p-5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-label-caps font-semibold uppercase tracking-wider text-text-secondary">
          Next in Rotation
        </span>
        {items.length > 0 && (
          <span
            className={
              primaryType === "STRENGTH"
                ? "rounded-full bg-tag-strength/10 px-2 py-1 text-label-caps font-semibold text-tag-strength"
                : "rounded-full bg-tag-cardio/10 px-2 py-1 text-label-caps font-semibold text-tag-cardio"
            }
          >
            {primaryType}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-headline-md font-semibold tracking-tight text-text-primary">
          {routineDayName}
        </h3>
        <div className="mt-1 flex items-center gap-2 font-mono text-numeric-caption text-text-secondary">
          <span className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            {items.length} exercises
          </span>
          {items.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Est. {estimatedMinutes} min
              </span>
            </>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 4).map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-surface-container-low px-3 py-1 text-label-primary text-text-primary"
            >
              {item.exercise.name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push(`/workout/start/${routineDayId}`)}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent-action text-headline-sm font-semibold text-white shadow-md transition-all active:scale-[0.98] active:bg-secondary"
      >
        <Play className="h-5 w-5" fill="currentColor" />
        Start Workout
      </button>
    </Card>
  );
}