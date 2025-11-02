"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatDistanceToNow,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  subWeeks,
  isWeekend,
} from "date-fns";
import { ja } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { isHoliday } from "@holiday-jp/holiday_jp";

interface AttendanceRecord {
  id: string;
  check_in: string;
  check_out: string | null;
}

interface LabMember {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  isCheckedIn: boolean;
  presenceStatus: "IN_LAB" | "ON_CAMPUS" | "OFF_CAMPUS";
  academicYear?: string;
  researchLab: string;
  Attendance: {
    check_in: string;
  }[];
  weekRecords?: AttendanceRecord[];
}

interface AttendanceListProps {
  labName?: string;
}

export function LabAttendanceList({ labName }: AttendanceListProps) {
  const [members, setMembers] = useState<LabMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // 研究室名が指定されている場合は、その研究室のメンバーのみを取得
        const url = labName
          ? `/api/attendance?lab=${encodeURIComponent(labName)}`
          : "/api/attendance";

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        const data = await response.json();

        // 各メンバーの先週の在室記録を取得
        const membersWithWeekRecords = await Promise.all(
          data.map(async (member: LabMember) => {
            const historyResponse = await fetch(
              `/api/attendance/history?userId=${member.userId}`
            );
            if (!historyResponse.ok) {
              return member;
            }
            const historyData = await historyResponse.json();

            // 先週の記録を抽出
            const weekStart = startOfWeek(subWeeks(new Date(), 1), {
              locale: ja,
            });
            const weekEnd = endOfWeek(subWeeks(new Date(), 1), { locale: ja });

            const weekRecords = historyData.records.filter(
              (record: AttendanceRecord) => {
                const check_in_date = new Date(record.check_in);
                return check_in_date >= weekStart && check_in_date <= weekEnd;
              }
            );

            return {
              ...member,
              weekRecords,
            };
          })
        );

        setMembers(membersWithWeekRecords);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
    const interval = setInterval(fetchMembers, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [labName]);

  // 在室時間を計算する関数
  const calculateTotalTime = (records: AttendanceRecord[] = []) => {
    return records.reduce((total, record) => {
      const check_in = new Date(record.check_in);
      const check_out = record.check_out
        ? new Date(record.check_out)
        : new Date();
      const diff_minutes = differenceInMinutes(check_out, check_in);
      return total + diff_minutes;
    }, 0);
  };

  // 分を時間と分に変換する関数
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  // 平日かどうかを判定する関数
  const isSchoolDay = (date: Date) => {
    return !isWeekend(date) && !isHoliday(date);
  };

  // 日本時間に変換する関数
  const toJST = (date: Date) => {
    return new Date(date.getTime() + 9 * 60 * 60 * 1000);
  };

  // 先週の登校日数を計算する関数
  const calculateSchoolDays = () => {
    // 現在のUTC時間を日本時間に変換
    const now = toJST(new Date());
    // 1週間前の日付を取得（日本時間）
    const lastWeek = subWeeks(now, 1);
    // 1週間前の月曜日を取得（日本時間）
    const weekStart = startOfWeek(lastWeek, { locale: ja, weekStartsOn: 1 });
    // 1週間前の日曜日を取得（日本時間）
    const weekEnd = endOfWeek(lastWeek, { locale: ja, weekStartsOn: 1 });

    let schoolDays = 0;
    const currentDate = new Date(weekStart);

    // 先週の各日をチェック
    while (currentDate <= weekEnd) {
      const isSchoolDayResult = isSchoolDay(currentDate);

      if (isSchoolDayResult) {
        schoolDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schoolDays;
  };

  // 芹川研究室のメンバーで先週の在室時間が登校日×4時間を超えているかチェックする関数
  const isOverRequiredHours = (member: LabMember) => {
    if (member.researchLab !== "芹川研究室") return false;
    if (!member.weekRecords) return false;

    const totalMinutes = calculateTotalTime(member.weekRecords);
    const schoolDays = calculateSchoolDays();
    const requiredMinutes = schoolDays * 4 * 60; // 登校日数 × 4時間

    return totalMinutes > requiredMinutes;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 rounded-lg border bg-card"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const presentMembers = members.filter(
    (member) => member.presenceStatus === "IN_LAB"
  );
  const onCampusMembers = members.filter(
    (member) => member.presenceStatus === "ON_CAMPUS"
  );
  const offCampusMembers = members.filter(
    (member) => member.presenceStatus === "OFF_CAMPUS"
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          在室中 ({presentMembers.length})
        </h3>
        {presentMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            現在在室しているメンバーはいません
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {presentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.imageUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/profiles/${member.userId}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {member.name}
                      </Link>
                      {member.academicYear && (
                        <Badge variant="secondary" className="text-xs">
                          {member.academicYear}
                        </Badge>
                      )}
                    </div>
                    {member.Attendance[0] && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(member.Attendance[0].check_in),
                          {
                            addSuffix: true,
                            locale: ja,
                          }
                        )}
                        から在室中
                      </p>
                    )}
                  </div>
                </div>
                {member.weekRecords && (
                  <div
                    className={`p-1.5 rounded-md ${
                      member.researchLab === "芹川研究室" &&
                      isOverRequiredHours(member)
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800/20"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        member.researchLab === "芹川研究室" &&
                        isOverRequiredHours(member)
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      先週の在室時間
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        member.researchLab === "芹川研究室" &&
                        isOverRequiredHours(member)
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {formatDuration(calculateTotalTime(member.weekRecords))}
                      {member.researchLab === "芹川研究室" && (
                        <span className="ml-1 text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded-full">
                          {formatDuration(calculateSchoolDays() * 4 * 60)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">在室中</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">
          学内 ({onCampusMembers.length})
        </h3>
        {onCampusMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            現在学内にいるメンバーはいません
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {onCampusMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.imageUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/profiles/${member.userId}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {member.name}
                      </Link>
                      {member.academicYear && (
                        <Badge variant="secondary" className="text-xs">
                          {member.academicYear}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">学内滞在中</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                  <span className="text-xs text-muted-foreground">学内</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">
          退室 ({offCampusMembers.length})
        </h3>
        {offCampusMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            退室しているメンバーはいません
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {offCampusMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.imageUrl} alt={member.name} />
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/profiles/${member.userId}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {member.name}
                      </Link>
                      {member.academicYear && (
                        <Badge variant="secondary" className="text-xs">
                          {member.academicYear}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {member.weekRecords && (
                  <div
                    className={`p-1.5 rounded-md ${
                      member.researchLab === "芹川研究室" &&
                      isOverRequiredHours(member)
                        ? "bg-green-100 dark:bg-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800/20"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        member.researchLab === "芹川研究室" &&
                        isOverRequiredHours(member)
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      先週の在室時間
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        member.researchLab === "芹川研究室" &&
                        isOverRequiredHours(member)
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {formatDuration(calculateTotalTime(member.weekRecords))}
                      {member.researchLab === "芹川研究室" && (
                        <span className="ml-1 text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded-full">
                          {formatDuration(calculateSchoolDays() * 4 * 60)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-muted-foreground">退室中</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
