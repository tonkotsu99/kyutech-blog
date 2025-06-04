import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: {params: Promise<{id: string}>}) {
  const params = await props.params;
  try {
    const postId = params.id
    const {userId} = await requireAuth();

    const post = await db.post.findUnique({
      where: {id: postId},
      select: {likeCount: true},
    })

    if (!post) {
      return NextResponse.json({error: "記事が見つかりません"}, {status: 404})
    }

    const userLike = userId ? await db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        }
      }
    }) : null

    return NextResponse.json(
      {
        count: post.likeCount,
        liked: !!userLike,
      }
    )
  } catch (error) {
    console.error("いいね情報の取得中にエラーが発生しました", error);
    return NextResponse.json({error: "いいね情報の取得中にエラーが発生しました"}, {status: 500})
  }
}

export async function POST(request:NextRequest, props: {params: Promise<{id: string}>}) {
  const params = await props.params;
  try {
    const postId = params.id
    const {userId} = await requireAuth();

    if (!userId) {
      return NextResponse.json({error: "認証が必要です"}, {status: 401})
    }

    const post = await db.post.findUnique({
      where: {id: postId},
    })

    if (!post) {
      return NextResponse.json({error: "記事が見つかりません"}, {status: 404})
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        }
      }
    })

    let liked = false;
    let count = post.likeCount;

    if (existingLike) {
      await db.like.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      })

      const updatedPost = await db.post.update({
        where: {id: postId},
        data: {likeCount: {decrement: 1}},
      })

      count = updatedPost.likeCount;
      liked = false;
    } else {
      await db.like.create({
        data: {
          userId,
          postId,
        }
      })

      const updatedPost = await db.post.update({
        where: {id: postId},
        data: {likeCount: {increment: 1}},
      })

      count = updatedPost.likeCount;
      liked = true
    }

    return NextResponse.json({liked, count})
  } catch (error) {
    console.error("いいね処理中にエラーが発生しました", error);
    return NextResponse.json({error: "いいね処理中にエラーが発生しました"}, {status: 500})
  }
}