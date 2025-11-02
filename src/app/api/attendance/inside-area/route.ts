import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { updateAttendance } from "@/lib/prisma/attendance";
import { PresenceStatus } from "@prisma/client";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("認証が必要です", { status: 401 });
    }

    const profile = await db.userProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        presenceStatus: true,
        isCheckedIn: true,
      },
    });

    if (!profile) {
      return new NextResponse("プロフィールが見つかりません", { status: 404 });
    }

    const activeAttendance = await db.attendance.findFirst({
      where: {
        user_id: profile.id,
        check_out: null,
      },
      orderBy: { check_in: "desc" },
    });

    if (activeAttendance) {
      await updateAttendance(profile.id, {
        nextStatus: PresenceStatus.ON_CAMPUS,
      });
    } else {
      await db.userProfile.update({
        where: { id: profile.id },
        data: {
          isCheckedIn: false,
          presenceStatus: PresenceStatus.ON_CAMPUS,
        },
      });
    }

    return NextResponse.json({
      presenceStatus: PresenceStatus.ON_CAMPUS,
      isCheckedIn: false,
    });
  } catch (error) {
    console.error("[ATTENDANCE_INSIDE_AREA_POST]", error);
    return new NextResponse("サーバーエラーが発生しました", { status: 500 });
  }
}
