import { posts, categories, tags, webStories, comments, users } from "@/db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export interface IPostRepository {
  findById(id: string): Promise<Post | undefined>;
  findBySlug(slug: string): Promise<Post | undefined>;
  findAll(filters?: any): Promise<Post[]>;
  create(data: NewPost): Promise<Post>;
  update(id: string, data: Partial<NewPost>): Promise<Post>;
  delete(id: string): Promise<void>;
}

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  create(data: NewCategory): Promise<Category>;
}

export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  create(data: NewTag): Promise<Tag>;
}

export type WebStory = InferSelectModel<typeof webStories>;
export type NewWebStory = InferInsertModel<typeof webStories>;

export interface IWebStoryRepository {
  findById(id: string): Promise<WebStory | undefined>;
  findAll(): Promise<WebStory[]>;
  create(data: NewWebStory): Promise<WebStory>;
  update(id: string, data: Partial<NewWebStory>): Promise<WebStory>;
}

export type Comment = InferSelectModel<typeof comments>;
export type NewComment = InferInsertModel<typeof comments>;

export interface ICommentRepository {
  findAllByPostId(postId: string): Promise<Comment[]>;
  updateStatus(id: string, status: "approved" | "rejected"): Promise<void>;
}
