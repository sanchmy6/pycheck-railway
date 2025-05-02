"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
    >
      {pending ? "Creating..." : "Create Example"}
    </button>
  );
}

type CreateExampleFormProps = {
  createAction: (
    state: { error: string | null, values?: { name: string, description: string } }, 
    formData: FormData
  ) => Promise<{ error: string | null, values?: { name: string, description: string } }>;
};

export function CreateExampleForm({ createAction }: CreateExampleFormProps) {
  const initialState = { error: null, values: { name: "", description: "" } };
  const [state, formAction] = useActionState(createAction, initialState);
  
  return (
    <>
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {state.error}
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={state.values?.name || ""}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={state.values?.description || ""}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-600 dark:focus:border-blue-600"
          />
        </div>
        
        <div>
          <SubmitButton />
        </div>
      </form>
    </>
  );
}