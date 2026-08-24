import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  const result = await seedDatabase(prisma);
  console.log("Seed concluído.");
  for (const login of result.logins) {
    console.log(`Login ${login.role}: ${login.email} / ${login.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
