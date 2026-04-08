import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { type AnyPgTable } from "drizzle-orm/pg-core";

export interface IBaseRepository<T extends AnyPgTable> {
  findById(id: string): Promise<any>;
  findAll(): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export abstract class BaseRepository<T extends AnyPgTable> implements IBaseRepository<T> {
  constructor(protected table: T) {}

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id));
    return result;
  }

  async findAll() {
    return db.select().from(this.table as any);
  }

  async create(data: any) {
    const [result] = await db.insert(this.table).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(this.table)
      .set(data)
      .where(eq((this.table as any).id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    await db.delete(this.table).where(eq((this.table as any).id, id));
  }
}
