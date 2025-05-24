"use server";

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