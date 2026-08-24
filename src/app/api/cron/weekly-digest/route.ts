import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigest } from "@/lib/digest";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await sendWeeklyDigest();
  return NextResponse.json(result);
}
