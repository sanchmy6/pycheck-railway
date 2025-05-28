"use server";

import { queryCategories, findCategoryById, queryProblemsByCategoryId, findProblemById, getCategoryWithCourse as getCategoryWithCourseFromDb } from "@/lib/db/db-helpers";

export async function getCategories() {
  return await queryCategories();
}

export async function getCategoryById(id: string) {
  return await findCategoryById(parseInt(id));
}

export async function getCategoryWithCourse(id: string) {
  return await getCategoryWithCourseFromDb(parseInt(id));
}

export async function getProblemsByCategoryId(id: string) {
  return await queryProblemsByCategoryId(parseInt(id));
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
