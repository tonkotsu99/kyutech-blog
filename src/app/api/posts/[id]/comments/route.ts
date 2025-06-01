import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {id: string}}) {
  try {
    const postId = params.id
    const {userId} = await requireAuth();

    const post = await db.post.findUnique({
      where: {id: postId},
    })

    if (!post) {
      return NextResponse.json({error: "記事が見つかりません"}, {status: 404})
    }

    const comments = await db.comment.findMany({
      where: {postId},
      orderBy: {createdAt: "desc"},
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

    let userLikedComments: {commentId: string}[] = [];
    if (!userId) {
      userLikedComments = await db.commentLike.findMany({
        where: {
          userId,
          comment: {
            postId,
          }
        },
        select: {
          commentId: true,
        }
      })
    }

    const likedCommentIds = new Set(userLikedComments.map((like) => like.commentId))

    const commentsWithLikeInfo = comments.map((comment) => ({...comment, liked: likedCommentIds.has(comment.id)}))

    return NextResponse.json(commentsWithLikeInfo)
  } catch (error) {
    console.error("コメントの取得中にエラーが発生しました", error );
    return NextResponse.json({error: "コメントの取得中にエラーが発生しました"}, {status: 500})
  }
}

export async function POST(request: NextRequest, {params}: {params: {id:string}}) {
  try {
    const postId = params.id
    const {userId} = await requireAuth();

    if (!userId) {
      return NextResponse.json({error: "認証が必要です"}, {status: 401});
    }

    const { content, parentId} = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({error: "コメント内容は必須です"}, {status: 400})
    }

    const post = await db.post.findUnique({where: {id: postId}})

    if (!post) {
      return NextResponse.json({error: "記事が見つかりません"}, {status: 404})
    }

    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: {id: parentId}
      })

      if (!parentComment) {
        return NextResponse.json({error: "親コメントが見つかりません"}, {status: 404})
      }
    }

    const comment = await db.comment.create({
      data: {
        content,
        postId,
        userId,
        parentId,
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

    return NextResponse.json(comment)
  } catch (error) {
    console.error("コメントの投稿中にエラーが発生しました", error);
    return NextResponse.json({error: "コメントの投稿中にエラーが発生しました"}, {status: 500})
  }
}