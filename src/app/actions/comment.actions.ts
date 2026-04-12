"use server";

import { z } from "zod";
import {
  CreateCommentSchema,
  UpdateCommentStatusSchema,
} from "@/lib/validations/schema";
import { CommentRepository } from "@/lib/repositories/comment.repository";
import { type Comment } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENVELOPE TYPE
// ─────────────────────────────────────────────────────────────────────────────

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new comment.
 * Status is forced to "pending" by the repository — it cannot be overridden by
 * the caller. Public-facing submissions are always moderated.
 */
export async function createCommentAction(
  input: z.infer<typeof CreateCommentSchema>
): Promise<ActionResponse<Comment>> {
  try {
    const validatedData = CreateCommentSchema.parse(input);
    const { recaptchaToken, ...repoData } = validatedData;
    
    // 1. Verify reCAPTCHA token with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY");
      return { success: false, error: "Server configuration error" };
    }

    const verifyParams = new URLSearchParams();
    verifyParams.append("secret", secretKey);
    verifyParams.append("response", recaptchaToken);

    const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.success || (verifyData.score !== undefined && verifyData.score < 0.5)) {
      return { success: false, error: "Failed reCAPTCHA verification. You appear to be a bot." };
    }

    // 2. Proceed with DB insertion
    const comment = await CommentRepository.createComment(repoData);
    return { success: true, data: comment };
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
      error instanceof Error ? error.message : "Failed to create comment";
    return { success: false, error: message };
  }
}

/**
 * Update the moderation status of a comment.
 * Admin-only operation. Valid statuses: "pending" | "approved" | "rejected".
 */
export async function updateCommentStatusAction(
  id: string,
  input: z.infer<typeof UpdateCommentStatusSchema>
): Promise<ActionResponse<Comment>> {
  try {
    if (!id) {
      return { success: false, error: "Comment ID is required" };
    }

    const validatedData = UpdateCommentStatusSchema.parse(input);
    const comment = await CommentRepository.updateCommentStatus(id, validatedData);

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    return { success: true, data: comment };
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
      error instanceof Error ? error.message : "Failed to update comment status";
    return { success: false, error: message };
  }
}

/**
 * Fetch all approved comments for a specific post.
 * Used on public-facing post pages to render the comment thread.
 */
export async function getCommentsByPostAction(
  postId: string
): Promise<ActionResponse<Comment[]>> {
  try {
    if (!postId) {
      return { success: false, error: "Post ID is required" };
    }

    const comments = await CommentRepository.getCommentsByPost(postId);
    return { success: true, data: comments };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch comments";
    return { success: false, error: message };
  }
}

/**
 * Fetch all comments site-wide.
 * Used in the admin moderation queue to list and manage all submissions.
 */
export async function getAllCommentsAction(): Promise<ActionResponse<Comment[]>> {
  try {
    const comments = await CommentRepository.getAllComments();
    return { success: true, data: comments };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch comments";
    return { success: false, error: message };
  }
}

/**
 * Hard-delete a comment by ID.
 * Admin-only — irreversible.
 */
export async function deleteCommentAction(
  id: string
): Promise<ActionResponse<Comment>> {
  try {
    if (!id) {
      return { success: false, error: "Comment ID is required" };
    }

    const deletedComment = await CommentRepository.deleteComment(id);

    if (!deletedComment) {
      return { success: false, error: "Comment not found" };
    }

    return { success: true, data: deletedComment };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete comment";
    return { success: false, error: message };
  }
}
