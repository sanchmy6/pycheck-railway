"use client";

import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export function CodeSnippet({ code, language = "python" }: CodeSnippetProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  
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
    setSelectedLines(prev => {
      if (prev.includes(lineNumber)) {
        return prev.filter(line => line !== lineNumber);
      }
      return [...prev, lineNumber].sort((a, b) => a - b);
    });
  };

  const handleSubmit = () => {
    const selectedCode = selectedLines
      .map(lineNum => codeLines[lineNum - 1])
      .join("\n") || "No code selected";

    console.log("Submitted code: ", selectedCode);
  };

  const getLineProps = (lineNumber: number) => {
    const isSelected = selectedLines.includes(lineNumber);
    
    return {
      style: {
        display: "block",
        backgroundColor: isSelected ? (isDarkMode ? "#2d3748" : "#e2e8f0") : "transparent",
        cursor: "pointer",
      },
      onClick: () => handleLineClick(lineNumber),
      className: `${isSelected ? "font-medium" : ""} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`,
      title: "Click to select this line"
    };
  };

  return (
    <div className="p-4">
      <div className="relative">
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
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Submit Selection
        </button>
      </div>
    </div>
  );
} 