import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { routineDayId } = body;

    if (!routineDayId || typeof routineDayId !== "string") {
      return NextResponse.json(
        { error: "routineDayId is required" },
        { status: 400 }
      );
    }

    const session = await prisma.workoutSession.create({
      data: { routineDayId },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("Failed to create workout session:", err);

    return NextResponse.json(
      { error: "Failed to create workout session" },
      { status: 500 }
    );
  }
}
