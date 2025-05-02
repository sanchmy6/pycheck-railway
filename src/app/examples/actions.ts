"use server";

import { revalidatePath } from "next/cache";
import { validateExample } from "@/lib/db/db-validators";
import { findExampleByName, createExample, queryExamples } from "@/lib/db/db-helpers";

export async function getExamples() {
  return await queryExamples();
}

export async function create(prevState: { error: string | null, values?: { name: string, description: string } }, 
  formData: FormData) {

  "use server";
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const values = { name, description };

  const validationResult = validateExample({ name, description });
  if (!validationResult.valid) {
    return { error: validationResult.error || "Invalid example data", values };
  }

  try {
    const existing = await findExampleByName(name);

    if (existing) {
      return { error: "An example with this name already exists", values };
    }

    await createExample({
      name,
      description
    });

    revalidatePath("/examples");
    
    return { error: null, values: { name: "", description: "" } };
  } catch (error: any) {
    return { error: error.message || "Failed to create example", values };
  }
}
