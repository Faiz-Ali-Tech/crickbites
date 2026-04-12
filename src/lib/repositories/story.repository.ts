import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webStories } from "@/db/schema";
import { CreateStoryInput, UpdateStoryInput } from "@/lib/validations/schema";

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
// STORY REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class StoryRepository {
  /**
   * Create a new web story.
   * `storyData` is passed directly as a plain object — Drizzle's JSONB
   * column type serialises it for PostgreSQL without double-stringifying.
   * Slug is auto-generated from `title` when not provided.
   */
  static async createStory(data: CreateStoryInput) {
    const slug = data.slug || generateSlug(data.title);

    const [newStory] = await db
      .insert(webStories)
      .values({
        title: data.title,
        slug,
        coverImage: data.coverImage || null,
        // storyData is typed as JSONB in the Drizzle schema.
        // Passing the plain object is correct — do NOT JSON.stringify().
        storyData: data.storyData,
        status: data.status as "draft" | "published" | "scheduled",
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        authorId: data.authorId,
      })
      .returning();

    return newStory;
  }

  /**
   * Update a web story by ID.
   * Slug is regenerated from `title` when `title` changes but no `slug` is given.
   * `storyData` is passed as a plain object — Drizzle handles JSONB serialisation.
   */
  static async updateStory(id: string, data: UpdateStoryInput) {
    const updatePayload: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updatePayload.title = data.title;
      // Auto-regenerate slug when title changes without an explicit slug.
      if (data.slug === undefined) {
        updatePayload.slug = generateSlug(data.title);
      }
    }

    if (data.slug !== undefined) {
      updatePayload.slug = data.slug;
    }

    if (data.coverImage !== undefined) {
      updatePayload.coverImage = data.coverImage || null;
    }

    if (data.storyData !== undefined) {
      // Pass the plain object — do NOT JSON.stringify().
      // Drizzle serialises JSONB columns correctly for postgres-js.
      updatePayload.storyData = data.storyData;
    }

    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }

    if (data.publishedAt !== undefined) {
      updatePayload.publishedAt = new Date(data.publishedAt);
    }

    const [updatedStory] = await db
      .update(webStories)
      .set(updatePayload)
      .where(eq(webStories.id, id))
      .returning();

    return updatedStory ?? null;
  }

  /** Fetch all web stories. */
  static async getStories() {
    return db.select().from(webStories);
  }

  /** Fetch a single web story by its primary-key UUID. Returns null when not found. */
  static async getStoryById(id: string) {
    const [story] = await db
      .select()
      .from(webStories)
      .where(eq(webStories.id, id));

    return story ?? null;
  }

  /** Fetch a single web story by its unique slug. Returns null when not found. */
  static async getStoryBySlug(slug: string) {
    const [story] = await db
      .select()
      .from(webStories)
      .where(eq(webStories.slug, slug));

    return story ?? null;
  }

  /** Hard-delete a web story by ID. Returns the deleted row. */
  static async deleteStory(id: string) {
    const [deletedStory] = await db
      .delete(webStories)
      .where(eq(webStories.id, id))
      .returning();

    return deletedStory ?? null;
  }
}
