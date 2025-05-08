import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.example.deleteMany();

  console.log("Seeding database...");

  // Create examples
  await seedExamples();

  // Create categories
  await seedCategories();

  // Create problems
  await seedProblems();

  console.log("Database seeded successfully");
}

async function seedExamples() {
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

async function seedCategories() {
  // Create categories
  const category1 = await prisma.category.create({
    data: {
      name: "Category 1",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Category 2",
    },
  });

  console.log("Created categories:", { category1, category2 });
}

async function seedProblems() {
  // Create problems
  const problem1 = await prisma.problem.create({
    data: {
      name: "Problem 1",
      description: "This is the first problem",
      categoryId: 1,
      code_snippet: "print('Hello, world!')\n",
      correct_line: 1,
      correct_reason: "This is the correct reason",
      incorrect_reason: "This is the incorrect reason",
      hint: "This is the hint",
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      name: "Problem 2",
      description: "This is the second problem",
      categoryId: 2,
      code_snippet: "print('Hello, world!')\n print('Bye, world!')\n",
      correct_line: 2,
      correct_reason: "This is the correct reason",
      incorrect_reason: "This is the incorrect reason",
      hint: "This is the hint",
    },
  });
  
  console.log("Created problems:", { problem1, problem2 });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 