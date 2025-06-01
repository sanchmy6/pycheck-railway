"use server";

import { queryCourses, queryCategoriesByCourseId, createCategory, createCourse, updateProblem, createProblem, queryCategoriesWithProblemsForCourse } from "@/lib/db/db-helpers";
import { revalidatePath } from "next/cache";
import { isValidAuthToken } from "./utils";
import { parse } from "csv-parse/sync";

export async function importProblems(authToken: string) {
  if (!isValidAuthToken(authToken)) {
    return { success: false, error: "Invalid authentication" };
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!sheetId) {
    return { success: false, error: "Google Sheet ID not configured" };
  }

  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      return { success: false, error: `Failed to fetch Google Sheet (Status: ${response.status}). Make sure it's publicly accessible.` };
    }

    const csvText = await response.text();
    
    let rows: string[][];
    try {
      rows = parse(csvText, {
        columns: false,
        skip_empty_lines: true,
        trim: true
      });
    } catch (error) {
      const err = error as Error;
      return { success: false, error: `Failed to parse CSV: ${err.message}` };
    }
    
    if (rows.length < 2) {
      return { success: false, error: "CSV file appears to be empty or only has headers" };
    }

    const headers = rows[0];
    
    const expectedHeaders = ["name", "description", "courseName", "lectureName", "codeSnippet", "correctLines", "hint", "reasons"];
    
    for (const expectedHeader of expectedHeaders) {
      if (!headers.includes(expectedHeader)) {
        return { success: false, error: `Missing required column: ${expectedHeader}` };
      }
    }
    
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let coursesCreated = 0;
    let categoriesCreated = 0;
    const errors: string[] = [];

    const existingCourses = new Set((await queryCourses()).map(c => c.name.toLowerCase()));
    const existingCategories = new Map<number, Set<string>>();

    for (let i = 1; i < rows.length; i++) {
      try {
        const row = rows[i];
        if (row.length !== headers.length) {
          errors.push(`Row ${i + 1}: Column count mismatch`);
          skippedCount++;
          continue;
        }

        const problemData: Record<string, string> = {};
        headers.forEach((header, index) => {
          problemData[header] = row[index] || "";
        });

        if (!problemData.name?.trim() || 
            !problemData.courseName?.trim() || 
            !problemData.lectureName?.trim() ||
            !problemData.codeSnippet?.trim() ||
            !problemData.correctLines?.trim() ||
            !problemData.hint?.trim() ||
            !problemData.reasons?.trim()) {
          errors.push(`Row ${i + 1}: Missing required fields (name, courseName, lectureName, codeSnippet, correctLines, hint, or reasons)`);
          skippedCount++;
          continue;
        }

        let course = await queryCourses().then(courses => 
          courses.find(c => c.name.toLowerCase() === problemData.courseName.toLowerCase())
        );
        
        if (!course) {
          const courseResult = await createCourse({ 
            name: problemData.courseName.trim(), 
            description: ""
          });
          course = courseResult;
          if (!existingCourses.has(problemData.courseName.toLowerCase())) {
            coursesCreated++;
            existingCourses.add(problemData.courseName.toLowerCase());
          }
        }

        if (!existingCategories.has(course.id)) {
          const courseCats = await queryCategoriesByCourseId(course.id);
          existingCategories.set(course.id, new Set(courseCats.map(c => c.name.toLowerCase())));
        }

        let category = await queryCategoriesByCourseId(course.id).then(categories =>
          categories.find(c => c.name.toLowerCase() === problemData.lectureName.toLowerCase())
        );

        if (!category) {
          const categoryResult = await createCategory({
            name: problemData.lectureName.trim(),
            courseId: course.id
          });
          category = categoryResult;
          const courseCategories = existingCategories.get(course.id)!;
          if (!courseCategories.has(problemData.lectureName.toLowerCase())) {
            categoriesCreated++;
            courseCategories.add(problemData.lectureName.toLowerCase());
          }
        }

        let correctLines: number[] = [];
        if (problemData.correctLines?.trim()) {
          try {
            correctLines = problemData.correctLines.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
          } catch {
            correctLines = [];
          }
        }

        let reasons: Record<string, string> = {};
        if (problemData.reasons?.trim()) {
          try {
            reasons = JSON.parse(problemData.reasons);
          } catch {
            errors.push(`Row ${i + 1}: Invalid JSON format in reasons field`);
            skippedCount++;
            continue;
          }
        }

        const existingProblems = await queryCategoriesWithProblemsForCourse(course.id);
        const existingCategory = existingProblems.find(cat => cat.id === category.id);
        const existingProblem = existingCategory?.problems?.find(p => 
          p.name.toLowerCase() === problemData.name.trim().toLowerCase()
        );

        const problemPayload = {
          name: problemData.name.trim(),
          description: problemData.description?.trim() || "",
          categoryId: category.id,
          code_snippet: problemData.codeSnippet.trim(),
          correct_lines: correctLines.join(","),
          reason: reasons,
          hint: problemData.hint.trim()
        };

        if (existingProblem) {
          await updateProblem(existingProblem.id, problemPayload);
          updatedCount++;
        } else {
          await createProblem(problemPayload);
          importedCount++;
        }

      } catch (error) {
        const err = error as Error;
        errors.push(`Row ${i + 1}: ${err.message || "Unknown error"}`);
        skippedCount++;
      }
    }

    revalidatePath("/teacher/overview");
    revalidatePath("/categories");

    return {
      success: true,
      details: {
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        coursesCreated,
        categoriesCreated,
        errors: errors.slice(0, 10) // Display the first 10 errors
      }
    };

  } catch (error) {
    const err = error as Error;
    return { success: false, error: `Import failed: ${err.message || "Unknown error"}` };
  }
} 