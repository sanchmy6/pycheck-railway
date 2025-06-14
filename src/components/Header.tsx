"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const hasDarkTheme = htmlElement.getAttribute("data-theme") === "dark";
    
    if (hasDarkTheme) {
      setIsToggled(true);
    }
  }, []);

  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isToggled) {
      htmlElement.setAttribute("data-theme", "dark");
    } else {
      htmlElement.setAttribute("data-theme", "light");
    }
  }, [isToggled]);

  const toggleTheme = () => {
    setIsToggled((prev) => !prev);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="group relative"
            >
              <div className="relative">
                {/* Animated background glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                
                {/* Main logo */}
                <div className="relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group-hover:scale-105">
                  {/* Logo Text */}
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-cyan-500 dark:group-hover:from-blue-300 dark:group-hover:via-purple-300 dark:group-hover:to-cyan-300 transition-all duration-300">
                    PyCheck
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isToggled ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isToggled ? (
                <svg 
                  className="h-5 w-5 text-gray-800 dark:text-yellow-300" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                  />
                </svg>
              ) : (
                <svg 
                  className="h-5 w-5 text-yellow-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            
            <Link
              href="/teacher"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Teacher Login"
            >
              <svg 
                className="h-5 w-5 text-gray-600 dark:text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 