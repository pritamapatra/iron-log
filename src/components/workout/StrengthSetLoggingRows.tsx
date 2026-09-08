"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface SetRowState {
  weightKg: number | null;
  reps: number | null;
  isCompleted: boolean;
}

export interface PersistedStrengthSetLog {
  routineDayItemId: string | null;
  exerciseId: string;
  setNumber: number | null;
  actualWeightKg: number | null;
  actualReps: number | null;
}

interface StrengthSetLoggingRowsProps {
  workoutSessionId: string;
  routineDayItemId: string;
  exerciseId: string;
  plannedSets: number;
  plannedWeightKg: number | null;
  plannedReps: number | null;
  persistedSetLogs?: PersistedStrengthSetLog[];
  onSetCompleted?: () => void;
  onSetLogged?: (setLog: PersistedStrengthSetLog) => void;
}

export function StrengthSetLoggingRows({
  workoutSessionId,
  routineDayItemId,
  exerciseId,
  plannedSets,
  plannedWeightKg,
  plannedReps,
  persistedSetLogs = [],
  onSetCompleted,
  onSetLogged,
}: StrengthSetLoggingRowsProps) {
  const totalSets = plannedSets > 0 ? plannedSets : 1;

  const [rows, setRows] = useState<SetRowState[]>(
    Array.from({ length: totalSets }, (_, index) => {
      const persisted = persistedSetLogs.find(
        (setLog) => setLog.setNumber === index + 1
      );

      return {
        weightKg: persisted?.actualWeightKg ?? plannedWeightKg,
        reps: persisted?.actualReps ?? plannedReps,
        isCompleted: Boolean(persisted),
      };
    })
  );

  const updateRow = (index: number, fields: Partial<SetRowState>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...fields } : row))
    );
  };

  const handleComplete = async (index: number) => {
    const row = rows[index];
    if (row.isCompleted) return;

    try {
      const res = await fetch("/api/set-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId,
          routineDayItemId,
          exerciseId,
          setNumber: index + 1,
          actualWeightKg: row.weightKg,
          actualReps: row.reps,
        }),
      });

      if (!res.ok) throw new Error("Failed to log set");

      const setLog: PersistedStrengthSetLog = await res.json();

      updateRow(index, { isCompleted: true });
      onSetLogged?.(setLog);
      onSetCompleted?.();
    } catch (err) {
      console.error("Failed to log set:", err);
    }
  };

  const inputClasses =
    "h-[44px] w-full rounded-control border border-divider bg-surface px-[12px] text-right font-mono text-numeric-data text-text-primary outline-none focus:border-[1.5px] focus:border-text-primary disabled:bg-surface-container-low disabled:text-text-secondary";

  return (
    <section className="overflow-hidden rounded-[16px] border border-black/[0.04] bg-surface shadow-level-1">
      <div className="flex items-center justify-between gap-[12px] border-b border-divider px-[16px] py-[16px]">
        <div>
          <h3 className="text-headline-sm font-semibold text-text-primary">
            Log your sets
          </h3>
          <p className="mt-[4px] text-label-primary text-text-secondary">
            Enter your actual weight and reps
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-tag-strength/10 px-[10px] py-[4px] font-mono text-numeric-caption text-tag-strength">
          {totalSets} sets
        </span>
      </div>

      <div className="flex items-center justify-between gap-[12px] border-b border-divider px-[16px] py-[16px]">
        <div>
          <h3 className="text-headline-sm font-semibold text-text-primary">
            Log your sets
          </h3>
          <p className="mt-[4px] text-label-primary text-text-secondary">
            Enter your actual weight and reps
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-tag-strength/10 px-[10px] py-[4px] font-mono text-numeric-caption text-tag-strength">
          {totalSets} sets
        </span>
      </div>

      <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_28px] items-center gap-[8px] border-b border-divider px-[16px] py-[12px]">
        <span className="text-label-caps font-semibold uppercase text-text-secondary">
          Set
        </span>
        <span className="text-label-caps font-semibold uppercase text-text-secondary">
          Weight
        </span>
        <span className="text-label-caps font-semibold uppercase text-text-secondary">
          Reps
        </span>
        <span className="text-label-caps font-semibold uppercase text-text-secondary">
          Done
        </span>
      </div>

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_28px] items-center gap-[8px] border-b border-divider px-[16px] py-[12px] last:border-b-0"
        >
          <span className="font-mono text-numeric-data text-text-primary">
            {index + 1}
          </span>

          <label className="relative block">
            <input
              type="number"
              value={row.weightKg ?? ""}
              onChange={(e) =>
                updateRow(index, {
                  weightKg: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              disabled={row.isCompleted}
              aria-label={`Set ${index + 1} weight in kilograms`}
              className={`${inputClasses} pr-[28px]`}
            />
            <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 bg-surface pl-[3px] text-label-primary text-text-secondary">
              kg
            </span>
          </label>

          <label className="relative block">
            <input
              type="number"
              value={row.reps ?? ""}
              onChange={(e) =>
                updateRow(index, {
                  reps: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              disabled={row.isCompleted}
              aria-label={`Set ${index + 1} repetitions`}
              className={`${inputClasses} pr-[36px]`}
            />
            <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 bg-surface pl-[3px] text-label-primary text-text-secondary">
              reps
            </span>
          </label>

          <button
            type="button"
            onClick={() => handleComplete(index)}
            disabled={row.isCompleted}
            aria-label={`Complete set ${index + 1}`}
            className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border transition-colors disabled:cursor-default ${
              row.isCompleted
                ? "border-accent-action bg-accent-action text-white"
                : "border-divider bg-surface text-transparent hover:border-accent-action"
            }`}
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </section>
  );
}
