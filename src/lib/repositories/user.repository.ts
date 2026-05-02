// import { eq } from "drizzle-orm";
// import { db } from "@/lib/db";
// import { users } from "@/db/schema";
// import { UpdateProfileInput } from "@/lib/validations/schema";

// export class UserRepository {
//   static async updateProfile(userId: string, data: UpdateProfileInput) {
//     const [updatedUser] = await db
//       .update(users)
//       .set({
//         name: data.name,
//         bio: data.bio,
//         avatarUrl: data.avatarUrl,
//       })
//       .where(eq(users.id, userId))
//       .returning();

//     return updatedUser;
//   }

//   static async getUserById(userId: string) {
//     const [user] = await db.select().from(users).where(eq(users.id, userId));
//     return user;
//   }
// }

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { UpdateProfileInput } from "@/lib/validations/schema";

export class UserRepository {

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    try {
      console.log("🟡 updateProfile called");
      console.log("➡️ userId:", userId);
      console.log("➡️ data:", data);

      const [updatedUser] = await db
        .update(users)
        .set({
          name: data.name,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        })
        .where(eq(users.id, userId))
        .returning();

      console.log("🟢 updatedUser:", updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("❌ updateProfile ERROR:");
      console.error(error);
      console.dir(error, { depth: null });
      console.trace();

      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      console.log("🟡 getUserById called");
      console.log("➡️ userId:", userId);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      console.log("🟢 DB user result:", user);

      if (!user) {
        console.warn("⚠️ USER NOT FOUND in DB:", userId);
      }

      return user;
    } catch (error) {
      console.error("❌ getUserById ERROR:");
      console.error(error);
      console.dir(error, { depth: null });
      console.trace();

      throw error;
    }
  }
}
