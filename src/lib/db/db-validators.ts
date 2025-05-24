// Example Validators
import { Prisma } from '@prisma/client';

type ExampleCreateInput = Prisma.ExampleCreateInput;

export function validateExample(data: Partial<ExampleCreateInput>): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: "Name is required" };
  }
  
  if (data.name.length > 100) {
    return { valid: false, error: "Name cannot exceed 100 characters" };
  }
  
  if (!data.description || data.description.trim() === '') {
    return { valid: false, error: "Description is required" };
  }
  
  return { valid: true };
}

// Course Validators
type CourseCreateInput = Prisma.CourseCreateInput;

export function validateCourse(data: Partial<CourseCreateInput>): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: "Name is required" };
  }

  if (data.name.length > 100) {
    return { valid: false, error: "Name cannot exceed 100 characters" };
  }
  
  return { valid: true };
}

// Category Validators
type CategoryCreateInput = Prisma.CategoryCreateInput;

export function validateCategory(data: Partial<CategoryCreateInput>): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: "Name is required" };
  }

  if (data.name.length > 100) {
    return { valid: false, error: "Name cannot exceed 100 characters" };
  } 

  return { valid: true };
}


// Problem Validators
type ProblemCreateInput = Prisma.ProblemCreateInput;

export function validateProblem(data: Partial<ProblemCreateInput>): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: "Name is required" };
  }

  if (data.name.length > 100) {
    return { valid: false, error: "Name cannot exceed 100 characters" };
  }

  if (!data.description || data.description.trim() === '') {
    return { valid: false, error: "Description is required" };
  }

  if (!data.code_snippet || data.code_snippet.trim() === '') {
    return { valid: false, error: "Code snippet is required" };
  }

  if (!data.correct_lines || data.correct_lines.trim() === '') {
    return { valid: false, error: "Correct lines are required" };
  }

  if (!data.reason) {
    return { valid: false, error: "Reasons are required" };
  }

  if (!data.hint || data.hint.trim() === '') {
    return { valid: false, error: "Hint is required" };
  }
  
  if (!data.category) {
    return { valid: false, error: "Category is required" };
  }

  return { valid: true };
}

