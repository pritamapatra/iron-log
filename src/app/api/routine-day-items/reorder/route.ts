import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "items must be a non-empty array of { id, order }" },
      { status: 400 }
    );
  }

  for (const item of items) {
    if (!item.id || typeof item.order !== "number") {
      return NextResponse.json(
        { error: "each item must have an id and a numeric order" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.$transaction(
    items.map((item: { id: string; order: number }) =>
      prisma.routineDayItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json(updated);
}