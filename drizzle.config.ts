import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Only track the crickbites schema; prevents drizzle-kit from touching
  // Supabase's internal schemas (auth, storage, realtime, etc.)
  schemaFilter: ["crickbites"],
  strict: true,
} satisfies Config;
