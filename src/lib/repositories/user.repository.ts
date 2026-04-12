import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { UpdateProfileInput } from "@/lib/validations/schema";

export class UserRepository {
  static async updateProfile(userId: string, data: UpdateProfileInput) {
    const [updatedUser] = await db
      .update(users)
      .set({
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  static async getUserById(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }
}
