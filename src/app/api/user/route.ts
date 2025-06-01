import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const {userId} = await requireAuth();
    console.log(userId);
    

    if (!userId) {
      return NextResponse.json({error: "ユーザーが認証されていません"}, {status: 401})
    }

    const user = await db.userProfile.findUnique({
      where: {userId: userId},
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json({error: "ユーザーが見つかりません"}, {status: 404})
    }
    return NextResponse.json(user, {status: 200})
  } catch (error) {
    console.error("ユーザー取得APIエラー:", error);
    return NextResponse.json({error: "ユーザー取得に失敗しました"}, {status: 500})
  }
}