"use client";

import { useState, useEffect } from "react";
import { CodeSnippet } from "@/app/courses/components/CodeSnippet";
import { BackButton } from "@/components/BackButton";

interface Problem {
    id: number;
    name: string;
    description: string;
    code_snippet: string;
    correct_lines: string;
    hint: string;
}

interface CourseClientPageProps {
    course: { name: string; description: string };
    categoriesWithProblems: Array<{
        id: number;
        name: string;
        problems: Array<Problem>;
    }>;
}

export function CourseClientPage({ course, categoriesWithProblems }: CourseClientPageProps) {
    const [openedCategoryId, setOpenedCategoryId] = useState<number | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [activeProblemId, setActiveProblemId] = useState<number | null>(null);

    useEffect(() => {
        if (categoriesWithProblems.length > 0 && activeCategoryId === null) {
            const firstCategory = categoriesWithProblems[0];
            setActiveCategoryId(firstCategory.id);
            setOpenedCategoryId(firstCategory.id);
            if (firstCategory.problems.length > 0) {
                setActiveProblemId(firstCategory.problems[0].id);
            }
        }
    }, [categoriesWithProblems, activeCategoryId]);

    // Scroll-based problem detection
    useEffect(() => {
        const handleScroll = () => {
            const problems = categoriesWithProblems.flatMap(cat => cat.problems);
            let currentProblem: Problem | null = null;

            // Find which problem is currently most visible
            for (const problem of problems) {
                const element = document.getElementById(`problem-${problem.id}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Consider a problem active if it's at least 30% visible and near the top of viewport
                    if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.1) {
                        currentProblem = problem;
                        break;
                    }
                }
            }

            if (currentProblem && currentProblem.id !== activeProblemId) {
                setActiveProblemId(currentProblem.id);
                
                // Find the category that contains this problem and set it as active
                const parentCategory = categoriesWithProblems.find(cat => 
                    cat.problems.some(p => p.id === currentProblem.id)
                );
                if (parentCategory && parentCategory.id !== activeCategoryId) {
                    setActiveCategoryId(parentCategory.id);
                    setOpenedCategoryId(parentCategory.id);
                }
            }
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', throttledScroll);
    }, [categoriesWithProblems, activeProblemId, activeCategoryId]);

    const toggleCategoryOpen = (categoryId: number) => {
        // Only allow one category to be open at a time (accordion behavior)
        if (openedCategoryId === categoryId) {
            setOpenedCategoryId(null);
        } else {
            setOpenedCategoryId(categoryId);
            setActiveCategoryId(categoryId);
        }
    };

    const handleProblemClick = (problemId: number, categoryId: number) => {
        setActiveProblemId(problemId);
        setActiveCategoryId(categoryId);
        
        // Ensure the category containing this problem is open
        if (openedCategoryId !== categoryId) {
            setOpenedCategoryId(categoryId);
        }
        
        // Smooth scroll to the problem
        const element = document.getElementById(`problem-${problemId}`);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    };

    const activeCategory = categoriesWithProblems.find((c) => c.id === activeCategoryId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <BackButton href="/" label="Back to Home" />
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        {course.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                        {course.description}
                    </p>
                </div>

                <div className="flex gap-8">
                    <aside className="w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] sticky top-20 h-full space-y-3 flex-shrink-0">
                        {categoriesWithProblems.map((category) => (
                            <details
                                key={category.id}
                                open={openedCategoryId === category.id}
                                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                                    openedCategoryId === category.id
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700'
                                        : ''
                                }`}
                            >
                                <summary
                                    className="cursor-pointer font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center justify-between group"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleCategoryOpen(category.id);
                                    }}
                                >
                                    <span>{category.name}</span>
                                    <svg 
                                        className={`w-5 h-5 transition-transform duration-200 ${openedCategoryId === category.id ? 'rotate-90' : ''} group-hover:text-blue-600 dark:group-hover:text-blue-400`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </summary>
                                <ul className="mt-4 space-y-2">
                                    {category.problems.map((problem) => (
                                        <li key={problem.id}>
                                            <button
                                                onClick={() => handleProblemClick(problem.id, category.id)}
                                                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 border ${
                                                    activeProblemId === problem.id
                                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 shadow-sm font-medium'
                                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-transparent hover:border-blue-200 dark:hover:border-blue-700'
                                                }`}
                                            >
                                                {problem.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ))}
                    </aside>

                    <section className="flex-1 space-y-6 min-w-0">
                        {activeCategory && (
                            <div className="bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 text-amber-800 dark:text-amber-200 p-4 rounded-xl backdrop-blur-sm shadow-sm">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm leading-relaxed">
                                        <span className="font-medium">Important:</span> The errors you are looking for are <span className="font-medium">logical or conceptual errors</span>, not syntax errors.
                                        Focus on issues with program logic, algorithm correctness, variable usage, or conceptual mistakes in the code implementation.
                                    </div>
                                </div>
                            </div>
                        )}

                        {!activeCategory && (
                            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 dark:border-gray-700/50">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No task is currently selected</p>
                                    <p className="text-sm mt-2">Choose a category from the sidebar to get started</p>
                                </div>
                            </div>
                        )}

                        {activeCategory?.problems.map((problem, index) => (
                            <div
                                key={problem.id}
                                id={`problem-${problem.id}`}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:border-gray-300/50 dark:hover:border-gray-600/50 animate-fade-in scroll-mt-20"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{problem.name}</h3>
                                </div>
                                <hr className="border-gray-200/60 dark:border-gray-600/60 mb-6" />
                                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{problem.description}</p>
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
            
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
