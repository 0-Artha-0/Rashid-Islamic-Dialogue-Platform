import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Session persistence is not implemented yet." }, { status: 501 });
}
