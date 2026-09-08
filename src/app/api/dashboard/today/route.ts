import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allDays = await prisma.routineDay.findMany({
      orderBy: { sequencePosition: "asc" },
      include: {
        items: {
          include: { exercise: true },
        },
      },
    });

    if (allDays.length === 0) {
      return NextResponse.json(
        { error: "No routine days exist yet" },
        { status: 404 }
      );
    }

    const lastCompletedSession = await prisma.workoutSession.findFirst({
      where: { endedAt: { not: null } },
      orderBy: { endedAt: "desc" },
      include: { routineDay: true },
    });

    if (!lastCompletedSession) {
      return NextResponse.json(allDays[0]);
    }

    const lastPosition = lastCompletedSession.routineDay.sequencePosition;
    const nextDay = allDays.find(
      (day) => day.sequencePosition > lastPosition
    );

    const todayDay = nextDay ?? allDays[0];

    return NextResponse.json(todayDay);
  } catch (err) {
    console.error("Failed to compute today's routine:", err);
    return NextResponse.json(
      { error: "Failed to compute today's routine" },
      { status: 500 }
    );
  }
}