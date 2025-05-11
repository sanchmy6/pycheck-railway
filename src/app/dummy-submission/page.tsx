"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DummySubmissionPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>("");
  const [lines, setLines] = useState<number[]>([]);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    const linesParam = searchParams.get("lines");
    
    if (codeParam) {
      setCode(decodeURIComponent(codeParam));
    }
    
    if (linesParam) {
      // Parse the comma-separated line numbers
      setLines(linesParam.split(",").map(Number));
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Code Selection Received</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3 dark:text-white">
          Selected Lines: {lines.length > 0 ? lines.join(", ") : "None"}
        </h2>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <pre className="text-sm font-mono whitespace-pre-wrap dark:text-white">
            {code}
          </pre>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 italic">
          This is a dummy page. In the future, this selection will be saved to the database.
        </p>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white"
        >
          Close
        </button>
        
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    </div>
  );
} 