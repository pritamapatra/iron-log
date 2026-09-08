"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { TodayRoutineCard } from "@/components/dashboard/TodayRoutineCard";
import { AllRoutinesList } from "@/components/dashboard/AllRoutinesList";
import { NewDayButton } from "@/components/dashboard/NewDayButton";

interface TodayRoutine {
  id: string;
  name: string;
  items: {
    id: string;
    exercise: {
      name: string;
      type: "STRENGTH" | "CARDIO";
    };
  }[];
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  weekDots: boolean[];
  trendPercent: number | null;
}

interface RoutineDaySummary {
  id: string;
  name: string;
  itemCount: number;
  primaryType: "STRENGTH" | "CARDIO" | null;
}

export default function DashboardPage() {
  const [today, setToday] = useState<TodayRoutine | null>(null);
  const [hasNoRoutineDays, setHasNoRoutineDays] = useState(false);
  const [streak, setStreak] = useState<Streak>({
  currentStreak: 0,
  longestStreak: 0,
  weekDots: [false, false, false, false, false, false, false],
  trendPercent: null,
});
  const [routineDays, setRoutineDays] = useState<RoutineDaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      try {
        const [todayRes, streakRes, routineDaysRes] = await Promise.all([
          fetch("/api/dashboard/today"),
          fetch("/api/streak", { cache: "no-store" }),
          fetch("/api/routine-days"),
        ]);

        if (isCancelled) return;

        if (todayRes.status === 404) {
          setHasNoRoutineDays(true);
        } else if (todayRes.ok) {
          const todayData = await todayRes.json();
          setToday(todayData);
        } else {
          throw new Error("Failed to load today's routine");
        }

        if (!streakRes.ok) throw new Error("Failed to load streak");
        const streakData: Streak = await streakRes.json();
        if (!isCancelled) setStreak(streakData);

        if (!routineDaysRes.ok) throw new Error("Failed to load routine days");
        const routineDaysData: RoutineDaySummary[] = await routineDaysRes.json();
        if (!isCancelled) setRoutineDays(routineDaysData);
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading) {
    return <div className="p-4 text-sm text-[#6E6E73]">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-[#FF453A]">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="flex flex-col gap-[20px] px-[16px] pb-[160px] pt-[12px]">
  <div className="flex items-baseline justify-between pb-[4px]">
    <div>
      <h1 className="text-headline-lg font-bold tracking-tight text-text-primary">
        Iron Log
      </h1>
      <p className="mt-[2px] text-label-primary text-text-secondary">
        High-focus biometric tracking
      </p>
    </div>

    <span className="inline-flex items-center gap-[4px] rounded-full bg-surface-container-high px-[8px] py-[4px] text-label-caps font-semibold tracking-[0.06em] text-text-secondary">
      <span className="h-[6px] w-[6px] rounded-full bg-accent-action" />
      SYNCED
    </span>
  </div>

        <StreakBadge data={streak} />

        {hasNoRoutineDays ? (
          <p className="text-sm text-[#6E6E73]">
            No routine days yet. Create your first one below.
          </p>
        ) : (
          today && (
            <TodayRoutineCard
  routineDayId={today.id}
  routineDayName={today.name}
  items={today.items}
/>
          )
        )}

        <AllRoutinesList routineDays={routineDays} activeRoutineDayId={today?.id} />
      </div>

      <NewDayButton />
      <BottomNav />
    </div>
  );
}