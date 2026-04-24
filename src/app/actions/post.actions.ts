"use server";

import { z } from "zod";
import {
  CreatePostSchema,
  UpdatePostSchema,
} from "@/lib/validations/schema";
// correct path use karo
import { PostRepository } from "@/repositories/post.repository";
import { type Post } from "@/db/schema";
import { createSupabaseClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────
// CREATE POST
// ─────────────────────────────────────────────

export async function createPostAction(
  input: z.infer<typeof CreatePostSchema>
): Promise<ActionResponse<Post>> {
  try {
    const validatedData = CreatePostSchema.parse(input);

    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const repo = new PostRepository();

    const { authorId, ...rest } = validatedData as any;


const post = await repo.createPost({
  ...rest,
  authorId: user.id,
});

    return { success: true, data: post };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error:
          "Validation failed: " +
          error.issues.map((e) => e.message).join(", "),
      };
    }

    console.log("❌ CREATE ERROR:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

// ─────────────────────────────────────────────
// GET ALL POSTS
// ─────────────────────────────────────────────

export async function getPostsAction(): Promise<ActionResponse<Post[]>> {
  try {
    const repo = new PostRepository();

    const posts = await repo.getPosts();

    return { success: true, data: posts };
  } catch (error: unknown) {
    console.log("❌ FETCH ERROR:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch posts",
    };
  }
}

// ─────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────

export async function getPostByIdAction(
  id: string
): Promise<ActionResponse<Post>> {
  try {
    if (!id) {
      return { success: false, error: "Post ID is required" };
    }

    const repo = new PostRepository();

    const post = await repo.getPostById(id);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch post",
    };
  }
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updatePostAction(
  id: string,
  input: z.infer<typeof UpdatePostSchema>
): Promise<ActionResponse<Post>> {
  try {
    const validatedData = UpdatePostSchema.parse(input);

    const repo = new PostRepository();

    const post = await repo.updatePost(id, validatedData);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deletePostAction(
  id: string
): Promise<ActionResponse<Post>> {
  try {
    const repo = new PostRepository();

    const post = await repo.deletePost(id);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}