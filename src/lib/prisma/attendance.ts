import { PresenceStatus } from "@prisma/client";
import { db } from "../db";

const toJST = (date: Date) => {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
};

const updateProfilePresence = async (
  profileId: string,
  status: PresenceStatus
) => {
  await db.userProfile.update({
    where: { id: profileId },
    data: {
      isCheckedIn: status === PresenceStatus.IN_LAB,
      presenceStatus: status,
    },
  });
};

export const createAttendance = async (profileId: string, comment?: string) => {
  try {
    const attendance = await db.attendance.create({
      data: {
        user_id: profileId,
        check_in: toJST(new Date()),
        comment: comment || null,
      },
    });

    await updateProfilePresence(profileId, PresenceStatus.IN_LAB);

    return attendance;
  } catch (error) {
    console.error("Error creating attendance:", error);
    throw error;
  }
};

export const updateAttendance = async (
  profileId: string,
  options?: { comment?: string; nextStatus?: PresenceStatus }
) => {
  try {
    const comment = options?.comment;
    const nextStatus = options?.nextStatus ?? PresenceStatus.OFF_CAMPUS;

    const attendance = await db.attendance.findFirst({
      where: {
        user_id: profileId,
        check_out: null,
      },
      orderBy: {
        check_in: "desc",
      },
    });

    if (!attendance) {
      throw new Error("チェックイン記録が見つかりません");
    }

    const updatedAttendance = await db.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        check_out: toJST(new Date()),
        comment: comment || null,
      },
    });

    await updateProfilePresence(profileId, nextStatus);

    return updatedAttendance;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

export const getUserAttendance = async (profileId: string) => {
  try {
    const attendances = await db.attendance.findMany({
      where: {
        user_id: profileId,
      },
      orderBy: {
        check_in: "desc",
      },
    });

    return attendances.map((attendance) => ({
      ...attendance,
      check_in: attendance.check_in,
      check_out: attendance.check_out ? attendance.check_out : null,
      duration: attendance.check_out
        ? (attendance.check_out.getTime() - attendance.check_in.getTime()) /
          (1000 * 60 * 60)
        : null,
    }));
  } catch (error) {
    console.error("Error getting user attendance:", error);
    throw error;
  }
};
