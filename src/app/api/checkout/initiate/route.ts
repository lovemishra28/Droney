import { NextResponse, type NextRequest } from "next/server";
import { initiateCheckoutAction } from "@/server/actions/checkout";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await initiateCheckoutAction(body);

    if (!result.success) {
      // 409 Conflict for out-of-stock or inventory lock contention
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
