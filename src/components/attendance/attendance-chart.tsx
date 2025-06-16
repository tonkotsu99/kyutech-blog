"use client";

import { format, addDays, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";

type AttendanceRecord = {
  id: string;
  check_in: Date;
  check_out: Date | null;
};

type ChartData = {
  date: string;
  dayOfMonth: string;
  hours: number;
  hoursText: string;
};

type AttendanceChartProps = {
  records: AttendanceRecord[];
};

// 現在時刻を日本時間に変換する関数
const getJSTNow = () => {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000);
};

export function AttendanceChart({ records }: AttendanceChartProps) {
  const [currentTime, setCurrentTime] = useState(getJSTNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getJSTNow());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  const weekStart = startOfWeek(currentTime, { locale: ja, weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const chartData: ChartData[] = weekDays.map((date) => {
    const dayRecords = records.filter((record) => {
      const recordDate = new Date(
        new Date(record.check_in).getTime() - 9 * 60 * 60 * 1000
      );
      return (
        recordDate.getDate() === date.getDate() &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });

    const totalHours = dayRecords.reduce((acc, record) => {
      const checkOutTime = record.check_out
        ? new Date(record.check_out)
        : currentTime;
      const duration =
        checkOutTime.getTime() - new Date(record.check_in).getTime();
      return acc + duration / (1000 * 60 * 60);
    }, 0);

    // 時間と分に変換
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    // 表示用のテキストを作成
    const hoursText = minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;

    return {
      date: format(date, "E", { locale: ja }),
      dayOfMonth: format(date, "M/d"),
      hours: Number(totalHours.toFixed(1)),
      hoursText,
    };
  });

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 14 }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 14 }}
            tickFormatter={(value) => `${value}時間`}
            width={60}
          />
          <Tooltip
            formatter={(value: number) => [`${value}時間`, "在室時間"]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "12px",
              fontSize: "14px",
            }}
          />
          <Bar
            dataKey="hours"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={80}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {chartData.map((data) => (
          <div
            key={data.date}
            className="text-center p-3 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="text-base font-medium text-gray-900">
              {data.date}
            </div>
            <div className="text-sm text-gray-500">{data.dayOfMonth}</div>
            <div className="text-base font-semibold text-blue-600">
              {data.hoursText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
