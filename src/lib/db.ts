// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "@/db/schema";

// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString, {
//     ssl: "require",
//     prepare: false,
// });
// export const db = drizzle(client, { schema });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });
