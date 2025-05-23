"use server";

import { verifyTeacherPassword, generateAuthToken } from "@/lib/auth";
import { createProblem, queryCategories, queryCourses, queryCategoriesByCourseId, createCategory } from "@/lib/db/db-helpers";
import { revalidatePath } from "next/cache";

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

export async function getCategories() {
  return await queryCategories();
}

export async function getCategoriesByCourse(courseId: number) {
  return await queryCategoriesByCourseId(courseId);
}

export async function createCategoryAction(authToken: string, name: string, courseId: number) {
  if (!authToken || authToken.length !== 64) {
    return { success: false, error: "Invalid authentication" };
  }

  try {
    const category = await createCategory({ name, courseId });
    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2002") {
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
  if (!authToken || authToken.length !== 64) {
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
  } catch (error: any) {
    console.error("Problem creation error:", error);
    
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("name")) {
        return { success: false, error: "A problem with this name already exists. Please choose a different name." };
      }
      return { success: false, error: "This problem conflicts with an existing entry. Please check your input." };
    }
    
    if (error.code === "P2003") {
      return { success: false, error: "The selected category is invalid. Please select a valid category." };
    }
    
    if (error.message?.includes("JSON")) {
      return { success: false, error: "There was an issue with the problem data format. Please try again." };
    }
    
    return { success: false, error: "Failed to create problem. Please check your input and try again." };
  }
} 