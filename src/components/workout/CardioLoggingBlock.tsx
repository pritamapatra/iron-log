"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/Button";

interface CardioLoggingBlockProps {
  workoutSessionId: string;
  exerciseId: string;
  plannedDurationMin: number | null;
  plannedDistanceKm: number | null;
  plannedInclinePct: number | null;
  plannedSpeedKmh: number | null;
  onCompleted?: () => void;
}

export function CardioLoggingBlock({
  workoutSessionId,
  exerciseId,
  plannedDurationMin,
  plannedDistanceKm,
  plannedInclinePct,
  plannedSpeedKmh,
  onCompleted,
}: CardioLoggingBlockProps) {
  const [durationMin, setDurationMin] = useState<number | null>(
    plannedDurationMin
  );
  const [distanceKm, setDistanceKm] = useState<number | null>(
    plannedDistanceKm
  );
  const [inclinePct, setInclinePct] = useState<number | null>(
    plannedInclinePct
  );
  const [speedKmh, setSpeedKmh] = useState<number | null>(plannedSpeedKmh);
  const [calories, setCalories] = useState<number | null>(null);
  const [avgHeartRate, setAvgHeartRate] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (isCompleted) return;

    setError(null);

    try {
      const res = await fetch("/api/set-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId,
          exerciseId,
          actualDurationMin: durationMin,
          actualDistanceKm: distanceKm,
          actualInclinePct: inclinePct,
          actualSpeedKmh: speedKmh,
          actualCalories: calories,
          actualAvgHeartRate: avgHeartRate,
        }),
      });

      if (!res.ok) throw new Error("Failed to log cardio block");

      setIsCompleted(true);
      onCompleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-[#E5E5EA] bg-[#FAFAFA] px-3 py-2 text-sm tabular-nums text-[#1D1D1F] outline-none";
  const labelClasses = "text-xs text-[#6E6E73]";

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Duration (min)</span>
          <input
            type="number"
            value={durationMin ?? ""}
            onChange={(e) =>
              setDurationMin(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Distance (km)</span>
          <input
            type="number"
            value={distanceKm ?? ""}
            onChange={(e) =>
              setDistanceKm(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Incline (%)</span>
          <input
            type="number"
            value={inclinePct ?? ""}
            onChange={(e) =>
              setInclinePct(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Speed (km/h)</span>
          <input
            type="number"
            value={speedKmh ?? ""}
            onChange={(e) =>
              setSpeedKmh(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Calories (optional)</span>
          <input
            type="number"
            value={calories ?? ""}
            onChange={(e) =>
              setCalories(e.target.value === "" ? null : Number(e.target.value))
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Avg heart rate (optional)</span>
          <input
            type="number"
            value={avgHeartRate ?? ""}
            onChange={(e) =>
              setAvgHeartRate(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            disabled={isCompleted}
            className={inputClasses}
          />
        </label>
      </div>

      {error && <p className="text-xs text-[#FF453A]">{error}</p>}

      <Button
        variant={isCompleted ? "secondary" : "primary"}
        onClick={handleComplete}
        disabled={isCompleted}
        className="flex items-center justify-center gap-2"
      >
        <Check size={16} />
        {isCompleted ? "Completed" : "Mark Complete"}
      </Button>
    </div>
  );
}