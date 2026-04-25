"use server";

import { z } from "zod";
import { UpdateProfileSchema } from "@/lib/validations/schema";
import { UserRepository } from "@/lib/repositories/user.repository";
import { InferSelectModel } from "drizzle-orm";
import { users } from "@/db/schema";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type User = InferSelectModel<typeof users>;

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS / PROFILE ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the authenticated admin's profile in the `crickbites.users` table.
 *
 * Security model:
 * - The user ID is resolved from the active Supabase session, NOT from the
 *   client payload. This prevents any client from forging another user's ID.
 * - `cookies()` is called lazily inside this Server Action's execution scope,
 *   which satisfies the Next.js dynamic server usage requirement and avoids
 *   the "Dynamic server usage" build error.
 *
 * Fields updated: `name`, `bio`, `avatar_url`.
 */
export async function updateAdminProfileAction(
  input: z.infer<typeof UpdateProfileSchema>
): Promise<ActionResponse<User>> {
  try {
    // Lazy import of `createSupabaseServer` ensures `cookies()` is only
    // called inside the action's execution scope — never at module level.
    const { createSupabaseServer } = await import("@/lib/supabase-ssr");
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized: you must be signed in" };
    }

    const validatedData = UpdateProfileSchema.parse(input);

    const updatedProfile = await UserRepository.updateProfile(
      user.id,
      validatedData
    );

    if (!updatedProfile) {
      return {
        success: false,
        error: "Profile not found — ensure the user row exists in crickbites.users",
      };
    }

    return { success: true, data: updatedProfile };
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
      error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

/**
 * Fetch the authenticated admin's profile from the `crickbites.users` table.
 *
 * Useful for pre-populating the profile settings form on the admin panel.
 */
export async function getAdminProfileAction(): Promise<ActionResponse<User>> {
  try {
    const { createSupabaseServer } = await import("@/lib/supabase-ssr");
    const supabase = await createSupabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized: you must be signed in" };
    }

    const profile = await UserRepository.getUserById(user.id);

    if (!profile) {
      return {
        success: false,
        error: "Profile not found — ensure the user row exists in crickbites.users",
      };
    }

    return { success: true, data: profile };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch profile";
    return { success: false, error: message };
  }
} 


