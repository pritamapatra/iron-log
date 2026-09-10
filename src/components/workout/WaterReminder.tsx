"use client";

import { useEffect, useRef, useState } from "react";
import { Droplets, Volume2, VolumeX, X } from "lucide-react";

interface WaterReminderProps {
  intervalMinutes: number | null;
}

const WATER_REMINDER_SOUND_ENABLED_KEY = "iron-log-water-reminder-sound-enabled";

function formatSecondsLeft(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function WaterReminder({ intervalMinutes }: WaterReminderProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextReminderAtRef = useRef<number | null>(null);
  const hasFiredRef = useRef(false);

  const resetCountdown = () => {
    if (!intervalMinutes || intervalMinutes <= 0) return;

    nextReminderAtRef.current = Date.now() + intervalMinutes * 60 * 1000;
    hasFiredRef.current = false;
    setSecondsLeft(intervalMinutes * 60);
    setIsReminderVisible(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const savedSoundPreference = window.localStorage.getItem(
      WATER_REMINDER_SOUND_ENABLED_KEY
    );

    // Sound is enabled unless the user explicitly muted it.
    setIsSoundEnabled(savedSoundPreference !== "false");
  }, []);

  useEffect(() => {
    if (!intervalMinutes || intervalMinutes <= 0) return;

    resetCountdown();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [intervalMinutes]);

  useEffect(() => {
    if (!intervalMinutes || intervalMinutes <= 0 || isReminderVisible) return;

    const tick = () => {
      const nextReminderAt = nextReminderAtRef.current;
      if (!nextReminderAt) return;

      const remainingMilliseconds = nextReminderAt - Date.now();
      const remainingSeconds = Math.max(
        0,
        Math.ceil(remainingMilliseconds / 1000)
      );

      setSecondsLeft(remainingSeconds);

      if (remainingMilliseconds <= 0 && !hasFiredRef.current) {
        hasFiredRef.current = true;

        if (isSoundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((err) => {
            console.error("Failed to play water reminder sound:", err);
          });
        }

        setIsReminderVisible(true);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [intervalMinutes, isReminderVisible, isSoundEnabled]);

  const toggleSound = () => {
    const nextValue = !isSoundEnabled;

    setIsSoundEnabled(nextValue);
    window.localStorage.setItem(
      WATER_REMINDER_SOUND_ENABLED_KEY,
      String(nextValue)
    );

    if (!nextValue && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (!intervalMinutes || intervalMinutes <= 0 || secondsLeft === null) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/sounds/water-reminder.mp3"
        preload="auto"
      />

      <div className="flex items-center justify-between gap-[12px] rounded-[12px] bg-accent-alert/10 px-[14px] py-[10px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <Droplets size={17} className="shrink-0 text-accent-alert" />
          <span className="truncate text-label-primary text-text-secondary">
            Next water reminder in{" "}
            <span className="font-mono font-semibold text-text-primary">
              {formatSecondsLeft(secondsLeft)}
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-[8px]">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={
              isSoundEnabled
                ? "Mute water reminder sound"
                : "Unmute water reminder sound"
            }
            title={
              isSoundEnabled
                ? "Mute reminder sound"
                : "Unmute reminder sound"
            }
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-accent-alert transition-colors hover:bg-accent-alert/10"
          >
            {isSoundEnabled ? (
              <Volume2 size={17} strokeWidth={2} />
            ) : (
              <VolumeX size={17} strokeWidth={2} />
            )}
          </button>

          <span className="text-label-primary font-semibold text-accent-alert">
            Every {intervalMinutes} min
          </span>
        </div>
      </div>

      {isReminderVisible && (
        <div className="fixed inset-x-[16px] bottom-[24px] z-[80] rounded-[18px] border border-accent-alert/20 bg-surface p-[16px] shadow-level-3">
          <div className="flex items-start gap-[12px]">
            <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-accent-alert/10 text-accent-alert">
              <Droplets size={21} strokeWidth={2} />
            </span>

            <div className="min-w-0 flex-1">
              <h2 className="text-headline-sm font-semibold text-text-primary">
                Time to drink water
              </h2>
              <p className="mt-[2px] text-label-primary text-text-secondary">
                Take a quick sip, then continue your workout.
              </p>
            </div>

            <button
              type="button"
              onClick={resetCountdown}
              aria-label="Dismiss water reminder"
              className="-mr-[6px] -mt-[6px] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-container-low hover:text-text-primary"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            onClick={resetCountdown}
            className="mt-[16px] h-[44px] w-full rounded-full bg-accent-action px-[16px] text-body-medium font-semibold text-white transition-opacity hover:opacity-85"
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}
