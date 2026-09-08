"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/components/Button";

export function NewDayButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/routine-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Routine Day" }),
      });

      if (!res.ok) throw new Error("Failed to create routine day");

      const created = await res.json();
      router.push(`/routine-days/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCreating(false);
    }
  }, [router]);

  return (
  <div className="fixed bottom-[88px] right-[16px] z-40 flex flex-col items-end gap-2">
    {error && (
      <p className="rounded-lg bg-white px-3 py-2 text-xs text-[#FF453A] shadow-sm">
        {error}
      </p>
    )}
    <Button
      variant="primary"
      onClick={handleCreate}
      disabled={isCreating}
      className="flex h-[48px] items-center gap-[8px] !bg-primary-container px-[20px] text-white shadow-xl transition-transform active:scale-95 hover:!opacity-100"
    >
      <Plus size={20} />
      <span className="text-headline-sm font-semibold tracking-tight">
        {isCreating ? "Creating..." : "New Day"}
      </span>
    </Button>
  </div>
);
}