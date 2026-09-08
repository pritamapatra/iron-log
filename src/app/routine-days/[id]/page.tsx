"use client";

import { RoutineDayItemRow } from "@/components/routine-days/RoutineDayItemRow";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Check, Pencil } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { AddExerciseSheet } from "@/components/exercises/AddExerciseSheet";
import { Plus } from "lucide-react";

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

interface RoutineDay {
  id: string;
  name: string;
  sequencePosition: number;
  items: RoutineDayItem[];
}

interface Exercise {
  id: string;
  name: string;
  type: "STRENGTH" | "CARDIO";
  muscleGroup: string;
  youtubeVideoId: string;
}

export default function RoutineDayBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [day, setDay] = useState<RoutineDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    fetch(`/api/routine-days/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load routine day");
        return res.json();
      })
      .then((data: RoutineDay) => {
        if (!isCancelled) {
          setDay(data);
          setTitleDraft(data.name);
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) setError(err.message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleSaveTitle = useCallback(async () => {
    if (!titleDraft.trim() || !day) return;

    try {
      const res = await fetch(`/api/routine-days/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: titleDraft.trim() }),
      });

      if (!res.ok) throw new Error("Failed to rename routine day");

      const updated: RoutineDay = await res.json();
      setDay(updated);
      setIsEditingTitle(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [id, titleDraft, day]);

  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleItemUpdate = useCallback(
  (itemId: string, fields: Partial<RoutineDayItem>) => {
    if (!day) return;
    setDay({
      ...day,
      items: day.items.map((item) =>
        item.id === itemId ? { ...item, ...fields } : item
      ),
    });
  },
  [day]
);

const handleDragEnd = useCallback(
  async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !day) return;

    const oldIndex = day.items.findIndex((item) => item.id === active.id);
    const newIndex = day.items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(day.items, oldIndex, newIndex).map(
      (item, index) => ({ ...item, order: index })
    );

    setDay({ ...day, items: reordered });

    try {
      const res = await fetch("/api/routine-day-items/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((item) => ({ id: item.id, order: item.order })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save new order");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  },
  [day]
);

const handleSelectExercise = useCallback(
  async (exercise: Exercise) => {
    if (!day) return;

    try {
      const res = await fetch("/api/routine-day-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineDayId: day.id,
          exerciseId: exercise.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to add exercise");

      const newItem: RoutineDayItem = await res.json();

      setDay({
        ...day,
        items: [...day.items, newItem],
      });
      setIsSheetOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  },
  [day]
);

const handleDeleteItem = useCallback(
  async (itemId: string) => {
    if (!day) return;

    try {
      const res = await fetch("/api/routine-day-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      if (!res.ok) throw new Error("Failed to remove exercise");

      setDay({
        ...day,
        items: day.items.filter((item) => item.id !== itemId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  },
  [day]
);

const handleSave = useCallback(async () => {
  if (!day) return;

  setIsSaving(true);
  setSaveError(null);

  try {
    const res = await fetch("/api/routine-day-items/planned-targets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: day.items.map((item) => ({
          id: item.id,
          plannedSets: item.plannedSets,
          plannedReps: item.plannedReps,
          plannedWeightKg: item.plannedWeightKg,
          plannedDurationMin: item.plannedDurationMin,
          plannedDistanceKm: item.plannedDistanceKm,
          plannedInclinePct: item.plannedInclinePct,
          plannedSpeedKmh: item.plannedSpeedKmh,
        })),
      }),
    });

    if (!res.ok) throw new Error("Failed to save planned targets");
  } catch (err) {
    setSaveError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setIsSaving(false);
  }
}, [day]);


  if (isLoading) {
    return <div className="p-[16px] text-label-primary text-text-secondary">Loading...</div>;
  }

  if (error || !day) {
    return (
      <div className="p-[16px] text-label-primary text-tag-cardio">
        {error || "Routine day not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 bg-background/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex h-[56px] items-center gap-[12px] px-[16px]">
        <button
          onClick={() => router.push("/")}
          aria-label="Back"
          className="-ml-[8px] flex h-[44px] w-[44px] items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-container-low"
        >
          <ChevronLeft size={24} />
        </button>

        {isEditingTitle ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              autoFocus
              className="h-[44px] flex-1 border-b border-divider bg-transparent text-headline-md font-semibold text-text-primary outline-none focus:border-text-primary"
            />
            <button
              onClick={handleSaveTitle}
              aria-label="Save title"
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-accent-action transition-colors hover:bg-surface-container-low"
            >
              <Check size={22} />
            </button>
          </div>
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 cursor-pointer text-headline-md font-semibold text-text-primary"
          >
            {day.name}
          </h1>
        )}
        </div>
      </header>

      <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-[16px] pb-[112px] pt-[80px]">
        <section className="mb-[16px] rounded-[16px] border border-black/[0.04] bg-surface p-[16px] shadow-level-1">
          <div className="flex min-w-0 items-start justify-between gap-[12px]">
            <div className="min-w-0">
              <p className="text-headline-md font-semibold text-text-primary">
                {day.name}
              </p>
              <div className="mt-[8px] flex flex-wrap items-center gap-[8px] text-label-primary text-text-secondary">
                <span className="flex items-center gap-[4px]">
                  <span className="font-mono text-numeric-caption text-tag-strength">
                    {day.items.length}
                  </span>
                  {day.items.length === 1 ? "exercise" : "exercises"}
                </span>
                <span className="text-text-secondary/40">•</span>
                <span>Est. {Math.max(15, day.items.length * 12)} min</span>
                <span className="rounded-full bg-surface-container px-[8px] py-[2px] text-label-caps font-semibold uppercase tracking-[0.06em] text-accent-action">
                  Active cycle
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-container-low"
              aria-label="Edit routine title"
            >
              <Pencil size={18} />
            </button>
          </div>
        </section>

      <DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={day.items?.map((item) => item.id) ?? []}
    strategy={verticalListSortingStrategy}
  >
    <div className="flex flex-col gap-[12px]">
      {day.items?.map((item) => (
        <RoutineDayItemRow
          key={item.id}
          item={item}
          onUpdate={handleItemUpdate}
          onDelete={handleDeleteItem}
        />
      ))}
    </div>
  </SortableContext>
</DndContext>
<button
  type="button"
  onClick={() => setIsSheetOpen(true)}
  className="mt-[24px] flex h-[50px] w-full items-center justify-center gap-[8px] rounded-full border border-divider bg-surface text-body-medium font-medium text-text-primary shadow-level-1 transition-colors hover:bg-surface-container-low"
>
  <Plus size={18} />
  Add Exercise
</button>

<AddExerciseSheet
  isOpen={isSheetOpen}
  onClose={() => setIsSheetOpen(false)}
  onSelect={handleSelectExercise}
/>

<div className="fixed inset-x-0 bottom-0 z-50 border-t border-divider bg-surface/95 px-[16px] pb-[16px] pt-[12px] backdrop-blur-xl">
  {saveError && (
    <p className="mb-[8px] text-center text-label-primary text-tag-cardio">{saveError}</p>
  )}
  <button
    type="button"
    onClick={handleSave}
    disabled={isSaving}
    className="mx-auto flex h-[50px] w-full max-w-[688px] items-center justify-center rounded-full bg-accent-action text-headline-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
  >
    {isSaving ? "Saving..." : "Save"}
  </button>
</div>
      </main>
    </div>
  );
}