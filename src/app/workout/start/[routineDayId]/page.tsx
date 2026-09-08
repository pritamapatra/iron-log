"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StartWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const routineDayId = params.routineDayId as string;

  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    async function createSession() {
      try {
        const res = await fetch("/api/workout-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ routineDayId }),
        });

        if (!res.ok) throw new Error("Failed to start workout session");

        const session = await res.json();

        router.replace(`/workout/${session.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    createSession();


  }, [routineDayId, router]);

  if (error) {
    return <div className="p-4 text-sm text-[#FF453A]">{error}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <p className="text-sm text-[#6E6E73]">Starting workout...</p>
    </div>
  );
}