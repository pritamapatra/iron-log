"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Check, Plus } from "lucide-react";
import Badge from "@/components/Badge";

interface Exercise {
  id: string;
  name: string;
  type: "STRENGTH" | "CARDIO";
  muscleGroup: string;
  youtubeVideoId: string;
}

interface AddExerciseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function AddExerciseSheet({ isOpen, onClose, onSelect }: AddExerciseSheetProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"STRENGTH" | "CARDIO">("STRENGTH");
  const [newMuscleGroup, setNewMuscleGroup] = useState("");
  const [newYoutubeVideoId, setNewYoutubeVideoId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STRENGTH" | "CARDIO">("ALL");
  const [muscleFilter, setMuscleFilter] = useState("ALL");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

  let isCancelled = false;
  setIsLoading(true);
  setError(null);

  const params = new URLSearchParams();
  if (debouncedQuery) params.set("search", debouncedQuery);

  fetch(`/api/exercises?${params.toString()}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load exercises");
      return res.json();
    })
    .then((data: Exercise[]) => {
      if (!isCancelled) setExercises(data);
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
}, [debouncedQuery, isOpen, refreshTrigger]);

  const handleClose = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedExercises([]);
    onClose();
  }, [onClose]);

  const toggleExerciseSelection = useCallback((exercise: Exercise) => {
    setSelectedExercises((current) =>
      current.some((item) => item.id === exercise.id)
        ? current.filter((item) => item.id !== exercise.id)
        : [...current, exercise],
    );
  }, []);

  const confirmSelection = useCallback(() => {
    selectedExercises.forEach(onSelect);
    handleClose();
  }, [handleClose, onSelect, selectedExercises]);

const handleCreateExercise = useCallback(async () => {
  if (!newName || !newMuscleGroup || !newYoutubeVideoId) {
    setError("All fields are required.");
    return;
  }

  setError(null);

  try {
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        type: newType,
        muscleGroup: newMuscleGroup,
        youtubeVideoId: newYoutubeVideoId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create exercise");
    }

    setNewName("");
    setNewType("STRENGTH");
    setNewMuscleGroup("");
    setNewYoutubeVideoId("");
    setIsCreatingNew(false);
    setRefreshTrigger((prev) => prev + 1);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  }
}, [newName, newType, newMuscleGroup, newYoutubeVideoId, query]);

  const muscleGroups = ["ALL", ...Array.from(new Set(exercises.map((exercise) => exercise.muscleGroup))).sort()];

  const filteredExercises = exercises.filter(
    (exercise) =>
      (typeFilter === "ALL" || exercise.type === typeFilter) &&
      (muscleFilter === "ALL" || exercise.muscleGroup.toLowerCase().includes(muscleFilter.toLowerCase())),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-[0px] backdrop-blur-[2px]">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.14)]">
        <div className="flex flex-col items-center pt-[12px]">
        <div className="h-[5px] w-[40px] rounded-full bg-[#D1D1D6]" />
        <div className="flex w-full items-center justify-between px-[20px] pb-[12px] pt-[12px]">
          <div className="flex min-w-0 items-center gap-[8px]">
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">Add Exercise</h2>
            <span className="rounded-full bg-[#F2F2F7] px-[8px] py-[3px] text-[12px] font-medium text-[#6E6E73]">
              {exercises.length} ready
            </span>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F2F2F7] text-[#6E6E73] hover:bg-[#E5E5EA]"
          >
            <X size={20} />
          </button>
        </div>
      </div>

        <div className="mx-[20px] mb-[12px] flex h-[44px] items-center gap-[8px] rounded-[12px] bg-[#F2F2F7] px-[12px]">
          <Search size={18} className="text-[#6E6E73]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="w-full bg-transparent text-base text-[#1D1D1F] outline-none placeholder:text-[#6E6E73]"
          />
        </div>

        <div className="mx-[20px] mb-[12px] grid grid-cols-3 gap-[4px] rounded-[12px] bg-[#F2F2F7] p-[4px]">
          {(["ALL", "STRENGTH", "CARDIO"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${
                typeFilter === type
                  ? "bg-white text-[#1D1D1F] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                  : "text-[#6E6E73]"
              }`}
            >
              {type === "ALL" ? "All Types" : type === "STRENGTH" ? "Strength" : "Cardio"}
            </button>
          ))}
        </div>

        <div className="mb-[12px] flex gap-[8px] overflow-x-auto px-[20px] pb-[2px]">
          {muscleGroups.map((muscleGroup) => (
            <button
              key={muscleGroup}
              type="button"
              onClick={() => setMuscleFilter(muscleGroup)}
              className={`h-[36px] shrink-0 rounded-full px-[14px] text-[13px] font-medium transition-colors ${
                muscleFilter === muscleGroup
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-[#F2F2F7] text-[#1D1D1F]"
              }`}
            >
              {muscleGroup === "ALL" ? "All" : muscleGroup}
            </button>
          ))}
        </div>

        <div className="mb-[12px] flex gap-[8px] overflow-x-auto px-[20px] pb-[2px]">
          {muscleGroups.map((muscleGroup) => (
            <button
              key={muscleGroup}
              type="button"
              onClick={() => setMuscleFilter(muscleGroup)}
              className={`h-[36px] shrink-0 rounded-full px-[14px] text-[13px] font-medium transition-colors ${
                muscleFilter === muscleGroup
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-[#F2F2F7] text-[#1D1D1F]"
              }`}
            >
              {muscleGroup === "ALL" ? "All" : muscleGroup}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[20px] pb-[16px]">
          {isLoading && (
            <div className="py-6 text-center text-sm text-[#6E6E73]">Loading...</div>
          )}

          {!isLoading && error && (
            <div className="py-6 text-center text-sm text-[#FF453A]">{error}</div>
          )}

          {!isLoading && !error && filteredExercises.length === 0 && (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-[24px] py-[32px] text-center">
              <div className="mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#F2F2F7] text-[22px] text-[#6E6E73]">
                <Search size={22} />
              </div>
              <p className="text-[17px] font-semibold text-[#1D1D1F]">No exercises found</p>
              <p className="mt-[4px] max-w-[260px] text-[13px] leading-[18px] text-[#6E6E73]">
                Try another search or filter, or create a custom exercise below.
              </p>
            </div>
          )}

          {!isLoading &&
            !error &&
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => toggleExerciseSelection(exercise)}
                className="mb-[8px] flex min-h-[76px] w-full items-center justify-between gap-[12px] rounded-[16px] border border-black/[0.04] bg-white p-[12px] text-left shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-colors active:bg-[#F2F2F7]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-[6px] flex items-center gap-[8px]">
                    <span className="truncate text-[17px] font-semibold tracking-[-0.005em] text-[#1D1D1F]">
                      {exercise.name}
                    </span>
                    <Badge type={exercise.type === "STRENGTH" ? "strength" : "cardio"}>
                      {exercise.type === "STRENGTH" ? "Strength" : "Cardio"}
                    </Badge>
                  </div>
                  <div className="truncate text-[13px] text-[#6E6E73]">{exercise.muscleGroup}</div>
                </div>
                <span
                  aria-hidden="true"
                  className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full ${
                    selectedExercises.some((item) => item.id === exercise.id)
                      ? "bg-[#34C759] text-white"
                      : "bg-[#F2F2F7] text-[#1D1D1F]"
                  }`}
                >
                  {selectedExercises.some((item) => item.id === exercise.id) ? (
                    <Check size={20} strokeWidth={2.5} />
                  ) : (
                    <Plus size={22} strokeWidth={2.25} />
                  )}
                </span>
              </button> 
            ))}
        </div>
        <div className="border-t border-black/[0.04] bg-white px-[20px] pb-[20px] pt-[12px]">
          <button
            type="button"
            onClick={confirmSelection}
            disabled={selectedExercises.length === 0}
            className="flex h-[50px] w-full items-center justify-center gap-[8px] rounded-full bg-[#34C759] px-[16px] text-[16px] font-semibold text-white shadow-[0_4px_12px_rgba(52,199,89,0.28)] transition-opacity disabled:bg-[#E5E5EA] disabled:text-[#6E6E73] disabled:shadow-none"
          >
            <Check size={20} strokeWidth={2.5} />
            {selectedExercises.length === 0
              ? "Select exercises"
              : `Add ${selectedExercises.length} exercise${selectedExercises.length === 1 ? "" : "s"}`}
          </button>
        </div>        <button
         onClick={() => setIsCreatingNew((prev) => !prev)}
         className="mx-[20px] mb-[8px] mt-[12px] h-[44px] rounded-full bg-[#F2F2F7] px-[16px] text-center text-sm font-medium text-[#1D1D1F]"
        >
        {isCreatingNew ? "Cancel" : "+ Create new exercise"}
        </button>
{isCreatingNew && (
  <div className="mx-[20px] mb-[20px] mt-[4px] flex flex-col gap-[12px] rounded-[16px] bg-[#FAFAFA] p-[16px]">
    <input
      type="text"
      value={newName}
      onChange={(e) => setNewName(e.target.value)}
      placeholder="Exercise name"
      className="h-[44px] rounded-[12px] border border-[#E5E5EA] bg-white px-[12px] text-base text-[#1D1D1F] outline-none placeholder:text-[#6E6E73] focus:border-[#1D1D1F]"
    />

    <div className="flex gap-2">
      <button
        onClick={() => setNewType("STRENGTH")}
        className={`flex-1 rounded-full border px-4 py-2 text-sm ${
          newType === "STRENGTH"
            ? "border-[#5E5CE6] bg-[#5E5CE6]/10 text-[#5E5CE6]"
            : "border-[#E5E5EA] text-[#6E6E73]"
        }`}
      >
        Strength
      </button>
      <button
        onClick={() => setNewType("CARDIO")}
        className={`flex-1 rounded-full border px-4 py-2 text-sm ${
          newType === "CARDIO"
            ? "border-[#FF453A] bg-[#FF453A]/10 text-[#FF453A]"
            : "border-[#E5E5EA] text-[#6E6E73]"
        }`}
      >
        Cardio
      </button>
    </div>

    <input
      type="text"
      value={newMuscleGroup}
      onChange={(e) => setNewMuscleGroup(e.target.value)}
      placeholder="Muscle group"
      className="h-[44px] rounded-[12px] border border-[#E5E5EA] bg-white px-[12px] text-base text-[#1D1D1F] outline-none placeholder:text-[#6E6E73] focus:border-[#1D1D1F]"
    />

    <input
      type="text"
      value={newYoutubeVideoId}
      onChange={(e) => setNewYoutubeVideoId(e.target.value)}
      placeholder="YouTube video ID"
      className="h-[44px] rounded-[12px] border border-[#E5E5EA] bg-white px-[12px] text-base text-[#1D1D1F] outline-none placeholder:text-[#6E6E73] focus:border-[#1D1D1F]"
    />

    <button
  onClick={handleCreateExercise}
  className="h-[48px] rounded-full bg-[#34C759] px-[16px] text-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(52,199,89,0.28)] transition-opacity active:opacity-85"
>
  Save Exercise
</button>
  </div>
    )}
      </div>
    </div>
  );
}