"use server";

import { z } from "zod";
import {
  CreatePostSchema,
  UpdatePostSchema,
} from "@/lib/validations/schema";
import { PostRepository } from "@/lib/repositories/post.repository";
import { type Post } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENVELOPE TYPE
// ─────────────────────────────────────────────────────────────────────────────

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new blog post.
 * Runs inside a DB transaction (post + junction rows).
 * Slug is auto-generated from `title` if not provided.
 */
export async function createPostAction(
  input: z.infer<typeof CreatePostSchema>
): Promise<ActionResponse<Post>> {
  try {
    const validatedData = CreatePostSchema.parse(input);
    const post = await PostRepository.createPost(validatedData as any);
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
    const message =
      error instanceof Error ? error.message : "Failed to create post";
    return { success: false, error: message };
  }
}

/**
 * Update an existing blog post by ID.
 * All fields are partial — only supplied fields are written.
 * Providing `categoryIds` or `tagIds` replaces the existing junction rows.
 */
export async function updatePostAction(
  id: string,
  input: z.infer<typeof UpdatePostSchema>
): Promise<ActionResponse<Post>> {
  try {
    if (!id) {
      return { success: false, error: "Post ID is required" };
    }

    const validatedData = UpdatePostSchema.parse(input);
    const post = await PostRepository.updatePost(id, validatedData as any);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

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
    const message =
      error instanceof Error ? error.message : "Failed to update post";
    return { success: false, error: message };
  }
}

/**
 * Fetch all blog posts.
 */
export async function getPostsAction(): Promise<ActionResponse<Post[]>> {
  try {
    const posts = await PostRepository.getPosts();
    return { success: true, data: posts };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch posts";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single blog post by its UUID.
 */
export async function getPostByIdAction(id: string): Promise<ActionResponse<Post>> {
  try {
    if (!id) {
      return { success: false, error: "Post ID is required" };
    }

    const post = await PostRepository.getPostById(id);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch post";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single blog post by its slug.
 */
export async function getPostBySlugAction(
  slug: string
): Promise<ActionResponse<Post>> {
  try {
    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    const post = await PostRepository.getPostBySlug(slug);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch post";
    return { success: false, error: message };
  }
}

/**
 * Hard-delete a blog post by ID.
 * Removes category and tag junction rows inside the same transaction.
 */
export async function deletePostAction(id: string): Promise<ActionResponse<Post>> {
  try {
    if (!id) {
      return { success: false, error: "Post ID is required" };
    }

    const deletedPost = await PostRepository.deletePost(id);

    if (!deletedPost) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: deletedPost };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete post";
    return { success: false, error: message };
  }
}
