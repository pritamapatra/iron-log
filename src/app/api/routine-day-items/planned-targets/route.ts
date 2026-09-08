import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PlannedTargetUpdate {
  id: string;
  plannedSets: number | null;
  plannedReps: number | null;
  plannedWeightKg: number | null;
  plannedDurationMin: number | null;
  plannedDistanceKm: number | null;
  plannedInclinePct: number | null;
  plannedSpeedKmh: number | null;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const items: PlannedTargetUpdate[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.routineDayItem.update({
          where: { id: item.id },
          data: {
            plannedSets: item.plannedSets,
            plannedReps: item.plannedReps,
            plannedWeightKg: item.plannedWeightKg,
            plannedDurationMin: item.plannedDurationMin,
            plannedDistanceKm: item.plannedDistanceKm,
            plannedInclinePct: item.plannedInclinePct,
            plannedSpeedKmh: item.plannedSpeedKmh,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update planned targets:", err);
    return NextResponse.json(
      { error: "Failed to update planned targets" },
      { status: 500 }
    );
  }
}