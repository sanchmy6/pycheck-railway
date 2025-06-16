"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getCourseById, updateCourseAction } from "../../../actions";

export default function EditCoursePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);

  useEffect(() => {
    const token = sessionStorage.getItem("teacher_token");
    if (!token) {
      router.push("/teacher");
      return;
    }
    
    setAuthToken(token);
    setIsAuthenticated(true);
    loadCourse(token);
  }, [router, courseId]);

  const loadCourse = async (token: string) => {
    try {
      const result = await getCourseById(token, courseId);
      if (result.success && result.course) {
        setFormData({
          name: result.course.name,
          description: result.course.description || ""
        });
      } else {
        setError(result.error || "Failed to load course");
      }
    } catch {
      setError("Failed to load course data. Please try again.");
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
      setError("Course name is required");
      return;
    }

    if (formData.name.trim().length < 3) {
      setError("Course name must be at least 3 characters long");
      return;
    }

    if (!formData.description.trim()) {
      setError("Course description is required");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Course description must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCourseAction(
        authToken, 
        courseId, 
        formData.name.trim(), 
        formData.description.trim()
      );

      if (result.success) {
        setSuccess("Course updated successfully!");
        setTimeout(() => {
          router.push("/teacher/overview");
        }, 1500);
      } else {
        setError(result.error || "Failed to update course");
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
          <div className="text-lg">Loading course...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update course information</p>
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
                    Course Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter course name..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe the course..."
                  />
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
                  {isSubmitting ? "Updating..." : "Update Course"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 