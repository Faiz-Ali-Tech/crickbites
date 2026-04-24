import { BaseRepository } from "@/lib/db/base.repository";
import { posts, postCategories, postTags } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export class PostRepository extends BaseRepository<typeof posts> {
  constructor() {
    super(posts);
  }

  // ✅ GET ALL POSTS
  async getPosts() {
    try {
      console.log("📦 Fetching posts...");

      const result = await db.query.posts.findMany({
        with: {
          author: true,
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      console.log("✅ Posts fetched:", result);

      return result;
    } catch (error) {
      console.log("❌ DB ERROR:", error);
      throw error;
    }
  }

  // ✅ CREATE POST
  async createPost(data: any) {
    const [post] = await db.insert(posts).values(data).returning();
    return post;
  }

  // ✅ UPDATE POST
  async updatePost(id: string, data: any) {
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, id))
      .returning();

    return post;
  }

  // ✅ DELETE POST
  async deletePost(id: string) {
    const [post] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    return post;
  }

  // ✅ GET BY ID
  async getPostById(id: string) {
    return await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
      },
    });
  }

  // ✅ GET BY SLUG
  async getPostBySlug(slug: string) {
    return await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        author: true,
      },
    });
  }
}