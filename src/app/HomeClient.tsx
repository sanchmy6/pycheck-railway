"use client";

import { useState } from "react";
import Link from "next/link";

interface Course {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface HomeClientProps {
  activeCourses: Course[];
  archivedCourses: Course[];
}

export function HomeClient({ activeCourses, archivedCourses }: HomeClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  
  const displayedCourses = showArchived 
    ? [...activeCourses, ...archivedCourses]
    : activeCourses;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        {/* Hero Section */}
        <div className="bg-light-gray dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative inline-block">
                {/* Main headline */}
                <h1 className="relative text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Welcome to PyCheck
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in-delay">
                Train and exercise with Python example challenges to get familiar with exam-style tasks.
              </p>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {displayedCourses.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Available Courses
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a course to start your learning journey
                    </p>
                  </div>
                  
                  {archivedCourses.length > 0 && (
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
                        />
                      </svg>
                      {showArchived ? "Hide Old Courses" : "Show Old Courses"}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 mb-12">
              {displayedCourses.map((course) => (
                <Link 
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg 
                              className="w-6 h-6 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {course.name}
                              </h2>
                              {course.status === "Archived" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  Archived
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {displayedCourses.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg 
                      className="w-16 h-16 text-blue-500 dark:text-blue-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Getting Ready for Launch!</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Our interactive programming courses are being prepared. Soon you&apos;ll be able to master 
                    Python concepts through hands-on coding exercises and real-time feedback.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What&apos;s Coming:</h4>
                    <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Interactive coding exercises
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Automated code testing and feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Progress tracking and achievements
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back soon for exciting programming challenges!
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 