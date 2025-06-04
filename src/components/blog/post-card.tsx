"use client";

import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCardProps } from "@/types";

import { PostContent } from "../editor/post-content";
import PostOperations from "../dashboard/blogs/post-operations";
import LikeButton from "./like-button";
import CommentSection from "./comment-section";

export function PostCard({ post, profile }: PostCardProps) {
  // 投稿日時を「〜前」の形式で表示
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  const isAuthor = profile?.id == post.author?.id;

  return (
    <div className="space-y-4">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <div className="flex items-center gap-2">
              {!post.published && (
                <Badge variant="outline" className="ml-2">
                  下書き
                </Badge>
              )}
              {isAuthor && <PostOperations post={post} />}
            </div>
          </div>
          {post.author && (
            <CardDescription>
              <div className="flex justify-between">
                <div>
                  投稿者:{post.author.name}({post.author.researchLab}{" "}
                  {post.author.academicYear})
                </div>
                <div>{timeAgo}</div>
              </div>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <div>
            <PostContent data={post.content} />
          </div>
        </CardContent>
        {/* Like Button Section */}
        <LikeButton postId={post.id} />
        {/* Comment Section */}
        <CommentSection postId={post.id} />
      </Card>
    </div>
  );
}
