import { getCategoryById, getProblemsByCategoryId } from "../actions";
import { CodeSnippet } from "../components/CodeSnippet";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const category = await getCategoryById(id);
  const problems = await getProblemsByCategoryId(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white">{category?.name}</h1>
      <div className="bg-white border rounded-lg p-6 m-4 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {problems.map((problem) => (
            <div key={problem.id}>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">{problem.name}</h3>
              <p className="text-sm text-black dark:text-gray-400">{problem.description}</p>
              <CodeSnippet code={problem.code_snippet} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

