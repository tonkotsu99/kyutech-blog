"use server";

import { SaveUserProfileProps, TechSkill } from "@/types";
import { revalidatePath } from "next/cache";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "./prisma/user";
import { createPost, deletePost, updatePost } from "./prisma/post";
import {
  createSkill,
  deleteSkill,
  getUserSkills,
  updateSkill,
} from "./prisma/skill";
import { createAttendance, updateAttendance } from "./prisma/attendance";

export const saveUserProfileAction = async ({
  userId,
  name,
  imageUrl,
  email,
  researchLab,
  academicYear,
  description,
  github,
  x,
  instagram,
  isCheckedIn,
  presenceStatus,
}: SaveUserProfileProps) => {
  try {
    const nextPresence =
      presenceStatus ?? (isCheckedIn ? "IN_LAB" : "OFF_CAMPUS");
    const result = await updateUserProfile(userId, {
      name,
      imageUrl,
      email: email || "",
      researchLab,
      academicYear,
      description,
      github,
      x,
      instagram,
      isCheckedIn,
      presenceStatus: nextPresence,
    });

    if (!result) {
      await createUserProfile({
        userId,
        name,
        imageUrl,
        email,
        researchLab,
        academicYear,
        description,
        github,
        x,
        instagram,
        isCheckedIn,
        presenceStatus: nextPresence,
      });
    }
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error };
  }
};

export async function toggleCheckedInStatus(
  userId: string,
  isCheckedIn: boolean,
  comment?: string
) {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      throw new Error("プロフィールが見つかりません");
    }

    if (!profile.id) {
      throw new Error("プロフィールIDが見つかりません");
    }

    // Attendanceテーブルへの記録
    const nextPresenceStatus = isCheckedIn ? "IN_LAB" : "OFF_CAMPUS";

    if (isCheckedIn) {
      await createAttendance(profile.id, comment);
    } else {
      try {
        await updateAttendance(profile.id, {
          comment,
          nextStatus: "OFF_CAMPUS",
        });
      } catch (error) {
        // チェックイン記録が見つからない場合は、プロフィールの状態のみを更新
        console.error(error);
        console.warn(
          "チェックイン記録が見つかりませんが、プロフィールの状態を更新します"
        );
      }
    }

    await updateUserProfile(userId, {
      name: profile.name,
      imageUrl: profile.imageUrl,
      email: profile.email || "",
      researchLab: profile.researchLab,
      academicYear: profile.academicYear,
      description: profile.description || "",
      github: profile.github || "",
      x: profile.x || "",
      instagram: profile.instagram || "",
      isCheckedIn,
      presenceStatus: nextPresenceStatus,
    });

    revalidatePath("/");
    return isCheckedIn;
  } catch (error) {
    console.error("チェックイン状態更新エラー:", error);
    throw new Error("チェックイン状態の更新に失敗しました");
  }
}

export async function createPostAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const contentStr = formData.get("content") as string;
    const published = formData.get("published") === "true";
    const authorId = formData.get("authorId") as string;

    if (!title || !contentStr || !authorId) {
      return { success: false, error: "必須フィールドが不足しています" };
    }

    // 文字列をJSONオブジェクトに変換
    let content;
    try {
      content = JSON.parse(contentStr);

      // EditorJSのデータ構造が不完全な場合の対応
      if (!content.blocks && !content.time) {
        // 単純なテキストとして扱う
        content = {
          blocks: [
            {
              type: "paragraph",
              data: {
                text: contentStr,
              },
            },
          ],
          time: new Date().getTime(),
          version: "2.22.2",
        };
      }

      // コンソールに保存するデータを出力（デバッグ用）
      console.log("Saving content:", content);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      // JSONパースに失敗した場合は単純なテキストとして扱う
      content = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: contentStr,
            },
          },
        ],
        time: new Date().getTime(),
        version: "2.22.2",
      };
    }

    await createPost({
      title,
      content,
      published,
      authorId,
    });

    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error };
  }
}

// 投稿の更新アクション
export async function updatePostAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const contentStr = formData.get("content") as string;
    const published = formData.get("published") === "true";

    if (!id || !title || !contentStr) {
      return { success: false, error: "必須フィールドが不足しています" };
    }

    // 文字列をJSONオブジェクトに変換
    let content;
    try {
      content = JSON.parse(contentStr);

      // EditorJSのデータ構造が不完全な場合の対応
      if (!content.blocks && !content.time) {
        // 単純なテキストとして扱う
        content = {
          blocks: [
            {
              type: "paragraph",
              data: {
                text: contentStr,
              },
            },
          ],
          time: new Date().getTime(),
          version: "2.22.2",
        };
      }

      // コンソールに保存するデータを出力（デバッグ用）
      console.log("Updating content:", content);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      // JSONパースに失敗した場合は単純なテキストとして扱う
      content = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: contentStr,
            },
          },
        ],
        time: new Date().getTime(),
        version: "2.22.2",
      };
    }

    await updatePost(id, {
      title,
      content,
      published,
    });

    revalidatePath(`/posts/${id}`);
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error };
  }
}

export const deletePostAction = async (formData: FormData) => {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "投稿IDが不足しています" };
    }

    await deletePost(id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error };
  }
};

// ユーザーのスキルを取得
export async function getUserTechSkills(profileId: string) {
  try {
    const skills = await getUserSkills(profileId);

    if (!skills) return [];

    // TechSkill型に変換
    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category as
        | "frontend"
        | "backend"
        | "database"
        | "image processing"
        | "ai"
        | "fpga"
        | "devops"
        | "other",
      iconName: skill.iconName || undefined,
    })) as TechSkill[];
  } catch (error) {
    console.error("スキル取得エラー:", error);
    throw new Error("スキルの取得に失敗しました");
  }
}

// スキルを追加
export async function addTechSkill(
  profileId: string,
  skill: Omit<TechSkill, "id">
) {
  try {
    const newSkill = await createSkill({
      name: skill.name,
      category: skill.category,
      iconName: skill.iconName,
      profileId,
    });

    revalidatePath("/");

    return {
      id: newSkill.id,
      name: newSkill.name,
      category: newSkill.category as
        | "frontend"
        | "backend"
        | "database"
        | "image processing"
        | "ai"
        | "fpga"
        | "devops"
        | "other",
      iconName: newSkill.iconName || undefined,
    } as TechSkill;
  } catch (error) {
    console.error("スキル追加エラー:", error);
    throw new Error("スキルの追加に失敗しました");
  }
}

// スキルを更新
export async function updateTechSkill(
  skillId: string,
  skill: Omit<TechSkill, "id">
) {
  try {
    const updatedSkill = await updateSkill(skillId, {
      name: skill.name,
      category: skill.category,
      iconName: skill.iconName,
    });

    revalidatePath("/");

    return {
      id: updatedSkill.id,
      name: updatedSkill.name,
      category: updatedSkill.category as
        | "frontend"
        | "backend"
        | "database"
        | "image processing"
        | "ai"
        | "fpga"
        | "devops"
        | "other",
      iconName: updatedSkill.iconName || undefined,
    } as TechSkill;
  } catch (error) {
    console.error("スキル更新エラー:", error);
    throw new Error("スキルの更新に失敗しました");
  }
}

// スキルを削除
export async function deleteTechSkill(skillId: string) {
  try {
    await deleteSkill(skillId);

    revalidatePath("/");
    return true;
  } catch (error) {
    console.error("スキル削除エラー:", error);
    throw new Error("スキルの削除に失敗しました");
  }
}
