import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request:NextRequest,
  props: {params: Promise<{id: string; commentId: string}>}
) {
  const params = await props.params;
  try {
    const {commentId} = params;
    const {userId} = await requireAuth();

    if (!userId) {
      return NextResponse.json({error: "認証が必要です"}, {status: 401});
    }

    const comment = await db.comment.findUnique({
      where: {id: commentId},
    })

    if (!comment) {
      return NextResponse.json({error: "コメントが見つかりません"}, {status: 404})
    }

    if (comment.userId ! == userId) {
      return NextResponse.json({error: "このコメントを編集する権限がありません"}, {status: 403})
    }

    const {content} = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({error: "コメント内容は必須です"}, {status: 400})
    }

    const updatedComment = await db.comment.update({
      where: {id: commentId},
      data: {
        content, 
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("コメントの編集中にエラーが発生しました", error);
    return NextResponse.json({error: "コメントの編集中にエラーが発生しました"}, {status: 500})
  }
}

export async function DELETE(
  request:NextRequest,
  props: {params: Promise<{id: string; commentId: string}>}
) {
  const params = await props.params;
  try {
    const {commentId} = params
    const {userId} = await requireAuth();

    if (!userId) {
      return NextResponse.json({error: "認証が必要です"}, {status: 401})
    }

    const comment = await db.comment.findUnique({
      where: {id: commentId}
    })

    if (!comment) {
      return NextResponse.json({erro: "コメントが見つかりません"}, {status: 404})
    }

    if (comment.userId !== userId) {
      return NextResponse.json({error: "このコメントを削除する権限がありません"}, {status: 403})
    }

    await db.comment.delete({
      where: {id: commentId}
    })
    return NextResponse.json({success: true})
  } catch (error) {
    console.error("コメントの削除中にエラーが発生しました", error);
    return NextResponse.json({error: "コメントの削除中にエラーが発生しました"}, {status: 500})
    
  }
}