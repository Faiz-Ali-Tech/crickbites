import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const PostStatusEnum = z.enum(["draft", "published", "scheduled"]);
export const CommentStatusEnum = z.enum(["pending", "approved", "rejected"]);

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 1: CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 1: TAGS
// ─────────────────────────────────────────────────────────────────────────────

export const CreateTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(255),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().optional(),
});

export const UpdateTagSchema = CreateTagSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 2: BLOG POSTS
// ─────────────────────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  readingTime: z.number().int().nonnegative().optional(),
  status: PostStatusEnum.default("draft"),
  publishedAt: z
    .union([z.date(), z.string().transform((str) => new Date(str))])
    .optional(),
  seoTitle: z.string().max(70, "SEO title should be at most 70 characters").optional(),
  seoDescription: z.string().max(160, "SEO description should be at most 160 characters").optional(),
  authorId: z.string().uuid("Author ID must be a valid UUID"),
  categoryIds: z.array(z.string().uuid("Each category ID must be a valid UUID")).optional().default([]),
  tagIds: z.array(z.string().uuid("Each tag ID must be a valid UUID")).optional().default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial().omit({ authorId: true });

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 3: WEB STORIES
// ─────────────────────────────────────────────────────────────────────────────

export const BackgroundMediaLayerSchema = z.object({
  type: z.literal("background_media"),
  media_type: z.enum(["image", "video"]),
  url: z.string().url("Media URL must be valid"),
  alt_text: z.string().optional().default(""),
  poster_image_url: z.string().url().optional(),
});

export const TextOverlayLayerSchema = z.object({
  type: z.literal("text_overlay"),
  html_tag: z.enum(["h1", "h2", "p"]),
  text: z.string().min(1, "Text is required"),
  styles: z.object({
    color: z.string(),
    position: z.string(),
  }),
});

export const CallToActionLayerSchema = z.object({
  type: z.literal("call_to_action"),
  url: z.string().url("CTA URL must be valid"),
  text: z.string().min(1, "CTA text is required"),
});

export const StoryLayerSchema = z.discriminatedUnion("type", [
  BackgroundMediaLayerSchema,
  TextOverlayLayerSchema,
  CallToActionLayerSchema,
]);

export const StoryPageSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  seo_title: z.string().min(1, "SEO title is required"),
  layers: z.array(StoryLayerSchema).min(1, "Each page must have at least one layer"),
});

export const StoryDataSchema = z.object({
  settings: z.object({
    publisher_logo_url: z.string().url("Publisher logo must be a valid URL"),
    language: z.string().default("en"),
    auto_advance_duration: z.string().default("7s"),
  }),
  pages: z.array(StoryPageSchema).min(1, "Story must have at least one page"),
});

export const CreateStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  coverImageUrl: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  storyData: StoryDataSchema,
  status: PostStatusEnum.default("draft"),
  publishedAt: z
    .union([z.date(), z.string().transform((str) => new Date(str))])
    .optional(),
  authorId: z.string().uuid("Author ID must be a valid UUID"),
});

export const UpdateStorySchema = CreateStorySchema.partial().omit({ authorId: true });

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 4: COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const CreateCommentSchema = z.object({
  postId: z.string().uuid("Post ID must be a valid UUID"),
  authorName: z.string().min(1, "Author name is required").max(255),
  content: z.string().min(1, "Comment content is required"),
});

export const UpdateCommentStatusSchema = z.object({
  status: CommentStatusEnum,
});

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN 5: SETTINGS & PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Avatar URL must be valid").optional().or(z.literal("")),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS (infer from schemas for type-safety)
// ─────────────────────────────────────────────────────────────────────────────

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type CreateStoryInput = z.infer<typeof CreateStorySchema>;
export type UpdateStoryInput = z.infer<typeof UpdateStorySchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentStatusInput = z.infer<typeof UpdateCommentStatusSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
