"use server";

import {findCourseById, queryCategoriesByCourseId, queryCourses, queryProblemsByCategoryId, findProblemById} from "@/lib/db/db-helpers";

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

export async function getProblemById(id: number) {
  const problem = await findProblemById(id);
  if (!problem) return null;

  const correctLinesCount = problem.correct_lines.split(",").length;
  return {
    id: problem.id,
    correctLinesCount
  };
}

export async function getProblemHint(problemId: number) {
  const problem = await findProblemById(problemId);
  if (!problem) return null;

  return {
    hint: problem.hint
  };
}

export async function getProblemSolution(problemId: number) {
  const problem = await findProblemById(problemId);
  if (!problem) return null;

  const correctLines = problem.correct_lines.split(",").map(line => parseInt(line.trim()));
  const reasons = problem.reason as Record<string, string>;

  const correctSelections = correctLines.map(line => ({
    line,
    reason: reasons[line.toString()] || "This line contains an error."
  }));

  return {
    correctLines,
    correctSelections
  };
}

export async function evaluateProblemSelection(problemId: number, selectedLines: number[]) {
  const problem = await findProblemById(problemId);

  if (!problem) {
    return { success: false, message: "Problem not found" };
  }

  const correctLines = problem.correct_lines.split(",").map(line => parseInt(line.trim()));
  const reasons = problem.reason as Record<string, string>;

  const incorrectSelections: Array<{ line: number; reason: string }> = [];
  const correctSelections: Array<{ line: number; reason: string }> = [];
  let correctSelectionsCount = 0;

  selectedLines.forEach(line => {
    if (correctLines.includes(line)) {
      correctSelectionsCount++;
      const reason = reasons[line.toString()] || "This line contains an error.";
      correctSelections.push({ line, reason });
    } else {
      const reason = reasons[line.toString()] || "This line is not part of the correct solution.";
      incorrectSelections.push({ line, reason });
    }
  });

  const expectedLinesCount = correctLines.length;
  const missingLinesCount = expectedLinesCount - correctSelectionsCount;
  const isCorrect = incorrectSelections.length === 0 && missingLinesCount === 0;

  return {
    success: true,
    isCorrect,
    incorrectSelections,
    correctSelections,
    correctSelectionsCount,
    missingLinesCount,
    expectedLinesCount
  };
}
