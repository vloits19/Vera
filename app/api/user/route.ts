import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { newName } = body;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const currentYear = new Date().getFullYear();
  let updates: any = { veraName: newName };

  // If setting name for the first time, it's free.
  // Otherwise, it counts towards the limit.
  if (user.veraName) {
    let currentCount = user.nameChangesThisYear;
    if (user.lastNameChangeYear !== currentYear) {
      currentCount = 0; // reset for new year
    }
    
    if (currentCount >= 2) {
      return NextResponse.json({ error: "Name change limit reached for this year." }, { status: 400 });
    }
    
    updates.nameChangesThisYear = currentCount + 1;
    updates.lastNameChangeYear = currentYear;
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: updates
  });

  return NextResponse.json({ user: updatedUser });
}
