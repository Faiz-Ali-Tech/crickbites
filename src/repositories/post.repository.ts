import { BaseRepository } from "@/lib/db/base.repository";
import { posts, postCategories, postTags } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";

export class PostRepository extends BaseRepository<typeof posts> {
  constructor() {
    super(posts);
  }

  async createWithRelations(data: any, categoryIds: string[], tagIds: string[]) {
    return await db.transaction(async (tx) => {
      const [newPost] = await tx.insert(posts).values(data).returning();

      if (categoryIds.length > 0) {
        await tx.insert(postCategories).values(
          categoryIds.map((id) => ({ postId: newPost.id, categoryId: id }))
        );
      }

      if (tagIds.length > 0) {
        await tx.insert(postTags).values(
          tagIds.map((id) => ({ postId: newPost.id, tagId: id }))
        );
      }

      return newPost;
    });
  }

  async updateWithRelations(id: string, data: any, categoryIds?: string[], tagIds?: string[]) {
    return await db.transaction(async (tx) => {
      const [updatedPost] = await tx
        .update(posts)
        .set(data)
        .where(eq(posts.id, id))
        .returning();

      if (categoryIds !== undefined) {
        await tx.delete(postCategories).where(eq(postCategories.postId, id));
        if (categoryIds.length > 0) {
          await tx.insert(postCategories).values(
            categoryIds.map((catId) => ({ postId: id, categoryId: catId }))
          );
        }
      }

      if (tagIds !== undefined) {
        await tx.delete(postTags).where(eq(postTags.postId, id));
        if (tagIds.length > 0) {
          await tx.insert(postTags).values(
            tagIds.map((tagId) => ({ postId: id, tagId: tagId }))
          );
        }
      }

      return updatedPost;
    });
  }
}
