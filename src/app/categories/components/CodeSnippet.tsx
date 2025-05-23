"use client";

import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { evaluateProblemSelection, getProblemById } from "../actions";

interface CodeSnippetProps {
  code: string;
  problemId: number;
  language?: string;
}

interface EvaluationResult {
  success: boolean;
  isCorrect?: boolean;
  incorrectSelections?: Array<{ line: number; reason: string }>;
  correctSelections?: Array<{ line: number; reason: string }>;
  correctSelectionsCount?: number;
  missingLinesCount?: number;
  expectedLinesCount?: number;
  message?: string;
}

export function CodeSnippet({ code, problemId, language = "python" }: CodeSnippetProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [expectedLinesCount, setExpectedLinesCount] = useState<number>(0);
  
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

  useEffect(() => {
    const fetchProblemInfo = async () => {
      const problemInfo = await getProblemById(problemId);
      if (problemInfo) {
        setExpectedLinesCount(problemInfo.correctLinesCount);
      }
    };
    
    fetchProblemInfo();
  }, [problemId]);

  const handleLineClick = (lineNumber: number) => {
    if (hasSubmitted) return;
    
    setSelectedLines(prev => {
      if (prev.includes(lineNumber)) {
        return prev.filter(line => line !== lineNumber);
      }
      return [...prev, lineNumber].sort((a, b) => a - b);
    });
  };

  const handleSubmit = async () => {
    if (selectedLines.length === 0) return;
    
    setIsEvaluating(true);
    setHasSubmitted(true);
    
    try {
      const result = await evaluateProblemSelection(problemId, selectedLines);
      setEvaluationResult(result);
    } catch (error) {
      setEvaluationResult({
        success: false,
        message: "An error occurred during evaluation"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setSelectedLines([]);
    setEvaluationResult(null);
    setHasSubmitted(false);
  };

  const getLineBackgroundColor = (lineNumber: number) => {
    if (!hasSubmitted) {
      return selectedLines.includes(lineNumber) 
        ? (isDarkMode ? "#2d3748" : "#e2e8f0") 
        : "transparent";
    }

    if (evaluationResult?.isCorrect && selectedLines.includes(lineNumber)) {
      return isDarkMode ? "#065f46" : "#dcfce7";
    }

    const incorrectLine = evaluationResult?.incorrectSelections?.find(sel => sel.line === lineNumber);
    if (incorrectLine) {
      return isDarkMode ? "#7f1d1d" : "#fef2f2";
    }

    return selectedLines.includes(lineNumber) 
      ? (isDarkMode ? "#065f46" : "#dcfce7") 
      : "transparent";
  };

  const getLineProps = (lineNumber: number) => {
    return {
      style: {
        display: "block",
        backgroundColor: getLineBackgroundColor(lineNumber),
        cursor: hasSubmitted ? "default" : "pointer",
      },
      onClick: () => handleLineClick(lineNumber),
      className: `${selectedLines.includes(lineNumber) ? "font-medium" : ""} ${!hasSubmitted ? "hover:bg-gray-200 dark:hover:bg-gray-700" : ""} transition-colors`,
      title: hasSubmitted ? undefined : "Click to select this line"
    };
  };

  const canSubmit = selectedLines.length === expectedLinesCount && !hasSubmitted;
  const remainingLines = expectedLinesCount - selectedLines.length;

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
      
      <div className="mt-4 space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {!hasSubmitted ? (
            <>
              Selected: {selectedLines.length} / {expectedLinesCount} lines
              {remainingLines > 0 && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({remainingLines} more needed)
                </span>
              )}
            </>
          ) : (
            <>Selected: {selectedLines.length} lines</>
          )}
        </div>
        
        <div className="flex gap-2">
          {!hasSubmitted ? (
            canSubmit ? (
              <button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEvaluating ? "Evaluating..." : "Submit Selection"}
              </button>
            ) : (
              <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500">
                Select {expectedLinesCount} lines to submit
              </div>
            )
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      {evaluationResult && (
        <div className="mt-4">
          {evaluationResult.success ? (
            <div>
              {evaluationResult.isCorrect ? (
                <div className="space-y-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
                    <div className="font-medium">Good Job!</div>
                  </div>
                  
                  {evaluationResult.correctSelections && evaluationResult.correctSelections.length > 0 && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                      <div className="font-medium mb-2">Explanation:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {evaluationResult.correctSelections.map(sel => (
                          <li key={sel.line} className="text-sm">
                            <span className="font-medium">Line {sel.line}:</span> {sel.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                    <div className="font-medium">That is not quite right. Let's review:</div>
                    <div className="text-sm mt-1">
                      You found {evaluationResult.correctSelectionsCount} of {evaluationResult.expectedLinesCount} correct lines.
                      {(evaluationResult.missingLinesCount && evaluationResult.missingLinesCount > 0) && (
                        <span className="block mt-1">
                          {evaluationResult.missingLinesCount} more correct line{evaluationResult.missingLinesCount !== 1 ? 's' : ''} {evaluationResult.missingLinesCount !== 1 ? 'are' : 'is'} missing.
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {evaluationResult.correctSelections && evaluationResult.correctSelections.length > 0 && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                      <div className="font-medium mb-2">Correctly identified lines:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {evaluationResult.correctSelections.map(sel => (
                          <li key={sel.line} className="text-sm">
                            <span className="font-medium">Line {sel.line}:</span> {sel.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {evaluationResult.message || "An error occurred during evaluation"}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 