"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

type UserProfile = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string | null;
  researchLab: string;
  academicYear: string;
  isCheckedIn: boolean;
  presenceStatus: "IN_LAB" | "ON_CAMPUS" | "OFF_CAMPUS";
};

export function AttendanceProfile({ targetUserId }: { targetUserId?: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/${targetUserId || "me"}`);

        if (!response.ok) {
          throw new Error("プロフィールの取得に失敗しました");
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
        toast.error("プロフィールの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId]);

  if (loading || !profile) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex  items-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusStyles: Record<
    UserProfile["presenceStatus"],
    { label: string; card: string; badge: string }
  > = {
    IN_LAB: {
      label: "在室",
      card: "bg-green-300 hover:bg-green-400 dark:bg-green-950/20 hover:dark:bg-green-950/30",
      badge: "bg-green-100 text-green-700",
    },
    ON_CAMPUS: {
      label: "学内",
      card: "bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/20 hover:dark:bg-amber-900/30",
      badge: "bg-amber-100 text-amber-700",
    },
    OFF_CAMPUS: {
      label: "学外",
      card: "",
      badge: "bg-gray-100 text-gray-600",
    },
  };

  const status =
    statusStyles[profile.presenceStatus] ?? statusStyles.OFF_CAMPUS;

  return (
    <Link href={`/dashboard/profiles/${profile.userId}`}>
      <Card className={`h-full ${status.card}`}>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 justify-center">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile.imageUrl || undefined}
                alt={profile.name}
              />
              <AvatarFallback>
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.researchLab} / {profile.academicYear}
              </p>
              <div className="mt-2 flex justify-center">
                <Badge className={status.badge}>{status.label}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
