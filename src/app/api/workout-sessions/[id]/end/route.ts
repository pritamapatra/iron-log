import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Workout session not found" },
        { status: 404 }
      );
    }

    if (session.endedAt) {
      return NextResponse.json(
        { error: "Workout session already ended" },
        { status: 409 }
      );
    }

    const updated = await prisma.workoutSession.update({
      where: { id },
      data: { endedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to end workout session:", err);
    return NextResponse.json(
      { error: "Failed to end workout session" },
      { status: 500 }
    );
  }
}