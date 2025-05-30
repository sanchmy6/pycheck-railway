"use server";

import {findCourseById, queryCategoriesByCourseId, queryCourses, queryProblemsByCategoryId} from "@/lib/db/db-helpers";

export async function getCourses() {
  return await queryCourses();
}

export async function getCourseById(id: string) {
  return await findCourseById(parseInt(id));
}

export async function getCategoriesByCourseId(id: string) {
  return await queryCategoriesByCourseId(parseInt(id));
}

export async function getProblemsByCategoryId(id: string) {
  return await queryProblemsByCategoryId(parseInt(id));
}

export async function getCategoriesWithProblems(courseId: string) {
  const categories = await getCategoriesByCourseId(courseId);

  return await Promise.all(
      categories.map(async (category) => {
          const problems = await getProblemsByCategoryId(category.id.toString());
          return {...category, problems};
      })
  );
}
