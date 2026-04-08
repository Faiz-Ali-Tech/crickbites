import { NextRequest } from "next/server";
import { PostService } from "@/services/PostService";
import { PostRepository } from "@/repositories/implementations/PostRepository";
import { successResponse, errorResponse } from "@/lib/api-utils";

const postService = new PostService(new PostRepository());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await postService.getPostById(slug); // Using slug search in current repo logic

    if (!post || post.status !== "published") {
      return errorResponse("Post not found", 404);
    }

    return successResponse(post);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch post", 500);
  }
}
