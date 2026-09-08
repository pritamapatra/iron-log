"use client";

import { useEffect, useRef, useState } from "react";
import { Droplet, X } from "lucide-react";
import Button from "@/components/Button";

interface WaterReminderProps {
  onFrequencySet?: (minutes: number) => void;
}

function playReminderBeep() {
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

    oscillator.frequency.value = 660;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.4
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (err) {
    console.error("Failed to play reminder beep:", err);
  }
}

function formatSecondsLeft(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function WaterReminder({ onFrequencySet }: WaterReminderProps) {
  const [frequencyMinutes, setFrequencyMinutes] = useState<number | null>(
    null
  );
  const [inputValue, setInputValue] = useState("20");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [hasFired, setHasFired] = useState(false);
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (frequencyMinutes === null) return;

    setSecondsLeft(frequencyMinutes * 60);
    setHasFired(false);
    hasFiredRef.current = false;
  }, [frequencyMinutes]);

  useEffect(() => {
    if (frequencyMinutes === null) return;

    if (secondsLeft <= 0) {
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        playReminderBeep();
        setHasFired(true);
      }
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [frequencyMinutes, secondsLeft]);

  const handleStart = () => {
    const parsed = Number(inputValue);
    if (Number.isNaN(parsed) || parsed <= 0) return;

    setFrequencyMinutes(parsed);
    onFrequencySet?.(parsed);
  };

  const handleDismiss = () => {
    if (frequencyMinutes === null) return;

    setSecondsLeft(frequencyMinutes * 60);
    setHasFired(false);
    hasFiredRef.current = false;
  };

  if (frequencyMinutes === null) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#E5E5EA] bg-white px-4 py-2">
        <Droplet size={16} className="text-[#FF9F0A]" />
        <span className="text-sm text-[#1D1D1F]">Remind me every</span>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-14 rounded-lg border border-[#E5E5EA] bg-[#FAFAFA] px-2 py-1 text-sm tabular-nums text-[#1D1D1F] outline-none"
        />
        <span className="text-sm text-[#1D1D1F]">min</span>
        <Button variant="primary" onClick={handleStart} className="px-3 py-1 text-xs">
          Set
        </Button>
      </div>
    );
  }

  if (hasFired) {
    return (
      <div className="flex items-center justify-between rounded-full bg-[#FF9F0A] px-4 py-2">
        <div className="flex items-center gap-2">
          <Droplet size={16} className="text-white" />
          <span className="text-sm font-medium text-white">
            Time to drink water
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-white hover:bg-white/20"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-full bg-[#FF9F0A]/10 px-4 py-2">
      <div className="flex items-center gap-2">
        <Droplet size={16} className="text-[#FF9F0A]" />
        <span className="text-sm text-[#1D1D1F]">
          Next reminder in {formatSecondsLeft(secondsLeft)}
        </span>
      </div>
    </div>
  );
}