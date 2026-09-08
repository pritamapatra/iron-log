"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Play } from "lucide-react";
import Card from "@/components/Card";

interface RoutineDaySummary {
  id: string;
  name: string;
  itemCount: number;
  primaryType: "STRENGTH" | "CARDIO" | null;
}

interface AllRoutinesListProps {
  routineDays: RoutineDaySummary[];
  activeRoutineDayId?: string;
}

export function AllRoutinesList({
  routineDays,
  activeRoutineDayId,
}: AllRoutinesListProps) {
  const router = useRouter();

  if (routineDays.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No routine days yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-headline-md font-semibold tracking-tight text-text-primary">
          All Routines
        </h3>
        <span className="font-mono text-numeric-caption text-text-secondary">
          {routineDays.length} routines
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {routineDays.map((day) => {
          const isActive = day.id === activeRoutineDayId;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => router.push(`/routine-days/${day.id}`)}
              className="text-left"
            >
              <Card
                className={
                  isActive
                    ? "flex items-center justify-between bg-gradient-to-r from-white to-surface-container-low shadow-sm active:scale-[0.99]"
                    : "flex items-center justify-between shadow-sm active:scale-[0.99]"
                }
              >
                <div className="flex min-w-0 flex-col gap-1 pr-3">
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-action" />
                    )}
                    <h4 className="truncate text-headline-sm font-semibold text-text-primary">
                      {day.name}
                    </h4>
                    {day.primaryType && (
                      <span
                        className={
                          day.primaryType === "STRENGTH"
                            ? "flex-shrink-0 rounded-full bg-tag-strength/10 px-2 py-0.5 text-label-caps font-semibold text-tag-strength"
                            : "flex-shrink-0 rounded-full bg-tag-cardio/10 px-2 py-0.5 text-label-caps font-semibold text-tag-cardio"
                        }
                      >
                        {day.primaryType}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-label-primary text-text-secondary">
                    {isActive && "Current active • "}
                    {day.itemCount} {day.itemCount === 1 ? "exercise" : "exercises"}
                  </p>
                </div>

                <div
                  className={
                    isActive
                      ? "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-action/10 text-accent-action"
                      : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-low text-text-secondary"
                  }
                >
                  {isActive ? (
                    <Play className="h-5 w-5" fill="currentColor" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}