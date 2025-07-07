"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "../components/CodeEditor";
import { CategorySelector } from "../components/CategorySelector";
import { CourseSelector } from "../components/CourseSelector";
import { createProblemAction, getCourses, getCategoriesByCourse, createCategoryAction, createCourseAction } from "../actions";
import { BackButton } from "@/components/BackButton";

interface Course {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function CreateProblemPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    courseId: "",
    categoryId: "",
    codeSnippet: "",
    hint: ""
  });
  
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("teacher_token");
    if (!token) {
      router.push("/teacher");
      return;
    }
    
    setAuthToken(token);
    setIsAuthenticated(true);
    loadCourses();
  }, [router]);

  const loadCourses = async () => {
    try {
      const courseList = await getCourses();
      setCourses(courseList);
    } catch {
      setError("Failed to load courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async (courseId: string) => {
    if (!courseId) {
      setCategories([]);
      return;
    }

    try {
      const result = await getCategoriesByCourse(parseInt(courseId));
      setCategories(result);
    } catch {
      setError("Failed to load categories. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "courseId" && value) {
      loadCategories(value);
      setFormData(prev => ({ ...prev, categoryId: "" }));
    }
  };

  const handleCourseChange = (courseId: string) => {
    handleInputChange("courseId", courseId);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
  };

  const handleCreateCategory = async (name: string) => {
    if (!formData.courseId) {
      return { success: false, error: "Please select a course first" };
    }

    const result = await createCategoryAction(authToken, name, parseInt(formData.courseId));
    
    if (result.success && result.category) {
      setCategories(prev => [...prev, result.category!]);
    }
    
    return result;
  };

  const handleCreateCourse = async (name: string, description: string, status: "Active" | "Archived" | "Private" = "Active") => {
    const result = await createCourseAction(authToken, name, description, status);
    
    if (result.success && result.course) {
      setCourses(prev => [...prev, result.course!]);
    }
    
    return result;
  };

  const handleLineSelectionChange = (lines: number[]) => {
    setSelectedLines(lines);
    
    const newReasons = { ...reasons };
    lines.forEach(line => {
      if (!newReasons[line.toString()]) {
        newReasons[line.toString()] = "";
      }
    });
    
    Object.keys(newReasons).forEach(lineStr => {
      if (!lines.includes(parseInt(lineStr))) {
        delete newReasons[lineStr];
      }
    });
    
    setReasons(newReasons);
  };

  const handleReasonChange = (line: number, reason: string) => {
    setReasons(prev => ({ ...prev, [line.toString()]: reason }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Problem name is required");
      return;
    }

    if (formData.name.trim().length < 3) {
      setError("Problem name must be at least 3 characters long");
      return;
    }

    if (!formData.description.trim()) {
      setError("Problem description is required");
      return;
    }

    if (!formData.courseId) {
      setError("Please select a course");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select or create a category");
      return;
    }

    if (!formData.codeSnippet.trim()) {
      setError("Code snippet is required");
      return;
    }

    if (selectedLines.length === 0) {
      setError("Please select at least one problematic line in the code");
      return;
    }

    const missingReasons = selectedLines.filter(line => !reasons[line.toString()]?.trim());
    if (missingReasons.length > 0) {
      setError(`Please provide explanations for lines: ${missingReasons.join(", ")}`);
      return;
    }

    if (!formData.hint.trim()) {
      setError("Hint is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProblemAction(authToken, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: parseInt(formData.categoryId),
        codeSnippet: formData.codeSnippet,
        correctLines: selectedLines,
        reasons,
        hint: formData.hint.trim()
      });

      if (result.success) {
        setSuccess("Problem created successfully!");
        setFormData({
          name: "",
          description: "",
          courseId: "",
          categoryId: "",
          codeSnippet: "",
          hint: ""
        });
        setSelectedLines([]);
        setReasons({});
        setCategories([]);
      } else {
        setError(result.error || "Failed to create problem");
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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <BackButton href="/teacher/overview" label="Back to Dashboard" />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Problem</h1>
        </div>

        <div className="max-w-4xl mx-auto">
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
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter problem name..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe the problem and what students should look for..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CourseSelector
                      courses={courses}
                      selectedCourseId={formData.courseId}
                      onCourseChange={handleCourseChange}
                      onCreateCourse={handleCreateCourse}
                    />
                  </div>

                  <div>
                    <CategorySelector
                      categories={categories}
                      selectedCategoryId={formData.categoryId}
                      onCategoryChange={handleCategoryChange}
                      onCreateCategory={handleCreateCategory}
                      disabled={!formData.courseId}
                    />
                  </div>
                </div>

                <CodeEditor
                  code={formData.codeSnippet}
                  onCodeChange={(code) => handleInputChange("codeSnippet", code)}
                  selectedLines={selectedLines}
                  onLineSelectionChange={handleLineSelectionChange}
                />

                {selectedLines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Explain each problematic line *
                    </label>
                    <div className="space-y-4">
                      {selectedLines.map(line => (
                        <div key={line}>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Line {line} - Reason
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={reasons[line.toString()] || ""}
                            onChange={(e) => handleReasonChange(line, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={`Explain why line ${line} is problematic...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="hint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hint *
                  </label>
                  <textarea
                    id="hint"
                    required
                    rows={2}
                    value={formData.hint}
                    onChange={(e) => handleInputChange("hint", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Provide a helpful hint for students..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Problem"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 