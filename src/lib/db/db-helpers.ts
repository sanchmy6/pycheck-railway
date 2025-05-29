import { prisma } from '@/prisma';

// Warm up database connection to eliminate first-query delays
let isWarmedUp = false;
export async function warmUpConnection() {
  if (isWarmedUp) return;
  
  try {
    // Execute a lightweight query to establish connection
    await prisma.$queryRaw`SELECT 1`;
    isWarmedUp = true;
    console.log('Database connection warmed up');
  } catch (error) {
    console.log('Database warm-up failed:', error);
  }
}

// Auto warm-up on module load
if (typeof window === 'undefined') { // Server-side only
  warmUpConnection();
}

// Course helpers
export async function findCourseById(id: number) {
  return await prisma.course.findUnique({
    where: { id },
  });
}

export async function createCourse(data: { name: string; description: string }) {
  return await prisma.course.create({
    data,
  });
}

export async function updateCourse(id: number, data: { name: string; description: string }) {
  return await prisma.course.update({
    where: { id },
    data,
  });
}

export async function queryCourses() {
  return await prisma.course.findMany({
    orderBy: { name: "asc" },
  });
}

export async function queryCoursesWithStats() {
  return await prisma.course.findMany({
    include: {
      _count: {
        select: {
          categories: true,
        },
      },
      categories: {
        include: {
          _count: {
            select: {
              problems: true,
            },
          },
          problems: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });
}

export async function queryCoursesWithBasicStats() {
  return await prisma.course.findMany({
    include: {
      _count: {
        select: {
          categories: true,
        },
      },
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function queryCoursesWithCompleteData() {
  return await prisma.course.findMany({
    include: {
      _count: {
        select: {
          categories: true,
        },
      },
      categories: {
        include: {
          _count: {
            select: {
              problems: true,
            },
          },
          problems: {
            select: {
              id: true,
              name: true,
              description: true,
            },
            orderBy: {
              name: "asc"
            }
          },
        },
        orderBy: {
          name: "asc"
        }
      },
    },
    orderBy: {
      name: "asc"
    }
  });
}

// Category helpers
export async function findCategoryById(id: number) {
  return await prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data: { name: string; courseId: number }) {
  return await prisma.category.create({
    data,
  });
}

export async function updateCategory(id: number, data: { name: string; courseId: number }) {
  return await prisma.category.update({
    where: { id },
    data,
  });
}

export async function queryCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function queryCategoriesByCourseId(courseId: number) {
  return await prisma.category.findMany({
    where: { courseId },
    orderBy: { name: "asc" },
  });
}

export async function queryCategoriesWithProblemsForCourse(courseId: number) {
  return await prisma.category.findMany({
    where: { courseId },
    include: {
      _count: {
        select: {
          problems: true,
        },
      },
      problems: {
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: {
          name: "asc"
        }
      },
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function findProblemById(id: number) {
  return await prisma.problem.findUnique({
    where: { id },
  });
}

export async function createProblem(data: { 
  name: string; 
  description: string; 
  categoryId: number; 
  code_snippet: string; 
  correct_lines: string; 
  reason: Record<string, string>; 
  hint: string 
}) {
  return await prisma.problem.create({
    data,
  });
}

export async function updateProblem(id: number, data: { 
  name: string; 
  description: string; 
  categoryId: number; 
  code_snippet: string; 
  correct_lines: string; 
  reason: Record<string, string>; 
  hint: string 
}) {
  return await prisma.problem.update({
    where: { id },
    data,
  });
}

export async function queryProblems() {
  return await prisma.problem.findMany({
    orderBy: { name: "asc" },
  });
}

export async function queryProblemsByCategoryId(categoryId: number) {
  return await prisma.problem.findMany({
    where: { categoryId },
    orderBy: { name: "asc" },
  });
}

export async function findProblemWithCategoryAndCourse(problemId: number) {
  return await prisma.problem.findUnique({
    where: { id: problemId },
    include: {
      category: {
        include: {
          course: {
            select: {
              id: true,
              name: true,
              description: true,
            }
          }
        }
      }
    }
  });
}

export async function findCategoryWithCourse(categoryId: number) {
  return await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
        }
      }
    }
  });
}

// Delete helpers
export async function deleteCourse(id: number) {
  return await prisma.course.delete({
    where: { id },
  });
}

export async function deleteCategory(id: number) {
  return await prisma.category.delete({
    where: { id },
  });
}

export async function deleteProblem(id: number) {
  return await prisma.problem.delete({
    where: { id },
  });
}
