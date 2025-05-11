import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data first
  await prisma.problem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.example.deleteMany();

  console.log("Seeding database...");

  // Create examples
  await seedExamples();

  // Create categories
  const categories = await seedCategories();

  // Create problems
  await seedProblems(categories);

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
  
  return { category1, category2 };
}

async function seedProblems(categories: any) {
  const { category1, category2 } = categories;
  
  // Create problems
  const problem1 = await prisma.problem.create({
    data: {
      name: "Problem 1",
      description: "This is the first problem",
      categoryId: category1.id,
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
      categoryId: category2.id,
      code_snippet: "print('Hello, world!')\n print('Bye, world!')\n",
      correct_line: 2,
      correct_reason: "This is the correct reason",
      incorrect_reason: "This is the incorrect reason",
      hint: "This is the hint",
    },
  });
  
  const bubbleSortProblem = await prisma.problem.create({
    data: {
      name: "Bubble Sort",
      description: "Implementation of the bubble sort algorithm.",
      categoryId: category1.id,
      code_snippet: `
        def bubble_sort(arr):
          n = len(arr)
          
          for i in range(n):
              swapped = False
              
              for j in range(0, n-i-1):
                  if arr[j] > arr[j+1]:
                      arr[j], arr[j+1] = arr[j+1], arr[j]
                      swapped = True
                      
              if not swapped:
                  break
                  
          return arr

        # Example usage
        arr = [64, 34, 25, 12, 22, 11, 90]
        sorted_arr = bubble_sort(arr)
        print("Sorted array:", sorted_arr)`,
      correct_line: 11,
      correct_reason: "This is the key comparison in bubble sort that determines whether two adjacent elements need to be swapped. It compares each element with the next one and swaps them if they're in the wrong order.",
      incorrect_reason: "While this line is part of the bubble sort algorithm, it's not the key comparison that determines when elements should be swapped.",
      hint: "Look for the line that compares adjacent elements to determine their order.",
    },
  });
  
  console.log("Created problems:", { problem1, problem2, bubbleSortProblem });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 