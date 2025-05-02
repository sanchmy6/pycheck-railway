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