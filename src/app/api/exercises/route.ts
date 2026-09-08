import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("GET /api/exercises failed:", error);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const muscleGroup =
      typeof body?.muscleGroup === "string" ? body.muscleGroup.trim() : "";
    const youtubeVideoId =
      typeof body?.youtubeVideoId === "string"
        ? body.youtubeVideoId.trim()
        : "";
    const type = body?.type;

    if (!name || !muscleGroup || !["STRENGTH", "CARDIO"].includes(type)) {
      return NextResponse.json(
        {
          error:
            "Exercise name, a valid type (STRENGTH or CARDIO), and muscle group are required.",
        },
        { status: 400 },
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        type,
        muscleGroup,
        youtubeVideoId,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("POST /api/exercises failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create exercise.",
      },
      { status: 500 },
    );
  }
}
