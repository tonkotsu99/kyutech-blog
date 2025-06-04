"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Heart, Reply, Edit, Trash2, X, Check } from "lucide-react";
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
import { useAuth } from "@clerk/nextjs";

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
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { userId } = useAuth();

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
    if (!userId) {
      console.error("ユーザーが認証されていません");
    }
  }, [userId]);

  // コメントを取得
  useEffect(() => {
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
  }, [postId]);

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
    const isCurrentUserComment = userId === comment.user.id;

    return (
      <Card className={`overflow-hidden ${isReply ? "ml-8 mt-2" : "mt-4"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={comment.user.imageUrl || "/placeholder.svg"}
                  alt={comment.user.name}
                />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{comment.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                  {comment.isEdited && " (編集済み)"}
                </p>
              </div>
            </div>

            {isCurrentUserComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteCommentId(comment.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {isEditing ? (
            <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
              <Textarea
                {...registerEdit("content", {
                  required: "コメントを入力してください",
                })}
                className="min-h-[100px]"
              />
              {errorsEdit.content && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsEdit.content.message}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                >
                  <X className="mr-2 h-4 w-4" />
                  キャンセル
                </Button>
                <Button type="submit" size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  保存
                </Button>
              </div>
            </form>
          ) : (
            <p className="whitespace-pre-wrap">{comment.content}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between py-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleLike(comment.id)}
              className={`flex items-center gap-1 ${
                comment.liked ? "text-red-500" : ""
              }`}
            >
              <Heart
                className={`h-4 w-4 ${comment.liked ? "fill-red-500" : ""}`}
              />
              <span>{comment.likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className="flex items-center gap-1"
            >
              <Reply className="h-4 w-4" />
              <span>返信</span>
            </Button>
          </div>
        </CardFooter>

        {/* 返信フォーム */}
        {replyingTo === comment.id && (
          <div className="px-4 pb-4">
            <form onSubmit={handleSubmitReply(onSubmitReply)}>
              <Textarea
                placeholder="返信を入力..."
                className="min-h-[80px]"
                {...registerReply("content", {
                  required: "返信を入力してください",
                })}
              />
              {errorsReply.content && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsReply.content.message}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  キャンセル
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "返信する"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 返信一覧 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="px-4 pb-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">コメント</h2>

      {/* コメント投稿フォーム */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">コメントを投稿</h3>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <Textarea
              placeholder="コメントを入力してください..."
              className="min-h-[100px]"
              {...register("content", {
                required: "コメントを入力してください",
              })}
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">
                {errors.content.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "投稿中..." : "投稿する"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* コメント一覧 */}
      <div className="space-y-4">
        {isLoading ? (
          <p>コメントを読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground">
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
    </div>
  );
}
