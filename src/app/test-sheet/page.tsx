// src/app/test-sheet/page.tsx
"use client";

import { useState } from "react";
import { AddExerciseSheet } from "@/components/exercises/AddExerciseSheet";

interface Exercise {
  id: string;
  name: string;
  type: "STRENGTH" | "CARDIO";
  muscleGroup: string;
  youtubeVideoId: string;
}

export default function TestSheetPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="w-full p-8">
      <button
        onClick={() => setIsSheetOpen(true)}
        className="rounded-full bg-black px-4 py-2 text-white"
      >
        Open Add Exercise Sheet
      </button>

      <AddExerciseSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={(exercise: Exercise) => {
          console.log("Selected:", exercise);
          setIsSheetOpen(false);
        }}
      />
    </div>
  );
}