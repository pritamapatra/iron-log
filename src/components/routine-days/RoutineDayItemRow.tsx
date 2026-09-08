import { useState } from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "@/components/Badge";

interface RoutineDayItem {
  id: string;
  order: number;
  plannedSets: number | null;
  plannedReps: number | null;
  plannedWeightKg: number | null;
  plannedDurationMin: number | null;
  plannedDistanceKm: number | null;
  plannedInclinePct: number | null;
  plannedSpeedKmh: number | null;
  exercise: {
    id: string;
    name: string;
    type: "STRENGTH" | "CARDIO";
    muscleGroup: string;
  };
}

type PlannedFieldUpdate = Partial<
  Pick<
    RoutineDayItem,
    | "plannedSets"
    | "plannedReps"
    | "plannedWeightKg"
    | "plannedDurationMin"
    | "plannedDistanceKm"
    | "plannedInclinePct"
    | "plannedSpeedKmh"
  >
>;

interface RoutineDayItemRowProps {
  item: RoutineDayItem;
  onUpdate: (itemId: string, fields: PlannedFieldUpdate) => void;
  onDelete: (itemId: string) => void;
}

interface SetTarget {
  weightKg: number;
  reps: number;
}

function formatPlannedTarget(item: RoutineDayItem): string {
  if (item.exercise.type === "STRENGTH") {
    const parts: string[] = [];
    if (item.plannedSets) parts.push(`${item.plannedSets} sets`);
    if (item.plannedReps) parts.push(`${item.plannedReps} reps`);
    if (item.plannedWeightKg) parts.push(`${item.plannedWeightKg} kg`);
    return parts.length > 0 ? parts.join(" x ") : "No target set";
  }

  const parts: string[] = [];
  if (item.plannedDurationMin) parts.push(`${item.plannedDurationMin} min`);
  if (item.plannedDistanceKm) parts.push(`${item.plannedDistanceKm} km`);
  if (item.plannedInclinePct) parts.push(`${item.plannedInclinePct}% incline`);
  if (item.plannedSpeedKmh) parts.push(`${item.plannedSpeedKmh} km/h`);
  return parts.length > 0 ? parts.join(", ") : "No target set";
}

function parseNumberInput(value: string): number | null {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function RoutineDayItemRow({
  item,
  onUpdate,
  onDelete,
}: RoutineDayItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [setTargets, setSetTargets] = useState<SetTarget[]>(() =>
    Array.from({ length: Math.max(item.plannedSets ?? 1, 1) }, () => ({
      weightKg: item.plannedWeightKg ?? 0,
      reps: item.plannedReps ?? 0,
    })),
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const inputClasses =
    "h-[44px] w-full rounded-[10px] border border-divider bg-surface px-[12px] font-mono text-numeric-data text-text-primary outline-none transition-colors focus:border-[1.5px] focus:border-text-primary";
  const labelClasses = "text-label-primary text-text-secondary";

  const updateSetTarget = (
    index: number,
    field: keyof SetTarget,
    value: number,
  ) => {
    setSetTargets((current) =>
      current.map((target, targetIndex) =>
        targetIndex === index ? { ...target, [field]: Math.max(0, value) } : target,
      ),
    );
  };

  const addSet = () => {
    const lastSet = setTargets.at(-1) ?? {
      weightKg: item.plannedWeightKg ?? 0,
      reps: item.plannedReps ?? 0,
    };
    const nextTargets = [...setTargets, { ...lastSet }];
    setSetTargets(nextTargets);
    onUpdate(item.id, { plannedSets: nextTargets.length });
  };

  const deleteSet = (index: number) => {
    if (setTargets.length === 1) return;
    const nextTargets = setTargets.filter((_, targetIndex) => targetIndex !== index);
    setSetTargets(nextTargets);
    onUpdate(item.id, { plannedSets: nextTargets.length });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-[16px] border border-black/[0.04] bg-surface shadow-level-1"
    >
      <div className="flex min-h-[76px] items-center justify-between gap-[12px] px-[16px] py-[16px]">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 flex-col items-start gap-[4px] text-left"
        >
          <div className="flex min-w-0 items-center gap-[8px]">
            <span className="truncate text-headline-sm font-semibold text-text-primary">
              {item.exercise.name}
            </span>
            <Badge type={item.exercise.type === "STRENGTH" ? "strength" : "cardio"}>
              {item.exercise.type === "STRENGTH" ? "Strength" : "Cardio"}
            </Badge>
          </div>
          {isExpanded ? (
            <span className="flex items-center gap-[4px] text-label-primary text-accent-action">
              <span className="h-[6px] w-[6px] rounded-full bg-accent-action" />
              Editing targets
            </span>
          ) : (
            <span className="truncate font-mono text-numeric-caption text-text-secondary">
              {formatPlannedTarget(item)}
            </span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-[4px]">
          <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-text-secondary">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.exercise.name}`}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-error-container/30 hover:text-tag-cardio"
          >
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            aria-label="Drag to reorder"
            className="flex h-[44px] w-[44px] cursor-grab touch-none items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-container-low active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-[12px] border-t border-divider px-[16px] py-[16px]">
          {item.exercise.type === "STRENGTH" ? (
            <div className="col-span-2">
              <div className="mb-[8px] grid grid-cols-[36px_1fr_1fr_28px] gap-[8px] px-[8px] text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span />
              </div>

              {setTargets.map((setTarget, index) => (
                <div
                  key={index}
                  className="mb-[8px] grid grid-cols-[36px_1fr_1fr_28px] items-center gap-[8px] rounded-[10px] bg-surface-container-low p-[8px]"
                >
                  <span className="flex h-[28px] w-[28px] items-center justify-center justify-self-center rounded-full bg-surface text-[12px] font-bold tabular-nums text-text-primary">
                    {index + 1}
                  </span>

                  <div className="flex h-[36px] items-center justify-between rounded-[8px] bg-surface px-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <button
                      type="button"
                      aria-label={`Decrease weight for set ${index + 1}`}
                      onClick={() => updateSetTarget(index, "weightKg", setTarget.weightKg - 2.5)}
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-surface-container-low text-text-primary active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={setTarget.weightKg || ""}
                      onChange={(e) =>
                        updateSetTarget(
                          index,
                          "weightKg",
                          parseNumberInput(e.target.value) ?? 0,
                        )
                      }
                      className="min-w-0 w-full bg-transparent text-center font-mono text-[14px] font-medium tabular-nums text-text-primary outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Increase weight for set ${index + 1}`}
                      onClick={() => updateSetTarget(index, "weightKg", setTarget.weightKg + 2.5)}
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-surface-container-low text-text-primary active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex h-[36px] items-center justify-between rounded-[8px] bg-surface px-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <button
                      type="button"
                      aria-label={`Decrease reps for set ${index + 1}`}
                      onClick={() => updateSetTarget(index, "reps", setTarget.reps - 1)}
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-surface-container-low text-text-primary active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={setTarget.reps || ""}
                      onChange={(e) =>
                        updateSetTarget(
                          index,
                          "reps",
                          parseNumberInput(e.target.value) ?? 0,
                        )
                      }
                      className="min-w-0 w-full bg-transparent text-center font-mono text-[14px] font-medium tabular-nums text-text-primary outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Increase reps for set ${index + 1}`}
                      onClick={() => updateSetTarget(index, "reps", setTarget.reps + 1)}
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-surface-container-low text-text-primary active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Delete set ${index + 1}`}
                    disabled={setTargets.length === 1}
                    onClick={() => deleteSet(index)}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-text-secondary transition-colors hover:bg-error-container/30 hover:text-tag-cardio disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSet}
                className="flex h-[44px] w-full items-center justify-center gap-[6px] rounded-[10px] bg-surface-container-low text-[14px] font-semibold text-text-primary transition-colors active:bg-surface-container"
              >
                <Plus size={18} />
                Add Set
              </button>
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-[4px]">
                <span className={labelClasses}>Duration (min)</span>
                <input
                  type="number"
                  value={item.plannedDurationMin ?? ""}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      plannedDurationMin: parseNumberInput(e.target.value),
                    })
                  }
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-[4px]">
                <span className={labelClasses}>Distance (km)</span>
                <input
                  type="number"
                  value={item.plannedDistanceKm ?? ""}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      plannedDistanceKm: parseNumberInput(e.target.value),
                    })
                  }
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-[4px]">
                <span className={labelClasses}>Incline (%)</span>
                <input
                  type="number"
                  value={item.plannedInclinePct ?? ""}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      plannedInclinePct: parseNumberInput(e.target.value),
                    })
                  }
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-[4px]">
                <span className={labelClasses}>Speed (km/h)</span>
                <input
                  type="number"
                  value={item.plannedSpeedKmh ?? ""}
                  onChange={(e) =>
                    onUpdate(item.id, {
                      plannedSpeedKmh: parseNumberInput(e.target.value),
                    })
                  }
                  className={inputClasses}
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}
