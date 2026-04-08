import { z } from "zod";

// ─── POST SCHEMAS ────────────────────────────────────────────────────────────

export const PostStatusEnum = z.enum(["draft", "published", "scheduled"]);

export const CreatePostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  readingTime: z.number().int().optional(),
  status: PostStatusEnum.default("draft"),
  publishedAt: z.date().optional().or(z.string().transform((str) => new Date(str))),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  authorId: z.string().uuid("Author ID must be a valid UUID"),
  // Arrays of UUIDs for categories and tags
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial();

// ─── WEB STORY SCHEMAS ───────────────────────────────────────────────────────

export const StoryLayerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("background_media"),
    media_type: z.enum(["image", "video"]),
    url: z.string().url(),
    alt_text: z.string().optional().default(""),
    poster_image_url: z.string().url().optional(),
  }),
  z.object({
    type: z.literal("text_overlay"),
    html_tag: z.enum(["h1", "h2", "p"]),
    text: z.string(),
    styles: z.object({
      color: z.string(),
      position: z.string(),
    }),
  }),
  z.object({
    type: z.literal("call_to_action"),
    url: z.string().url(),
    text: z.string(),
  }),
]);

export const StoryPageSchema = z.object({
  id: z.string(),
  seo_title: z.string(),
  layers: z.array(StoryLayerSchema),
});

export const StoryDataSchema = z.object({
  settings: z.object({
    publisher_logo_url: z.string(),
    language: z.string(),
    auto_advance_duration: z.string(),
  }),
  pages: z.array(StoryPageSchema),
});

export const CreateStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  storyData: StoryDataSchema,
  status: PostStatusEnum.default("draft"),
  publishedAt: z.date().optional().or(z.string().transform((str) => new Date(str))),
  authorId: z.string().uuid("Author ID must be a valid UUID"),
});

export const UpdateStorySchema = CreateStorySchema.partial();

// ─── COMMENT SCHEMAS ─────────────────────────────────────────────────────────

export const CommentStatusEnum = z.enum(["pending", "approved", "rejected"]);

export const CreateCommentSchema = z.object({
  postId: z.string().uuid("Post ID must be a valid UUID"),
  authorName: z.string().min(1, "Author name is required"),
  content: z.string().min(1, "Content is required"),
});

export const UpdateCommentStatusSchema = z.object({
  status: CommentStatusEnum,
});

// ─── SETTINGS/PROFILE SCHEMAS ────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});
