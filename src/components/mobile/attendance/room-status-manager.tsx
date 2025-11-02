"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toggleCheckedInStatus } from "@/lib/actions";
import { profileProps } from "@/types";
import { LogIn, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RoomStatusManagerProps = {
  profile: profileProps;
};

export default function RoomStatusManager({ profile }: RoomStatusManagerProps) {
  const [user, setUser] = useState<profileProps>(profile);
  const [checkOutComment, setCheckOutComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleCheckedInStatus = async (isCheckIn: boolean) => {
    try {
      setIsLoading(true);
      const comment = isCheckIn ? "" : checkOutComment;
      const newStatus = await toggleCheckedInStatus(
        user.userId,
        isCheckIn,
        comment
      );
      setUser((prev) => ({
        ...prev,
        isCheckedIn: newStatus,
        presenceStatus: newStatus ? "IN_LAB" : "OFF_CAMPUS",
      }));
      if (newStatus) {
        toast.success("在室に変更しました");
      } else {
        toast.success("退室に変更しました");
        setCheckOutComment("");
      }
    } catch (error) {
      console.log("チェックイン状態更新エラー:", error);
      toast.error("チェックイン状態の更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetOnCampus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/attendance/inside-area", {
        method: "POST",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "学内ステータスの更新に失敗しました");
      }

      setUser((prev) => ({
        ...prev,
        isCheckedIn: false,
        presenceStatus: "ON_CAMPUS",
      }));
      toast.success("学内ステータスに変更しました");
    } catch (error) {
      console.log("学内ステータス更新エラー:", error);
      toast.error("学内ステータスの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">LocaLabo</CardTitle>
        <CardDescription>現在の状態を更新してください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-2 py-2">
          <Avatar className="h-12 w-12 ">
            <AvatarImage src={user.imageUrl} />
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </div>

        <div className="flex justify-center">
          <div
            className={`text-center px-4 py-2 rounded-full font-medium ${(() => {
              if (user.isCheckedIn === null) return "bg-gray-200 text-gray-700";
              switch (user.presenceStatus) {
                case "IN_LAB":
                  return "bg-green-100 text-green-800";
                case "ON_CAMPUS":
                  return "bg-amber-100 text-amber-800";
                default:
                  return "bg-red-100 text-red-800";
              }
            })()}`}
          >
            {user.isCheckedIn === null
              ? "読み込み中..."
              : user.presenceStatus === "IN_LAB"
              ? "在室中"
              : user.presenceStatus === "ON_CAMPUS"
              ? "学内"
              : "退室中"}
          </div>
        </div>

        {user.isCheckedIn && (
          <div className="space-y-2">
            <Input
              placeholder="活動報告を入力（任意）"
              value={checkOutComment}
              onChange={(e) => setCheckOutComment(e.target.value)}
              maxLength={50}
            />
            {checkOutComment && (
              <p className="text-sm text-gray-500 text-right">
                {checkOutComment.length}/50文字
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 py-2">
        <Button
          className="w-full h-16 text-lg"
          onClick={() => handleToggleCheckedInStatus(true)}
          disabled={isLoading || user.presenceStatus === "IN_LAB"}
          variant={user.presenceStatus === "IN_LAB" ? "outline" : "default"}
        >
          <LogIn className="mr-2 h-5 w-5" />
          入室
        </Button>
        <Button
          className="w-full h-16 text-lg"
          onClick={handleSetOnCampus}
          disabled={isLoading || user.presenceStatus === "ON_CAMPUS"}
          variant={
            user.presenceStatus === "ON_CAMPUS" ? "outline" : "secondary"
          }
        >
          <MapPin className="mr-2 h-5 w-5" />
          学内
        </Button>
        <Button
          className="w-full h-16 text-lg"
          onClick={() => handleToggleCheckedInStatus(false)}
          disabled={isLoading || user.presenceStatus === "OFF_CAMPUS"}
          variant={user.presenceStatus === "OFF_CAMPUS" ? "outline" : "default"}
        >
          <LogOut className="mr-2 h-5 w-5" />
          退室
        </Button>
      </CardFooter>
    </>
  );
}
