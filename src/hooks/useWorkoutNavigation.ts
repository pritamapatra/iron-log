"use client";

import { useCallback, useState } from "react";

export function useWorkoutNavigation(
  totalExercises: number,
  initialCompletedSetCount = 0
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(initialCompletedSetCount);
  const [requiredCount, setRequiredCount] = useState(0);

  const resetProgressForExercise = useCallback(
    (required: number, completed = 0) => {
      setRequiredCount(required);
      setCompletedCount(completed);
    },
    []
  );

  const registerSetCompleted = useCallback(() => {
    setCompletedCount((prev) => prev + 1);
  }, []);

  const setCurrentExerciseIndex = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalExercises - 1)));
  }, [totalExercises]);

  const isCurrentExerciseComplete =
    requiredCount > 0 && completedCount >= requiredCount;

  const isLastExercise = currentIndex >= totalExercises - 1;

  const completedExercises =
    Math.min(currentIndex + (isCurrentExerciseComplete ? 1 : 0), totalExercises);

  const goToNextExercise = useCallback(() => {
    if (!isCurrentExerciseComplete) return;
    if (isLastExercise) return;

    setCurrentIndex((prev) => prev + 1);
  }, [isCurrentExerciseComplete, isLastExercise]);

  return {
    currentIndex,
    completedExercises,
    isCurrentExerciseComplete,
    isLastExercise,
    resetProgressForExercise,
    registerSetCompleted,
    setCurrentExerciseIndex,
    goToNextExercise,
  };
}