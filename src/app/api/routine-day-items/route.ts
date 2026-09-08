import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    routineDayId,
    exerciseId,
    plannedSets,
    plannedReps,
    plannedWeightKg,
    plannedDurationMin,
    plannedDistanceKm,
    plannedInclinePct,
    plannedSpeedKmh,
  } = body;

  if (!routineDayId || !exerciseId) {
    return NextResponse.json(
      { error: "routineDayId and exerciseId are required" },
      { status: 400 }
    );
  }

  const day = await prisma.routineDay.findUnique({
    where: { id: routineDayId },
  });

  if (!day) {
    return NextResponse.json(
      { error: "Routine day not found" },
      { status: 404 }
    );
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    return NextResponse.json(
      { error: "Exercise not found" },
      { status: 404 }
    );
  }

  const lastItem = await prisma.routineDayItem.findFirst({
    where: { routineDayId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastItem ? lastItem.order + 1 : 1;

  const item = await prisma.routineDayItem.create({
    data: {
      routineDayId,
      exerciseId,
      order: nextOrder,
      plannedSets: plannedSets ?? null,
      plannedReps: plannedReps ?? null,
      plannedWeightKg: plannedWeightKg ?? null,
      plannedDurationMin: plannedDurationMin ?? null,
      plannedDistanceKm: plannedDistanceKm ?? null,
      plannedInclinePct: plannedInclinePct ?? null,
      plannedSpeedKmh: plannedSpeedKmh ?? null,
    },
    include: {
      exercise: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}


export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json(
        { error: "Routine day item id is required" },
        { status: 400 }
      );
    }

    await prisma.routineDayItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to remove routine day item:", err);

    return NextResponse.json(
      { error: "Failed to remove exercise" },
      { status: 500 }
    );
  }
}
