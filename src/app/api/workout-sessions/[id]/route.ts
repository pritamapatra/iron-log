import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        setLogs: {
          select: {
            routineDayItemId: true,
            exerciseId: true,
            setNumber: true,
            actualWeightKg: true,
            actualReps: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("Failed to load workout session:", err);

    return NextResponse.json(
      { error: "Failed to load workout session" },
      { status: 500 }
    );
  }
}
