"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Course {
  id: number;
  name: string;
  description?: string;
  _count: {
    categories: number;
  };
  categories: Array<{
    id: number;
    name: string;
    _count: {
      problems: number;
    };
    problems: Array<{
      id: number;
      name: string;
      description: string;
    }>;
  }>;
}

interface TeacherOverviewClientProps {
  initialCourses: Course[];
}

let coursesCache: Course[] | null = null;

export function TeacherOverviewClient({ initialCourses }: TeacherOverviewClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    if (initialCourses.length > 0) {
      coursesCache = initialCourses;
    }
  }, [initialCourses]);

  useEffect(() => {
    const token = sessionStorage.getItem("teacher_token");
    if (!token) {
      router.push("/teacher");
      return;
    }
    
    setIsAuthenticated(true);
    
    if (coursesCache && coursesCache.length > 0) {
      setCourses(coursesCache);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("teacher_token");
    // coursesCache = null;
    router.push("/teacher");
  };

  const coursesWithStats = useMemo(() => {
    return courses.map(course => ({
      ...course,
      totalProblems: course.categories.reduce((total, category) => total + category._count.problems, 0)
    }));
  }, [courses]);

  const toggleCourse = (courseId: number) => {
    const newExpandedCourse = expandedCourse === courseId ? null : courseId;
    setExpandedCourse(newExpandedCourse);
    setExpandedCategory(null);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-lg">Authenticating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/teacher/create"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Problem
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your courses, categories, and problems • Click to expand
            </p>
          </div>
          
          {coursesWithStats.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No courses found. Create your first problem to get started.
              </div>
              <Link
                href="/teacher/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create First Problem
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {coursesWithStats.map((course) => {
                const isExpanded = expandedCourse === course.id;
                
                return (
                  <div key={course.id} className="px-6 py-4">
                    {/* Course Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCourse(course.id)}
                            className="flex items-center text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <svg 
                              className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            {course.name}
                          </button>
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-7">
                            {course.description}
                          </p>
                        )}
                        <div className="flex items-center gap-6 mt-2 ml-7">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-14l2 2m0 0l2 2m-2-2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h2" />
                            </svg>
                            {course.categories.length} {course.categories.length === 1 ? "category" : "categories"}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {course.totalProblems} problems
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teacher/edit/course/${course.id}`}
                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          View
                        </Link>
                      </div>
                    </div>

                    {/* Categories (when course is expanded) */}
                    {isExpanded && (
                      <div className="mt-4 ml-7 space-y-3">
                        {course.categories.map((category) => (
                          <div key={category.id} className="border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="flex items-center text-md font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                                  >
                                    <svg 
                                      className={`w-4 h-4 mr-2 transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    {category.name}
                                  </button>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {category._count.problems} {category._count.problems === 1 ? "problem" : "problems"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/teacher/edit/category/${category.id}`}
                                  className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Edit
                                </Link>
                                <Link
                                  href={`/categories/${category.id}`}
                                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  View
                                </Link>
                              </div>
                            </div>

                            {/* Problems (when category is expanded) */}
                            {expandedCategory === category.id && (
                              <div className="mt-3 ml-6 space-y-2">
                                {category.problems?.length > 0 ? category.problems.map((problem) => (
                                  <div key={problem.id} className="border-l-2 border-gray-100 dark:border-gray-700 pl-3 py-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {problem.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                          {problem.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Link
                                          href={`/teacher/edit/problem/${problem.id}`}
                                          className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                          Edit
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                )) : (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 italic pl-3">
                                    No problems in this category yet
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {course.categories.length === 0 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                            No categories in this course yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 