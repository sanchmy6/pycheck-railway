"use server";

import { createExample, queryExamples } from "@/lib/db/db-helpers";
import { revalidatePath } from "next/cache";

export async function getExamples() {
  return await queryExamples();
}

export async function createExampleAction(name: string, description: string) {
  if (!name.trim() || !description.trim()) {
    return { success: false, error: "Name and description are required" };
  }

  if (name.trim().length < 3) {
    return { success: false, error: "Name must be at least 3 characters long" };
  }

  if (description.trim().length < 10) {
    return { success: false, error: "Description must be at least 10 characters long" };
  }

  try {
    const example = await createExample({
      name: name.trim(),
      description: description.trim()
    });

    revalidatePath("/examples");
    return { success: true, example };
  } catch (error: unknown) {
    const err = error as { code?: string };
    
    if (err.code === "P2002") {
      return { success: false, error: "An example with this name already exists" };
    }
    
    return { success: false, error: "Failed to create example. Please try again." };
  }
}

// Server action for form component compatibility
export async function create(
  prevState: { error: string | null, values?: { name: string, description: string } }, 
  formData: FormData
) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const values = { name, description };

  if (!name?.trim() || !description?.trim()) {
    return { error: "Name and description are required", values };
  }

  if (name.trim().length < 3) {
    return { error: "Name must be at least 3 characters long", values };
  }

  if (description.trim().length < 10) {
    return { error: "Description must be at least 10 characters long", values };
  }

  try {
    await createExample({
      name: name.trim(),
      description: description.trim()
    });

    revalidatePath("/examples");
    return { error: null, values: { name: "", description: "" } };
  } catch (error: unknown) {
    const err = error as { code?: string };
    
    if (err.code === "P2002") {
      return { error: "An example with this name already exists", values };
    }
    
    return { error: "Failed to create example. Please try again.", values };
  }
}
