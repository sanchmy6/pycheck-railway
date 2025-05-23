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

  // Create courses
  const courses = await seedCourses();

  // Create categories
  const categories = await seedCategories(courses);

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

async function seedCourses() {
  const course1 = await prisma.course.create({
    data: {
      name: "Course 1",
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "Course 2",
    },
  });

  console.log("Created courses:", { course1, course2 });

  return { course1, course2 };
}

async function seedCategories(courses: any) {
  const { course1} = courses

  // Create categories
  const category1 = await prisma.category.create({
    data: {
      name: "Category 1",
      courseId: course1.id,
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Category 2",
      courseId: course1.id,
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
      name: "Calculate Average",
      description: "Find the errors in this function that calculates the average of a list of numbers.",
      categoryId: category1.id,
      code_snippet: `def calculate_average(numbers):
  total = 0
  count = 0
  
  for num in numbers:
    total = num
    count += 1
    
  if count == 0:
    return 0
    
  average = total * count
  return average`,
      correct_lines: "6,11",
      reason: {
        "6": "Error: Using assignment (=) instead of addition (+=). This overwrites the total instead of adding to it.",
        "11": "Error: Using multiplication (*) instead of division (/). This calculates the product instead of the average."
      },
      hint: "Look for lines that incorrectly handle the total sum and the final calculation.",
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      name: "Find Maximum Value",
      description: "Identify the errors in this function that finds the maximum value in a list.",
      categoryId: category2.id,
      code_snippet: `def find_maximum(numbers):
  if not numbers:
    return 0
    
  maximum = 0
  
  for num in numbers:
    if num < maximum:
      maximum = num
      
  return maximum`,
      correct_lines: "3,5,8",
      reason: {
        "3": "Error: Returning 0 for empty list instead of None. This could be misleading as 0 might be a valid maximum.",
        "5": "Error: Initializing maximum to 0 instead of numbers[0]. This fails for lists with all negative numbers.",
        "8": "Error: Using less than (<) instead of greater than (>). This finds the minimum instead of the maximum."
      },
      hint: "Look for lines that incorrectly handle edge cases, initialization, and comparison logic.",
    },
  });
  
  const bubbleSortProblem = await prisma.problem.create({
    data: {
      name: "Bubble Sort",
      description: "Implementation of the bubble sort algorithm.",
      categoryId: category1.id,
      code_snippet: `def bubble_sort(arr):
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
      correct_lines: "11,12",
      reason: {
        "11": "This is the key comparison in bubble sort that determines whether two adjacent elements need to be swapped. It compares each element with the next one and swaps them if they're in the wrong order.",
        "12": "Second reason",
      },
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