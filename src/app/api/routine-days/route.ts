import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const lastDay = await prisma.routineDay.findFirst({
    orderBy: { sequencePosition: "desc" },
  });

  const nextPosition = lastDay ? lastDay.sequencePosition + 1 : 1;

  const routineDay = await prisma.routineDay.create({
    data: {
      name: name.trim(),
      sequencePosition: nextPosition,
    },
  });

  return NextResponse.json(routineDay, { status: 201 });
}

export async function GET() {
  const routineDays = await prisma.routineDay.findMany({
    orderBy: { sequencePosition: "asc" },
    include: {
      items: {
        include: { exercise: true },
      },
    },
  });

  const result = routineDays.map((day) => {
    const strengthCount = day.items.filter(
      (item) => item.exercise.type === "STRENGTH"
    ).length;
    const cardioCount = day.items.length - strengthCount;

    let primaryType: "STRENGTH" | "CARDIO" | null = null;
    if (day.items.length > 0) {
      primaryType = cardioCount > strengthCount ? "CARDIO" : "STRENGTH";
    }

    return {
      id: day.id,
      name: day.name,
      sequencePosition: day.sequencePosition,
      itemCount: day.items.length,
      primaryType,
      createdAt: day.createdAt,
      updatedAt: day.updatedAt,
    };
  });

  return NextResponse.json(result);
}