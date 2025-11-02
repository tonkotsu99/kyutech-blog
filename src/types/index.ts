import { Post as PrismaPost } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import React, { ComponentType, JSX } from "react";
import { ReactNode } from "react";
import { Prisma } from "@prisma/client";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};
export type TechStack = {
  title: string;
  description: string;
  href: string;
  svg: ReactNode;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    instagram: string;
    github: string;
  };
};

export type MarketingConfig = {
  mainNav: NavItem[];
  techstack: TechStack[];
};

export type AdditionalInfoFormProps = {
  userId: string;
};

export type SaveUserProfileProps = {
  userId: string;
  name: string;
  imageUrl: string;
  email?: string;
  researchLab: string;
  academicYear: string;
  description: string;
  github: string;
  x: string;
  instagram: string;
  isCheckedIn: boolean;
  presenceStatus: "IN_LAB" | "ON_CAMPUS" | "OFF_CAMPUS";
};

export type EditProfileProps = {
  params: Promise<{
    userId: string;
  }>;
};
export type ProfileFormProps = {
  userId: string;
};
export type MainNavProps = {
  items: NavItem[];
};

export type PageLayoutProps = {
  children: ReactNode;
};

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon: ComponentType<{ className?: string }>;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavItem[];
    }
);

export type DashboardConfig = {
  mainSidebarNav: SidebarNavItem[];
  supportSidebarNav: SidebarNavItem[];
};

export type DashboardNavProps = {
  mainItems: SidebarNavItem[];
  supportItems: SidebarNavItem[];
  userId: string;
};

export type DashBoardShellProps = React.HTMLAttributes<HTMLDivElement>;

export type DashBoardHeaderProps = {
  heading: string;
  text?: string;
  children: React.ReactNode;
};
export type PostItemProps = {
  post: Pick<PrismaPost, "id" | "title" | "published" | "createdAt">;
};

export type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: Prisma.JsonValue;
    published: boolean;
    createdAt: Date;
    author?: {
      id: string;
      name: string;
      researchLab: string;
      academicYear: string;
    };
  };
  profile: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    researchLab: string;
    academicYear: string;
  };
};

export type PostOperationsProps = {
  post: Pick<PrismaPost, "id" | "title">;
};

export type DataProps = {
  title: string;
  content: Prisma.InputJsonValue;
  published: boolean;
  authorId: string;
};

export type PostFormProps = {
  authorId: string;
  post?: {
    id: string;
    title: string;
    content: Record<string, unknown>;
    published: boolean;
  };
  isEditing?: boolean;
};

export type EditPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export type profileProps = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email?: string;
  researchLab: string;
  academicYear: string;
  description: string | "";
  isCheckedIn: boolean;
  presenceStatus: "IN_LAB" | "ON_CAMPUS" | "OFF_CAMPUS";
  comment?: string;
  github: string | "";
  x: string | "";
  instagram: string | "";
};

export type editProfileProps = {
  name: string;
  researchLab: string;
  academicYear: string;
  description: string;
  github: string;
  x: string;
  instagram: string;
};
export interface TechSkill {
  id: string;
  name: string;
  category:
    | "frontend"
    | "backend"
    | "database"
    | "image processing"
    | "fpga"
    | "ai"
    | "devops"
    | "other";
  iconName?: string;
}

export interface IconMapping {
  [key: string]: (props?: { className?: string }) => JSX.Element;
}

export interface CategoryIconMapping {
  [key: string]: LucideIcon;
}

export interface ProfileCardProps {
  initialProfile: profileProps;
  initialtechSkills: TechSkill[];
}

export interface Post {
  id: string;
  title: string;
  content: string;
  description: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  tags: string[];
  likes: number;
  views: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: User;
  postId: string;
  post: Post;
  parentId?: string;
  parent?: Comment;
  replies: Comment[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  github?: string;
  twitter?: string;
  website?: string;
  role: UserRole;
  posts: Post[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "ADMIN" | "USER" | "EDITOR";

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  github?: string;
  twitter?: string;
  website?: string;
  academicYear?: string;
  researchLab?: string;
  isCheckedIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  profileId: string;
  user: User;
  checkIn: Date;
  checkOut?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceHistory {
  records: AttendanceRecord[];
  totalTime: number;
}

export interface AttendanceStatus {
  id: string;
  profileId: string;
  name: string;
  imageUrl: string;
  isCheckedIn: boolean;
  academicYear?: string;
  researchLab?: string;
  Attendance: {
    checkIn: string;
  }[];
  weekRecords?: AttendanceRecord[];
}
