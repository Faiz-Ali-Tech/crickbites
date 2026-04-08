import { pgSchema, text, timestamp, uuid, varchar, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";

// ─── Custom Schema ─────────────────────────────────────────────────────────────
export const crickbites = pgSchema("crickbites");

// ─── Enums ─────────────────────────────────────────────────────────────────────
export const userRoleEnum = crickbites.enum("user_role", ["admin", "author"]);
export const postStatusEnum = crickbites.enum("post_status", ["draft", "published", "scheduled"]);
export const commentStatusEnum = crickbites.enum("comment_status", ["pending", "approved", "rejected"]);

// ─── Tables ────────────────────────────────────────────────────────────────────
export const users = crickbites.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRoleEnum("role").notNull().default("author"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = crickbites.table("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

export const tags = crickbites.table("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

export const posts = crickbites.table("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImageUrl: text("featured_image_url"),
  readingTime: integer("reading_time"),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postCategories = crickbites.table("post_categories", {
  postId: uuid("post_id").references(() => posts.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.categoryId] }),
}));

export const postTags = crickbites.table("post_tags", {
  postId: uuid("post_id").references(() => posts.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.tagId] }),
}));

export const webStories = crickbites.table("web_stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  coverImageUrl: text("cover_image_url"),
  storyData: jsonb("story_data").$type<{
    settings: {
      publisher_logo_url: string;
      language: string;
      auto_advance_duration: string;
    };
    pages: Array<{
      id: string;
      seo_title: string;
      layers: Array<
        | { type: "background_media"; media_type: "image" | "video"; url: string; alt_text: string; poster_image_url?: string }
        | { type: "text_overlay"; html_tag: "h1" | "h2" | "p"; text: string; styles: { color: string; position: string } }
        | { type: "call_to_action"; url: string; text: string }
      >;
    }>;
  }>().notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = crickbites.table("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id).notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
