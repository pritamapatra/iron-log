"use client";

import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";

const WATER_REMINDER_INTERVAL_KEY = "iron-log-water-reminder-interval-minutes";

export function WaterReminderSettings() {
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [savedIntervalMinutes, setSavedIntervalMinutes] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(WATER_REMINDER_INTERVAL_KEY);
    const savedInterval = savedValue ? Number(savedValue) : null;

    if (savedInterval && savedInterval > 0) {
      setSavedIntervalMinutes(savedInterval);
      setIntervalMinutes(String(savedInterval));
    }
  }, []);

  const handleSave = () => {
    const parsedInterval = Number(intervalMinutes);

    if (!Number.isFinite(parsedInterval) || parsedInterval <= 0) {
      setMessage("Enter a valid number of minutes");
      return;
    }

    const wholeMinutes = Math.floor(parsedInterval);
    window.localStorage.setItem(
      WATER_REMINDER_INTERVAL_KEY,
      String(wholeMinutes)
    );
    setSavedIntervalMinutes(wholeMinutes);
    setIntervalMinutes(String(wholeMinutes));
    setMessage(`Reminder set for every ${wholeMinutes} min`);
  };

  const handleTurnOff = () => {
    window.localStorage.removeItem(WATER_REMINDER_INTERVAL_KEY);
    setSavedIntervalMinutes(null);
    setIntervalMinutes("");
    setMessage("Water reminder turned off");
  };

  return (
    <section className="rounded-[16px] border border-black/[0.04] bg-surface p-[16px] shadow-level-1">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex min-w-0 items-center gap-[10px]">
          <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-accent-alert/10 text-accent-alert">
            <Droplets size={18} strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-headline-sm font-semibold text-text-primary">
              Water reminder
            </h2>
            <p className="mt-[2px] text-label-primary text-text-secondary">
              {savedIntervalMinutes
                ? `Active every ${savedIntervalMinutes} min`
                : "Not set"}
            </p>
          </div>
        </div>

        {savedIntervalMinutes && (
          <button
            type="button"
            onClick={handleTurnOff}
            className="shrink-0 rounded-full px-[10px] py-[6px] text-label-primary font-semibold text-text-secondary transition-colors hover:bg-surface-container-low hover:text-text-primary"
          >
            Turn off
          </button>
        )}
      </div>

      <div className="mt-[16px] flex items-center gap-[8px]">
        <label className="flex min-w-0 flex-1 items-center rounded-[10px] border border-divider bg-background px-[12px]">
          <span className="whitespace-nowrap text-label-primary text-text-secondary">
            Every
          </span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={intervalMinutes}
            onChange={(event) => {
              setIntervalMinutes(event.target.value);
              setMessage(null);
            }}
            aria-label="Water reminder interval in minutes"
            className="min-w-0 flex-1 bg-transparent px-[8px] py-[10px] text-right font-mono text-numeric-data text-text-primary outline-none"
          />
          <span className="whitespace-nowrap text-label-primary text-text-secondary">
            min
          </span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="h-[44px] shrink-0 rounded-full bg-accent-action px-[18px] text-body-medium font-semibold text-white transition-opacity hover:opacity-85"
        >
          Set
        </button>
      </div>

      {message && (
        <p className="mt-[8px] text-label-primary text-text-secondary">{message}</p>
      )}
    </section>
  );
}
