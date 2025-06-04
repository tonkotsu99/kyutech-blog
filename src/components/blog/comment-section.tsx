"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Heart,
  Reply,
  Edit,
  Trash2,
  X,
  Check,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LikeButton from "./like-button";

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  likeCount: number;
  liked?: boolean;
  user: User;
  parentId: string | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  profileId: string;
}

export default function CommentSection({
  postId,
  profileId,
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ content: string }>({
    defaultValues: {
      content: "",
    },
  });

  const {
    register: registerReply,
    handleSubmit: handleSubmitReply,
    reset: resetReply,
    formState: { errors: errorsReply },
  } = useForm<{ content: string }>({
    defaultValues: {
      content: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm<{ content: string }>({
    defaultValues: {
      content: "",
    },
  });

  // 現在のユーザーIDを取得
  useEffect(() => {
    if (!profileId) {
      console.error("ユーザーが認証されていません");
    }
  }, [profileId]);

  // コメントを取得
  useEffect(() => {
    if (!isOpen) return;

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        if (response.ok) {
          const data = await response.json();
          // 親コメントと返信を整理
          const parentComments = data.filter(
            (comment: Comment) => !comment.parentId
          );
          const commentMap = new Map<string, Comment>();

          data.forEach((comment: Comment) => {
            commentMap.set(comment.id, { ...comment, replies: [] });
          });

          data.forEach((comment: Comment) => {
            if (comment.parentId && commentMap.has(comment.parentId)) {
              const parent = commentMap.get(comment.parentId);
              if (parent && parent.replies) {
                parent.replies.push(commentMap.get(comment.id)!);
              }
            }
          });

          const organizedComments = parentComments.map(
            (comment: Comment) => commentMap.get(comment.id)!
          );
          setComments(organizedComments);
        } else {
          console.error("コメントの取得に失敗しました");
        }
      } catch (error) {
        console.error("コメントの取得中にエラーが発生しました", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, isOpen]);

  // コメントを投稿
  const onSubmit = async (data: { content: string }) => {
    if (!data.content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data.content }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
        reset();
      } else {
        const error = await response.json();
        console.error("コメントの投稿に失敗しました", error);
      }
    } catch (error) {
      console.error("コメントの投稿中にエラーが発生しました", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 返信を投稿
  const onSubmitReply = async (data: { content: string }) => {
    if (!data.content.trim() || !replyingTo) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
          parentId: replyingTo,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();

        // コメント一覧を更新
        setComments((prev) => {
          return prev.map((comment) => {
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              };
            }
            return comment;
          });
        });

        resetReply();
        setReplyingTo(null);
      } else {
        const error = await response.json();
        console.error("返信の投稿に失敗しました", error);
      }
    } catch (error) {
      console.error("返信の投稿中にエラーが発生しました", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメントを編集
  const onSubmitEdit = async (data: { content: string }) => {
    if (!data.content.trim() || !editingCommentId) return;

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${editingCommentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: data.content }),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();

        // コメント一覧を更新
        setComments((prev) => {
          return prev.map((comment) => {
            if (comment.id === editingCommentId) {
              return { ...comment, ...updatedComment };
            }

            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === editingCommentId
                    ? { ...reply, ...updatedComment }
                    : reply
                ),
              };
            }

            return comment;
          });
        });

        resetEdit();
        setEditingCommentId(null);
      } else {
        const error = await response.json();
        console.error("コメントの編集に失敗しました", error);
      }
    } catch (error) {
      console.error("コメントの編集中にエラーが発生しました", error);
    }
  };

  // コメントを削除
  const deleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${deleteCommentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // コメント一覧から削除
        setComments((prev) => {
          // 親コメントの場合
          const filteredComments = prev.filter(
            (comment) => comment.id !== deleteCommentId
          );

          // 返信の場合
          return filteredComments.map((comment) => {
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== deleteCommentId
                ),
              };
            }
            return comment;
          });
        });
      } else {
        const error = await response.json();
        console.error("コメントの削除に失敗しました", error);
      }
    } catch (error) {
      console.error("コメントの削除中にエラーが発生しました", error);
    } finally {
      setDeleteCommentId(null);
    }
  };

  // コメントにいいね
  const toggleLike = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/like`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const { liked, count } = await response.json();

        // コメント一覧を更新
        setComments((prev) => {
          return prev.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, liked, likeCount: count };
            }

            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId
                    ? { ...reply, liked, likeCount: count }
                    : reply
                ),
              };
            }

            return comment;
          });
        });
      } else {
        const error = await response.json();
        console.error("いいねの処理に失敗しました", error);
      }
    } catch (error) {
      console.error("いいねの処理中にエラーが発生しました", error);
    }
  };

  // 編集を開始
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setValueEdit("content", comment.content);
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setEditingCommentId(null);
    resetEdit();
  };

  // コメントコンポーネント
  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => {
    const isEditing = editingCommentId === comment.id;
    const isCurrentUserComment = profileId === comment.user.id;

    return (
      <div className={`${isReply ? "ml-8 mt-2" : "mt-4"} pb-2`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Avatar className="h-6 w-6 mt-1">
              <AvatarImage
                src={comment.user.imageUrl || "/placeholder.svg"}
                alt={comment.user.name}
              />
              <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{comment.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                  {comment.isEdited && " (編集済み)"}
                </p>
              </div>
              {isEditing ? (
                <form
                  onSubmit={handleSubmitEdit(onSubmitEdit)}
                  className="mt-1"
                >
                  <Textarea
                    {...registerEdit("content", {
                      required: "コメントを入力してください",
                    })}
                    className="min-h-[60px] text-sm"
                  />
                  {errorsEdit.content && (
                    <p className="text-xs text-red-500 mt-1">
                      {errorsEdit.content.message}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                      className="h-7 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      キャンセル
                    </Button>
                    <Button type="submit" size="sm" className="h-7 text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      保存
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-sm whitespace-pre-wrap mt-1">
                  {comment.content}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(comment.id)}
                  className={`h-6 px-2 text-xs ${
                    comment.liked ? "text-red-500" : ""
                  }`}
                >
                  <Heart
                    className={`h-3 w-3 mr-1 ${
                      comment.liked ? "fill-red-500" : ""
                    }`}
                  />
                  <span>{comment.likeCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="h-6 px-2 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  返信
                </Button>

                {isCurrentUserComment && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(comment)}>
                        <Edit className="mr-2 h-3 w-3" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteCommentId(comment.id)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 返信フォーム */}
        {replyingTo === comment.id && (
          <div className="mt-2 ml-8">
            <form
              onSubmit={handleSubmitReply(onSubmitReply)}
              className="relative"
            >
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="返信を入力..."
                  className="min-h-[40px] py-2 pr-20 resize-none text-sm"
                  {...registerReply("content", {
                    required: "返信を入力してください",
                  })}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {isSubmitting ? "送信中..." : "返信"}
                </Button>
              </div>
              {errorsReply.content && (
                <p className="text-xs text-red-500 mt-1">
                  {errorsReply.content.message}
                </p>
              )}
            </form>
          </div>
        )}

        {/* 返信一覧 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 px-6">
      <div className="flex items-center gap-4">
        <LikeButton postId={postId} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5" />
          <span>コメント</span>
          {comments.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <>
          {/* コメント投稿フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} className="relative">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="コメントを入力してください..."
                className="min-h-[40px] py-2 pr-20 resize-none"
                {...register("content", {
                  required: "コメントを入力してください",
                })}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {isSubmitting ? "送信中..." : "投稿"}
              </Button>
            </div>
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">
                {errors.content.message}
              </p>
            )}
          </form>

          {/* コメント一覧 */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                コメントを読み込み中...
              </p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                まだコメントはありません。最初のコメントを投稿しましょう！
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>

          {/* 削除確認ダイアログ */}
          <AlertDialog
            open={!!deleteCommentId}
            onOpenChange={(open) => !open && setDeleteCommentId(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は元に戻せません。コメントは完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteComment}
                  className="bg-red-500 hover:bg-red-600"
                >
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
