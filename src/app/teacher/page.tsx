"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticateTeacher, validateAuthToken } from "./actions";
import { BackButton } from "@/components/BackButton";
import { checkExistingAuth } from "./utils";

export default function TeacherLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const router = useRouter();

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = checkExistingAuth();
        
        if (authResult.isValid && authResult.token) {
          // Optionally validate with server for extra security
          const serverValidation = await validateAuthToken(authResult.token);
          
          if (serverValidation.success) {
            // User is already authenticated, redirect to dashboard
            router.push("/teacher/overview");
            return;
          } else {
            // Server says token is invalid, clean it up
            sessionStorage.removeItem("teacher_token");
          }
        }
      } catch (error) {
        // Handle any errors during auth check
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authenticateTeacher(password);
      
      if (result.success) {
        sessionStorage.setItem("teacher_token", result.token || "");
        router.push("/teacher/overview");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking existing authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-700 dark:text-gray-300">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-8 left-8">
          <BackButton href="/" label="Back to Home" />
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter the password to access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter password..."
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
              <div className="text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 