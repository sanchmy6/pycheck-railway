import Link from "next/link";
import { CreateExampleForm } from "./CreateExampleForm";
import { create, getExamples } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExamplesPage() {
  const examples = await getExamples();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Examples</h1>
        <Link
          href="#create-form"
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium inline-block dark:bg-blue-800 dark:hover:bg-blue-900"
        >
          Add New Example
        </Link>
      </div>
      
      {examples.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center dark:bg-gray-800">
          <p className="text-black mb-4 dark:text-white">No examples found.</p>
          <p className="text-black dark:text-white">Create your first example below!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {examples.map((example) => (
            <div 
              key={example.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold mb-2 dark:text-white">{example.name}</h2>
              <p className="text-black dark:text-gray-200">{example.description}</p>
              <div className="mt-4 text-sm text-black dark:text-gray-400">
                Created: {new Date(example.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div id="create-form" className="bg-white rounded-lg p-6 shadow-sm mt-8 max-w-2xl mx-auto dark:bg-gray-800 dark:border dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Create New Example</h2>
        <CreateExampleForm createAction={create} />
      </div>
    </div>
  );
} 