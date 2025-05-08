"use server";

import { revalidatePath } from "next/cache";
import { validateCategory } from "@/lib/db/db-validators";
import { createCategory, queryCategories, findCategoryById, queryProblemsByCategoryId } from "@/lib/db/db-helpers";

export async function getCategories() {
  return await queryCategories();
}

export async function getCategoryById(id: string) {
  return await findCategoryById(parseInt(id));
}

export async function getProblemsByCategoryId(id: string) {
  return await queryProblemsByCategoryId(parseInt(id));
}

export async function create(prevState: { error: string | null, values?: { name: string } }, 
  formData: FormData) {

  const name = formData.get("name") as string;
  const values = { name };

  const validationResult = validateCategory({ name });
  if (!validationResult.valid) {
    return { error: validationResult.error || "Invalid category data", values };
  }

  try {
    await createCategory({
      name,
    });

    revalidatePath("/categories");
    
    return { error: null, values: { name: "" } };
  } catch (error: any) {
    return { error: error.message || "Failed to create category", values };
  }
}