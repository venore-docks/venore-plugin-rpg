import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin, com tabela de tracking no schema rpg_migrations (o core
// deriva "<key>_migrations" — run-plugin-migrations.ts).
export default defineConfig({
  schema: ["./database/schema/index.ts"],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  migrations: { schema: "rpg_migrations", table: "__drizzle_migrations" },
});
