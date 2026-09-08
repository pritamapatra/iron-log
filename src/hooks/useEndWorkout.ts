"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export function useEndWorkout(workoutSessionId: string) {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestEndWorkout = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const cancelEndWorkout = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const confirmEndWorkout = useCallback(async () => {
    setIsEnding(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/workout-sessions/${workoutSessionId}/end`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Failed to end workout session");

      setShowConfirm(false);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsEnding(false);
    }
  }, [workoutSessionId, router]);

  return {
    isEnding,
    showConfirm,
    error,
    requestEndWorkout,
    cancelEndWorkout,
    confirmEndWorkout,
  };
}