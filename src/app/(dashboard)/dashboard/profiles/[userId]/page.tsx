import ProfileCard from "@/components/dashboard/profiles/profile-card";
import { getUserTechSkills } from "@/lib/actions";
import { requireAuth } from "@/lib/auth";
import { getUserProfile } from "@/lib/prisma/user";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function Profile(props: Props) {
  const { userId: currentUserId } = await requireAuth();
  const targetUserIdOrId = (await props.params).userId;

  // 表示対象のユーザーのプロフィールを取得
  const targetProfile = await getUserProfile(targetUserIdOrId);

  if (!targetProfile) {
    notFound();
  }

  const skills = await getUserTechSkills(targetProfile.id);
  const isOwnProfile = currentUserId === targetProfile.userId;

  return (
    <>
      <div>
        <ProfileCard
          initialProfile={{
            id: targetProfile.id,
            userId: targetProfile.userId,
            name: targetProfile.name,
            imageUrl: targetProfile.imageUrl,
            researchLab: targetProfile.researchLab,
            academicYear: targetProfile.academicYear,
            description: targetProfile.description || "",
            isCheckedIn: targetProfile.isCheckedIn,
            presenceStatus: targetProfile.presenceStatus || "OFF_CAMPUS",
            github: targetProfile.github || "",
            x: targetProfile.x || "",
            instagram: targetProfile.instagram || "",
          }}
          initialtechSkills={skills}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </>
  );
}
