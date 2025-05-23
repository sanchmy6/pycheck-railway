import { prisma } from '@/prisma';

// Example helpers
export async function findExampleById(id: number) {
  return await prisma.example.findUnique({
    where: { id },
  });
}

export async function findExampleByName(name: string) {
  return await prisma.example.findUnique({
    where: { name },
  });
}

export async function createExample(data: { name: string; description: string }) {
  return await prisma.example.create({
    data,
  });
}

export async function queryExamples() {
  return await prisma.example.findMany();
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

export async function queryCourses() {
  return await prisma.course.findMany();
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

export async function queryCategories() {
  return await prisma.category.findMany();
}

export async function queryCategoriesByCourseId(courseId: number) {
  return await prisma.category.findMany({
    where: { courseId },
  });
}

// Problem helpers
export async function findProblemById(id: number) {
  return await prisma.problem.findUnique({
    where: { id },
  });
}

export async function createProblem(data: { name: string; description: string; categoryId: number; code_snippet: string; correct_line: number; correct_reason: string; incorrect_reason: string; hint: string }) {
  return await prisma.problem.create({
    data,
  });
}

export async function queryProblems() {
  return await prisma.problem.findMany();
}

export async function queryProblemsByCategoryId(categoryId: number) {
  return await prisma.problem.findMany({
    where: { categoryId },
  });
}
