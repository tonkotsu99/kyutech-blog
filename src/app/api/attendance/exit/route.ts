import { updateAttendance } from "@/lib/prisma/attendance";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です。" },
        { status: 400 }
      );
    }

    const result = await updateAttendance(userId);
    return NextResponse.json({
      success: true,
      isCheckedIn: result,
      message: "チェックアウトが完了しました",
    });
  } catch (error) {
    console.error("チェックアウトAPIエラー:", error);

    const errorMessage =
      error instanceof Error ? error.message : "チェックアウトに失敗しました";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
