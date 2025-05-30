"use client";

import { useState } from "react";
import { CodeSnippet } from "@/app/courses/components/CodeSnippet";
import { BackButton } from "@/components/BackButton";

interface CourseClientPageProps {
    course: { name: string; description: string };
    categoriesWithProblems: Array<{
        id: number;
        name: string;
        problems: Array<any>;
    }>;
}

export function CourseClientPage({ course, categoriesWithProblems }: CourseClientPageProps) {
    const [openedCategoryIds, setOpenedCategoryIds] = useState<number[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    const toggleCategoryOpen = (categoryId: number) => {
        setOpenedCategoryIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const activeCategory = categoriesWithProblems.find((c) => c.id === activeCategoryId);

    return (
        <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="container mx-auto px-4 py-6">
                <BackButton href="/courses" label="← Back to Courses" />

                <h1 className="text-3xl font-bold mt-4">{course.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{course.description}</p>

                <div className="flex">
                    {/* Sidebar */}
                    <aside className="w-64 sticky top-20 h-full pr-6 space-y-4">
                        {categoriesWithProblems.map((category) => (
                            <details
                                key={category.id}
                                open={openedCategoryIds.includes(category.id)}
                                className="bg-white dark:bg-gray-800 rounded shadow p-4 open:bg-blue-50 open:dark:bg-blue-900"
                            >
                                <summary
                                    className="cursor-pointer font-semibold"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleCategoryOpen(category.id);
                                    }}
                                >
                                    {category.name}
                                </summary>
                                <ul className="mt-2 list-disc pl-4 text-sm">
                                    {category.problems.map((problem) => (
                                        <li key={problem.id}>
                                            <a
                                                href={`#problem-${problem.id}`}
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                                onClick={() => setActiveCategoryId(category.id)}
                                            >
                                                {problem.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ))}
                    </aside>

                    {/* Main content */}
                    <section className="flex-1 space-y-6">
                        {activeCategory && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-100 rounded-md mb-6">
                                <strong>Important:</strong> The errors you are looking for are <strong>logical or conceptual errors</strong>, not syntax errors.
                                Focus on issues with program logic, algorithm correctness, variable usage, or conceptual mistakes in the code implementation.
                            </div>
                        )}

                        {!activeCategory && (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-20 text-lg italic">
                                No task is currently selected
                            </div>
                        )}

                        {activeCategory?.problems.map((problem) => (
                            <div
                                key={problem.id}
                                id={`problem-${problem.id}`}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6"
                            >
                                <h3 className="text-xl font-semibold mb-2 dark:text-white">{problem.name}</h3>
                                <hr className="border-gray-300 dark:border-gray-600 mb-4" />
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{problem.description}</p>
                                <CodeSnippet
                                    code={problem.code_snippet}
                                    problemId={problem.id}
                                    problemData={{
                                        correctLinesCount: problem.correct_lines.split(",").length,
                                        hint: problem.hint,
                                    }}
                                />
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
