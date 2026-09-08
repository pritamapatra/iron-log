import { Flame, TrendingUp, Check } from "lucide-react";
import Card from "@/components/Card";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weekDots: boolean[];
  trendPercent: number | null;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreakBadge({ data }: { data: StreakData }) {
  const { currentStreak, longestStreak, weekDots, trendPercent } = data;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-alert/15">
            <Flame className="h-6 w-6 text-accent-alert" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-headline-lg font-bold tracking-tight text-text-primary">
                {currentStreak}
              </span>
              <span className="text-headline-sm font-semibold text-text-primary">
                Days Streak
              </span>
            </div>
            <p className="font-mono text-numeric-caption text-text-secondary">
              Longest: {longestStreak} days
            </p>
          </div>
        </div>

        {trendPercent !== null && (
          <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1">
            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
            <span className="font-mono text-label-caps font-semibold text-secondary">
              {trendPercent > 0 ? "+" : ""}{trendPercent}%
            </span>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-background p-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDots.map((completed, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-label-caps font-semibold text-text-secondary">
                {DAY_LABELS[i]}
              </span>
              <div
                className={
                  completed
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-accent-action text-white"
                    : "flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high"
                }
              >
                {completed ? (
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                 ) : (
                  <span className="h-2 w-2 rounded-full bg-outline-variant" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}