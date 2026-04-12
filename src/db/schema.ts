import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { pgSchema, text, timestamp, uuid, varchar, boolean, jsonb, primaryKey, integer } from "drizzle-orm/pg-core";

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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  readingTime: integer("reading_time"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  featuredImage: text("featured_image"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webStories = crickbites.table("web_stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: text("title").notNull(),
  coverImage: text("cover_image"),
  storyData: jsonb("story_data").notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
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

export const comments = crickbites.table("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id).notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email"),
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  webStories: many(webStories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(postCategories),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  categories: many(postCategories),
  tags: many(postTags),
}));

export const webStoriesRelations = relations(webStories, ({ one }) => ({
  author: one(users, {
    fields: [webStories.authorId],
    references: [users.id],
  }),
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

// ─── Types ─────────────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type PostCategory = InferSelectModel<typeof postCategories>;
export type NewPostCategory = InferInsertModel<typeof postCategories>;

export type PostTag = InferSelectModel<typeof postTags>;
export type NewPostTag = InferInsertModel<typeof postTags>;

export type WebStory = InferSelectModel<typeof webStories>;
export type NewWebStory = InferInsertModel<typeof webStories>;

export type Comment = InferSelectModel<typeof comments>;
export type NewComment = InferInsertModel<typeof comments>;
