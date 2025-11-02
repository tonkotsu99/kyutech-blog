"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useRef, useState } from "react";
import { ProfileHeader } from "./ui/profile-header";

import { ProfileEditButtons } from "./ui/profile-edit-button";
import { profileProps, TechSkill } from "@/types";
import { toast } from "sonner";
import {
  addTechSkill,
  deleteTechSkill,
  saveUserProfileAction,
  toggleCheckedInStatus,
  updateTechSkill,
} from "@/lib/actions";
import ProfileForm from "./ui/profile-form";
import { z } from "zod";
import { profileFormSchema } from "@/lib/validations/profile";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TechSkillsSection from "./ui/tech-skills-section";
import { PutBlobResult } from "@vercel/blob";

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileCardProps {
  initialProfile: profileProps;
  initialtechSkills: TechSkill[];
  isOwnProfile?: boolean;
}

const ProfileCard = ({
  initialProfile,
  initialtechSkills,
  isOwnProfile = false,
}: ProfileCardProps) => {
  const defaultProfile: profileProps = {
    name: initialProfile?.name || "",
    academicYear: initialProfile?.academicYear || "",
    researchLab: initialProfile?.researchLab || "",
    id: initialProfile?.id || "",
    userId: initialProfile?.userId || "",
    imageUrl: initialProfile?.imageUrl || "",
    email: initialProfile?.email || "",
    description: initialProfile?.description || "",
    isCheckedIn: initialProfile?.isCheckedIn,
    presenceStatus: initialProfile?.presenceStatus || "OFF_CAMPUS",
    github: initialProfile?.github || "",
    x: initialProfile?.x || "",
    instagram: initialProfile?.instagram || "",
  };

  const [profile, setProfile] = useState<profileProps>(defaultProfile);
  const [techSkills, setTechSkills] = useState<TechSkill[]>(initialtechSkills);
  const [editMode, setEditMode] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TechSkill | null>(null);
  const isLoading = false;
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(profile.imageUrl || "未設定");
  const inputFileRef = useRef<HTMLInputElement>(null);

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      imageUrl: profile.imageUrl,
      researchLab: profile.researchLab,
      academicYear: profile.academicYear,
      email: profile.email || "",
      description: profile.description || "",
      isCheckedIn: profile.isCheckedIn,
      presenceStatus: profile.presenceStatus || "OFF_CAMPUS",
      github: profile.github || "",
      x: profile.x || "",
      instagram: profile.instagram || "",
    },
  });

  const handleProfileEdit = () => {
    methods.reset({
      name: profile.name,
      imageUrl: profile.imageUrl,
      researchLab: profile.researchLab,
      academicYear: profile.academicYear,
      email: profile.email || "",
      description: profile.description || "",
      isCheckedIn: profile.isCheckedIn,
      presenceStatus: profile.presenceStatus || "OFF_CAMPUS",
      github: profile.github || "",
      x: profile.x || "",
      instagram: profile.instagram || "",
    });
    setPreviewUrl(profile.imageUrl || "未設定");
    setEditMode(true);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const response = await fetch(
        `/api/dashboard/profiles?filename=${file.name}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("画像のアップロードに失敗しました");
      }
      const newBlob = (await response.json()) as PutBlobResult;

      methods.setValue("imageUrl", newBlob.url);
      toast.success("画像がアップロードされました");
    } catch (error) {
      console.error(error);
      toast.error("画像のアップロードに失敗しました");
      toast.error("画像のアップロードに失敗しました");
      setPreviewUrl(profile.imageUrl || "未設定");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      const isValid = await methods.trigger();
      if (!isValid) {
        toast.error("入力内容を確認してください");
        return;
      }
      const formValues = methods.getValues();
      const updatedProfileData = {
        ...profile,
        ...formValues,
      };
      await saveUserProfileAction({
        userId: updatedProfileData.userId,
        name: updatedProfileData.name,
        imageUrl: updatedProfileData.imageUrl,
        email: updatedProfileData.email,
        researchLab: updatedProfileData.researchLab,
        academicYear: updatedProfileData.academicYear,
        description: updatedProfileData.description,
        github: updatedProfileData.github,
        x: updatedProfileData.x,
        instagram: updatedProfileData.instagram,
        isCheckedIn: updatedProfileData.isCheckedIn,
        presenceStatus: updatedProfileData.presenceStatus || "OFF_CAMPUS",
      });
      setProfile(updatedProfileData);
      setEditMode(false);
      toast.success("プロフィールを更新しました");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("プロフィールの更新に失敗しました");
    }
  };

  const handleProfileCancel = () => {
    setEditMode(false);
  };

  const handleToggleCheckedInStatus = async () => {
    if (!editMode) {
      setProfile((prev) => ({
        ...prev,
        isCheckedIn: !prev.isCheckedIn,
        presenceStatus: !prev.isCheckedIn ? "IN_LAB" : "OFF_CAMPUS",
      }));
    }
    try {
      const newStatus = await toggleCheckedInStatus(
        profile.userId,
        !profile.isCheckedIn
      );
      setProfile((prev) => ({
        ...prev,
        isCheckedIn: newStatus,
        presenceStatus: newStatus ? "IN_LAB" : "OFF_CAMPUS",
      }));
      if (newStatus) {
        toast.success("在室に変更しました");
      } else {
        toast.success("退室に変更しました");
      }
    } catch (error) {
      console.error("チェックイン状態更新エラー:", error);
      toast.error("チェックイン状態の更新に失敗しました");
    }
  };

  const handleSetOnCampusStatus = async () => {
    try {
      const response = await fetch("/api/attendance/inside-area", {
        method: "POST",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "学内ステータスの更新に失敗しました");
      }

      setProfile((prev) => ({
        ...prev,
        isCheckedIn: false,
        presenceStatus: "ON_CAMPUS",
      }));
      toast.success("学内ステータスに変更しました");
    } catch (error) {
      console.error("学内ステータス更新エラー:", error);
      toast.error("学内ステータスの更新に失敗しました");
    }
  };

  const handleAddSkill = async (newSkill: Omit<TechSkill, "id">) => {
    try {
      if (!profile.id) {
        const tempId = Math.random().toString(36).substring(2, 9);
        setTechSkills([...techSkills, { id: tempId, ...newSkill }]);
        return;
      }
      const skill = await addTechSkill(profile.id, newSkill);
      setTechSkills([...techSkills, skill]);
      toast.success("スキルが追加されました");
    } catch (error) {
      console.error("スキル追加エラー:", error);
      toast.error("スキルの追加に失敗しました");
    }
  };
  const handleEditSkill = (skill: TechSkill) => {
    setEditingSkill(skill);
  };

  const handleSaveEditSkill = async () => {
    if (!editingSkill || !profile.id) {
      return;
    }
    try {
      const updatedSkill = await updateTechSkill(editingSkill.id, {
        name: editingSkill.name,
        category: editingSkill.category,
        iconName: editingSkill.iconName,
      });

      setTechSkills(
        techSkills.map((skill) =>
          skill.id === editingSkill.id ? updatedSkill : skill
        )
      );
      setEditingSkill(null);

      toast.success("スキルが更新されました");
    } catch (error) {
      console.error("スキル更新エラー:", error);
      toast.error("スキルの更新に失敗しました");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      if (!profile.id) {
        setTechSkills(techSkills.filter((skill) => skill.id !== id));
        return;
      }
      await deleteTechSkill(id);
      setTechSkills(techSkills.filter((skill) => skill.id !== id));
      toast.success("スキルが削除されました");
    } catch (error) {
      console.error("スキル削除エラー:", error);
      toast.error("スキルの削除に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-center items-center h-40">
            <p>読み込み中...</p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="mt-2 md:mt-5">
        <CardHeader className="pb-2 md:pb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            プロフィール
          </h3>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <Card>
            <CardContent className="p-3 md:p-6 pr-4 md:pr-6">
              {isOwnProfile && (
                <ProfileEditButtons
                  editMode={editMode}
                  onEdit={handleProfileEdit}
                  onSave={handleProfileSave}
                  onCancel={handleProfileCancel}
                />
              )}
              <FormProvider {...methods}>
                {!editMode ? (
                  <ProfileHeader
                    profile={profile}
                    onToggleCheckedIn={handleToggleCheckedInStatus}
                    onSetOnCampus={handleSetOnCampusStatus}
                    isOwnProfile={isOwnProfile}
                  />
                ) : (
                  <ProfileForm
                    isUploading={isUploading}
                    previewUrl={previewUrl}
                    inputFileRef={inputFileRef}
                    handleFileChange={handleFileChange}
                  />
                )}
              </FormProvider>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-6 pr-4 md:pr-6">
              <TechSkillsSection
                techSkills={techSkills}
                onAddSkill={handleAddSkill}
                onEditSkill={handleEditSkill}
                onSaveEditSkill={handleSaveEditSkill}
                onDeleteSkill={handleDeleteSkill}
                editingSkill={editingSkill}
                setEditingSkill={setEditingSkill}
                isOwnProfile={isOwnProfile}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProfileCard;
