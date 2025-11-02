import * as z from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  researchLab: z.string().min(1, "研究室は必須です"),
  academicYear: z.string().min(1, "学年は必須です"),
  imageUrl: z.string().url("有効なURLを入力してください"),
  description: z.string(),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  github: z.string(),
  x: z.string(),
  instagram: z.string(),
  isCheckedIn: z.boolean(),
  presenceStatus: z
    .enum(["IN_LAB", "ON_CAMPUS", "OFF_CAMPUS"])
    .default("OFF_CAMPUS"),
});
