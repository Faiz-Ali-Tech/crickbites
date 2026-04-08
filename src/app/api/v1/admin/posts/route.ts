import { NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-ssr";
import { PostService } from "@/services/PostService";
import { PostRepository } from "@/repositories/implementations/PostRepository";
import { successResponse, errorResponse } from "@/lib/api-utils";

const postService = new PostService(new PostRepository());

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const posts = await postService.getAllPosts();
    return successResponse(posts);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch posts", 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await request.json();
    const newPost = await postService.createPost({
      ...body,
      authorId: session.user.id,
    });
    return successResponse(newPost, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to create post", 400);
  }
}
