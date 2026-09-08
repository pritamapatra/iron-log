import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  const exercises = await prisma.exercise.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(exercises);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type, muscleGroup, youtubeVideoId } = body;

  if (!name || !type || !muscleGroup || !youtubeVideoId) {
    return NextResponse.json(
      { error: "name, type, muscleGroup, and youtubeVideoId are required" },
      { status: 400 }
    );
  }

  if (type !== "STRENGTH" && type !== "CARDIO") {
    return NextResponse.json(
      { error: "type must be STRENGTH or CARDIO" },
      { status: 400 }
    );
  }

  const exercise = await prisma.exercise.create({
    data: { name, type, muscleGroup, youtubeVideoId },
  });

  return NextResponse.json(exercise, { status: 201 });
}