import {
  type Category,
  type Comment,
  type NewCategory,
  type NewComment,
  type NewPost,
  type NewWebStory,
  type NewTag,
  type Post,
  type Tag,
  type WebStory,
} from "@/db/schema";

export type { Category, Comment, Post, WebStory, Tag, NewCategory, NewComment, NewPost, NewWebStory, NewTag };

export interface IPostRepository {
  findById(id: string): Promise<Post | undefined>;
  findBySlug(slug: string): Promise<Post | undefined>;
  findAll(filters?: any): Promise<Post[]>;
  create(data: NewPost): Promise<Post>;
  update(id: string, data: Partial<NewPost>): Promise<Post>;
  delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  create(data: NewCategory): Promise<Category>;
}

export interface ITagRepository {
  findAll(): Promise<Tag[]>;
  create(data: NewTag): Promise<Tag>;
}

export interface IWebStoryRepository {
  findById(id: string): Promise<WebStory | undefined>;
  findAll(): Promise<WebStory[]>;
  create(data: NewWebStory): Promise<WebStory>;
  update(id: string, data: Partial<NewWebStory>): Promise<WebStory>;
}

export interface ICommentRepository {
  findAllByPostId(postId: string): Promise<Comment[]>;
  updateStatus(id: string, status: "approved" | "rejected"): Promise<void>;
}
