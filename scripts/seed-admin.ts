import { createClient } from "@supabase/supabase-js";
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function seedAdmin() {
  const email = "admin@crickbites.com";
  const password = "}T0&J*f^5p8trsWL)@we";
  const name = "Super Admin";

  console.log(`Seeding admin: ${email}...`);

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("User already exists")) {
      console.log("Admin user already exists in Supabase Auth.");
    } else {
      console.error("Error creating auth user:", authError);
      process.exit(1);
    }
  }

  // 2. Synchronize with the Users table in Drizzle
  const authUserId = authData?.user?.id;

  if (authUserId) {
    try {
      await db.insert(users).values({
        id: authUserId,
        email,
        name,
        role: "admin",
      }).onConflictDoNothing();
      console.log("Admin user seeded in Drizzle database.");
    } catch (dbError) {
      console.error("Error seeding Drizzle user:", dbError);
      process.exit(1);
    }
  } else {
    console.log("Admin user likely already exists, skipping Drizzle sync.");
  }

  console.log("Seeding process completed.");
}

seedAdmin();
