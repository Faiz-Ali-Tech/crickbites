import { db } from "@/lib/db";
import { tags } from "@/db/schema";
import { ITagRepository, Tag, NewTag } from "@/repositories/interfaces";

export class TagRepository implements ITagRepository {
  async findAll(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async create(data: NewTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  }
}
