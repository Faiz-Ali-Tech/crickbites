"use server";

import { z } from "zod";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateTagSchema,
  UpdateTagSchema,
} from "@/lib/validations/schema";
import {
  CategoryRepository,
  TagRepository,
} from "@/lib/repositories/taxonomy.repository";
import { type Category, type Tag } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENVELOPE TYPE
// ─────────────────────────────────────────────────────────────────────────────

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new category.
 * Slug is auto-generated from `name` if not provided.
 */
export async function createCategoryAction(
  input: z.infer<typeof CreateCategorySchema>
): Promise<ActionResponse<Category>> {
  try {
    const validatedData = CreateCategorySchema.parse(input);
    const category = await CategoryRepository.create(validatedData);
    return { success: true, data: category };
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
      error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}

/**
 * Fetch all categories.
 */
export async function getCategoriesAction(): Promise<ActionResponse<Category[]>> {
  try {
    const categories = await CategoryRepository.getAll();
    return { success: true, data: categories };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch categories";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single category by its UUID.
 */
export async function getCategoryByIdAction(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    if (!id) {
      return { success: false, error: "Category ID is required" };
    }

    const category = await CategoryRepository.getById(id);

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch category";
    return { success: false, error: message };
  }
}

/**
 * Update a category by ID.
 * Validates the input with `UpdateCategorySchema` (partial, at-least-one-field).
 * If `name` is provided without `slug`, slug is auto-regenerated.
 */
export async function updateCategoryAction(
  id: string,
  input: z.infer<typeof UpdateCategorySchema>
): Promise<ActionResponse<Category>> {
  try {
    if (!id) {
      return { success: false, error: "Category ID is required" };
    }

    const validatedData = UpdateCategorySchema.parse(input);
    const updatedCategory = await CategoryRepository.update(id, validatedData);

    if (!updatedCategory) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: updatedCategory };
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
      error instanceof Error ? error.message : "Failed to update category";
    return { success: false, error: message };
  }
}

/**
 * Delete a category by ID.
 */
export async function deleteCategoryAction(
  id: string
): Promise<ActionResponse<Category>> {
  try {
    if (!id) {
      return { success: false, error: "Category ID is required" };
    }

    const deletedCategory = await CategoryRepository.delete(id);

    if (!deletedCategory) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: deletedCategory };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete category";
    return { success: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TAG ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new tag.
 * Slug is auto-generated from `name` if not provided.
 */
export async function createTagAction(
  input: z.infer<typeof CreateTagSchema>
): Promise<ActionResponse<Tag>> {
  try {
    const validatedData = CreateTagSchema.parse(input);
    const tag = await TagRepository.create(validatedData);
    return { success: true, data: tag };
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
      error instanceof Error ? error.message : "Failed to create tag";
    return { success: false, error: message };
  }
}

/**
 * Fetch all tags.
 */
export async function getTagsAction(): Promise<ActionResponse<Tag[]>> {
  try {
    const tags = await TagRepository.getAll();
    return { success: true, data: tags };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tags";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single tag by its UUID.
 */
export async function getTagByIdAction(id: string): Promise<ActionResponse<Tag>> {
  try {
    if (!id) {
      return { success: false, error: "Tag ID is required" };
    }

    const tag = await TagRepository.getById(id);

    if (!tag) {
      return { success: false, error: "Tag not found" };
    }

    return { success: true, data: tag };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tag";
    return { success: false, error: message };
  }
}

/**
 * Update a tag by ID.
 * Validates the input with `UpdateTagSchema` (partial, at-least-one-field).
 * If `name` is provided without `slug`, slug is auto-regenerated.
 */
export async function updateTagAction(
  id: string,
  input: z.infer<typeof UpdateTagSchema>
): Promise<ActionResponse<Tag>> {
  try {
    if (!id) {
      return { success: false, error: "Tag ID is required" };
    }

    const validatedData = UpdateTagSchema.parse(input);
    const updatedTag = await TagRepository.update(id, validatedData);

    if (!updatedTag) {
      return { success: false, error: "Tag not found" };
    }

    return { success: true, data: updatedTag };
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
      error instanceof Error ? error.message : "Failed to update tag";
    return { success: false, error: message };
  }
}

/**
 * Delete a tag by ID.
 */
export async function deleteTagAction(id: string): Promise<ActionResponse<Tag>> {
  try {
    if (!id) {
      return { success: false, error: "Tag ID is required" };
    }

    const deletedTag = await TagRepository.delete(id);

    if (!deletedTag) {
      return { success: false, error: "Tag not found" };
    }

    return { success: true, data: deletedTag };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete tag";
    return { success: false, error: message };
  }
}
