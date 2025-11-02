"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SocialLinks } from "./social-links";
import { profileProps } from "@/types";

interface ProfileHeaderProps {
  profile: profileProps;
  onToggleCheckedIn: () => void;
  onSetOnCampus?: () => void;
  isOwnProfile?: boolean;
}

export const ProfileHeader = ({
  profile,
  onToggleCheckedIn,
  onSetOnCampus,
  isOwnProfile = false,
}: ProfileHeaderProps) => {
  const presenceLabelMap: Record<
    profileProps["presenceStatus"],
    { label: string; style: string }
  > = {
    IN_LAB: { label: "在室", style: "bg-green-100 text-green-700" },
    ON_CAMPUS: { label: "学内", style: "bg-amber-100 text-amber-700" },
    OFF_CAMPUS: { label: "学外", style: "bg-gray-100 text-gray-600" },
  };

  const presence =
    presenceLabelMap[profile.presenceStatus] ?? presenceLabelMap.OFF_CAMPUS;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 mx-auto md:mx-0">
          <AvatarImage src={profile.imageUrl} alt={profile.name} />
          <AvatarFallback>{profile.name[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold">{profile.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Badge variant="outline">{profile.academicYear}</Badge>
            <Badge variant="outline">{profile.researchLab}</Badge>
            <Badge className={`${presence.style}`}>{presence.label}</Badge>
            <SocialLinks
              github={profile.github}
              x={profile.x}
              instagram={profile.instagram}
            />
          </div>
        </div>
        {isOwnProfile && (
          <div className="flex w-full md:w-auto md:ml-auto gap-2">
            <Button
              onClick={onToggleCheckedIn}
              className={`flex-1 md:flex-none px-6 py-2 text-base md:text-lg ${
                profile.isCheckedIn
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {profile.isCheckedIn ? "退室" : "入室"}
            </Button>
            <Button
              variant="secondary"
              onClick={onSetOnCampus}
              disabled={profile.presenceStatus === "ON_CAMPUS"}
              className="flex-1 md:flex-none px-4 py-2 text-base md:text-lg"
            >
              学内
            </Button>
          </div>
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold">自己紹介</h3>
          <p className="text-sm md:text-base text-muted-foreground">
            {profile.description}
          </p>
        </div>
      </div>
    </div>
  );
};
