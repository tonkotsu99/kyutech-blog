import { cache } from "react";
import { db } from "@/lib/db";

export const getAllLabs = cache(async () => {
  try {
    const labs = await db.userProfile.findMany({
      select: {
        researchLab: true,
      },
      distinct: ["researchLab"],
      where: {
        researchLab: {
          not: "",
        },
      },
      orderBy: {
        researchLab: "asc",
      },
    });

    return labs.map((lab) => lab.researchLab).filter(Boolean);
  } catch (error) {
    console.error("Error fetching labs:", error);
    return [];
  }
});

export const getLabMembers = cache(
  async (labName?: string, userLab?: string) => {
    const members = await db.userProfile.findMany({
      where: labName ? { researchLab: labName } : { researchLab: userLab },
      select: {
        id: true,
        userId: true,
        name: true,
        imageUrl: true,
        isCheckedIn: true,
        academicYear: true,
        researchLab: true,
        presenceStatus: true,
        Attendance: {
          where: { check_out: null },
          select: { check_in: true },
          take: 1,
        },
      },
      orderBy: [{ isCheckedIn: "desc" }, { name: "asc" }],
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
  }
);
