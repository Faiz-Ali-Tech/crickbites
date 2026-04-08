import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { ICategoryRepository, Category, NewCategory } from "@/repositories/interfaces";

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async create(data: NewCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }
}
