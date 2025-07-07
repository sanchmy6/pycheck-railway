"use client";

import React, { useState } from "react";

interface Course {
  id: number;
  name: string;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  onCreateCourse: (name: string, description: string, status?: "Active" | "Archived" | "Private") => Promise<{ success: boolean; course?: Course; error?: string }>;
}

export function CourseSelector({
  courses,
  selectedCourseId,
  onCourseChange,
  onCreateCourse,
}: CourseSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseStatus, setNewCourseStatus] = useState<"Active" | "Archived" | "Private">("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setNewCourseName("");
    setNewCourseDescription("");
    setNewCourseStatus("Active");
    setError("");
    if (!isCreating) {
      onCourseChange("");
    }
  };

  const handleCreateSubmit = async () => {
    if (!newCourseName.trim()) {
      setError("Course name is required");
      return;
    }

    if (newCourseName.trim().length < 3) {
      setError("Course name must be at least 3 characters long");
      return;
    }

    if (newCourseName.trim().length > 100) {
      setError("Course name must be less than 100 characters");
      return;
    }

    if (!newCourseDescription.trim()) {
      setError("Course description is required");
      return;
    }

    if (newCourseDescription.trim().length < 10) {
      setError("Course description must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await onCreateCourse(newCourseName.trim(), newCourseDescription.trim(), newCourseStatus);
      
      if (result.success && result.course) {
        onCourseChange(result.course.id.toString());
        setIsCreating(false);
        setNewCourseName("");
        setNewCourseDescription("");
        setNewCourseStatus("Active");
      } else {
        setError(result.error || "Failed to create course");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      e.preventDefault();
      handleCreateSubmit();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Course *
        </label>
        <button
          type="button"
          onClick={handleCreateToggle}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isCreating ? "Select existing" : "Create new"}
        </button>
      </div>

      {error && (
        <div className="mb-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!isCreating ? (
        <select
          id="course"
          required
          value={selectedCourseId}
          onChange={(e) => onCourseChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            placeholder="Enter new course name..."
          />
          <textarea
            value={newCourseDescription}
            onChange={(e) => setNewCourseDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            placeholder="Enter course description..."
          />
          <select
            value={newCourseStatus}
            onChange={(e) => setNewCourseStatus(e.target.value as "Active" | "Archived" | "Private")}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
          >
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
            <option value="Private">Private</option>
          </select>
          <button
            type="button"
            onClick={handleCreateSubmit}
            disabled={isSubmitting || !newCourseName.trim() || !newCourseDescription.trim()}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      )}
    </div>
  );
} 