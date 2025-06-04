import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> }
) {
  const params = await props.params;
  try {
    const { commentId } = params;
    const { userId } = await requireAuth();

    if (!userId) {
      return NextResponse.json({ erro: "認証が必要です" }, { status: 401 });
    }

    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 }
      );
    }

    const existingLike = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    let liked = false;
    let count = comment.likeCount;

    if (existingLike) {
      await db.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      const updatedComment = await db.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });

      count = updatedComment.likeCount;
      liked = false;
    } else {
      await db.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      const updatedComment = await db.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });

      count = updatedComment.likeCount;
      liked = true;
    }

    return NextResponse.json({ liked, count });
  } catch (error) {
    console.error("コメントのいいね処理中にエラーが発生しました", error);
    return NextResponse.json(
      {
        error: "コメントのいいね処理中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
