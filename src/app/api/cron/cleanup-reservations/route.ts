import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { purgeExpiredReservations } from "@/server/services/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron secret not configured on server" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized cron trigger" },
      { status: 401 }
    );
  }

  const providedToken = authHeader.slice(7).trim();
  const tokenBuf = Buffer.from(providedToken);
  const secretBuf = Buffer.from(cronSecret);

  if (
    tokenBuf.length !== secretBuf.length ||
    !crypto.timingSafeEqual(tokenBuf, secretBuf)
  ) {
    return NextResponse.json(
      { error: "Unauthorized cron trigger" },
      { status: 401 }
    );
  }

  try {
    const releasedCount = await purgeExpiredReservations();

    return NextResponse.json({
      success: true,
      releasedReservations: releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Reservation Cleanup Cron Error]:", error);
    return NextResponse.json(
      { error: "Failed to purge expired inventory locks" },
      { status: 500 }
    );
  }
}
