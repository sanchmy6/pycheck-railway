import Link from "next/link";
import { getCategories } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => (
          <div key={category.id} className="bg-gray-50 border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 dark:text-white">{category.name}</h2>
            <div className="mt-4 text-sm text-black dark:text-gray-400">
              <Link href={`/categories/${category.id}`} className="text-blue-600 hover:text-blue-700">View Category</Link>
              <div>
                Created: {new Date(category.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}