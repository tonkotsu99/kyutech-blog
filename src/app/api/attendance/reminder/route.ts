import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCheckoutReminderEmail } from "@/lib/mail";
import { cache } from "react";
import { updateAttendance } from "@/lib/prisma/attendance";
import { UserProfile, Attendance, PresenceStatus } from "@prisma/client";

type UserWithAttendance = UserProfile & {
  Attendance: Attendance[];
};

// 在室中のユーザーを取得する部分だけをキャッシュ
const getActiveUsers = cache(async () => {
  return await db.userProfile.findMany({
    where: {
      isCheckedIn: true,
    },
    include: {
      Attendance: {
        where: {
          check_out: null,
        },
        orderBy: {
          check_in: "desc",
        },
        take: 1,
      },
    },
  });
});

export async function GET() {
  return await sendReminderEmails();
}

export async function POST() {
  return await sendReminderEmails();
}

async function processUser(user: UserWithAttendance) {
  if (user.email && user.Attendance[0]) {
    try {
      // データベースの更新を先に実行
      await Promise.all([
        db.userProfile.update({
          where: {
            id: user.id,
          },
          data: {
            isCheckedIn: false,
            presenceStatus: PresenceStatus.OFF_CAMPUS,
          },
        }),
        updateAttendance(user.id, { nextStatus: PresenceStatus.OFF_CAMPUS }),
      ]);

      // メール送信は非同期で実行（レスポンスを待たない）
      sendCheckoutReminderEmail(
        user.email,
        user.name,
        user.userId,
        user.Attendance[0].check_in
      ).catch((error) => {
        console.error(`Error sending email to user ${user.id}:`, error);
      });
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error);
    }
  }
}

async function sendReminderEmails() {
  try {
    const activeUsers = await getActiveUsers();

    // バッチサイズを小さくして、タイムアウトを防ぐ
    const BATCH_SIZE = 3;

    // ユーザーをバッチに分割して処理
    for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
      const batch = activeUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(processUser));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    return NextResponse.json(
      { error: "メール送信に失敗しました" },
      { status: 500 }
    );
  }
}
