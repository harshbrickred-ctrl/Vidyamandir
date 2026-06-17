import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { ensureAdminUser } = await import("../src/lib/auth");
  await ensureAdminUser();
  console.log("Database seeded: admin user is ready.");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
