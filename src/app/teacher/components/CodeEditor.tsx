"use client";

import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  selectedLines: number[];
  onLineSelectionChange: (lines: number[]) => void;
  language?: string;
}

export function CodeEditor({ 
  code, 
  onCodeChange, 
  selectedLines, 
  onLineSelectionChange, 
  language = "python" 
}: CodeEditorProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const codeLines = code.split("\n");

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsDarkMode(theme === "dark");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme");
          setIsDarkMode(newTheme === "dark");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleLineClick = (lineNumber: number) => {
    const newSelectedLines = selectedLines.includes(lineNumber)
      ? selectedLines.filter(line => line !== lineNumber)
      : [...selectedLines, lineNumber].sort((a, b) => a - b);
    
    onLineSelectionChange(newSelectedLines);
  };

  const getLineProps = (lineNumber: number) => {
    const isSelected = selectedLines.includes(lineNumber);
    
    return {
      style: {
        display: "block",
        backgroundColor: isSelected 
          ? (isDarkMode ? "#7f1d1d" : "#fef2f2") 
          : "transparent",
        cursor: "pointer",
      },
      onClick: () => handleLineClick(lineNumber),
      className: `${isSelected ? "font-medium" : ""} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`,
      title: isSelected ? "Click to deselect (problematic line)" : "Click to select as problematic line"
    };
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Code Snippet
        </label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Enter your Python code here..."
        />
      </div>
      
      {code.trim() && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code Preview - Click lines to mark as problematic (red = problematic)
          </label>
          <div className="relative border border-gray-300 rounded-md dark:border-gray-700">
            <SyntaxHighlighter
              language={language}
              style={isDarkMode ? vscDarkPlus : oneLight}
              showLineNumbers={true}
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                textAlign: "right",
                userSelect: "none"
              }}
              wrapLines={true}
              lineProps={getLineProps}
              className="text-sm font-mono"
            >
              {code}
            </SyntaxHighlighter>
          </div>
          
          {selectedLines.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
              <div className="text-sm font-medium text-red-800 dark:text-red-300">
                Selected problematic lines: {selectedLines.join(", ")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 