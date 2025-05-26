import Link from "next/link";
import { getCategoriesByCourseId, getCourseById } from "../actions";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Category {
  id: number;
  name: string;
  created_at: Date;
}

export default async function CoursePage({ params }: PageProps) {
  const { id } = await params;
  const course = await getCourseById(id);
  const categories = await getCategoriesByCourseId(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/courses" label="Back to Courses" />
      <h1 className="text-3xl font-bold dark:text-white">{course?.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{course?.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category: Category) => (
          <div key={category.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2 dark:text-white">{category.name}</h2>
            <div className="mt-4 text-sm text-black dark:text-gray-400">
              <Link href={`/categories/${category.id}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View Category
              </Link>
              <div className="mt-2">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No categories found for this course.</p>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Courses
          </Link>
        </div>
      )}
    </div>
  );
}