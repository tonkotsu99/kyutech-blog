import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "react";

// データベースクエリをcache関数でラップ
const getAllMembersAttendance = cache(async () => {
  const members = await db.userProfile.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      imageUrl: true,
      isCheckedIn: true,
      academicYear: true,
      researchLab: true,
      Attendance: {
        where: {
          check_out: null,
        },
        select: {
          check_in: true,
        },
        take: 1,
      },
    },
    orderBy: [{ researchLab: "asc" }, { isCheckedIn: "desc" }, { name: "asc" }],
  });

  // チェックイン時間をUTCに戻す
  return members.map((member) => ({
    ...member,
    Attendance: member.Attendance.map((attendance) => ({
      ...attendance,
      check_in: new Date(
        attendance.check_in.getTime() - 9 * 60 * 60 * 1000
      ).toISOString(),
    })),
  }));
});

export async function GET() {
  try {
    // キャッシュされた関数を使用して全メンバーの出席状況を取得
    const allMembers = await getAllMembersAttendance();

    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("[ATTENDANCE_ALL_GET]", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}
