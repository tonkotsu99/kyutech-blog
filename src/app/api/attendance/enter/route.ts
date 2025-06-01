import { toggleCheckedInStatus } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, comment} = body;

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 });
    }

    const result = await toggleCheckedInStatus(userId, true, comment)

    return NextResponse.json({
      success: true,
      isCheckedIn: result,
      message: "チェックインが完了しました"
    })
  } catch (error) {
    console.error("チェックインAPIエラー:", error);
    
    const errorMessage = error instanceof Error ? error.message : "チェックインに失敗しました";

    return NextResponse.json({error: errorMessage}, {status: 500})
  }
}