import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const postId = params.id;

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "記事が見つかりません" },
        { status: 404 }
      );
    }

    const commentCount = await db.comment.count({
      where: { postId },
    });

    return NextResponse.json({ count: commentCount });
  } catch (error) {
    console.error("コメント数の取得中にエラーが発生しました", error);
    return NextResponse.json(
      { error: "コメント数の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
