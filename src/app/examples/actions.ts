"use server";

import { revalidatePath } from "next/cache";
import { validateExample } from "@/lib/db/db-validators";
import { findExampleByName, createExample, queryExamples } from "@/lib/db/db-helpers";

export async function getExamples() {
  return await queryExamples();
}

// In your server action file or function
export async function create(prevState: { error: string | null, values?: { name: string, description: string } }, 
  formData: FormData) {

  "use server";
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Always include the submitted values in the response
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

    // Revalidate the path to show the new data
    revalidatePath("/examples");
    
    // On success, return empty values to reset the form
    return { error: null, values: { name: "", description: "" } };
  } catch (error: any) {
    return { error: error.message || "Failed to create example", values };
  }
}
