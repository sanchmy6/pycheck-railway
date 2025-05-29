"use server";

import { verifyTeacherPassword, generateAuthToken } from "@/lib/auth";
import { createProblem, queryCategories, queryCourses, queryCategoriesByCourseId, createCategory, createCourse, updateCourse, updateCategory, updateProblem, findCourseById, findCategoryById, findProblemById, queryCoursesWithBasicStats, queryCategoriesWithProblemsForCourse, findProblemWithCategoryAndCourse, findCategoryWithCourse, queryCoursesWithCompleteData, deleteCourse, deleteCategory, deleteProblem } from "@/lib/db/db-helpers";
import { revalidatePath } from "next/cache";

// Utility functions for common validations and error handling
function isValidAuthToken(authToken: string): boolean {
  return !!authToken && authToken.length === 64;
}

function isUniqueConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2002";
}

function isForeignKeyConstraintError(error: unknown): boolean {
  const err = error as { code?: string };
  return err.code === "P2003";
}

export async function authenticateTeacher(password: string) {
  const isValid = verifyTeacherPassword(password);
  
  if (isValid) {
    const token = generateAuthToken();
    return { success: true, token };
  }
  
  return { success: false, error: "Invalid password" };
}

export async function getCourses() {
  return await queryCourses();
}

export async function getCoursesWithStats() {
  return await queryCoursesWithCompleteData();
}

export async function getCategories() {
  return await queryCategories();
}

export async function getCategoriesByCourse(courseId: number) {
  return await queryCategoriesByCourseId(courseId);
}

export async function createCourseAction(authToken: string, name: string, description: string) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const course = await createCourse({ name, description });
    return { success: true, course };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A course with this name already exists" };
    }
    return { success: false, error: "Failed to create course. Please try again." };
  }
}

export async function createCategoryAction(authToken: string, name: string, courseId: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const category = await createCategory({ name, courseId });
    return { success: true, category };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A category with this name already exists" };
    }
    return { success: false, error: "Failed to create category. Please try again." };
  }
}

export async function createProblemAction(
  authToken: string,
  formData: {
    name: string;
    description: string;
    categoryId: number;
    codeSnippet: string;
    correctLines: number[];
    reasons: Record<string, string>;
    hint: string;
  }
) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const correctLinesString = formData.correctLines.join(",");
    
    await createProblem({
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      code_snippet: formData.codeSnippet,
      correct_lines: correctLinesString,
      reason: formData.reasons,
      hint: formData.hint
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] }; message?: string };
    console.error("Problem creation error:", err);
    
    if (isUniqueConstraintError(error)) {
      if (err.meta?.target?.includes("name")) {
        return { success: false, error: "A problem with this name already exists. Please choose a different name." };
      }
      return { success: false, error: "This problem conflicts with an existing entry. Please check your input." };
    }
    
    if (isForeignKeyConstraintError(error)) {
      return { success: false, error: "The selected category is invalid. Please select a valid category." };
    }
    
    if (err.message?.includes("JSON")) {
      return { success: false, error: "There was an issue with the problem data format. Please try again." };
    }
    
    return { success: false, error: "Failed to create problem. Please check your input and try again." };
  }
}

export async function updateCourseAction(authToken: string, id: number, name: string, description: string) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const course = await updateCourse(id, { name, description });
    revalidatePath("/teacher/overview");
    revalidatePath("/courses");
    return { success: true, course };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A course with this name already exists" };
    }
    return { success: false, error: "Failed to update course. Please try again." };
  }
}

export async function updateCategoryAction(authToken: string, id: number, name: string, courseId: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const category = await updateCategory(id, { name, courseId });
    revalidatePath("/teacher/overview");
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "A category with this name already exists" };
    }
    if (isForeignKeyConstraintError(error)) {
      return { success: false, error: "The selected course is invalid" };
    }
    return { success: false, error: "Failed to update category. Please try again." };
  }
}

export async function updateProblemAction(
  authToken: string,
  id: number,
  formData: {
    name: string;
    description: string;
    categoryId: number;
    codeSnippet: string;
    correctLines: number[];
    reasons: Record<string, string>;
    hint: string;
  }
) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const correctLinesString = formData.correctLines.join(",");
    
    await updateProblem(id, {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      code_snippet: formData.codeSnippet,
      correct_lines: correctLinesString,
      reason: formData.reasons,
      hint: formData.hint
    });

    revalidatePath("/categories");
    revalidatePath("/teacher/overview");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] }; message?: string };
    console.error("Problem update error:", err);
    
    if (isUniqueConstraintError(error)) {
      if (err.meta?.target?.includes("name")) {
        return { success: false, error: "A problem with this name already exists. Please choose a different name." };
      }
      return { success: false, error: "This problem conflicts with an existing entry. Please check your input." };
    }
    
    if (isForeignKeyConstraintError(error)) {
      return { success: false, error: "The selected category is invalid. Please select a valid category." };
    }
    
    if (err.message?.includes("JSON")) {
      return { success: false, error: "There was an issue with the problem data format. Please try again." };
    }
    
    return { success: false, error: "Failed to update problem. Please check your input and try again." };
  }
}

export async function getCourseById(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const course = await findCourseById(id);
    return { success: true, course };
  } catch {
    return { success: false, error: "Failed to fetch course" };
  }
}

export async function getCategoryById(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const category = await findCategoryById(id);
    return { success: true, category };
  } catch {
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getProblemById(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const problem = await findProblemById(id);
    return { success: true, problem };
  } catch {
    return { success: false, error: "Failed to fetch problem" };
  }
}

// Optimized functions for better performance
export async function getCoursesBasic() {
  return await queryCoursesWithBasicStats();
}

export async function getCategoriesWithProblemsForCourseAction(authToken: string, courseId: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const categories = await queryCategoriesWithProblemsForCourse(courseId);
    return { success: true, categories };
  } catch {
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getProblemByIdOptimized(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const problem = await findProblemWithCategoryAndCourse(id);
    return { success: true, problem };
  } catch {
    return { success: false, error: "Failed to fetch problem" };
  }
}

export async function getCategoryByIdOptimized(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const category = await findCategoryWithCourse(id);
    return { success: true, category };
  } catch {
    return { success: false, error: "Failed to fetch category" };
  }
}

// Delete
export async function deleteCourseAction(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    await deleteCourse(id);
    revalidatePath("/teacher/overview");
    revalidatePath("/courses");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete course. Please try again." };
  }
}

export async function deleteCategoryAction(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    await deleteCategory(id);
    revalidatePath("/teacher/overview");
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category. Please try again." };
  }
}

export async function deleteProblemAction(authToken: string, id: number) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    await deleteProblem(id);
    revalidatePath("/teacher/overview");
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete problem. Please try again." };
  }
} 