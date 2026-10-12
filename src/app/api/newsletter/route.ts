import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/server/actions/newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const result = await subscribeNewsletter(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
