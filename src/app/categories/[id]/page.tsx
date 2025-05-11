import { getCategoryById, getProblemsByCategoryId } from "../actions";
import { CodeSnippet } from "../components/CodeSnippet";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const category = await getCategoryById(id);
  const problems = await getProblemsByCategoryId(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">{category?.name}</h1>
      <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Problems</h2>
        <div className="space-y-8">
          {problems.map((problem) => (
            <div key={problem.id} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0">
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{problem.name}</h3>
              <p className="text-sm text-black dark:text-gray-400 mb-4">{problem.description}</p>
              <CodeSnippet code={problem.code_snippet} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

