"use client";

import { useEndWorkout } from "@/hooks/useEndWorkout";
import Button from "@/components/Button";

export default function TestWorkoutPage() {
  const {
    isEnding,
    showConfirm,
    error,
    requestEndWorkout,
    cancelEndWorkout,
    confirmEndWorkout,
  } = useEndWorkout("cmtk54d8v0007wjqguq8r4rqj");

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={requestEndWorkout}
          className="text-sm font-medium text-[#FF453A]"
        >
          End Workout
        </button>
      </div>

      {error && <p className="text-sm text-[#FF453A]">{error}</p>}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <p className="mb-4 text-base text-[#1D1D1F]">
              End this workout session?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={cancelEndWorkout}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmEndWorkout}
                disabled={isEnding}
              >
                {isEnding ? "Ending..." : "End Workout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}