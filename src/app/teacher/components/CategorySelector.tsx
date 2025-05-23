"use client";

import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  courseId: string;
  onCategoryChange: (categoryId: string) => void;
  onCreateCategory: (name: string) => Promise<{ success: boolean; category?: Category; error?: string }>;
  disabled?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  courseId,
  onCategoryChange,
  onCreateCategory,
  disabled = false
}: CategorySelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setNewCategoryName("");
    setError("");
    if (!isCreating) {
      onCategoryChange("");
    }
  };

  const handleCreateSubmit = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    if (newCategoryName.trim().length < 2) {
      setError("Category name must be at least 2 characters long");
      return;
    }

    if (newCategoryName.trim().length > 50) {
      setError("Category name must be less than 50 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await onCreateCategory(newCategoryName.trim());
      
      if (result.success && result.category) {
        onCategoryChange(result.category.id.toString());
        setIsCreating(false);
        setNewCategoryName("");
      } else {
        setError(result.error || "Failed to create category");
      }
    } catch (error) {
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
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category *
        </label>
        <button
          type="button"
          onClick={handleCreateToggle}
          disabled={disabled}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          id="category"
          required
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {disabled ? "Select a course first" : "Select a category"}
          </option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isSubmitting}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            placeholder="Enter new category name..."
          />
          <button
            type="button"
            onClick={handleCreateSubmit}
            disabled={disabled || isSubmitting || !newCategoryName.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      )}
    </div>
  );
} 