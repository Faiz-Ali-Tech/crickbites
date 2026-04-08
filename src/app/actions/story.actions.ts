"use server";

import { z } from "zod";
import {
  CreateStorySchema,
  UpdateStorySchema,
} from "@/lib/validations/backend.schema";
import { StoryRepository } from "@/lib/repositories/story.repository";
import { WebStory } from "@/repositories/interfaces";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENVELOPE TYPE
// ─────────────────────────────────────────────────────────────────────────────

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// STORY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new web story.
 * `storyData` must be a valid JSON object matching the StoryDataSchema.
 * It is passed directly to Drizzle — no manual serialisation required.
 * Slug is auto-generated from `title` if not provided.
 */
export async function createStoryAction(
  input: z.infer<typeof CreateStorySchema>
): Promise<ActionResponse<WebStory>> {
  try {
    const validatedData = CreateStorySchema.parse(input);
    const story = await StoryRepository.createStory(validatedData);
    return { success: true, data: story };
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
      error instanceof Error ? error.message : "Failed to create story";
    return { success: false, error: message };
  }
}

/**
 * Update an existing web story by ID.
 * All fields are partial — only supplied fields are written.
 * If `title` changes without a new `slug`, the slug is regenerated.
 */
export async function updateStoryAction(
  id: string,
  input: z.infer<typeof UpdateStorySchema>
): Promise<ActionResponse<WebStory>> {
  try {
    if (!id) {
      return { success: false, error: "Story ID is required" };
    }

    const validatedData = UpdateStorySchema.parse(input);
    const story = await StoryRepository.updateStory(id, validatedData);

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    return { success: true, data: story };
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
      error instanceof Error ? error.message : "Failed to update story";
    return { success: false, error: message };
  }
}

/**
 * Fetch all web stories.
 */
export async function getStoriesAction(): Promise<ActionResponse<WebStory[]>> {
  try {
    const stories = await StoryRepository.getStories();
    return { success: true, data: stories };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stories";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single web story by its UUID.
 */
export async function getStoryByIdAction(
  id: string
): Promise<ActionResponse<WebStory>> {
  try {
    if (!id) {
      return { success: false, error: "Story ID is required" };
    }

    const story = await StoryRepository.getStoryById(id);

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    return { success: true, data: story };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch story";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single web story by its slug.
 */
export async function getStoryBySlugAction(
  slug: string
): Promise<ActionResponse<WebStory>> {
  try {
    if (!slug) {
      return { success: false, error: "Slug is required" };
    }

    const story = await StoryRepository.getStoryBySlug(slug);

    if (!story) {
      return { success: false, error: "Story not found" };
    }

    return { success: true, data: story };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch story";
    return { success: false, error: message };
  }
}

/**
 * Hard-delete a web story by ID.
 */
export async function deleteStoryAction(id: string): Promise<ActionResponse<WebStory>> {
  try {
    if (!id) {
      return { success: false, error: "Story ID is required" };
    }

    const deletedStory = await StoryRepository.deleteStory(id);

    if (!deletedStory) {
      return { success: false, error: "Story not found" };
    }

    return { success: true, data: deletedStory };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete story";
    return { success: false, error: message };
  }
}
