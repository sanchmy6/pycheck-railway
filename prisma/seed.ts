import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.example.deleteMany();

  console.log("Seeding database...");

  // Create examples
  const example1 = await prisma.example.create({
    data: {
      name: "Example 1",
      description: "This is the first example",
    },
  });

  const example2 = await prisma.example.create({
    data: {
      name: "Example 2",
      description: "This is the second example",
    },
  });

  console.log("Created examples:", { example1, example2 });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 