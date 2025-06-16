import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllAttendanceList } from "@/components/attendance/all-attendance-list";

export default async function LocalaboPage() {
  return (
    <div className="py-8">
      <div className="grid gap-6">
        <Card className="min-h-[1750px] md:min-h-[800px]">
          <CardHeader>
            <CardTitle>全研究室在室状況</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              全研究室の在室状況をリアルタイムで表示しています。
            </p>
            <AllAttendanceList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
