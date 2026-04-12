import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, tags } from "@/db/schema";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTagInput,
  UpdateTagInput,
} from "@/lib/validations/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Slug Generation
// ─────────────────────────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class CategoryRepository {
  /**
   * Insert a new category row.
   * Auto-generates the slug from `name` if one is not provided.
   */
  static async create(data: CreateCategoryInput) {
    const slug = data.slug || generateSlug(data.name);

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug,
        description: data.description ?? null,
      })
      .returning();

    return newCategory;
  }

  /** Fetch every category, ordered by name. */
  static async getAll() {
    return db.select().from(categories);
  }

  /** Fetch a single category by its primary-key UUID. */
  static async getById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    return category ?? null;
  }

  /** Fetch a single category by its unique slug. */
  static async getBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));

    return category ?? null;
  }

  /**
   * Update a category by ID.
   * If `name` is provided but `slug` is not, the slug is regenerated.
   */
  static async update(
    id: string,
    data: UpdateCategoryInput
  ) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      // Only auto-generate slug if name changed and no explicit slug was given
      if (data.slug === undefined) {
        updateData.slug = generateSlug(data.name);
      }
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return updatedCategory ?? null;
  }

  /** Hard-delete a category by ID. Returns the deleted row. */
  static async delete(id: string) {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    return deletedCategory ?? null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TAG REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export class TagRepository {
  /**
   * Insert a new tag row.
   * Auto-generates the slug from `name` if one is not provided.
   */
  static async create(data: CreateTagInput) {
    const slug = data.slug || generateSlug(data.name);

    const [newTag] = await db
      .insert(tags)
      .values({
        name: data.name,
        slug,
        description: data.description ?? null,
      })
      .returning();

    return newTag;
  }

  /** Fetch every tag. */
  static async getAll() {
    return db.select().from(tags);
  }

  /** Fetch a single tag by its primary-key UUID. */
  static async getById(id: string) {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));

    return tag ?? null;
  }

  /** Fetch a single tag by its unique slug. */
  static async getBySlug(slug: string) {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug));

    return tag ?? null;
  }

  /**
   * Update a tag by ID.
   * If `name` is provided but `slug` is not, the slug is regenerated.
   */
  static async update(
    id: string,
    data: UpdateTagInput
  ) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      if (data.slug === undefined) {
        updateData.slug = generateSlug(data.name);
      }
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const [updatedTag] = await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, id))
      .returning();

    return updatedTag ?? null;
  }

  /** Hard-delete a tag by ID. Returns the deleted row. */
  static async delete(id: string) {
    const [deletedTag] = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning();

    return deletedTag ?? null;
  }
}
