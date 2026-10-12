import { NextResponse, type NextRequest } from "next/server";
import { requestOtpAction } from "@/server/actions/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await requestOtpAction(body);

    if (!result.success) {
      if (
        result.message?.toLowerCase().includes("too many") ||
        result.message?.toLowerCase().includes("rate limit")
      ) {
        return NextResponse.json(result, { status: 429 });
      }
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
