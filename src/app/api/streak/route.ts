import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();
  return Math.round((dateB - dateA) / msPerDay);
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function GET() {
  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { endedAt: { not: null } },
      select: { endedAt: true },
      orderBy: { endedAt: "asc" },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        weekDots: [false, false, false, false, false, false, false],
        trendPercent: null,
      });
    }

    const uniqueDateKeys = Array.from(
      new Set(sessions.map((s) => toDateKey(s.endedAt as Date)))
    ).sort();
    const uniqueDateKeySet = new Set(uniqueDateKeys);

    let longestStreak = 1;
    let runningStreak = 1;

    for (let i = 1; i < uniqueDateKeys.length; i++) {
      const gap = daysBetween(uniqueDateKeys[i - 1], uniqueDateKeys[i]);
      if (gap === 1) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 1;
      }
    }

    const now = new Date();
    const todayKey = toDateKey(now);
    const lastDateKey = uniqueDateKeys[uniqueDateKeys.length - 1];
    const gapFromToday = daysBetween(lastDateKey, todayKey);

    let currentStreak = 0;

    if (gapFromToday <= 1) {
      currentStreak = 1;
      for (let i = uniqueDateKeys.length - 1; i > 0; i--) {
        const gap = daysBetween(uniqueDateKeys[i - 1], uniqueDateKeys[i]);
        if (gap === 1) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }

    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const thisMonday = startOfWeekMonday(now);
    const weekDots = dayLabels.map((_, index) => {
      const dateKey = toDateKey(addDays(thisMonday, index));
      return uniqueDateKeySet.has(dateKey);
    });

    const todayIndexInWeek = (() => {
      const day = now.getUTCDay();
      return day === 0 ? 6 : day - 1;
    })();

    const lastMonday = addDays(thisMonday, -7);

    let thisWeekCount = 0;
    let lastWeekComparableCount = 0;

    for (let i = 0; i <= todayIndexInWeek; i++) {
      const thisWeekKey = toDateKey(addDays(thisMonday, i));
      if (uniqueDateKeySet.has(thisWeekKey)) thisWeekCount += 1;

      const lastWeekKey = toDateKey(addDays(lastMonday, i));
      if (uniqueDateKeySet.has(lastWeekKey)) lastWeekComparableCount += 1;
    }

    let trendPercent: number | null = null;
    if (lastWeekComparableCount > 0) {
      trendPercent = Math.round(
        ((thisWeekCount - lastWeekComparableCount) / lastWeekComparableCount) * 100
      );
    }

    return NextResponse.json({
      currentStreak,
      longestStreak,
      weekDots,
      trendPercent,
    });
  } catch (err) {
    console.error("Failed to compute streak:", err);
    return NextResponse.json(
      { error: "Failed to compute streak" },
      { status: 500 }
    );
  }
}
