import { getCategoriesByCourseId, getCourseById, getProblemsByCategoryId } from "../actions";
import { CourseClientPage } from "./CourseClientPage";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

function CourseLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-6">
                <div className="animate-pulse">
                    {/* Back button */}
                    <div className="mb-6">
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                    
                    {/* Header */}
                    <div className="mb-8">
                        <div className="h-12 w-96 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3"></div>
                        <div className="h-6 w-full max-w-3xl bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <aside className="w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-5">
                                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((j) => (
                                            <div key={j} className="h-4 w-full bg-gray-100 dark:bg-gray-600 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </aside>
                        
                        {/* Main content */}
                        <section className="flex-1 space-y-6">
                            <div className="bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-xl p-4">
                                <div className="h-4 w-full bg-amber-200 dark:bg-amber-800 rounded"></div>
                            </div>
                            
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 rounded-full"></div>
                                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="h-px bg-gray-200 dark:bg-gray-600 mb-6"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="mt-6">
                                        <div className="h-32 w-full bg-gray-100 dark:bg-gray-600 rounded-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CourseNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
                    <svg 
                        className="w-20 h-20 mx-auto mb-6 text-red-400 dark:text-red-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                        />
                    </svg>
                    
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Course Not Found
                    </h1>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        The course you&apos;re looking for doesn&apos;t exist or may have been removed.
                    </p>
                    
                    <div className="space-y-3">
                        <Link
                            href="/courses"
                            className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            Browse All Courses
                        </Link>
                        
                        <Link
                            href="/"
                            className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

async function CourseContent({ id }: { id: string }) {
    try {
        const [course, categories] = await Promise.all([
            getCourseById(id),
            getCategoriesByCourseId(id)
        ]);

        if (!course) {
            return <CourseNotFound />;
        }

        const categoriesWithProblems = await Promise.all(
            categories.map(async (category) => {
                const problems = await getProblemsByCategoryId(category.id.toString());
                return { ...category, problems };
            })
        );

        return (
            <CourseClientPage
                course={{ name: course.name, description: course.description }}
                categoriesWithProblems={categoriesWithProblems}
            />
        );
    } catch (error) {
        console.error("Error loading course:", error);
        return <CourseNotFound />;
    }
}

export default async function CoursePage({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<CourseLoading />}>
            <CourseContent id={id} />
        </Suspense>
    );
}
