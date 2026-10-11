import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/server/services/session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("aerostore_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const payload = await verifySessionToken(sessionToken);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.sub,
      role: payload.role,
      name: payload.fullName || payload.name,
    },
  });
}
