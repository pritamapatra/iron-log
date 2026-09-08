import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const routineDay = await prisma.routineDay.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          exercise: true,
        },
      },
    },
  });

  if (!routineDay) {
    return NextResponse.json(
      { error: "Routine day not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(routineDay);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.routineDay.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json(
      { error: "Routine day not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.routineDay.update({
    where: { id },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}