import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const StorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  storyData: z.object({
    settings: z.object({
      publisher_logo_url: z.string().url(),
      language: z.string().default("en"),
      auto_advance_duration: z.string().default("7s"),
    }),
    pages: z.array(z.object({
      id: z.string(),
      seo_title: z.string(),
      layers: z.array(z.any()), // Simplified for schema definition
    })),
  }),
});

export const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional()
});

export const TagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional()
});
