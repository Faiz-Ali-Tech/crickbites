import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { ICommentRepository, Comment } from "@/repositories/interfaces";
import { eq } from "drizzle-orm";

export class CommentRepository implements ICommentRepository {
  async findAllByPostId(postId: string): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.postId, postId));
  }

  async updateStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    await db.update(comments).set({ status }).where(eq(comments.id, id));
  }
}
