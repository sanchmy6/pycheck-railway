import { getCategoryById, getProblemsByCategoryId, getCategoryWithCourse } from "../actions";
import { CodeSnippet } from "../components/CodeSnippet";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;

  const category = await getCategoryById(id);
  const categoryWithCourse = await getCategoryWithCourse(id);
  const problems = await getProblemsByCategoryId(id);

  return (
    <div className="container mx-auto px-4 py-8">
      {categoryWithCourse?.course && (
        <BackButton 
          href={`/courses/${categoryWithCourse.course.id}`} 
          label={`Back to ${categoryWithCourse.course.name}`} 
        />
      )}
      <h1 className="text-3xl font-bold mb-6 dark:text-white">{category?.name}</h1>
      
      <div className="bg-gray-100 border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Problems</h2>
        
        <p className="mb-4">
          <span className="font-medium text-lg"><strong>Important:</strong></span> The errors you are looking for are <strong>logical or conceptual errors</strong>, not syntax errors. 
          Focus on issues with program logic, algorithm correctness, variable usage, or conceptual mistakes in the code implementation.
        </p> 
        
        <div className="space-y-8">
          {problems.map((problem) => (
            <div key={problem.id} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0">
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{problem.name}</h3>
              <p className="text-sm text-black dark:text-gray-400 mb-4">{problem.description}</p>
              <CodeSnippet code={problem.code_snippet} problemId={problem.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

