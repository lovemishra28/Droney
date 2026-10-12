import { NextRequest, NextResponse } from "next/server";
import { bookPilotConsultation } from "@/server/actions/consultation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await bookPilotConsultation(body);

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
