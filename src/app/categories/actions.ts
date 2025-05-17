"use server";

import { queryCategories, findCategoryById, queryProblemsByCategoryId } from "@/lib/db/db-helpers";

export async function getCategories() {
  return await queryCategories();
}

export async function getCategoryById(id: string) {
  return await findCategoryById(parseInt(id));
}

export async function getProblemsByCategoryId(id: string) {
  return await queryProblemsByCategoryId(parseInt(id));
}
