import { NextRequest } from "next/server";
import { PostService } from "@/services/PostService";
import { PostRepository } from "@/repositories/implementations/PostRepository";
import { successResponse, errorResponse } from "@/lib/api-utils";

const postService = new PostService(new PostRepository());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    // In a real implementation, we'd pass pagination/filters to the service
    const posts = await postService.getAllPosts();
    
    // Filtering for 'published' status only for public API
    const publishedPosts = posts.filter(p => p.status === "published");

    return successResponse({
      items: publishedPosts,
      meta: {
        total: publishedPosts.length,
        page,
        limit,
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch posts", 500);
  }
}
