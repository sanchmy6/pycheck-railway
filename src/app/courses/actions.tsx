"use server";

import { revalidatePath } from "next/cache";
import { validateCourse } from "@/lib/db/db-validators";
import { queryCourses, findCourseById, queryCategoriesByCourseId } from "@/lib/db/db-helpers";

export async function getCourses() {
  return await queryCourses();
}

export async function getCourseById(id: string) {
  return await findCourseById(parseInt(id));
}

export async function getCategoriesByCourseId(id: string) {
  return await queryCategoriesByCourseId(parseInt(id));
}