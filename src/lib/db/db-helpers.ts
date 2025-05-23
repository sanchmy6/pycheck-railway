import { prisma } from '@/prisma';

// Optimize connection settings for faster initial queries
const optimizedPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        const result = await query(args);
        const end = Date.now();
        
        // Log slow queries in development
        if (process.env.NODE_ENV === 'development' && (end - start) > 100) {
          console.log(`Slow query: ${model}.${operation} took ${end - start}ms`);
        }
        
        return result;
      },
    },
  },
});

// Warm up database connection to eliminate first-query delays
let isWarmedUp = false;
export async function warmUpConnection() {
  if (isWarmedUp) return;
  
  try {
    // Execute a lightweight query to establish connection
    await optimizedPrisma.$queryRaw`SELECT 1`;
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

// Example helpers
export async function findExampleById(id: number) {
  return await optimizedPrisma.example.findUnique({
    where: { id },
  });
}

export async function findExampleByName(name: string) {
  return await optimizedPrisma.example.findUnique({
    where: { name },
  });
}

export async function createExample(data: { name: string; description: string }) {
  return await optimizedPrisma.example.create({
    data,
  });
}

export async function queryExamples() {
  return await optimizedPrisma.example.findMany();
}

// Course helpers
export async function findCourseById(id: number) {
  return await optimizedPrisma.course.findUnique({
    where: { id },
  });
}

export async function createCourse(data: { name: string; description: string }) {
  return await optimizedPrisma.course.create({
    data,
  });
}

export async function updateCourse(id: number, data: { name: string; description: string }) {
  return await optimizedPrisma.course.update({
    where: { id },
    data,
  });
}

export async function queryCourses() {
  return await optimizedPrisma.course.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCoursesWithStats() {
  return await optimizedPrisma.course.findMany({
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

export async function getCoursesWithBasicStats() {
  return await optimizedPrisma.course.findMany({
    include: {
      _count: {
        select: {
          categories: true,
        },
      },
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function getCoursesWithCompleteData() {
  return await optimizedPrisma.course.findMany({
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
              name: 'asc'
            }
          },
        },
        orderBy: {
          name: 'asc'
        }
      },
    },
    orderBy: {
      name: 'asc'
    }
  });
}

// Category helpers
export async function findCategoryById(id: number) {
  return await optimizedPrisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data: { name: string; courseId: number }) {
  return await optimizedPrisma.category.create({
    data,
  });
}

export async function updateCategory(id: number, data: { name: string; courseId: number }) {
  return await optimizedPrisma.category.update({
    where: { id },
    data,
  });
}

export async function queryCategories() {
  return await optimizedPrisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function queryCategoriesByCourseId(courseId: number) {
  return await optimizedPrisma.category.findMany({
    where: { courseId },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoriesWithProblemsForCourse(courseId: number) {
  return await optimizedPrisma.category.findMany({
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
          name: 'asc'
        }
      },
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function findProblemById(id: number) {
  return await optimizedPrisma.problem.findUnique({
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
  return await optimizedPrisma.problem.create({
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
  return await optimizedPrisma.problem.update({
    where: { id },
    data,
  });
}

export async function queryProblems() {
  return await optimizedPrisma.problem.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function queryProblemsByCategoryId(categoryId: number) {
  return await optimizedPrisma.problem.findMany({
    where: { categoryId },
    orderBy: { name: 'asc' },
  });
}

export async function getProblemWithCategoryAndCourse(problemId: number) {
  return await optimizedPrisma.problem.findUnique({
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

export async function getCategoryWithCourse(categoryId: number) {
  return await optimizedPrisma.category.findUnique({
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
