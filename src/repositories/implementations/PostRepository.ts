import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { IPostRepository, Post, NewPost } from "@/repositories/interfaces";
import { eq } from "drizzle-orm";

export class PostRepository implements IPostRepository {
  async findById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async findBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async findAll(): Promise<Post[]> {
    return db.select().from(posts);
  }

  async create(data: NewPost): Promise<Post> {
    const [post] = await db.insert(posts).values(data).returning();
    return post;
  }

  async update(id: string, data: Partial<NewPost>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async delete(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }
}
