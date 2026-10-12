import { NextResponse, type NextRequest } from "next/server";
import { purgeExpiredReservations } from "@/server/services/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Guard cron route with Bearer token if CRON_SECRET is configured
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
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
