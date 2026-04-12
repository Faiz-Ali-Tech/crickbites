import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categories, comments, posts, tags, users, webStories } from "@/db/schema";

// Base insert schemas generated directly from Drizzle table definitions.
export const PostInsertSchema = createInsertSchema(posts);
export const WebStoryInsertSchema = createInsertSchema(webStories);
export const CommentInsertSchema = createInsertSchema(comments);
export const CategoryInsertSchema = createInsertSchema(categories);
export const TagInsertSchema = createInsertSchema(tags);
export const UserInsertSchema = createInsertSchema(users);

// Shared form/input schemas that can be reused in actions and UI layers.
export const CreatePostSchema = PostInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

// --- Story Data Sub-schemas ---
export const StoryLayerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("background_media"), media_type: z.enum(["image", "video"]), url: z.string().url(), alt_text: z.string().optional(), poster_image_url: z.string().url().optional() }),
  z.object({ type: z.literal("text_overlay"), html_tag: z.enum(["h1", "h2", "p"]), text: z.string().min(1), styles: z.object({ color: z.string(), position: z.string() }) }),
  z.object({ type: z.literal("call_to_action"), url: z.string().url(), text: z.string().min(1) }),
]);

export const StoryPageSchema = z.object({
  id: z.string().min(1),
  seo_title: z.string().min(1),
  layers: z.array(StoryLayerSchema).min(1),
});

export const StoryDataSchema = z.object({
  settings: z.object({
    publisher_logo_url: z.string().url().optional().or(z.literal("")),
    language: z.string().default("en"),
    auto_advance_duration: z.string().default("7s"),
  }),
  pages: z.array(StoryPageSchema).min(1),
});

export const CreateStorySchema = WebStoryInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  storyData: StoryDataSchema,
  publishedAt: z.union([z.date(), z.string().transform(s => new Date(s))]).optional(),
});

export const UpdateStorySchema = CreateStorySchema.partial().omit({ authorId: true });

export const CreateCommentSchema = CommentInsertSchema.omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  recaptchaToken: z.string().min(1, "reCAPTCHA token is required"),
});

export const UpdateCommentStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const CreateCategorySchema = CategoryInsertSchema.omit({ id: true });
export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateTagSchema = TagInsertSchema.omit({ id: true });
export const UpdateTagSchema = CreateTagSchema.partial();

export const UpdateProfileSchema = UserInsertSchema.pick({
  name: true,
  bio: true,
  avatarUrl: true,
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type CreateStoryInput = z.infer<typeof CreateStorySchema>;
export type UpdateStoryInput = z.infer<typeof UpdateStorySchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentStatusInput = z.infer<typeof UpdateCommentStatusSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

