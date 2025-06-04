"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/likes`);
        if (response.ok) {
          const data = await response.json();
          setLikes(data.count);
          setLiked(data.liked);
        }
      } catch (error) {
        console.error("言い値状態の取得中にエラーが発生しました", error);
      }
    };
    fetchLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikes(data.count);
      } else {
        const error = await response.json();
        console.error("言い値の処理中にエラーが発生しました", error);
      }
    } catch (error) {
      console.error("言い値の処理中にエラーが発生しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={"ghost"}
        size={"sm"}
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
      >
        <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
        <span>{likes}</span>
      </Button>
    </div>
  );
}
