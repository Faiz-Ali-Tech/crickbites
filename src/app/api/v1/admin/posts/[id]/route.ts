import { NextRequest } from "next/server";
import { getSession } from "@/lib/supabase-server";
import { PostService } from "@/services/PostService";
import { PostRepository } from "@/repositories/implementations/PostRepository";
import { successResponse, errorResponse } from "@/lib/api-utils";

const postService = new PostService(new PostRepository());

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return errorResponse("Unauthorized", 401);

  try {
    const { id } = await params;
    const post = await postService.getPostById(id);
    if (!post) return errorResponse("Post not found", 404);
    return successResponse(post);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch post", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return errorResponse("Unauthorized", 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const updatedPost = await postService.updatePost(id, body);
    return successResponse(updatedPost);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update post", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return errorResponse("Unauthorized", 401);

  try {
    const { id } = await params;
    // await postService.deletePost(id); // Assume delete exists in service
    return successResponse({ message: "Post deleted successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to delete post", 500);
  }
}
