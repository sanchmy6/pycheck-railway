"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getCategoryByIdOptimized, updateCategoryAction, getCourses } from "../../../actions";

interface Course {
  id: number;
  name: string;
}

export default function EditCategoryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    courseId: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);

  useEffect(() => {
    const token = sessionStorage.getItem("teacher_token");
    if (!token) {
      router.push("/teacher");
      return;
    }
    
    setAuthToken(token);
    setIsAuthenticated(true);
    loadData(token);
  }, [router, categoryId]);

  const loadData = async (token: string) => {
    try {
      const [categoryResult, coursesData] = await Promise.all([
        getCategoryByIdOptimized(token, categoryId),
        getCourses()
      ]);

      if (categoryResult.success && categoryResult.category) {
        setFormData({
          name: categoryResult.category.name,
          courseId: categoryResult.category.courseId.toString()
        });
      } else {
        setError(categoryResult.error || "Failed to load category");
      }

      setCourses(coursesData);
    } catch {
      setError("Failed to load category data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Category name must be at least 2 characters long");
      return;
    }

    if (!formData.courseId) {
      setError("Please select a course");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCategoryAction(
        authToken, 
        categoryId, 
        formData.name.trim(), 
        parseInt(formData.courseId)
      );

      if (result.success) {
        setSuccess("Category updated successfully!");
        setTimeout(() => {
          router.push("/teacher/overview");
        }, 1500);
      } else {
        setError(result.error || "Failed to update category");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-lg">Loading category...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Category</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update category information</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/teacher/overview"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Back to Overview
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                {success}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter category name..."
                  />
                </div>

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course *
                  </label>
                  <select
                    id="course"
                    required
                    value={formData.courseId}
                    onChange={(e) => handleInputChange("courseId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Link
                  href="/teacher/overview"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 