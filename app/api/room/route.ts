import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { points: true, roomLevel: true, ownedItems: true, placedItems: true, sleepData: true }
  });
  
  return NextResponse.json({ state: user });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { points, roomLevel, ownedItems, placedItems, sleepData } = body;

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      points,
      roomLevel,
      ownedItems: JSON.stringify(ownedItems),
      placedItems: JSON.stringify(placedItems),
      sleepData: sleepData ? JSON.stringify(sleepData) : "null"
    }
  });

  return NextResponse.json({ success: true });
}
