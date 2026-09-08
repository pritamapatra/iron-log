"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";

interface RestTimerProps {
  isActive: boolean;
  durationSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

function playCompletionBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (err) {
    console.error("Failed to play completion beep:", err);
  }
}

function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function RestTimer({
  isActive,
  durationSeconds,
  onComplete,
  onSkip,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [showFlash, setShowFlash] = useState(false);
  const hasFiredCompletionRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      setSecondsLeft(durationSeconds);
      setShowFlash(false);
      hasFiredCompletionRef.current = false;
    }
  }, [isActive, durationSeconds]);

  useEffect(() => {
    if (!isActive) return;

    if (secondsLeft <= 0) {
      if (!hasFiredCompletionRef.current) {
        hasFiredCompletionRef.current = true;
        playCompletionBeep();
        setShowFlash(true);

        const flashTimeout = setTimeout(() => {
          setShowFlash(false);
          onComplete();
        }, 600);

        return () => clearTimeout(flashTimeout);
      }

      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((previousSeconds) => previousSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, onComplete, secondsLeft]);

  if (!isActive) return null;

  const percentage = Math.min(
    100,
    Math.max(0, (secondsLeft / durationSeconds) * 100)
  );
  const circumference = 2 * Math.PI * 15.9155;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <section
      className={`relative overflow-hidden rounded-[16px] bg-surface p-[16px] shadow-level-2 transition-colors duration-300 ${
        showFlash ? "bg-accent-alert" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-x-0 top-0 h-[4px] bg-surface-container-high">
        <div
          className="h-full rounded-full bg-accent-alert transition-[width] duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-[12px] pt-[4px]">
        <div className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center">
          <svg className="h-[48px] w-[48px] -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="#E9E7ED"
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
              fill="none"
              stroke="#FF9F0A"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <Timer
            size={18}
            strokeWidth={2}
            className={showFlash ? "absolute text-white" : "absolute text-accent-alert"}
          />
        </div>

        <div className="min-w-0">
          <p
            className={`font-mono text-numeric-timer leading-none ${
              showFlash ? "text-white" : "text-text-primary"
            }`}
          >
            {formatTime(secondsLeft)}
          </p>
          <p
            className={`mt-[4px] truncate text-numeric-caption ${
              showFlash ? "text-white/80" : "text-text-secondary"
            }`}
          >
            Rest interval active
          </p>
        </div>
      </div>

      <div className="mt-[12px] flex items-center gap-[8px]">
        <button
          type="button"
          onClick={() => setSecondsLeft((previousSeconds) => previousSeconds + 30)}
          className="min-h-[36px] rounded-full bg-surface-container-high px-[12px] font-mono text-numeric-caption font-semibold text-text-primary transition-colors hover:bg-surface-container"
        >
          +30s
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="min-h-[36px] rounded-full bg-surface-container px-[12px] text-label-primary font-semibold text-text-secondary transition-colors hover:text-text-primary"
        >
          Skip
        </button>
      </div>
    </section>
  );
}
