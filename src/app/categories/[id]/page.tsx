import { getCategoryById, getProblemsByCategoryId } from "../actions";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id);
  const problems = await getProblemsByCategoryId(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white">{category?.name}</h1>
      <div className="mt-4 text-sm text-black dark:text-gray-400">
        Created: {new Date(category?.created_at || "").toLocaleDateString()}
      </div>
      <div className="mt-4 text-sm text-black dark:text-gray-400">
        Updated: {new Date(category?.updated_at || "").toLocaleDateString()}
      </div>
      <div className="mt-4 text-sm text-black dark:text-gray-400">
        <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Problems</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {problems.map((problem) => (
              <div key={problem.id}>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{problem.name}</h3>
                <p className="text-sm text-black dark:text-gray-400">{problem.description}</p>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <pre className="text-sm text-black dark:text-gray-400 font-mono whitespace-pre-wrap">
                    {problem.code_snippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

