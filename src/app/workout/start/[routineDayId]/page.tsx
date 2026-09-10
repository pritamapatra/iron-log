"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Droplets } from "lucide-react";

const WATER_REMINDER_INTERVAL_KEY = "iron-log-water-reminder-interval-minutes";

type StartChoice = "checking" | "ask" | "starting";

export default function StartWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const routineDayId = params.routineDayId as string;

  const [choice, setChoice] = useState<StartChoice>("checking");
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(
      WATER_REMINDER_INTERVAL_KEY
    );
    const savedInterval = savedValue ? Number(savedValue) : null;

    if (savedInterval && savedInterval > 0) {
      startWorkout(Math.floor(savedInterval));
      return;
    }

    setChoice("ask");
  }, []);

  async function startWorkout(waterReminderIntervalMinutes: number | null) {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    setChoice("starting");
    setError(null);

    try {
      const res = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineDayId,
          waterReminderIntervalMinutes,
        }),
      });

      if (!res.ok) throw new Error("Failed to start workout session");

      const session = await res.json();
      router.replace(`/workout/${session.id}`);
    } catch (err) {
      hasStartedRef.current = false;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setChoice("ask");
    }
  }

  const handleStartWithReminder = () => {
    const parsedInterval = Number(intervalMinutes);

    if (!Number.isFinite(parsedInterval) || parsedInterval <= 0) {
      setError("Enter a valid number of minutes");
      return;
    }

    const wholeMinutes = Math.floor(parsedInterval);

    window.localStorage.setItem(
      WATER_REMINDER_INTERVAL_KEY,
      String(wholeMinutes)
    );

    startWorkout(wholeMinutes);
  };

  const handleSkip = () => {
    startWorkout(null);
  };

  if (choice === "checking" || choice === "starting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <p className="text-sm text-[#6E6E73]">
          {choice === "checking" ? "Preparing workout..." : "Starting workout..."}
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center bg-[#FAFAFA] px-[16px]">
      <section className="w-full rounded-[20px] border border-black/[0.04] bg-surface p-[20px] shadow-level-1">
        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-accent-alert/10 text-accent-alert">
          <Droplets size={22} strokeWidth={2} />
        </div>

        <h1 className="mt-[16px] text-headline-lg font-bold tracking-tight text-text-primary">
          Set a water reminder?
        </h1>

        <p className="mt-[6px] text-body-medium text-text-secondary">
          We’ll show a small reminder while your workout is active.
        </p>

        <label className="mt-[20px] flex items-center rounded-[10px] border border-divider bg-background px-[12px]">
          <span className="whitespace-nowrap text-label-primary text-text-secondary">
            Every
          </span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={intervalMinutes}
            onChange={(event) => {
              setIntervalMinutes(event.target.value);
              setError(null);
            }}
            aria-label="Water reminder interval in minutes"
            placeholder="20"
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-[8px] py-[12px] text-right font-mono text-numeric-data text-text-primary outline-none placeholder:text-text-secondary/50"
          />
          <span className="whitespace-nowrap text-label-primary text-text-secondary">
            min
          </span>
        </label>

        {error && (
          <p className="mt-[8px] text-label-primary text-[#FF453A]">{error}</p>
        )}

        <button
          type="button"
          onClick={handleStartWithReminder}
          className="mt-[16px] h-[48px] w-full rounded-full bg-accent-action px-[18px] text-body-medium font-semibold text-white transition-opacity hover:opacity-85"
        >
          Start with reminder
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-[8px] h-[44px] w-full rounded-full text-body-medium font-semibold text-text-secondary transition-colors hover:bg-surface-container-low hover:text-text-primary"
        >
          Skip for this workout
        </button>
      </section>
    </main>
  );
}
