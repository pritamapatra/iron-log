import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workoutSessionId,
      routineDayItemId,
      exerciseId,
      setNumber,
      actualWeightKg,
      actualReps,
      actualDurationMin,
      actualDistanceKm,
      actualInclinePct,
      actualSpeedKmh,
      actualCalories,
      actualAvgHeartRate,
      note,
    } = body;

    if (!workoutSessionId || typeof workoutSessionId !== "string") {
      return NextResponse.json(
        { error: "workoutSessionId is required" },
        { status: 400 }
      );
    }

    if (!routineDayItemId || typeof routineDayItemId !== "string") {
      return NextResponse.json(
        { error: "routineDayItemId is required" },
        { status: 400 }
      );
    }

    if (!exerciseId || typeof exerciseId !== "string") {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }

    const setLog = await prisma.setLog.create({
      data: {
        workoutSessionId,
        routineDayItemId,
        exerciseId,
        setNumber: setNumber ?? null,
        actualWeightKg: actualWeightKg ?? null,
        actualReps: actualReps ?? null,
        actualDurationMin: actualDurationMin ?? null,
        actualDistanceKm: actualDistanceKm ?? null,
        actualInclinePct: actualInclinePct ?? null,
        actualSpeedKmh: actualSpeedKmh ?? null,
        actualCalories: actualCalories ?? null,
        actualAvgHeartRate: actualAvgHeartRate ?? null,
        note: note ?? null,
      },
    });

    return NextResponse.json(setLog, { status: 201 });
  } catch (err) {
    console.error("Failed to create set log:", err);
    return NextResponse.json(
      { error: "Failed to create set log" },
      { status: 500 }
    );
  }
}