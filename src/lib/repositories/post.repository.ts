import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, postCategories, postTags } from "@/db/schema";
import type { CreatePostInput, UpdatePostInput } from "@/lib/validations/backend.schema";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Slug Generation
// ─────────────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// POST REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class PostRepository {
  /**
   * Create a new post inside a transaction.
   * Simultaneously inserts the post row and its category/tag junction records.
   * Slug is auto-generated from `title` when not provided.
   */
  static async createPost(data: CreatePostInput) {
    const slug = data.slug || generateSlug(data.title);

    return db.transaction(async (tx) => {
      // 1. Insert the post row.
      const [newPost] = await tx
        .insert(posts)
        .values({
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt ?? null,
          featuredImageUrl: data.featuredImageUrl || null,
          readingTime: data.readingTime ?? null,
          status: data.status as "draft" | "published" | "scheduled",
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          authorId: data.authorId,
        })
        .returning();

      // 2. Insert post_categories junction rows.
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.insert(postCategories).values(
          data.categoryIds.map((categoryId) => ({
            postId: newPost.id,
            categoryId,
          }))
        );
      }

      // 3. Insert post_tags junction rows.
      if (data.tagIds && data.tagIds.length > 0) {
        await tx.insert(postTags).values(
          data.tagIds.map((tagId) => ({
            postId: newPost.id,
            tagId,
          }))
        );
      }

      return newPost;
    });
  }

  /**
   * Update a post inside a transaction.
   * Always stamps `updatedAt`. Deletes then re-inserts junction records when
   * `categoryIds` or `tagIds` are present in the payload.
   * Slug is regenerated from `title` when `title` changes but no `slug` is given.
   */
  static async updatePost(id: string, data: UpdatePostInput) {
    return db.transaction(async (tx) => {
      // Build the scalar update payload — strip relation arrays.
      const { categoryIds, tagIds, ...scalarFields } = data;
      const updatePayload: Record<string, unknown> = { ...scalarFields };

      // Auto-generate slug when title changes without an explicit slug.
      if (scalarFields.title && !scalarFields.slug) {
        updatePayload.slug = generateSlug(scalarFields.title);
      }

      // Normalise the publishedAt field.
      if (scalarFields.publishedAt) {
        updatePayload.publishedAt = new Date(scalarFields.publishedAt);
      }

      // Always stamp updatedAt.
      updatePayload.updatedAt = new Date();

      // 1. Update the post row when there are scalar changes.
      let updatedPost = null;
      const hasScalarChanges = Object.keys(updatePayload).length > 1; // updatedAt alone doesn't count
      if (hasScalarChanges) {
        const [result] = await tx
          .update(posts)
          .set(updatePayload)
          .where(eq(posts.id, id))
          .returning();
        updatedPost = result;
      }

      // 2. Sync post_categories: delete existing, then insert new.
      if (categoryIds !== undefined) {
        await tx.delete(postCategories).where(eq(postCategories.postId, id));
        if (categoryIds.length > 0) {
          await tx.insert(postCategories).values(
            categoryIds.map((categoryId) => ({ postId: id, categoryId }))
          );
        }
      }

      // 3. Sync post_tags: delete existing, then insert new.
      if (tagIds !== undefined) {
        await tx.delete(postTags).where(eq(postTags.postId, id));
        if (tagIds.length > 0) {
          await tx.insert(postTags).values(
            tagIds.map((tagId) => ({ postId: id, tagId }))
          );
        }
      }

      // If only junction tables were touched, fetch and return the current post row.
      if (!updatedPost) {
        const [result] = await tx
          .select()
          .from(posts)
          .where(eq(posts.id, id));
        updatedPost = result;
      }

      return updatedPost ?? null;
    });
  }

  /** Fetch all posts ordered by creation date (newest first). */
  static async getPosts() {
    return db.select().from(posts);
  }

  /** Fetch a single post by its primary-key UUID. Returns null when not found. */
  static async getPostById(id: string) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post ?? null;
  }

  /** Fetch a single post by its unique slug. Returns null when not found. */
  static async getPostBySlug(slug: string) {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post ?? null;
  }

  /**
   * Hard-delete a post inside a transaction.
   * Junction rows are removed first to respect foreign-key constraints.
   * Returns the deleted post row.
   */
  static async deletePost(id: string) {
    return db.transaction(async (tx) => {
      // 1. Delete junction rows first (FK constraint).
      await tx.delete(postCategories).where(eq(postCategories.postId, id));
      await tx.delete(postTags).where(eq(postTags.postId, id));

      // 2. Delete the post and return the row.
      const [deletedPost] = await tx
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      return deletedPost ?? null;
    });
  }
}
