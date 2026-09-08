interface WorkoutProgressBarProps {
  activeIndex: number;
  completedCount: number;
  totalCount: number;
}

export function WorkoutProgressBar({
  activeIndex,
  completedCount,
  totalCount,
}: WorkoutProgressBarProps) {
  const safeTotal = totalCount > 0 ? totalCount : 1;
  const percentage = Math.min(
    100,
    Math.max(0, (completedCount / safeTotal) * 100)
  );

  return (
    <div
      className="h-[4px] w-full overflow-hidden rounded-full bg-divider"
      role="progressbar"
      aria-label={`Workout progress: ${completedCount} of ${totalCount} exercises complete`}
      aria-valuemin={0}
      aria-valuemax={totalCount}
      aria-valuenow={completedCount}
    >
      <div
        className="h-full rounded-full bg-accent-action transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
