import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { cache } from "react";

// パラメータを受け取るキャッシュ関数
const getAttendanceHistory = cache(
  async (userId: string, targetUserId: string | null) => {
    // 対象ユーザーのプロフィールを取得
    let targetProfile;

    // userIdパラメータが存在し、undefinedでない場合のみ別のユーザーを検索
    if (targetUserId && targetUserId !== "undefined") {
      // まずidで検索
      let foundProfile = await db.userProfile.findUnique({
        where: { id: targetUserId },
      });

      // idで見つからない場合はuserIdで検索
      if (!foundProfile) {
        foundProfile = await db.userProfile.findUnique({
          where: { userId: targetUserId },
        });
      }

      if (foundProfile) {
        targetProfile = foundProfile;
      } else {
        throw new Error("対象ユーザーのプロフィールが見つかりません");
      }
    } else {
      // 自分自身のプロフィールを取得
      targetProfile = await db.userProfile.findUnique({
        where: { userId },
      });

      if (!targetProfile) {
        throw new Error("プロフィールが見つかりません");
      }
    }

    // 在室記録を取得
    const attendanceRecords = await db.attendance.findMany({
      where: {
        user_id: targetProfile.id,
      },
      orderBy: {
        check_in: "desc",
      },
    });
    // 総レコード数を取得
    const totalRecords = await db.attendance.count({
      where: {
        user_id: targetProfile.id,
      },
    });

    return {
      records: attendanceRecords,
      total: totalRecords,
    };
  }
);

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    // URLからパラメータを取得
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get("userId");

    // キャッシュされた関数を呼び出し
    try {
      const result = await getAttendanceHistory(userId, targetUserId);
      return NextResponse.json(result);
    } catch (error) {
      console.error("[ATTENDANCE_HISTORY_GET]", error);
    }
  } catch (error) {
    console.error("[ATTENDANCE_HISTORY_GET]", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}
