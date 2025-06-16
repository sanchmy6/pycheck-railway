"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { deleteCourseAction, deleteCategoryAction, deleteProblemAction, importProblems, getCoursesWithStats } from "../actions";
import { ImportHelpWindow } from "../components/ImportHelpWindow";

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

interface TeacherClientProps {
  initialCourses: Course[];
}

let coursesCache: Course[] | null = null;

export function TeacherClient({ initialCourses }: TeacherClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "course" | "category" | "problem";
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    error?: string;
    details?: {
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
      coursesCreated: number;
      categoriesCreated: number;
    };
  } | null>(null);

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

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    setDeleteError("");

    const authToken = sessionStorage.getItem("teacher_token") || "";

    try {
      let result;

      switch (deleteConfirm.type) {
        case "course":
          result = await deleteCourseAction(authToken, deleteConfirm.id);
          break;
        case "category":
          result = await deleteCategoryAction(authToken, deleteConfirm.id);
          break;
        case "problem":
          result = await deleteProblemAction(authToken, deleteConfirm.id);
          break;
      }

      if (result.success) {
        if (deleteConfirm.type === "course") {
          setCourses(prev => prev.filter(course => course.id !== deleteConfirm.id));
        } else if (deleteConfirm.type === "category") {
          setCourses(prev => prev.map(course => ({
            ...course,
            categories: course.categories.filter(category => category.id !== deleteConfirm.id)
          })));
        } else if (deleteConfirm.type === "problem") {
          setCourses(prev => prev.map(course => ({
            ...course,
            categories: course.categories.map(category => ({
              ...category,
              problems: category.problems.filter(problem => problem.id !== deleteConfirm.id)
            }))
          })));
        }

        setDeleteConfirm(null);
      } else {
        setDeleteError(result.error || "Failed to delete item");
      }
    } catch {
      setDeleteError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    const authToken = sessionStorage.getItem("teacher_token") || "";

    try {
      const result = await importProblems(authToken);
      setImportResult(result);
      
      if (result.success) {
        const freshCourses = await getCoursesWithStats();
        setCourses(freshCourses);
        coursesCache = freshCourses;
      }
    } catch (error) { 
      const err = error as Error;
      setImportResult({
        success: false,
        error: `Import failed: ${err.message || "Unknown error"}`
      });
    } finally {
      setIsImporting(false);
    }
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
        <BackButton href="/" label="Back to Home" />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/teacher/create"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Problem
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? "Importing..." : "Import from Sheet"}
              </button>
              <button
                onClick={() => setShowImportHelp(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title="Import Help"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCourse(course.id)}
                            className="flex items-center text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <svg
                              className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
                        <button
                          onClick={() => setDeleteConfirm({ type: "course", id: course.id, name: course.name })}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

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
                                      className={`w-4 h-4 mr-2 transition-transform ${expandedCategory === category.id ? "rotate-90" : ""}`}
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
                                  href={`/courses/${course.id}?category=${category.id}`}
                                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => setDeleteConfirm({ type: "category", id: category.id, name: category.name })}
                                  className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

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
                                        <button
                                          onClick={() => setDeleteConfirm({ type: "problem", id: problem.id, name: problem.name })}
                                          className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                          Delete
                                        </button>
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the {deleteConfirm.type} &quot;{deleteConfirm.name}&quot;?
              {deleteConfirm.type === "course" && " This will also delete all categories and problems in this course."}
              {deleteConfirm.type === "category" && " This will also delete all problems in this category."}
              {" "}This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 py-1 font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {importResult.success ? (
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {importResult.success ? "Import Successful" : "Import Failed"}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {importResult.success ? (
                <div className="space-y-4">
                  {importResult.details && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {importResult.details.imported}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          New Problems
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {importResult.details.updated}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Updated Problems
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {importResult.details.skipped}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          Rows Skipped
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {(importResult.details.imported || 0) + (importResult.details.updated || 0) + (importResult.details.skipped || 0)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Total Rows
                        </div>
                      </div>
                    </div>
                  )}

                  {importResult.details && (importResult.details.coursesCreated > 0 || importResult.details.categoriesCreated > 0) && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Created:
                      </h4>
                      <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        {importResult.details.coursesCreated > 0 && (
                          <div className="flex justify-between">
                            <span>Courses:</span>
                            <span className="font-medium">{importResult.details.coursesCreated}</span>
                          </div>
                        )}
                        {importResult.details.categoriesCreated > 0 && (
                          <div className="flex justify-between">
                            <span>Categories:</span>
                            <span className="font-medium">{importResult.details.categoriesCreated}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {importResult.details && importResult.details.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Errors ({importResult.details.errors.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto">
                        <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                          {importResult.details.errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {importResult.error}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-end">
                <button
                  onClick={() => setImportResult(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImportHelpWindow 
        isOpen={showImportHelp} 
        onClose={() => setShowImportHelp(false)} 
      />
    </div>
  );
} 