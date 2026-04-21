import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import type {
  CreateCommentInput,
  UpdateCommentStatusInput,
} from "@/lib/validations/schema";

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class CommentRepository {
  /**
   * Insert a new comment row.
   * Status is ALWAYS forced to "pending" regardless of the caller's input —
   * the schema ensures this but we enforce it at the repository level too.
   */
  static async createComment(data: Omit<CreateCommentInput, "recaptchaToken">) {
    const [newComment] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        authorName: data.authorName.trim(),
        content: data.content.trim(),
        status: "pending", // hard-coded: new comments always start as pending
      })
      .returning();

    return newComment;
  }

  /**
   * Update the moderation status of a single comment.
   * Valid values: "pending" | "approved" | "rejected".
   */
  static async updateCommentStatus(id: string, data: UpdateCommentStatusInput) {
    const [updatedComment] = await db
      .update(comments)
      .set({ status: data.status })
      .where(eq(comments.id, id))
      .returning();

    return updatedComment ?? null;
  }

  /**
   * Fetch all comments for a specific post, ordered by creation date (oldest first).
   * This is used on the public frontend to display a post's comment thread.
   */
  static async getCommentsByPost(postId: string) {
    return db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.status, "approved")));
  }

  /**
   * Fetch all comments across the entire site.
   * Used by the admin panel's comment moderation queue.
   */
  static async getAllComments() {
    return db.select().from(comments);
  }

  /**
   * Hard-delete a comment by ID.
   * Returns the deleted row, or null if the comment was not found.
   */
  static async deleteComment(id: string) {
    const [deletedComment] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();

    return deletedComment ?? null;
  }
}
