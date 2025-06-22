import { AllAttendanceList } from "@/components/attendance/all-attendance-list";

export default async function DisplayPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="h-full">
        <AllAttendanceList />
      </div>
    </div>
  );
}
